import { copyEnvExamples, setEnvValue } from "../common";

import { App } from "./config/definitions";

import type { NewProject } from "../common";

export const prepareEnvironment = async (
  project: NewProject,
  cwd: string,
  apps: App[],
) => {
  await copyEnvExamples(cwd, [
    ".",
    "apps/web",
    ...(apps.includes(App.MOBILE) ? ["apps/mobile"] : []),
    ...(apps.includes(App.EXTENSION) ? ["apps/extension"] : []),
  ]);
  await setEnvValue(cwd, ".", "PRODUCT_NAME", project.projectName);
};
