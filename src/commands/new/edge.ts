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

const syncWranglerVars = async (
  cwd: string,
  values: Record<string, string>,
) => {
  for (const name of ["wrangler.local.jsonc", "wrangler.jsonc"]) {
    const file = join(cwd, name);
    let content = await promises.readFile(file, "utf8");
    for (const [key, value] of Object.entries(values)) {
      if (!wranglerVarKeys.has(key)) continue;
      const encoded = ["VITE_AUTH_PASSWORD", "VITE_AUTH_ANONYMOUS"].includes(
        key,
      )
        ? String(value === "true")
        : JSON.stringify(value);
      const pattern = new RegExp(`^([ \\t]*)"${key}":.*,$`, "m");
      if (pattern.test(content)) {
        content = content.replace(
          pattern,
          (_line, indent: string) => `${indent}"${key}": ${encoded},`,
        );
      } else {
        content = content.replace(
          '"vars": {\n',
          `"vars": {\n    "${key}": ${encoded},\n`,
        );
      }
    }
    if (values.EMAIL_FROM) {
      const address =
        /<([^<>]+)>$/.exec(values.EMAIL_FROM)?.[1] ?? values.EMAIL_FROM;
      const allowedSenders = /"allowed_sender_addresses": \[[^\]]*\]/;
      if (!allowedSenders.test(content)) {
        throw new Error(
          `Edge template changed: ${name} has no email sender binding.`,
        );
      }
      content = content.replace(
        allowedSenders,
        `"allowed_sender_addresses": [${JSON.stringify(address)}]`,
      );
    }
    await promises.writeFile(file, content);
  }
};

export const initializeEdgeProject = async (project: NewProject) => {
  const configure = await getConfigureProvidersStep();
  logger.log(
    `\nCreating a new Edge Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );

  const projectDir = await cloneKit(project, "edge");
  const starterConfig = await promises.readFile(
    join(projectDir, "wrangler.starter.jsonc"),
    "utf8",
  );
  if (!starterConfig.includes("__PROJECT_NAME__")) {
    throw new Error(
      "Edge starter config is missing its project-name placeholder.",
    );
  }
  await promises.writeFile(
    join(projectDir, "wrangler.jsonc"),
    starterConfig
      .replaceAll("__PROJECT_NAME__", project.name)
      .replace(
        `"VITE_PRODUCT_NAME": "${project.name}"`,
        `"VITE_PRODUCT_NAME": ${JSON.stringify(project.projectName)}`,
      ),
  );
  const localConfig = await promises.readFile(
    join(projectDir, "wrangler.local.jsonc"),
    "utf8",
  );
  if (!localConfig.includes('"name": "edge-local"')) {
    throw new Error("Edge local config is missing its starter name.");
  }
  await promises.writeFile(
    join(projectDir, "wrangler.local.jsonc"),
    localConfig
      .replaceAll("edge-local", project.name)
      .replace(
        '"VITE_PRODUCT_NAME": "TurboEdge"',
        `"VITE_PRODUCT_NAME": ${JSON.stringify(project.projectName)}`,
      ),
  );
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
  await syncWranglerVars(projectDir, {
    VITE_PRODUCT_NAME: project.projectName,
    CONTACT_EMAIL: "hello@example.com",
    EMAIL_FROM: `${project.projectName} <noreply@example.com>`,
    ...configured,
  });

  await installKitDependencies(projectDir);
  const spinner = ora("Preparing local D1 database...").start();
  try {
    await execa("pnpm", ["db:migrate"], { cwd: projectDir });
    spinner.succeed("Local D1 database ready!");
  } catch (error) {
    spinner.fail("Failed to prepare local D1 database.");
    throw error;
  }
  await configureKitGit(projectDir, "edge", true);
};
