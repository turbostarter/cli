import prompts from "prompts";

import { FlagsProvider, App, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getFlagsMobileProvider = async (): Promise<{
  provider: FlagsProvider[typeof App.MOBILE];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(FlagsProvider[App.MOBILE]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for mobile feature flags?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getFlagsMobileProviderConfig = async (
  provider: FlagsProvider[typeof App.MOBILE],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case FlagsProvider[App.MOBILE].IN_MEMORY:
      return {};
    case FlagsProvider[App.MOBILE].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: config.env.flags[App.MOBILE].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[config.env.flags[App.MOBILE].posthog.key],
          },
          {
            type: "text",
            name: config.env.flags[App.MOBILE].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[config.env.flags[App.MOBILE].posthog.host] ??
              "https://us.i.posthog.com",
          },
        ],
        { onCancel },
      );
    case FlagsProvider[App.MOBILE].GROWTHBOOK:
      return prompts(
        [
          {
            type: "text",
            name: config.env.flags[App.MOBILE].growthbook.clientKey,
            message: "Enter your GrowthBook client key",
            initial:
              configuredEnv[config.env.flags[App.MOBILE].growthbook.clientKey],
          },
          {
            type: "text",
            name: config.env.flags[App.MOBILE].growthbook.apiHost,
            message: "Enter your GrowthBook API host",
            initial:
              configuredEnv[config.env.flags[App.MOBILE].growthbook.apiHost] ??
              "https://cdn.growthbook.io",
          },
        ],
        { onCancel },
      );
  }
};

export const getFlagsMobileConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getFlagsMobileProvider();
  const env = await getFlagsMobileProviderConfig(provider, configuredEnv);

  return { provider, env };
};
