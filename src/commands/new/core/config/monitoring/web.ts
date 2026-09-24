import prompts from "prompts";

import { getLabel, onCancel } from "~/utils";

import { MonitoringProvider, App, coreEnv } from "../definitions";

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
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case MonitoringProvider[App.WEB].SENTRY:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.monitoring[App.WEB].sentry.dsn,
            message: "Enter your Sentry DSN",
            initial: configuredEnv[coreEnv.monitoring[App.WEB].sentry.dsn],
          },
        ],
        { onCancel },
      );
    case MonitoringProvider[App.WEB].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.monitoring[App.WEB].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[coreEnv.monitoring[App.WEB].posthog.key],
          },
          {
            type: "text",
            name: coreEnv.monitoring[App.WEB].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[coreEnv.monitoring[App.WEB].posthog.host] ??
              "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getMonitoringWebConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getMonitoringWebProvider();
  const env = await getMonitoringWebProviderConfig(provider, configuredEnv);

  return { provider, env };
};
