import prompts from "prompts";

import { getLabel, onCancel } from "~/utils";

import { FlagsProvider, App, coreEnv } from "../definitions";

const getFlagsExtensionProvider = async (): Promise<{
  provider: FlagsProvider[typeof App.EXTENSION];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(FlagsProvider[App.EXTENSION]).map(
          (provider) => ({
            title: getLabel(provider),
            value: provider,
          }),
        ),
        name: "provider",
        message: "What do you want to use for extension feature flags?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getFlagsExtensionProviderConfig = async (
  provider: FlagsProvider[typeof App.EXTENSION],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case FlagsProvider[App.EXTENSION].IN_MEMORY:
      return {};
    case FlagsProvider[App.EXTENSION].POSTHOG:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.flags[App.EXTENSION].posthog.key,
            message: "Enter your PostHog key",
            initial: configuredEnv[coreEnv.flags[App.EXTENSION].posthog.key],
          },
          {
            type: "text",
            name: coreEnv.flags[App.EXTENSION].posthog.host,
            message: "Enter your PostHog host",
            initial:
              configuredEnv[coreEnv.flags[App.EXTENSION].posthog.host] ??
              "https://us.i.posthog.com",
          },
        ],
        { onCancel },
      );
    case FlagsProvider[App.EXTENSION].GROWTHBOOK:
      return prompts(
        [
          {
            type: "text",
            name: coreEnv.flags[App.EXTENSION].growthbook.clientKey,
            message: "Enter your GrowthBook client key",
            initial:
              configuredEnv[coreEnv.flags[App.EXTENSION].growthbook.clientKey],
          },
          {
            type: "text",
            name: coreEnv.flags[App.EXTENSION].growthbook.apiHost,
            message: "Enter your GrowthBook API host",
            initial:
              configuredEnv[coreEnv.flags[App.EXTENSION].growthbook.apiHost] ??
              "https://cdn.growthbook.io",
          },
        ],
        { onCancel },
      );
  }
};

export const getFlagsExtensionConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getFlagsExtensionProvider();
  const env = await getFlagsExtensionProviderConfig(provider, configuredEnv);

  return { provider, env };
};
