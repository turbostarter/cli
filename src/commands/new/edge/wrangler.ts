import { randomBytes, randomUUID } from "node:crypto";

import { modifyTextFile } from "~/utils/file";

import type { NewProject } from "../common";

const wranglerVarKeys = new Set([
  "VITE_PRODUCT_NAME",
  "CONTACT_EMAIL",
  "EMAIL_FROM",
  "VITE_AUTH_PASSWORD",
  "VITE_AUTH_ANONYMOUS",
  "VITE_TURNSTILE_SITE_KEY",
  "VITE_CF_WEB_ANALYTICS_TOKEN",
]);

interface EdgeWrangler {
  name: string;
  vars: Record<string, string | boolean>;
  routes: { pattern: string; custom_domain: boolean }[];
  send_email: { allowed_sender_addresses: string[] }[];
  d1_databases: { database_name: string; database_id: string }[];
  kv_namespaces: { id: string }[];
  r2_buckets: { bucket_name: string }[];
  flagship: { app_id: string }[];
  queues: {
    producers: { queue: string }[];
    consumers: { queue: string }[];
  };
}

const setWranglerVars = (
  config: EdgeWrangler,
  values: Record<string, string>,
) => {
  config.vars.BETTER_AUTH_URL = "http://localhost:3000";
  config.vars.VITE_URL = "http://localhost:3000";
  config.vars.VITE_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  config.vars.VITE_CF_WEB_ANALYTICS_TOKEN = "";
  for (const [key, value] of Object.entries(values)) {
    if (!wranglerVarKeys.has(key)) continue;
    config.vars[key] =
      key === "VITE_AUTH_PASSWORD" || key === "VITE_AUTH_ANONYMOUS"
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
      const config = JSON.parse(
        source.replace(/,(\s*[}\]])/g, "$1"),
      ) as EdgeWrangler;
      config.name = project.name;
      setWranglerVars(config, values);
      setWranglerBindings(config, project, values.EMAIL_FROM);

      return `${JSON.stringify(config, null, 2)}\n`;
    },
  });
};
