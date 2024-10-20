import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import { join } from "path";
import color from "picocolors";
import prompts from "prompts";

import { App, config } from "~/config";
import { logger, onCancel } from "~/utils";

import { validatePrerequisites } from "./prerequisites";

export const newCommand = new Command()
  .name("new")
  .description("create a new TurboStarter project")
  .action(async () => {
    logger.log(`${color.bgYellow(color.black(" TurboStarter "))}\n`);

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

    // const supabaseConfig = await getSupabaseConfig();
    // const billingConfig = await getBillingConfig();
    // const emailConfig = await getEmailConfig();

    // const env = {
    //   ...("env" in supabaseConfig ? supabaseConfig.env : {}),
    //   ...billingConfig,
    //   ...emailConfig,
    // };

    // await prepareEnvironment(global.name);
    // await setEnvironmentVariables(global.name, env);

    await cloneRepository(global.name);
    // await installDependencies(response.name);
    // await startSupabase(response.name);

    logger.log(
      `\n🎉 You can now get started. Open the project and just ship it! 🎉\n`,
    );

    logger.info(
      `Problems? ${color.underline("https://turbostarter.dev/docs")}`,
    );
  });

const cloneRepository = async (name: string) => {
  const spinner = ora(`Cloning repository into ${name}...`).start();
  const cwd = join(process.cwd(), name);

  try {
    await execa("git", ["clone", "--no-checkout", config.repository, name]);
    await execa("git", ["sparse-checkout", "init", "--no-cone"], {
      cwd,
    });
    await execa("git", ["sparse-checkout", "set", `'/*'`, `'!/apps/mobile/*'`]);
    await execa("git", ["checkout"], { cwd });

    spinner.succeed("Repository successfully pulled!");
  } catch (error) {
    console.error(error);
    spinner.fail("Failed to clone TurboStarter!");
    process.exit(1);
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
    process.exit(1);
  }
};
