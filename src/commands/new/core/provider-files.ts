import ora from "ora";

import { logger } from "~/utils";
import { replaceInFiles } from "~/utils/file";

import { providerConfigFiles } from "./config/definitions";

import type {
  AnalyticsProvider,
  BillingProvider,
  EmailProvider,
  FlagsProvider,
  MonitoringProvider,
  StorageProvider,
} from "./config/definitions";

export const updateProvidersFiles = async (
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
