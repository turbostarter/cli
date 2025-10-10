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
          },
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION]["google-analytics"]
              .secret,
            message: "Enter your Google Analytics secret",
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
          },
          {
            type: "text",
            name: config.env.analytics[App.EXTENSION].posthog.host,
            message: "Enter your PostHog host",
            initial: "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getAnalyticsExtensionConfig = async () => {
  const { provider } = await getAnalyticsExtensionProvider();
  const env = await getAnalyticsExtensionProviderConfig(provider);

  return { provider, env };
};
