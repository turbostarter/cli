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
  configuredEnv: Record<string, string>,
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
            initial:
              configuredEnv[
                config.env.analytics[App.WEB]["google-analytics"].measurementId
              ],
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB]["google-analytics"].secret,
            message: "Enter your Google Analytics secret",
            initial:
              configuredEnv[
                config.env.analytics[App.WEB]["google-analytics"].secret
              ],
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
            initial: configuredEnv[config.env.analytics[App.WEB].mixpanel.token],
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
            initial:
              configuredEnv[config.env.analytics[App.WEB]["open-panel"].clientId],
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB]["open-panel"].secret,
            message: "Enter your OpenPanel secret",
            initial:
              configuredEnv[config.env.analytics[App.WEB]["open-panel"].secret],
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
            initial: configuredEnv[config.env.analytics[App.WEB].plausible.domain],
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].plausible.host,
            message: "Enter your Plausible host",
            initial:
              configuredEnv[config.env.analytics[App.WEB].plausible.host] ??
              "https://plausible.io",
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
            initial: configuredEnv[config.env.analytics[App.WEB].posthog.key],
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[config.env.analytics[App.WEB].posthog.host] ??
              "https://us.posthog.com",
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
            initial:
              configuredEnv[config.env.analytics[App.WEB].umami.host] ??
              "https://cloud.umami.is",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.websiteId,
            message: "Enter your Umami website ID",
            initial:
              configuredEnv[config.env.analytics[App.WEB].umami.websiteId],
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.apiHost,
            message: "Enter your Umami API host",
            initial:
              configuredEnv[config.env.analytics[App.WEB].umami.apiHost] ??
              "https://api-gateway.umami.dev",
          },
          {
            type: "text",
            name: config.env.analytics[App.WEB].umami.apiKey,
            message: "Enter your Umami API key",
            initial: configuredEnv[config.env.analytics[App.WEB].umami.apiKey],
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
            initial: configuredEnv[config.env.analytics[App.WEB].vemetric.token],
          },
        ],
        { onCancel },
      );
    case AnalyticsProvider[App.WEB].VERCEL:
      return {};
  }
};

export const getAnalyticsWebConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getAnalyticsWebProvider();
  const env = await getAnalyticsWebProviderConfig(provider, configuredEnv);

  return { provider, env };
};
