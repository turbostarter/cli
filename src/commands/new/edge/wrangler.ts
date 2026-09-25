import { applyEdits, modify, parse, printParseErrorCode } from "jsonc-parser";
import { randomBytes, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import * as z from "zod";

import { edgeEnv } from "~/commands/new/edge/config";
import { logger } from "~/utils/logger";

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

export const configureWrangler = async (
  project: NewProject,
  cwd: string,
  values: Record<string, string>,
) => {
  const path = join(cwd, "wrangler.jsonc");
  const source = await fs.readFile(path, "utf8");
  const errors: ParseError[] = [];
  const parsed: unknown = parse(source, errors, { allowTrailingComma: true });
  if (errors.length > 0) {
    const error = errors[0];
    logger.info(
      `Skipping wrangler.jsonc configuration: invalid JSONC at offset ${error.offset} (${printParseErrorCode(error.error)}). Review this file after setup.`,
    );
    return false;
  }

  const result = wranglerSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    logger.info(
      `Skipping wrangler.jsonc configuration: template JSONC does not match the expected shape (${issues}). Review this file after setup.`,
    );
    return false;
  }

  const sender = values[edgeEnv.emailFrom];
  const changes: [JSONPath, unknown][] = [
    [["name"], project.name],
    [["vars", "BETTER_AUTH_URL"], "http://localhost:3000"],
    [["vars", "VITE_URL"], "http://localhost:3000"],
    [["vars", edgeEnv.turnstile.siteKey], "1x00000000000000000000AA"],
    [["vars", edgeEnv.analytics.webAnalyticsToken], ""],
    [["routes"], []],
    [
      ["send_email", 0, "allowed_sender_addresses"],
      [/<([^<>]+)>$/.exec(sender)?.[1] ?? sender],
    ],
    [["d1_databases", 0, "database_name"], project.name],
    [["d1_databases", 0, "database_id"], randomUUID()],
    [["kv_namespaces", 0, "id"], randomBytes(16).toString("hex")],
    [["r2_buckets", 0, "bucket_name"], project.name],
    [["flagship", 0, "app_id"], randomUUID()],
    [["queues", "producers", 0, "queue"], `${project.name}-jobs`],
    [["queues", "consumers", 0, "queue"], `${project.name}-jobs`],
  ];

  for (const [key, value] of Object.entries(values)) {
    if (!wranglerVarKeys.has(key)) continue;
    changes.push([
      ["vars", key],
      key === edgeEnv.auth.password || key === edgeEnv.auth.anonymous
        ? value === "true"
        : value,
    ]);
  }

  const indent = /(?:^|\r?\n)([ \t]+)"/.exec(source)?.[1] ?? "  ";
  const formattingOptions = {
    eol: source.includes("\r\n") ? "\r\n" : "\n",
    insertSpaces: !indent.includes("\t"),
    tabSize: indent.includes("\t") ? 1 : indent.length,
  };
  let updated = source;
  for (const [path, value] of changes) {
    updated = applyEdits(
      updated,
      modify(updated, path, value, { formattingOptions }),
    );
  }
  await fs.writeFile(path, updated);
  return true;
};
