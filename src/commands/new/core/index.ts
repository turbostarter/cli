import { join } from "node:path";
import color from "picocolors";

import { Kit, Service, ServiceType } from "~/config";
import { logger } from "~/utils";

import {
  cloneKit,
  configureKitGit,
  getConfigureProvidersStep,
  installKitDependencies,
} from "../common";
import { startServices } from "../services";

import { getApps, modifyFilesForMissingApps } from "./apps";
import { setEnvironmentVariables } from "./config/env";
import { prepareCoreEnvironment } from "./environment";
import { updateProvidersFiles } from "./provider-files";
import { getProvidersConfig } from "./providers";

import type { NewProject } from "../common";

export const initializeCoreProject = async ({
  cwd,
  name,
  projectName,
}: NewProject) => {
  const apps = await getApps();

  const shouldConfigureProviders = await getConfigureProvidersStep();
  const config = shouldConfigureProviders
    ? await getProvidersConfig(apps)
    : undefined;

  logger.log(
    `\nCreating a new TurboStarter project in ${color.greenBright(join(cwd, name))}. \n`,
  );

  const projectDir = await cloneKit({ cwd, name, projectName }, Kit.CORE);
  await modifyFilesForMissingApps(projectDir, apps);
  await prepareCoreEnvironment({ cwd, name, projectName }, projectDir, apps);

  if (config) {
    await setEnvironmentVariables(projectDir, config.env);
    await updateProvidersFiles(projectDir, {
      email: config.email.provider,
      storage: config.storage.provider,
      billing: config.billing.providers,
      analytics: config.analytics.providers,
      monitoring: config.monitoring.providers,
      flags: config.flags.providers,
    });
  }

  await installKitDependencies(projectDir);
  await configureKitGit(projectDir);

  if (!config || config.db.type === ServiceType.LOCAL)
    await startServices(projectDir, [Service.DB]);
};
