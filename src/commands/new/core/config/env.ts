import _ from "lodash";
import ora from "ora";

import { envInPaths } from "~/config";
import { logger } from "~/utils";

import { setEnvValue } from "../../common";

export const setEnvironmentVariable = async (
  projectDir: string,
  key: string,
  value: string,
) => {
  if (!value) {
    return;
  }

  const paths = _.keys(
    _.pickBy(envInPaths, (values) => _.includes(values, key)),
  );

  for (const path of paths) {
    await setEnvValue(projectDir, path, key, value);
  }
};

export const setEnvironmentVariables = async (
  projectDir: string,
  variables: Record<string, string>,
) => {
  const spinner = ora(`Setting environment variables...`).start();

  try {
    for (const [key, value] of Object.entries(variables)) {
      await setEnvironmentVariable(projectDir, key, value);
    }

    spinner.succeed("Environment variables successfully set!");
  } catch (error) {
    logger.error(error);
    logger.error("Failed to set environment variables!");
    process.exit(1);
  }
};
