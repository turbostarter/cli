import { copyEnvExamples, createAuthSecret, setEnvValue } from "../common";

import { App } from "./config/definitions";

import type { NewProject } from "../common";

export const prepareCoreEnvironment = async (
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
  await setEnvValue(cwd, "apps/web", "BETTER_AUTH_SECRET", createAuthSecret());
};
