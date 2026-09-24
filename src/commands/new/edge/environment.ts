import { copyEnvExamples, createAuthSecret, setEnvValue } from "../common";

import { configureEdgeProviders } from "./providers";

import type { NewProject } from "../common";

export const prepareEdgeEnvironment = async (
  project: NewProject,
  cwd: string,
  configure: boolean,
) => {
  await copyEnvExamples(cwd, ["."]);
  await setEnvValue(cwd, ".", "VITE_PRODUCT_NAME", project.projectName);
  await setEnvValue(cwd, ".", "BETTER_AUTH_SECRET", createAuthSecret());
  await setEnvValue(cwd, ".", "CONTACT_EMAIL", "hello@example.com");
  await setEnvValue(
    cwd,
    ".",
    "EMAIL_FROM",
    `${project.projectName} <noreply@example.com>`,
  );

  return {
    VITE_PRODUCT_NAME: project.projectName,
    CONTACT_EMAIL: "hello@example.com",
    EMAIL_FROM: `${project.projectName} <noreply@example.com>`,
    ...(configure ? await configureEdgeProviders(cwd) : {}),
  };
};
