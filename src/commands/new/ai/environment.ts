import { copyEnvExamples, setEnvValue } from "../common";

import type { NewProject } from "../common";

export const prepareEnvironment = async (
  project: NewProject,
  cwd: string,
  mobile: boolean,
  databaseUrl?: string,
) => {
  await copyEnvExamples(cwd, [
    ".",
    "apps/web",
    ...(mobile ? ["apps/mobile"] : []),
  ]);
  await setEnvValue(cwd, ".", "PRODUCT_NAME", project.projectName);
  if (databaseUrl) {
    await setEnvValue(cwd, ".", "DATABASE_URL", databaseUrl);
  }
};
