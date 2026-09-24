import prompts from "prompts";

import { getLabel, onCancel } from "~/utils";

import { FlagsProvider, App, coreEnv } from "../definitions";

const getFlagsWebProvider = async (): Promise<{
  provider: FlagsProvider[typeof App.WEB];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(FlagsProvider[App.WEB]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for web feature flags?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getFlagsWebProviderConfig = async (
  provider: FlagsProvider[typeof App.WEB],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case FlagsProvider[App.WEB].IN_MEMORY:
      return {};
    case FlagsProvider[App.WEB].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.flags[App.WEB].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[coreEnv.flags[App.WEB].posthog.key],
          },
          {
            type: "text",
            name: coreEnv.flags[App.WEB].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[coreEnv.flags[App.WEB].posthog.host] ??
              "https://us.i.posthog.com",
          },
        ],
        { onCancel },
      );
    case FlagsProvider[App.WEB].GROWTHBOOK:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.flags[App.WEB].growthbook.clientKey,
            message: "Enter your GrowthBook client key",
            initial: configuredEnv[coreEnv.flags[App.WEB].growthbook.clientKey],
          },
          {
            type: "text",
            name: coreEnv.flags[App.WEB].growthbook.apiHost,
            message: "Enter your GrowthBook API host",
            initial:
              configuredEnv[coreEnv.flags[App.WEB].growthbook.apiHost] ??
              "https://cdn.growthbook.io",
          },
        ],
        { onCancel },
      );
  }
};

export const getFlagsWebConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getFlagsWebProvider();
  const env = await getFlagsWebProviderConfig(provider, configuredEnv);

  return { provider, env };
};
