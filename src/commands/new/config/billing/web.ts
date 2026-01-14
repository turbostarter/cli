import prompts from "prompts";

import { App, BillingProvider, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

import type { BillingProvider as BillingProviderType } from "~/config";

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
) => {
  switch (provider) {
    case BillingProvider[App.WEB].STRIPE:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing[App.WEB].stripe.secretKey,
            message: "Enter your Stripe secret key",
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].stripe.webhookSecret,
            message: "Enter your Stripe webhook secret",
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
          },
          {
            type: "text",
            name: config.env.billing[App.WEB]["lemon-squeezy"].apiKey,
            message: "Enter your Lemon Squeezy API key",
          },
          {
            type: "text",
            name: config.env.billing[App.WEB]["lemon-squeezy"].signingSecret,
            message: "Enter your Lemon Squeezy signing secret",
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
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].polar.webhookSecret,
            message: "Enter your Polar webhook secret",
          },
          {
            type: "text",
            name: config.env.billing[App.WEB].polar.organizationSlug,
            message: "Enter your Polar organization slug",
          },
        ],
        { onCancel },
      );
  }
};

export const getBillingWebConfig = async () => {
  const { provider } = await getBillingWebProvider();
  const env = await getBillingWebProviderConfig(provider);

  return { provider, env };
};
