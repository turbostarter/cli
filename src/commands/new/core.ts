import { promises } from "fs";
import ora from "ora";
import { join } from "path";
import color from "picocolors";
import prompts from "prompts";
import { Project } from "ts-morph";

import { getAnalyticsConfig } from "~/commands/new/config/analytics";
import { getBillingConfig } from "~/commands/new/config/billing";
import { getDatabaseConfig } from "~/commands/new/config/db";
import { getEmailConfig } from "~/commands/new/config/email";
import { setEnvironmentVariables } from "~/commands/new/config/env";
import { fileModificationsByMissingApp } from "~/commands/new/config/file-modifications";
import { getFlagsConfig } from "~/commands/new/config/flags";
import { getMonitoringConfig } from "~/commands/new/config/monitoring";
import { getStorageConfig } from "~/commands/new/config/storage";
import { App, providerConfigFiles, Service, ServiceType } from "~/config";
import { enforceSchema, logger, onCancel } from "~/utils";
import {
  isJsonFile,
  isTextFile,
  isTypescriptFile,
  removePath,
  replaceInFiles,
} from "~/utils/file";

import {
  cloneKit,
  configureKitGit,
  copyEnvExamples,
  createAuthSecret,
  getConfigureProvidersStep,
  installKitDependencies,
  setEnvValue,
} from "./common";
import { startServices } from "./services";

import type { NewProject } from "./common";
import type {
  AnalyticsProvider,
  BillingProvider,
  EmailProvider,
  FlagsProvider,
  MonitoringProvider,
  StorageProvider,
} from "~/config";

export const initializeCoreProject = async ({
  cwd,
  name,
  projectName,
}: NewProject) => {
  const apps = await getApps();

  const shouldConfigureProviders = await getConfigureProvidersStep();
  const config = shouldConfigureProviders
    ? await getProvidersConfig(apps)
    : undefined;

  logger.log(
    `\nCreating a new TurboStarter project in ${color.greenBright(join(cwd, name))}. \n`,
  );

  const projectDir = await cloneKit({ cwd, name, projectName }, "core");
  await modifyFilesForMissingApps(projectDir, apps);
  await copyEnvExamples(projectDir, [
    ".",
    "apps/web",
    ...(apps.includes(App.MOBILE) ? ["apps/mobile"] : []),
    ...(apps.includes(App.EXTENSION) ? ["apps/extension"] : []),
  ]);
  await setEnvValue(projectDir, ".", "PRODUCT_NAME", projectName);
  await setEnvValue(
    projectDir,
    "apps/web",
    "BETTER_AUTH_SECRET",
    createAuthSecret(),
  );

  if (config) {
    await setEnvironmentVariables(projectDir, config.env);
    await updateProvidersFiles(projectDir, {
      email: config.email.provider,
      storage: config.storage.provider,
      billing: config.billing.providers,
      analytics: config.analytics.providers,
      monitoring: config.monitoring.providers,
      flags: config.flags.providers,
    });
  }

  await installKitDependencies(projectDir);
  await configureKitGit(projectDir);

  if (!config || config.db.type === ServiceType.LOCAL)
    await startServices(projectDir, [Service.DB]);
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

const getProvidersConfig = async (apps: App[]) => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const configuredEnv: Record<string, string> = {};

  const db = await getDatabaseConfig(configuredEnv);
  Object.assign(configuredEnv, "env" in db ? db.env : {});

  const email = await getEmailConfig(configuredEnv);
  Object.assign(configuredEnv, email.env);

  const billing = await getBillingConfig(apps, configuredEnv);
  Object.assign(configuredEnv, billing.env);

  const analytics = await getAnalyticsConfig(apps, configuredEnv);
  Object.assign(configuredEnv, analytics.env);

  const storage = await getStorageConfig(configuredEnv);
  Object.assign(configuredEnv, storage.env);

  const monitoring = await getMonitoringConfig(apps, configuredEnv);
  Object.assign(configuredEnv, monitoring.env);

  const flags = await getFlagsConfig(apps, configuredEnv);
  Object.assign(configuredEnv, flags.env);

  const env = {
    ...("env" in db ? db.env : {}),
    ...billing.env,
    ...email.env,
    ...storage.env,
    ...analytics.env,
    ...monitoring.env,
    ...flags.env,
  };

  return { db, email, billing, analytics, storage, monitoring, flags, env };
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

      if (isTextFile(file)) {
        const content = await promises.readFile(join(cwd, file.path), "utf8");
        await promises.writeFile(join(cwd, file.path), file.modify(content));
      }
    }
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
    flags?: Partial<FlagsProvider>;
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
    if (providers.flags && Object.keys(providers.flags).length > 0) {
      await Promise.all(
        Object.entries(providers.flags).map(([key, value]) =>
          replaceInFiles({
            cwd,
            paths:
              providerConfigFiles.flags[key as keyof typeof FlagsProvider]
                .files,
            pattern:
              providerConfigFiles.flags[key as keyof typeof FlagsProvider]
                .pattern,
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
