import prompts from "prompts";

import { getLabel, logger, onCancel } from "~/utils";

import { AnalyticsProvider, App, coreEnv } from "../definitions";

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
  configuredEnv: Record<string, string>,
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
            name: coreEnv.analytics[App.MOBILE].mixpanel.token,
            message: "Enter your Mixpanel token",
            initial:
              configuredEnv[coreEnv.analytics[App.MOBILE].mixpanel.token],
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.MOBILE].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.analytics[App.MOBILE].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[coreEnv.analytics[App.MOBILE].posthog.key],
          },
          {
            type: "text",
            name: coreEnv.analytics[App.MOBILE].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[coreEnv.analytics[App.MOBILE].posthog.host] ??
              "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
  }
};

export const getAnalyticsMobileConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getAnalyticsMobileProvider();
  const env = await getAnalyticsMobileProviderConfig(provider, configuredEnv);

  return { provider, env };
};
