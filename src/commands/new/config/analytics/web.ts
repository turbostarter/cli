import prompts from "prompts";

import { AnalyticsProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getAnalyticsWebProvider = async (): Promise<{
  provider: AnalyticsProvider[typeof App.WEB];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(AnalyticsProvider[App.WEB]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for web analytics?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getAnalyticsWebProviderConfig = async (
  provider: AnalyticsProvider[typeof App.WEB],
) => {
  switch (provider) {
    case AnalyticsProvider[App.WEB].GOOGLE_ANALYTICS:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB]["google-analytics"]
              .measurementId,
            message: "Enter your Google Analytics measurement ID",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB]["google-analytics"].secret,
            message: "Enter your Google Analytics secret",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].MIXPANEL:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB].mixpanel.token,
            message: "Enter your Mixpanel token",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].OPEN_PANEL:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB]["open-panel"].clientId,
            message: "Enter your OpenPanel client ID",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB]["open-panel"].secret,
            message: "Enter your OpenPanel secret",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].PLAUSIBLE:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB].plausible.domain,
            message: "Enter your Plausible domain",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].plausible.host,
            message: "Enter your Plausible host",
            initial: "https://plausible.io",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB].posthog.key,
            message: "Enter your PostHog key",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].posthog.host,
            message: "Enter your PostHog host",
            initial: "https://us.posthog.com",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].UMAMI:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.host,
            message: "Enter your Umami host",
            initial: "https://cloud.umami.is",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.websiteId,
            message: "Enter your Umami website ID",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.apiHost,
            message: "Enter your Umami API host",
            initial: "https://api-gateway.umami.dev",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.apiKey,
            message: "Enter your Umami API key",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].VEMETRIC:
      return prompts(
        [
          {
            type: "text",
            name: config.env.analytics[App.WEB].vemetric.token,
            message: "Enter your Vemetric project token",
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].VERCEL:
      return {};
  }
};

export const getAnalyticsWebConfig = async () => {
  const { provider } = await getAnalyticsWebProvider();
  const env = await getAnalyticsWebProviderConfig(provider);

  return { provider, env };
};
