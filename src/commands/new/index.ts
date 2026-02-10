import { Command } from "commander";
import { execa } from "execa";
import { promises } from "fs";
import ora from "ora";
import path, { join } from "path";
import color from "picocolors";
import prompts from "prompts";
import { Project } from "ts-morph";
import { z } from "zod";

import { getAnalyticsConfig } from "~/commands/new/config/analytics";
import { getBillingConfig } from "~/commands/new/config/billing";
import { getDatabaseConfig } from "~/commands/new/config/db";
import { getEmailConfig } from "~/commands/new/config/email";
import {
  prepareEnvironment,
  setEnvironmentVariables,
} from "~/commands/new/config/env";
import { fileModificationsByMissingApp } from "~/commands/new/config/file-modifications";
import { getMonitoringConfig } from "~/commands/new/config/monitoring";
import { getStorageConfig } from "~/commands/new/config/storage";
import {
  App,
  config,
  providerConfigFiles,
  Service,
  ServiceType,
} from "~/config";
import {
  enforceSchema,
  hasSshAccess,
  httpsUrl,
  logger,
  onCancel,
  setUpstreamRemote,
  sshUrl,
} from "~/utils";
import {
  isJsonFile,
  isTypescriptFile,
  removePath,
  replaceInFiles,
} from "~/utils/file";

import { validatePrerequisites } from "./prerequisites";
import { startServices } from "./services";

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
      logger.error(error);
      process.exit(1);
    }
  });

const initializeProject = async (options: z.infer<typeof newOptionsSchema>) => {
  await validatePrerequisites();

  const name = await getName();
  const apps = await getApps();

  const shouldConfigureProviders = await getConfigureProvidersStep();
  const config = shouldConfigureProviders
    ? await getProvidersConfig(apps)
    : undefined;

  logger.log(
    `\nCreating a new TurboStarter project in ${color.greenBright(join(options.cwd, name))}. \n`,
  );

  const projectDir = await cloneRepository(options.cwd, name, apps);
  await configureGit(projectDir);
  await prepareEnvironment(projectDir);

  if (config) {
    await setEnvironmentVariables(projectDir, config.env);
    await updateProvidersFiles(projectDir, {
      email: config.email.provider,
      storage: config.storage.provider,
      billing: config.billing.providers,
      analytics: config.analytics.providers,
      monitoring: config.monitoring.providers,
    });
  }

  await installDependencies(projectDir);

  const localServices = [
    ...(!config || config.db.type === ServiceType.LOCAL ? [Service.DB] : []),
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

const getConfigureProvidersStep = async () => {
  const result = await prompts(
    {
      type: "select",
      name: "configure",
      message: "Configure all providers now?",
      choices: [
        {
          title: "Yes, configure now (recommended)",
          value: true,
          selected: true,
        },
        {
          title: "No, just let me ship, now!",
          value: false,
        },
      ],
    },
    {
      onCancel,
    },
  );

  return Boolean(result.configure);
};

const getProvidersConfig = async (apps: App[]) => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const db = await getDatabaseConfig();
  const email = await getEmailConfig();
  const billing = await getBillingConfig(apps);
  const analytics = await getAnalyticsConfig(apps);
  const storage = await getStorageConfig();
  const monitoring = await getMonitoringConfig(apps);

  const env = {
    ...("env" in db ? db.env : {}),
    ...billing.env,
    ...email.env,
    ...storage.env,
    ...analytics.env,
    ...monitoring.env,
  };

  return { db, email, billing, analytics, storage, monitoring, env };
};

const cloneRepository = async (cwd: string, name: string, apps: App[]) => {
  const spinner = ora(`Cloning repository into ${name}...`).start();
  const projectDir = join(cwd, name);

  try {
    const url = (await hasSshAccess())
      ? sshUrl(config.repository)
      : httpsUrl(config.repository);
    await execa("git", ["clone", "-b", "main", "--single-branch", url, name], {
      cwd,
    });

    await modifyFilesForMissingApps(projectDir, apps);

    spinner.succeed("Repository successfully pulled!");
    return projectDir;
  } catch (error) {
    spinner.fail("Failed to clone TurboStarter! Please try again.");
    logger.error(error);
    process.exit(1);
  }
};

const modifyFilesForMissingApps = async (cwd: string, apps: App[]) => {
  const files = Object.values(App)
    .filter((app) => !apps.includes(app))
    .map((app) => fileModificationsByMissingApp[app])
    .flat();

  if (!files.length) {
    return;
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  });

  for (const file of files) {
    if (file.action === "remove") {
      await removePath({ cwd, path: file.path });
    }

    if (file.action === "modify") {
      if (isJsonFile(file)) {
        const data = await promises.readFile(join(cwd, file.path), "utf8");
        const parsed: unknown = JSON.parse(data);
        if (!enforceSchema(parsed, file.schema)) {
          continue;
        }
        const modified = file.modify(parsed);
        await promises.writeFile(
          join(cwd, file.path),
          JSON.stringify(modified, null, 2),
        );
      }

      if (isTypescriptFile(file)) {
        const sourceFile = project.addSourceFileAtPath(join(cwd, file.path));
        file.modify(sourceFile);
        await sourceFile.save();
      }
    }
  }
};

const configureGit = async (cwd: string) => {
  const spinner = ora(`Configuring Git...`).start();

  try {
    const upstreamUrl = (await hasSshAccess())
      ? sshUrl(config.repository)
      : httpsUrl(config.repository);
    await setUpstreamRemote(upstreamUrl, { cwd });

    spinner.succeed("Git successfully configured!");
  } catch (error) {
    spinner.fail("Failed to configure Git! Please try again.");
    logger.error(error);
    process.exit(1);
  }
};

const installDependencies = async (cwd: string) => {
  const spinner = ora(`Installing dependencies...`).start();

  try {
    await execa("pnpm", ["install"], { cwd });
    await execa("pnpm", ["format:fix"], { cwd });

    spinner.succeed("Dependencies successfully installed!");
  } catch (error) {
    spinner.fail("Failed to install dependencies! Please try again.");
    logger.error(error);
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
  } catch (error) {
    spinner.fail("Failed to update providers files! Please try again.");
    logger.error(error);
    process.exit(1);
  }
};
