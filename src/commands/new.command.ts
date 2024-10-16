import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import { join } from "path";
import color from "picocolors";
import prompts from "prompts";

import { config } from "~/config";
import { logger } from "~/utils";

export const newCommand = new Command()
  .name("new")
  .description("create a new TurboStarter project")
  .action(async () => {
    logger.log(`${color.bgYellow(color.black(" TurboStarter "))}\n`);

    const response = await prompts({
      type: "text",
      name: "name",
      message: "What's the name of the project?",
      validate: (value: string) =>
        value.length > 0 ? true : "Name is required!",
    });

    if (!response.name) {
      logger.error("Operation aborted.");
      return;
    }

    await cloneRepository(config.repository, response.name);
    await installDependencies(response.name);

    logger.log(
      `\n🎉 You can now get started. Open the project and start coding! 🎉\n`,
    );

    logger.info(
      `Problems? ${color.underline("https://turbostarter.dev/docs")}`,
    );
  });

const cloneRepository = async (repository: string, name: string) => {
  const spinner = ora(`Cloning repository into ${name}...`).start();

  try {
    await execa("git", ["clone", repository, name]);

    spinner.succeed("Repository successfully pulled!");
  } catch {
    spinner.fail("Failed to clone TurboStarter!");

    return Promise.reject(new Error("Failed to clone TurboStarter!"));
  }
};

const installDependencies = async (name: string) => {
  const cwd = join(process.cwd(), name);
  const spinner = ora(`Installing dependencies...`).start();

  try {
    await execa("pnpm", ["install"], { cwd });

    spinner.succeed("Dependencies successfully installed!");
  } catch {
    spinner.fail("Failed to install dependencies!");

    return Promise.reject(new Error("Failed to install dependencies!"));
  }
};
