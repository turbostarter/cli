import { copyEnvExamples, createAuthSecret, setEnvValue } from "../common";

import type { NewProject } from "../common";

export const prepareAiEnvironment = async (
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
  await setEnvValue(cwd, "apps/web", "BETTER_AUTH_SECRET", createAuthSecret());
  if (databaseUrl) await setEnvValue(cwd, ".", "DATABASE_URL", databaseUrl);
};
