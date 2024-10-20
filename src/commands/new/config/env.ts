import { promises } from "fs";
import _ from "lodash";
import ora from "ora";
import { join } from "path";

import { EnvFile, envInPaths, EnvPath } from "~/config";
import { logger } from "~/utils";

export const prepareEnvironment = async (name: string) => {
  try {
    await Promise.all(
      Object.values(EnvPath).map(async (path) => {
        const cwd = join(process.cwd(), name, path);
        await promises.copyFile(
          join(cwd, EnvFile.EXAMPLE),
          join(cwd, EnvFile.LOCAL),
        );
      }),
    );
  } catch {
    logger.error("Failed to prepare environment!");
    process.exit(1);
  }
};

export const setEnvironmentVariable = async (
  name: string,
  key: string,
  value: string,
) => {
  const paths = _.keys(
    _.pickBy(envInPaths, (values) => _.includes(values, key)),
  );

  await Promise.all(
    paths.map(async (path) => {
      const cwd = join(process.cwd(), name, path);
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
    }),
  );
};

export const setEnvironmentVariables = async (
  name: string,
  variables: Record<string, string>,
) => {
  const spinner = ora(`Setting environment variables...`).start();

  try {
    await Promise.all(
      Object.entries(variables).map(([key, value]) =>
        setEnvironmentVariable(name, key, value),
      ),
    );

    spinner.succeed("Environment variables successfully set!");
  } catch {
    logger.error("Failed to set environment variables!");
    process.exit(1);
  }
};
