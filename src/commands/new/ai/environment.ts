import { copyEnvExamples, setEnvValue } from "../common";

import type { NewProject } from "../common";

export const prepareEnvironment = async (
  project: NewProject,
  cwd: string,
  mobile: boolean,
) => {
  await copyEnvExamples(cwd, [
    ".",
    "apps/web",
    ...(mobile ? ["apps/mobile"] : []),
  ]);
  await setEnvValue(cwd, ".", "PRODUCT_NAME", project.projectName);
};
