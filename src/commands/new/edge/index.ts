import { join } from "node:path";
import color from "picocolors";

import { edgeEnv, envInPaths } from "~/commands/new/edge/config";
import { Kit } from "~/config";
import { logger } from "~/utils";

import {
  cloneKit,
  configureGit,
  getConfigureProvidersStep,
  installDependencies,
  setEnvironmentVariablesInPaths,
} from "../common";

import { prepareLocalD1 } from "./database";
import { prepareEnvironment } from "./environment";
import { configureProviders } from "./providers";
import { configureWrangler } from "./wrangler";

import type { NewProject } from "../common";

export const initializeEdgeProject = async (project: NewProject) => {
  const shouldConfigureProviders = await getConfigureProvidersStep();
  const config = shouldConfigureProviders
    ? await configureProviders()
    : undefined;

  logger.log(
    `\nCreating a new Edge Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );

  const projectDir = await cloneKit(project, Kit.EDGE);
  await prepareEnvironment(project, projectDir);

  if (config) {
    await setEnvironmentVariablesInPaths(projectDir, config.env, envInPaths);
  }

  const wranglerConfigured = await configureWrangler(project, projectDir, {
    [edgeEnv.productName]: project.projectName,
    [edgeEnv.contactEmail]: "hello@example.com",
    [edgeEnv.emailFrom]: `noreply@example.com`,
    ...(config?.env ?? {}),
  });
  await installDependencies(projectDir);
  if (wranglerConfigured) {
    await prepareLocalD1(projectDir);
  } else {
    logger.info(
      "Local D1 setup skipped. Review wrangler.jsonc, then run pnpm db:setup in your project.",
    );
  }
  await configureGit(projectDir);
};
