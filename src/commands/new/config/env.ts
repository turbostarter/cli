import { promises } from "fs";
import _ from "lodash";
import ora from "ora";
import { join } from "path";

import { EnvFile, envInPaths, EnvPath } from "~/config";
import { logger } from "~/utils";

export const prepareEnvironment = async (projectDir: string) => {
  try {
    await Promise.allSettled(
      Object.values(EnvPath).map(async (path) => {
        const cwd = join(projectDir, path);
        await promises.copyFile(
          join(cwd, EnvFile.EXAMPLE),
          join(cwd, EnvFile.LOCAL),
        );
      }),
    );
  } catch (error) {
    logger.error(error);
    logger.error("Failed to prepare environment!");
    process.exit(1);
  }
};

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
    const cwd = join(projectDir, path);
    const envFilePath = join(cwd, EnvFile.LOCAL);

    const content = await promises.readFile(envFilePath, "utf8");

    const regex = new RegExp(`^${key}=.*`, "gm");

    if (regex.test(content)) {
      await promises.writeFile(
        envFilePath,
        content.replace(regex, `${key}="${value}"`),
      );
    } else {
      await promises.appendFile(envFilePath, `\n${key}="${value}"`);
    }
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
