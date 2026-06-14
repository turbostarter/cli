import prompts from "prompts";

import { MonitoringProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getMonitoringMobileProvider = async (): Promise<{
  provider: MonitoringProvider[typeof App.MOBILE];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(MonitoringProvider[App.MOBILE]).map(
          (provider) => ({
            title: getLabel(provider),
            value: provider,
          }),
        ),
        name: "provider",
        message: "What do you want to use for mobile monitoring?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getMonitoringMobileProviderConfig = async (
  provider: MonitoringProvider[typeof App.MOBILE],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case MonitoringProvider[App.MOBILE].SENTRY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.MOBILE].sentry.dsn,
            message: "Enter your Sentry DSN",
            initial: configuredEnv[config.env.monitoring[App.MOBILE].sentry.dsn],
          },
        ],
        { onCancel },
      );
    case MonitoringProvider[App.MOBILE].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.monitoring[App.MOBILE].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[config.env.monitoring[App.MOBILE].posthog.key],
          },
          {
            type: "text",
            name: config.env.monitoring[App.MOBILE].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[config.env.monitoring[App.MOBILE].posthog.host] ??
              "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getMonitoringMobileConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getMonitoringMobileProvider();
  const env = await getMonitoringMobileProviderConfig(provider, configuredEnv);

  return { provider, env };
};
