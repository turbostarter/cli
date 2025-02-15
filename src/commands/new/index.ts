import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import path, { join } from "path";
import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { getBillingConfig } from "~/commands/new/config/billing";
import { getDatabaseConfig } from "~/commands/new/config/db";
import { getEmailConfig } from "~/commands/new/config/email";
import {
  prepareEnvironment,
  setEnvironmentVariables,
} from "~/commands/new/config/env";
import { getStorageConfig } from "~/commands/new/config/storage";
import { startDatabase } from "~/commands/new/db";
import { App, appSpecificFiles, config, DatabaseType } from "~/config";
import { handleError, logger, onCancel } from "~/utils";

import { validatePrerequisites } from "./prerequisites";

const newOptionsSchema = z.object({
  cwd: z.string(),
});

export const newCommand = new Command()
  .name("new")
  .description("create a new TurboStarter project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd(),
  )
  .action(async (opts: z.infer<typeof newOptionsSchema>) => {
    try {
      logger.log(`${color.bgYellow(color.black(" TurboStarter "))}\n`);

      const options = newOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
      });

      await initializeProject(options);

      logger.log(
        `\n🎉 You can now get started. Open the project and just ship it! 🎉\n`,
      );

      logger.info(
        `Problems? ${color.underline("https://turbostarter.dev/docs")}`,
      );
    } catch (error) {
      logger.break();
      handleError(error);
    }
  });

const initializeProject = async (options: z.infer<typeof newOptionsSchema>) => {
  await validatePrerequisites();

  const global = await prompts(
    [
      {
        type: "multiselect",
        name: "apps",
        message: `What do you want to ship?`,
        instructions: false,
        choices: [
          { title: "Web app", value: App.WEB, selected: true },
          { title: "Mobile app", value: App.MOBILE, selected: false },
          {
            title: "Browser extension",
            value: App.EXTENSION,
            selected: false,
          },
        ],
        hint: `You ${color.bold("must")} ship a web app, to ensure backend services work.`,
      },
      {
        type: "text",
        name: "name",
        message: "Enter your project name.",
        validate: (value: string) =>
          value.length > 0 ? true : "Name is required!",
      },
    ],
    {
      onCancel,
    },
  );

  const dbConfig = await getDatabaseConfig();
  const billingConfig = await getBillingConfig();
  const emailConfig = await getEmailConfig();
  const storageConfig = await getStorageConfig();

  const config = {
    ...("env" in dbConfig ? dbConfig.env : {}),
    ...billingConfig,
    ...emailConfig,
    ...storageConfig,
  };

  const projectDir = await cloneRepository(
    options.cwd,
    global.name,
    global.apps,
  );
  await configureGit(projectDir);
  await prepareEnvironment(projectDir);
  await setEnvironmentVariables(projectDir, config);
  await installDependencies(projectDir);

  if (dbConfig.type === DatabaseType.LOCAL) {
    await startDatabase(projectDir);
  }
};

const cloneRepository = async (cwd: string, name: string, apps: App[]) => {
  const spinner = ora(`Cloning repository into ${name}...`).start();
  const projectDir = join(cwd, name);

  const filesToRemove = Object.values(App)
    .filter((app) => !apps.includes(app))
    .map((app) => appSpecificFiles[app])
    .flat();

  try {
    await execa(
      "git",
      ["clone", "-b", "main", "--single-branch", config.repository, name],
      { cwd },
    );

    if (filesToRemove.length) {
      await execa("rm", ["-rf", ...filesToRemove], { cwd: projectDir });
    }

    spinner.succeed("Repository successfully pulled!");
    return projectDir;
  } catch {
    spinner.fail("Failed to clone TurboStarter! Please try again.");
    process.exit(1);
  }
};

const configureGit = async (cwd: string) => {
  const spinner = ora(`Configuring Git...`).start();

  try {
    await execa("rm", ["-rf", ".git"], { cwd });
    await execa("git", ["init"], { cwd });
    await execa("git", ["remote", "add", "upstream", config.repository], {
      cwd,
    });
    await execa("git", ["add", "."], { cwd });
    await execa("git", ["commit", "-m", "Initial commit"], { cwd });

    spinner.succeed("Git successfully configured!");
  } catch {
    spinner.fail("Failed to configure Git! Please try again.");
    process.exit(1);
  }
};

const installDependencies = async (cwd: string) => {
  const spinner = ora(`Installing dependencies...`).start();

  try {
    await execa("pnpm", ["install"], { cwd });

    spinner.succeed("Dependencies successfully installed!");
  } catch {
    spinner.fail("Failed to install dependencies! Please try again.");
    process.exit(1);
  }
};
