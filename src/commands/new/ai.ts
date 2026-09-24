import { promises } from "node:fs";
import { join } from "node:path";
import color from "picocolors";
import prompts from "prompts";

import { getDatabaseConfig } from "~/commands/new/config/db";
import { Service, ServiceType } from "~/config";
import { logger, onCancel } from "~/utils";

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
import { startServices } from "./services";

import type { NewProject } from "./common";

const chooseMobile = async () => {
  const result = await prompts(
    {
      type: "confirm",
      name: "mobile",
      message: "Include the mobile app?",
      initial: false,
    },
    { onCancel },
  );
  return Boolean(result.mobile);
};

const removeMobile = async (cwd: string) => {
  await Promise.all(
    [
      "apps/mobile",
      "packages/ui/mobile",
      "packages/auth/src/client/mobile.ts",
      ".github/workflows/publish-mobile.yml",
      "patches",
    ].map((item) =>
      promises.rm(join(cwd, item), { recursive: true, force: true }),
    ),
  );

  const workspace = join(cwd, "pnpm-workspace.yaml");
  const workspaceContent = await promises.readFile(workspace, "utf8");
  const withoutPatches = workspaceContent
    .split("\n")
    .filter(
      (line) =>
        !line.includes("react-native-ios-utilities@") &&
        !line.includes("react-native-pdf@"),
    )
    .join("\n");
  await promises.writeFile(workspace, withoutPatches);

  const authPackage = join(cwd, "packages/auth/package.json");
  const authConfig = JSON.parse(
    await promises.readFile(authPackage, "utf8"),
  ) as {
    dependencies: Record<string, string>;
  };
  delete authConfig.dependencies["@better-auth/expo"];
  await promises.writeFile(
    authPackage,
    `${JSON.stringify(authConfig, null, 2)}\n`,
  );

  const authServer = join(cwd, "packages/auth/src/server.ts");
  let server = await promises.readFile(authServer, "utf8");
  for (const line of [
    'import { expo } from "@better-auth/expo";\n',
    '    "turbostarter-ai://",\n',
    "    expo(),\n",
  ]) {
    if (!server.includes(line))
      throw new Error(
        `AI template changed: expected text missing from ${authServer}`,
      );
    server = server.replace(line, "");
  }
  await promises.writeFile(authServer, server);
};

const aiGroups = [
  {
    title: "AI Gateway",
    entries: [
      { key: "AI_GATEWAY_API_KEY", label: "AI Gateway API key", secret: true },
    ],
  },
  {
    title: "other model providers",
    entries: [
      ["OPENAI_API_KEY", "OpenAI API key"],
      ["ANTHROPIC_API_KEY", "Anthropic API key"],
      ["GOOGLE_GENERATIVE_AI_API_KEY", "Google Generative AI API key"],
      ["XAI_API_KEY", "xAI API key"],
      ["DEEPSEEK_API_KEY", "DeepSeek API key"],
      ["REPLICATE_API_TOKEN", "Replicate API token"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "AI tools",
    entries: [
      ["BRAVE_SEARCH_API_KEY", "Brave Search API key"],
      ["EXA_API_KEY", "Exa API key"],
      ["FIRECRAWL_API_KEY", "Firecrawl API key"],
      ["TAVILY_API_KEY", "Tavily API key"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "voice",
    entries: [
      { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API key", secret: true },
      { key: "LIVEKIT_API_KEY", label: "LiveKit API key", secret: true },
      { key: "LIVEKIT_API_SECRET", label: "LiveKit API secret", secret: true },
      { key: "LIVEKIT_URL", label: "LiveKit URL" },
    ],
  },
  {
    title: "S3 storage",
    entries: [
      { key: "S3_REGION", label: "S3 region" },
      { key: "S3_BUCKET", label: "S3 bucket" },
      { key: "S3_ENDPOINT", label: "S3 endpoint" },
      { key: "S3_ACCESS_KEY_ID", label: "S3 access key ID", secret: true },
      {
        key: "S3_SECRET_ACCESS_KEY",
        label: "S3 secret access key",
        secret: true,
      },
    ],
  },
];

export const initializeAiProject = async (project: NewProject) => {
  const mobile = await chooseMobile();
  const configure = await getConfigureProvidersStep();
  const db = configure
    ? await getDatabaseConfig({})
    : { type: ServiceType.LOCAL };

  logger.log(
    `\nCreating a new AI Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );
  const projectDir = await cloneKit(project, "ai");
  if (!mobile) await removeMobile(projectDir);
  await copyEnvExamples(projectDir, [
    ".",
    "apps/web",
    ...(mobile ? ["apps/mobile"] : []),
  ]);
  await setEnvValue(projectDir, ".", "PRODUCT_NAME", project.projectName);
  await setEnvValue(
    projectDir,
    "apps/web",
    "BETTER_AUTH_SECRET",
    createAuthSecret(),
  );

  const databaseUrl =
    "env" in db &&
    db.env &&
    typeof db.env === "object" &&
    "DATABASE_URL" in db.env
      ? db.env.DATABASE_URL
      : undefined;
  if (typeof databaseUrl === "string") {
    await setEnvValue(projectDir, ".", "DATABASE_URL", databaseUrl);
  }
  if (configure) await configureEnvGroups(projectDir, "apps/web", aiGroups);

  await installKitDependencies(projectDir);
  await configureKitGit(projectDir);
  if (db.type === ServiceType.LOCAL)
    await startServices(projectDir, [Service.DB]);
};
