import prompts from "prompts";

import { MonitoringProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getMonitoringExtensionProvider = async (): Promise<{
  provider: MonitoringProvider[typeof App.EXTENSION];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(MonitoringProvider[App.EXTENSION]).map(
          (provider) => ({
            title: getLabel(provider),
            value: provider,
          }),
        ),
        name: "provider",
        message: "What do you want to use for extension monitoring?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getMonitoringExtensionProviderConfig = async (
  provider: MonitoringProvider[typeof App.EXTENSION],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case MonitoringProvider[App.EXTENSION].SENTRY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.EXTENSION].sentry.dsn,
            message: "Enter your Sentry DSN",
            initial:
              configuredEnv[config.env.monitoring[App.EXTENSION].sentry.dsn],
          },
        ],
        { onCancel },
      );
    case MonitoringProvider[App.EXTENSION].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.EXTENSION].posthog.key,
            message: "Enter your PostHog key",
            initial:
              configuredEnv[config.env.monitoring[App.EXTENSION].posthog.key],
          },
          {
            type: "text",
            name: config.env.monitoring[App.EXTENSION].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[
                config.env.monitoring[App.EXTENSION].posthog.host
              ] ?? "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getMonitoringExtensionConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getMonitoringExtensionProvider();
  const env = await getMonitoringExtensionProviderConfig(
    provider,
    configuredEnv,
  );

  return { provider, env };
};
