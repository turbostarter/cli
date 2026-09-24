import prompts from "prompts";

import { App, BillingProvider, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

import type { BillingProvider as BillingProviderType } from "~/config";

const DodoPaymentsEnvironment = {
  TEST_MODE: "test_mode",
  LIVE_MODE: "live_mode",
} as const;

const getBillingWebProvider = async (): Promise<{
  provider: BillingProviderType[typeof App.WEB];
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(BillingProvider[App.WEB]).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for web billing?",
      },
    ],
    { onCancel },
  );
};

const getBillingWebProviderConfig = async (
  provider: BillingProviderType[typeof App.WEB],
  configuredEnv: Record<string, string>,
) => {
  switch (provider) {
    case BillingProvider[App.WEB].STRIPE:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.WEB].stripe.secretKey,
            message: "Enter your Stripe secret key",
            initial:
              configuredEnv[config.env.billing[App.WEB].stripe.secretKey],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].stripe.webhookSecret,
            message: "Enter your Stripe webhook secret",
            initial:
              configuredEnv[config.env.billing[App.WEB].stripe.webhookSecret],
          },
        ],
        { onCancel },
      );
    case BillingProvider[App.WEB].LEMON_SQUEEZY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.WEB]["lemon-squeezy"].storeId,
            message: "Enter your Lemon Squeezy store ID",
            initial:
              configuredEnv[
                config.env.billing[App.WEB]["lemon-squeezy"].storeId
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB]["lemon-squeezy"].apiKey,
            message: "Enter your Lemon Squeezy API key",
            initial:
              configuredEnv[
                config.env.billing[App.WEB]["lemon-squeezy"].apiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB]["lemon-squeezy"].signingSecret,
            message: "Enter your Lemon Squeezy signing secret",
            initial:
              configuredEnv[
                config.env.billing[App.WEB]["lemon-squeezy"].signingSecret
              ],
          },
        ],
        { onCancel },
      );
    case BillingProvider[App.WEB].POLAR:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.WEB].polar.accessToken,
            message: "Enter your Polar access token",
            initial:
              configuredEnv[config.env.billing[App.WEB].polar.accessToken],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].polar.webhookSecret,
            message: "Enter your Polar webhook secret",
            initial:
              configuredEnv[config.env.billing[App.WEB].polar.webhookSecret],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].polar.organizationSlug,
            message: "Enter your Polar organization slug",
            initial:
              configuredEnv[config.env.billing[App.WEB].polar.organizationSlug],
          },
        ],
        { onCancel },
      );
    case BillingProvider[App.WEB].DODO_PAYMENTS:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.WEB]["dodo-payments"].apiKey,
            message: "Enter your Dodo Payments API key",
            initial:
              configuredEnv[
                config.env.billing[App.WEB]["dodo-payments"].apiKey
              ],
          },
          {
            type: "text",
            name: config.env.billing[App.WEB]["dodo-payments"].webhookKey,
            message: "Enter your Dodo Payments webhook key",
            initial:
              configuredEnv[
                config.env.billing[App.WEB]["dodo-payments"].webhookKey
              ],
          },
          {
            type: "select",
            name: config.env.billing[App.WEB]["dodo-payments"].environment,
            message: "Select your Dodo Payments environment",
            choices: Object.values(DodoPaymentsEnvironment).map(
              (environment) => ({
                title: getLabel(environment),
                value: environment,
              }),
            ),
            initial: (() => {
              const environments = Object.values(DodoPaymentsEnvironment);
              const configured =
                configuredEnv[
                  config.env.billing[App.WEB]["dodo-payments"].environment
                ];
              const index = environments.findIndex(
                (environment) => environment === configured,
              );

              return index >= 0 ? index : 0;
            })(),
          },
        ],
        { onCancel },
      );
  }
};

export const getBillingWebConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getBillingWebProvider();
  const env = await getBillingWebProviderConfig(provider, configuredEnv);

  return { provider, env };
};
