import { join } from "node:path";
import color from "picocolors";

import { Kit, Service, ServiceType } from "~/config";
import { logger } from "~/utils";

import {
  cloneKit,
  configureGit,
  getConfigureProvidersStep,
  installtDependencies,
} from "../common";
import { getDatabaseConfig } from "../database";
import { startServices } from "../services";

import { prepareEnvironment } from "./environment";
import { chooseMobile, removeMobile } from "./mobile";
import { configureProviders } from "./providers";

import type { NewProject } from "../common";

export const initializeAiProject = async (project: NewProject) => {
  const mobile = await chooseMobile();
  const configure = await getConfigureProvidersStep();
  const db = configure
    ? await getDatabaseConfig({})
    : { type: ServiceType.LOCAL };

  logger.log(
    `\nCreating a new AI Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );
  const projectDir = await cloneKit(project, Kit.AI);
  if (!mobile) {
    await removeMobile(projectDir);
  }

  const databaseUrl =
    db.type === ServiceType.CLOUD ? db.env.DATABASE_URL : undefined;
  await prepareEnvironment(project, projectDir, mobile, databaseUrl);
  if (configure) {
    await configureProviders(projectDir);
  }

  await installtDependencies(projectDir);
  await configureGit(projectDir);
  if (db.type === ServiceType.LOCAL) {
    await startServices(projectDir, [Service.DB]);
  }
};
