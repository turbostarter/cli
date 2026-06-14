import prompts from "prompts";

import { AnalyticsProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getAnalyticsExtensionProvider = async (): Promise<{
  provider: AnalyticsProvider[typeof App.EXTENSION];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(AnalyticsProvider[App.EXTENSION]).map(
          (provider) => ({
            title: getLabel(provider),
            value: provider,
          }),
        ),
        name: "provider",
        message: "What do you want to use for extension analytics?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getAnalyticsExtensionProviderConfig = async (
  provider: AnalyticsProvider[typeof App.EXTENSION],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case AnalyticsProvider[App.EXTENSION].GOOGLE_ANALYTICS:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION]["google-analytics"]
              .measurementId,
            message: "Enter your Google Analytics measurement ID",
            initial:
              configuredEnv[
                config.env.analytics[App.EXTENSION]["google-analytics"]
                  .measurementId
              ],
          },
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION]["google-analytics"]
              .secret,
            message: "Enter your Google Analytics secret",
            initial:
              configuredEnv[
                config.env.analytics[App.EXTENSION]["google-analytics"].secret
              ],
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.EXTENSION].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION].posthog.key,
            message: "Enter your PostHog key",
            initial:
              configuredEnv[config.env.analytics[App.EXTENSION].posthog.key],
          },
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[config.env.analytics[App.EXTENSION].posthog.host] ??
              "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getAnalyticsExtensionConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getAnalyticsExtensionProvider();
  const env = await getAnalyticsExtensionProviderConfig(
    provider,
    configuredEnv,
  );

  return { provider, env };
};
