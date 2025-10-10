import prompts from "prompts";

import { AnalyticsProvider, App, config } from "~/config";
import { getLabel, logger, onCancel } from "~/utils";

const getAnalyticsMobileProvider = async (): Promise<{
  provider: AnalyticsProvider[typeof App.MOBILE];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(AnalyticsProvider[App.MOBILE]).map(
          (provider) => ({
            title: getLabel(provider),
            value: provider,
          }),
        ),
        name: "provider",
        message: "What do you want to use for mobile analytics?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getAnalyticsMobileProviderConfig = async (
  provider: AnalyticsProvider[typeof App.MOBILE],
) => {
  switch (provider) {
    case AnalyticsProvider[App.MOBILE].GOOGLE_ANALYTICS:
      logger.info(
        "Check how to configure Google Analytics for mobile at https://www.turbostarter.dev/docs/mobile/analytics/configuration#google-analytics",
      );
      return {};
    case AnalyticsProvider[App.MOBILE].MIXPANEL:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.MOBILE].mixpanel.token,
            message: "Enter your Mixpanel token",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.MOBILE].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.MOBILE].posthog.key,
            message: "Enter your PostHog key",
          },
          {
            type: "text",
            name: config.env.analytics[App.MOBILE].posthog.host,
            message: "Enter your PostHog host",
            initial: "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getAnalyticsMobileConfig = async () => {
  const { provider } = await getAnalyticsMobileProvider();
  const env = await getAnalyticsMobileProviderConfig(provider);

  return { provider, env };
};
