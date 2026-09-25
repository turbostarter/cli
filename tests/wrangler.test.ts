import { parse } from "jsonc-parser";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { configureWrangler } from "../src/commands/new/edge/wrangler";
import { logger } from "../src/utils/logger";

import type { ParseError } from "jsonc-parser";

const project = {
  cwd: tmpdir(),
  name: "example-app",
  projectName: "Example App",
};

const wrangler = `{
  // Keep this deployment note.
  "name": "template", // Keep this name note.
  "vars": {
    "EXISTING": "https://example.com/a,}", // Keep this inline note.
    "VITE_AUTH_PASSWORD": false,
  },
  "routes": ["example.com/*",],
  "send_email": [{ "allowed_sender_addresses": ["old@example.com",] }],
  "d1_databases": [{ "database_name": "old", "database_id": "old-id" }],
  "kv_namespaces": [{ "id": "old-id" }],
  "r2_buckets": [{ "bucket_name": "old" }],
  "flagship": [{ "app_id": "old-id" }],
  "queues": {
    "producers": [{ "queue": "old-jobs" }],
    "consumers": [{ "queue": "old-jobs" }],
  },
}
`;

const captureInfo = async (run: () => Promise<boolean>) => {
  const messages: string[] = [];
  const originalInfo = logger.info.bind(logger);
  logger.info = (message) => messages.push(String(message));
  try {
    return { configured: await run(), messages };
  } finally {
    logger.info = originalInfo;
  }
};

void test("configures commented Wrangler JSONC while preserving comments and existing values", async (t) => {
  const cwd = await fs.mkdtemp(join(tmpdir(), "wrangler-jsonc-"));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  await fs.writeFile(join(cwd, "wrangler.jsonc"), wrangler);

  const configured = await configureWrangler(project, cwd, {
    EMAIL_FROM: "TurboStarter <noreply@example.com>",
    VITE_PRODUCT_NAME: "Example App",
    VITE_AUTH_PASSWORD: "true",
  });
  assert.equal(configured, true);

  const updated = await fs.readFile(join(cwd, "wrangler.jsonc"), "utf8");
  assert.match(updated, /\/\/ Keep this deployment note\./);
  assert.match(updated, /\/\/ Keep this name note\./);
  assert.match(updated, /\/\/ Keep this inline note\./);
  assert.match(updated, /"EXISTING": "https:\/\/example\.com\/a,}"/);
  const errors: ParseError[] = [];
  const config = parse(updated, errors, { allowTrailingComma: true }) as {
    name: string;
    vars: Record<string, string | boolean>;
    routes: string[];
    send_email: { allowed_sender_addresses: string[] }[];
    d1_databases: { database_name: string }[];
    r2_buckets: { bucket_name: string }[];
    queues: {
      producers: { queue: string }[];
      consumers: { queue: string }[];
    };
  };
  assert.deepEqual(errors, []);
  assert.equal(config.name, "example-app");
  assert.equal(config.vars.EXISTING, "https://example.com/a,}");
  assert.equal(config.vars.VITE_PRODUCT_NAME, "Example App");
  assert.equal(config.vars.VITE_AUTH_PASSWORD, true);
  assert.deepEqual(config.routes, []);
  assert.deepEqual(config.send_email[0].allowed_sender_addresses, [
    "noreply@example.com",
  ]);
  assert.equal(config.d1_databases[0].database_name, "example-app");
  assert.equal(config.r2_buckets[0].bucket_name, "example-app");
  assert.equal(config.queues.producers[0].queue, "example-app-jobs");
  assert.equal(config.queues.consumers[0].queue, "example-app-jobs");
});

void test("logs invalid JSONC and continues without changing the file", async (t) => {
  const cwd = await fs.mkdtemp(join(tmpdir(), "wrangler-jsonc-"));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  const path = join(cwd, "wrangler.jsonc");
  const invalid = '{ "name": "template", /* unfinished';
  await fs.writeFile(path, invalid);

  const { configured, messages } = await captureInfo(() =>
    configureWrangler(project, cwd, {}),
  );
  assert.equal(configured, false);
  assert.ok(
    messages.some((message) => message.includes("invalid JSONC at offset")),
  );
  assert.equal(await fs.readFile(path, "utf8"), invalid);
});

void test("logs changed Wrangler shape and continues without changing the file", async (t) => {
  const cwd = await fs.mkdtemp(join(tmpdir(), "wrangler-jsonc-"));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  const path = join(cwd, "wrangler.jsonc");
  const changed = wrangler.replace(
    '"flagship": [{ "app_id": "old-id" }],',
    '"flagship": [],',
  );
  await fs.writeFile(path, changed);

  const { configured, messages } = await captureInfo(() =>
    configureWrangler(project, cwd, {}),
  );
  assert.equal(configured, false);
  assert.ok(
    messages.some((message) => /expected shape.*flagship/.test(message)),
  );
  assert.equal(await fs.readFile(path, "utf8"), changed);
});
