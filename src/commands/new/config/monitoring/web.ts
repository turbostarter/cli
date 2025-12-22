import prompts from "prompts";

import { MonitoringProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getMonitoringWebProvider = async (): Promise<{
  provider: MonitoringProvider[typeof App.WEB];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(MonitoringProvider[App.WEB]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for web monitoring?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getMonitoringWebProviderConfig = async (
  provider: MonitoringProvider[typeof App.WEB],
) => {
  switch (provider) {
    case MonitoringProvider[App.WEB].SENTRY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.WEB].sentry.dsn,
            message: "Enter your Sentry DSN",
          },
        ],
        { onCancel },
      );
    case MonitoringProvider[App.WEB].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.WEB].posthog.key,
            message: "Enter your PostHog key",
          },
          {
            type: "text",
            name: config.env.monitoring[App.WEB].posthog.host,
            message: "Enter your PostHog host",
            initial: "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getMonitoringWebConfig = async () => {
  const { provider } = await getMonitoringWebProvider();
  const env = await getMonitoringWebProviderConfig(provider);

  return { provider, env };
};
