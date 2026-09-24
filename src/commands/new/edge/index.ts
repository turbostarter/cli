import { join } from "node:path";
import color from "picocolors";

import { Kit } from "~/config";
import { logger } from "~/utils";

import {
  cloneKit,
  configureGit,
  getConfigureProvidersStep,
  installtDependencies,
} from "../common";

import { prepareLocalD1 } from "./database";
import { prepareEdgeEnvironment } from "./environment";
import { configureWrangler } from "./wrangler";

import type { NewProject } from "../common";

export const initializeEdgeProject = async (project: NewProject) => {
  const configure = await getConfigureProvidersStep();
  logger.log(
    `\nCreating a new Edge Kit project in ${color.greenBright(join(project.cwd, project.name))}.\n`,
  );

  const projectDir = await cloneKit(project, Kit.EDGE);
  const values = await prepareEdgeEnvironment(project, projectDir, configure);
  await configureWrangler(project, projectDir, values);
  await installtDependencies(projectDir);
  await prepareLocalD1(projectDir);
  await configureGit(projectDir);
};
