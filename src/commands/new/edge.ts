import { execa } from "execa";
import { promises } from "node:fs";
import { join } from "node:path";
import ora from "ora";
import color from "picocolors";

import { logger } from "~/utils";

import {
  cloneKit,
  configureEnvGroups,
  configureKitGit,
  copyEnvExamples,
  createAuthSecret,
  getConfigureProvidersStep,
  installKitDependencies,
  setEnvValue,
} from "./common";

import type { NewProject } from "./common";

const edgeGroups = [
  {
    title: "contact and sender email",
    path: ".",
    entries: [
      { key: "CONTACT_EMAIL", label: "Contact inbox email" },
      { key: "EMAIL_FROM", label: "Sender email address" },
    ],
  },
  {
    title: "authentication methods and OAuth",
    path: ".",
    entries: [
      {
        key: "VITE_AUTH_PASSWORD",
        label: "Enable password authentication? (true/false)",
        boolean: true,
      },
      {
        key: "VITE_AUTH_ANONYMOUS",
        label: "Enable anonymous authentication? (true/false)",
        boolean: true,
      },
      { key: "GOOGLE_CLIENT_ID", label: "Google client ID" },
      {
        key: "GOOGLE_CLIENT_SECRET",
        label: "Google client secret",
        secret: true,
      },
      { key: "GITHUB_CLIENT_ID", label: "GitHub client ID" },
      {
        key: "GITHUB_CLIENT_SECRET",
        label: "GitHub client secret",
        secret: true,
      },
      { key: "CLOUDFLARE_CLIENT_ID", label: "Cloudflare client ID" },
      {
        key: "CLOUDFLARE_CLIENT_SECRET",
        label: "Cloudflare client secret",
        secret: true,
      },
    ],
  },
  {
    title: "Turnstile",
    path: ".",
    entries: [
      { key: "VITE_TURNSTILE_SITE_KEY", label: "Turnstile site key" },
      {
        key: "TURNSTILE_SECRET_KEY",
        label: "Turnstile secret key",
        secret: true,
      },
    ],
  },
  {
    title: "Stripe",
    path: ".",
    entries: [
      { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", secret: true },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Stripe webhook secret",
        secret: true,
      },
    ],
  },
  {
    title: "Cloudflare Web Analytics",
    path: ".",
    entries: [
      { key: "VITE_CF_WEB_ANALYTICS_TOKEN", label: "Web Analytics token" },
    ],
  },
];

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
  vars?: Record<string, string | boolean>;
  routes?: unknown;
  flagship?: unknown;
  ai?: unknown;
  send_email?: { allowed_sender_addresses: string[] }[];
  d1_databases?: { database_name: string; database_id: string }[];
  kv_namespaces?: { id: string }[];
  r2_buckets?: { bucket_name: string }[];
  queues?: {
    producers: { queue: string }[];
    consumers: { queue: string }[];
  };
}

const configureWrangler = async (
  project: NewProject,
  cwd: string,
  values: Partial<Record<string, string>>,
) => {
  const file = join(cwd, "wrangler.jsonc");
  const source = await promises.readFile(file, "utf8");
  const config = JSON.parse(
    source.replace(/,(\s*[}\]])/g, "$1"),
  ) as EdgeWrangler;
  if (
    !config.vars ||
    !config.send_email?.[0] ||
    !config.d1_databases?.[0] ||
    !config.kv_namespaces?.[0] ||
    !config.r2_buckets?.[0] ||
    !config.queues?.producers[0] ||
    !config.queues.consumers[0]
  ) {
    throw new Error(
      "Edge template changed: required Wrangler bindings missing.",
    );
  }

  config.name = project.name;
  delete config.routes;
  delete config.flagship;
  delete config.ai;
  config.vars.BETTER_AUTH_URL = "http://localhost:3000";
  config.vars.VITE_URL = "http://localhost:3000";
  config.vars.VITE_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  delete config.vars.VITE_CF_WEB_ANALYTICS_TOKEN;
  for (const [key, value] of Object.entries(values)) {
    if (!wranglerVarKeys.has(key) || value === undefined) continue;
    config.vars[key] =
      key === "VITE_AUTH_PASSWORD" || key === "VITE_AUTH_ANONYMOUS"
        ? value === "true"
        : value;
  }

  const sender =
    values.EMAIL_FROM ?? `${project.projectName} <noreply@example.com>`;
  config.send_email[0].allowed_sender_addresses = [
    /<([^<>]+)>$/.exec(sender)?.[1] ?? sender,
  ];
  config.d1_databases[0].database_name = project.name;
  config.d1_databases[0].database_id = "00000000-0000-0000-0000-000000000000";
  config.kv_namespaces[0].id = "00000000000000000000000000000000";
  config.r2_buckets[0].bucket_name = project.name;
  config.queues.producers[0].queue = `${project.name}-jobs`;
  config.queues.consumers[0].queue = `${project.name}-jobs`;

  await promises.writeFile(file, `${JSON.stringify(config, null, 2)}\n`);
};

export const initializeEdgeProject = async (project: NewProject) => {
  const configure = await getConfigureProvidersStep();
  logger.log(
    `\nCreating a new Edge Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );

  const projectDir = await cloneKit(project, "edge");
  await copyEnvExamples(projectDir, ["."]);
  await setEnvValue(projectDir, ".", "VITE_PRODUCT_NAME", project.projectName);
  await setEnvValue(projectDir, ".", "BETTER_AUTH_SECRET", createAuthSecret());
  await setEnvValue(projectDir, ".", "CONTACT_EMAIL", "hello@example.com");
  await setEnvValue(
    projectDir,
    ".",
    "EMAIL_FROM",
    `${project.projectName} <noreply@example.com>`,
  );
  const configured = configure
    ? await configureEnvGroups(projectDir, edgeGroups)
    : {};
  await configureWrangler(project, projectDir, {
    VITE_PRODUCT_NAME: project.projectName,
    CONTACT_EMAIL: "hello@example.com",
    EMAIL_FROM: `${project.projectName} <noreply@example.com>`,
    ...configured,
  });

  await installKitDependencies(projectDir);
  const spinner = ora("Preparing local D1 database...").start();
  try {
    await execa("pnpm", ["db:migrate", "--local"], { cwd: projectDir });
    spinner.succeed("Local D1 database ready!");
  } catch (error) {
    spinner.fail("Failed to prepare local D1 database.");
    throw error;
  }
  await configureKitGit(projectDir, "edge", true);
};
