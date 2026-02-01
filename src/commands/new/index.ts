import { Command } from "commander";
import { execa } from "execa";
import ora from "ora";
import path, { join } from "path";
import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { getAnalyticsConfig } from "~/commands/new/config/analytics";
import { getBillingConfig } from "~/commands/new/config/billing";
import { getDatabaseConfig } from "~/commands/new/config/db";
import { getEmailConfig } from "~/commands/new/config/email";
import {
  prepareEnvironment,
  setEnvironmentVariables,
} from "~/commands/new/config/env";
import { getMonitoringConfig } from "~/commands/new/config/monitoring";
import { getStorageConfig } from "~/commands/new/config/storage";
import { startServices } from "~/commands/new/services";
import {
  App,
  appSpecificFiles,
  config,
  providerConfigFiles,
  Service,
  ServiceType,
} from "~/config";
import { handleError, logger, onCancel } from "~/utils";
import { removePaths, replaceInFiles } from "~/utils/file";

import { validatePrerequisites } from "./prerequisites";

import type {
  AnalyticsProvider,
  BillingProvider,
  EmailProvider,
  MonitoringProvider,
  StorageProvider,
} from "~/config";

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
      logger.log(`\n${color.bgRedBright(color.white(" TurboStarter "))}\n`);

      const options = newOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
      });

      const { name } = await initializeProject(options);

      logger.log(
        `\n🎉 You can now get started. Open the project and just ship it! 🎉\n`,
      );
      logger.log(`> cd ${name}\n> pnpm dev\n`);
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

  const name = await getName();
  const apps = await getApps();

  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const dbConfig = await getDatabaseConfig();
  const emailConfig = await getEmailConfig();
  const billingConfig = await getBillingConfig(apps);
  const analyticsConfig = await getAnalyticsConfig(apps);
  const storageConfig = await getStorageConfig();
  const monitoringConfig = await getMonitoringConfig(apps);

  const env = {
    ...("env" in dbConfig ? dbConfig.env : {}),
    ...billingConfig.env,
    ...emailConfig.env,
    ...storageConfig.env,
    ...analyticsConfig.env,
    ...monitoringConfig.env,
  };

  logger.log(
    `\nCreating a new TurboStarter project in ${color.greenBright(join(options.cwd, name))}. \n`,
  );

  const projectDir = await cloneRepository(options.cwd, name, apps);
  await prepareEnvironment(projectDir);
  await updateProvidersFiles(projectDir, {
    email: emailConfig.provider,
    storage: storageConfig.provider,
    billing: billingConfig.providers,
    analytics: analyticsConfig.providers,
    monitoring: monitoringConfig.providers,
  });
  await setEnvironmentVariables(projectDir, env);
  await configureGit(projectDir);
  await installDependencies(projectDir);

  const localServices = [
    ...(dbConfig.type === ServiceType.LOCAL ? [Service.DB] : []),
  ];

  if (localServices.length > 0) {
    await startServices(projectDir, localServices);
  }

  return { name, apps };
};

const getName = async () => {
  const result = await prompts(
    {
      type: "text",
      name: "name",
      message: "Enter your project name.",
      validate: (value: string) =>
        value.length > 0 ? true : "Name is required!",
    },
    {
      onCancel,
    },
  );

  return String(result.name);
};

const getApps = async () => {
  while (true) {
    const result = await prompts(
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
        onCancel,
      },
    );

    const apps = result.apps as App[];

    if (apps.includes(App.WEB)) {
      return apps;
    } else {
      logger.error(
        `You ${color.bold("must")} ship a web app, to ensure backend services work.`,
      );
    }
  }
};

const getRepositoryUrl = async (httpsUrl: string): Promise<string> => {
  try {
    await execa("ssh", ["-T", "git@github.com"], { timeout: 5000 });
    return httpsUrl.replace("https://github.com/", "git@github.com:");
  } catch {
    return httpsUrl;
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
    const url = await getRepositoryUrl(config.repository);
    await execa("git", ["clone", "-b", "main", "--single-branch", url, name], {
      cwd,
    });

    if (filesToRemove.length) {
      await removePaths({ cwd: projectDir, paths: filesToRemove });
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
    await removePaths({ cwd, paths: [".git"] });
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

const updateProvidersFiles = async (
  cwd: string,
  providers: {
    email?: EmailProvider;
    storage?: StorageProvider;
    billing?: Partial<BillingProvider>;
    analytics?: Partial<AnalyticsProvider>;
    monitoring?: Partial<MonitoringProvider>;
  },
) => {
  const spinner = ora(`Updating providers files...`).start();

  try {
    if (providers.email) {
      await replaceInFiles({
        cwd,
        paths: providerConfigFiles.email.files,
        pattern: providerConfigFiles.email.pattern,
        value: providers.email,
      });
    }
    if (providers.storage) {
      await replaceInFiles({
        cwd,
        paths: providerConfigFiles.storage.files,
        pattern: providerConfigFiles.storage.pattern,
        value: providers.storage,
      });
    }
    if (providers.billing && Object.keys(providers.billing).length > 0) {
      await Promise.all(
        Object.entries(providers.billing).map(([key, value]) =>
          replaceInFiles({
            cwd,
            paths:
              providerConfigFiles.billing[key as keyof typeof BillingProvider]
                .files,
            pattern:
              providerConfigFiles.billing[key as keyof typeof BillingProvider]
                .pattern,
            value,
          }),
        ),
      );
    }
    if (providers.analytics && Object.keys(providers.analytics).length > 0) {
      await Promise.all(
        Object.entries(providers.analytics).map(([key, value]) =>
          replaceInFiles({
            cwd,
            paths:
              providerConfigFiles.analytics[
                key as keyof typeof AnalyticsProvider
              ].files,
            pattern:
              providerConfigFiles.analytics[
                key as keyof typeof AnalyticsProvider
              ].pattern,
            value,
          }),
        ),
      );
    }
    if (providers.monitoring && Object.keys(providers.monitoring).length > 0) {
      await Promise.all(
        Object.entries(providers.monitoring).map(([key, value]) =>
          replaceInFiles({
            cwd,
            paths:
              providerConfigFiles.monitoring[
                key as keyof typeof MonitoringProvider
              ].files,
            pattern:
              providerConfigFiles.monitoring[
                key as keyof typeof MonitoringProvider
              ].pattern,
            value,
          }),
        ),
      );
    }

    spinner.succeed("Providers files successfully updated!");
  } catch (e) {
    console.error(e);
    spinner.fail("Failed to update providers files! Please try again.");
    process.exit(1);
  }
};
