import { join } from "node:path";
import color from "picocolors";

import { envInPaths } from "~/commands/new/ai/config";
import { Kit, Service, ServiceType } from "~/config";
import { logger } from "~/utils";

import {
  cloneKit,
  configureGit,
  getConfigureProvidersStep,
  installDependencies,
  setEnvironmentVariablesInPaths,
} from "../common";
import { startServices } from "../services";

import { prepareEnvironment } from "./environment";
import { chooseMobile, removeMobile } from "./mobile";
import { configureProviders } from "./providers";

import type { NewProject } from "../common";

export const initializeAiProject = async (project: NewProject) => {
  const mobile = await chooseMobile();
  const shouldConfigureProviders = await getConfigureProvidersStep();
  const config = shouldConfigureProviders
    ? await configureProviders()
    : undefined;

  logger.log(
    `\nCreating a new AI Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );
  const projectDir = await cloneKit(project, Kit.AI);
  if (!mobile) {
    await removeMobile(projectDir);
  }

  await prepareEnvironment(project, projectDir, mobile);
  if (config) {
    await setEnvironmentVariablesInPaths(projectDir, config.env, envInPaths);
  }

  await installDependencies(projectDir);
  await configureGit(projectDir);
  if (!config || config.db.type === ServiceType.LOCAL) {
    await startServices(projectDir, [Service.DB]);
  }
};
