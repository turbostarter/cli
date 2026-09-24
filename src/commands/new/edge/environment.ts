import { edgeEnv } from "~/commands/new/edge/config";

import { copyEnvExamples, setEnvValue } from "../common";

import type { NewProject } from "../common";

export const prepareEnvironment = async (project: NewProject, cwd: string) => {
  await copyEnvExamples(cwd, ["."]);
  await setEnvValue(cwd, ".", edgeEnv.productName, project.projectName);
};
