import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";
import { randomBytes, randomUUID } from "node:crypto";
import * as z from "zod";

import { edgeEnv } from "~/commands/new/edge/config";
import { modifyTextFile } from "~/utils/file";

import type { NewProject } from "../common";
import type { JSONPath, ParseError } from "jsonc-parser";

const wranglerVarKeys = new Set([
  edgeEnv.productName,
  edgeEnv.contactEmail,
  edgeEnv.emailFrom,
  edgeEnv.auth.password,
  edgeEnv.auth.anonymous,
  edgeEnv.turnstile.siteKey,
  edgeEnv.analytics.webAnalyticsToken,
]);

const wranglerSchema = z.looseObject({
  name: z.string(),
  vars: z.record(z.string(), z.union([z.string(), z.boolean()])),
  routes: z.array(z.unknown()),
  send_email: z
    .array(z.looseObject({ allowed_sender_addresses: z.array(z.string()) }))
    .min(1),
  d1_databases: z
    .array(
      z.looseObject({ database_name: z.string(), database_id: z.string() }),
    )
    .min(1),
  kv_namespaces: z.array(z.looseObject({ id: z.string() })).min(1),
  r2_buckets: z.array(z.looseObject({ bucket_name: z.string() })).min(1),
  flagship: z.array(z.looseObject({ app_id: z.string() })).min(1),
  queues: z.looseObject({
    producers: z.array(z.looseObject({ queue: z.string() })).min(1),
    consumers: z.array(z.looseObject({ queue: z.string() })).min(1),
  }),
});

type EdgeWrangler = z.infer<typeof wranglerSchema>;

interface Change {
  path: JSONPath;
  value: unknown;
}

const changedValues = (
  before: unknown,
  after: unknown,
  path: JSONPath = [],
): Change[] => {
  if (Object.is(before, after)) return [];

  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) return [{ path, value: after }];
    return after.flatMap((value, index) =>
      changedValues(before[index], value, [...path, index]),
    );
  }

  if (
    before !== null &&
    after !== null &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const oldValues = before as Record<string, unknown>;
    return Object.entries(after).flatMap(([key, value]) =>
      changedValues(oldValues[key], value, [...path, key]),
    );
  }

  return [{ path, value: after }];
};

const setWranglerVars = (
  config: EdgeWrangler,
  values: Record<string, string>,
) => {
  config.vars.BETTER_AUTH_URL = "http://localhost:3000";
  config.vars.VITE_URL = "http://localhost:3000";
  config.vars[edgeEnv.turnstile.siteKey] = "1x00000000000000000000AA";
  config.vars[edgeEnv.analytics.webAnalyticsToken] = "";
  for (const [key, value] of Object.entries(values)) {
    if (!wranglerVarKeys.has(key)) continue;
    config.vars[key] =
      key === edgeEnv.auth.password || key === edgeEnv.auth.anonymous
        ? value === "true"
        : value;
  }
};

const setWranglerBindings = (
  config: EdgeWrangler,
  project: NewProject,
  sender: string,
) => {
  config.routes = [];
  config.send_email[0].allowed_sender_addresses = [
    /<([^<>]+)>$/.exec(sender)?.[1] ?? sender,
  ];
  config.d1_databases[0].database_name = project.name;
  config.d1_databases[0].database_id = randomUUID();
  config.kv_namespaces[0].id = randomBytes(16).toString("hex");
  config.r2_buckets[0].bucket_name = project.name;
  config.flagship[0].app_id = randomUUID();
  config.queues.producers[0].queue = `${project.name}-jobs`;
  config.queues.consumers[0].queue = `${project.name}-jobs`;
};

export const configureWrangler = async (
  project: NewProject,
  cwd: string,
  values: Record<string, string>,
) => {
  await modifyTextFile({
    cwd,
    path: "wrangler.jsonc",
    modify: (source) => {
      const errors: ParseError[] = [];
      const parsed: unknown = parse(source, errors, {
        allowTrailingComma: true,
      });
      if (errors.length > 0) {
        const error = errors[0];
        throw new Error(
          `Invalid wrangler.jsonc at offset ${error.offset}: ${printParseErrorCode(error.error)}`,
        );
      }

      const original = wranglerSchema.parse(parsed);
      const config = structuredClone(original);
      config.name = project.name;
      setWranglerVars(config, values);
      setWranglerBindings(config, project, values[edgeEnv.emailFrom]);

      const indent = /(?:^|\r?\n)([ \t]+)"/.exec(source)?.[1] ?? "  ";
      const formattingOptions = {
        eol: source.includes("\r\n") ? "\r\n" : "\n",
        insertSpaces: !indent.includes("\t"),
        tabSize: indent.includes("\t") ? 1 : indent.length,
      };

      return changedValues(original, config).reduce(
        (text, { path, value }) =>
          applyEdits(text, modify(text, path, value, { formattingOptions })),
        source,
      );
    },
  });
};
