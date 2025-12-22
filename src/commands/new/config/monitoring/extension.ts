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
) => {
  switch (provider) {
    case MonitoringProvider[App.EXTENSION].SENTRY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.EXTENSION].sentry.dsn,
            message: "Enter your Sentry DSN",
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
          },
          {
            type: "text",
            name: config.env.monitoring[App.EXTENSION].posthog.host,
            message: "Enter your PostHog host",
            initial: "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getMonitoringExtensionConfig = async () => {
  const { provider } = await getMonitoringExtensionProvider();
  const env = await getMonitoringExtensionProviderConfig(provider);

  return { provider, env };
};
