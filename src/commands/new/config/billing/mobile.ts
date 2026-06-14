import prompts from "prompts";

import { App, BillingProvider, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

import type { BillingProvider as BillingProviderType } from "~/config";

const getBillingMobileProvider = async (): Promise<{
  provider: BillingProviderType[typeof App.MOBILE];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(BillingProvider[App.MOBILE]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for mobile billing?",
      },
    ],
    { onCancel },
  );
};

const getBillingMobileProviderConfig = async (
  provider: BillingProviderType[typeof App.MOBILE],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case BillingProvider[App.MOBILE].REVENUECAT:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.MOBILE].revenuecat.appleApiKey,
            message: "Enter your RevenueCat Apple API key",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].revenuecat.appleApiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.MOBILE].revenuecat.googleApiKey,
            message: "Enter your RevenueCat Google API key",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].revenuecat.googleApiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.MOBILE].revenuecat.webhookSecret,
            message: "Enter your RevenueCat webhook secret",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].revenuecat.webhookSecret
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.MOBILE].revenuecat.apiKey,
            message: "Enter your RevenueCat API key",
            initial:
              configuredEnv[config.env.billing[App.MOBILE].revenuecat.apiKey],
          },
        ],
        { onCancel },
      );
    case BillingProvider[App.MOBILE].SUPERWALL:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.MOBILE].superwall.appleApiKey,
            message: "Enter your Superwall Apple API key",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].superwall.appleApiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.MOBILE].superwall.googleApiKey,
            message: "Enter your Superwall Google API key",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].superwall.googleApiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.MOBILE].superwall.webhookSecret,
            message: "Enter your Superwall webhook secret",
            initial:
              configuredEnv[
                config.env.billing[App.MOBILE].superwall.webhookSecret
              ],
          },
        ],
        { onCancel },
      );
  }
};

export const getBillingMobileConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getBillingMobileProvider();
  const env = await getBillingMobileProviderConfig(provider, configuredEnv);

  return { provider, env };
};
