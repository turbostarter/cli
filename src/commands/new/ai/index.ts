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
import { getDatabaseConfig } from "../database";
import { startServices } from "../services";

import { prepareAiEnvironment } from "./environment";
import { chooseMobile, removeMobile } from "./mobile";
import { configureAiProviders } from "./providers";

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
  if (!mobile) await removeMobile(projectDir);

  const databaseUrl =
    "env" in db &&
    db.env &&
    typeof db.env === "object" &&
    "DATABASE_URL" in db.env
      ? db.env.DATABASE_URL
      : undefined;
  await prepareAiEnvironment(
    project,
    projectDir,
    mobile,
    typeof databaseUrl === "string" ? databaseUrl : undefined,
  );
  if (configure) await configureAiProviders(projectDir);

  await installKitDependencies(projectDir);
  await configureKitGit(projectDir);
  if (db.type === ServiceType.LOCAL)
    await startServices(projectDir, [Service.DB]);
};
