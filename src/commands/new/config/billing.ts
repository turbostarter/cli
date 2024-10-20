import prompts from "prompts";

import { BillingProvider, config } from "~/config";
import { getLabel, onCancel } from "~/utils";

const getBillingProvider = async (): Promise<{
  [key in typeof config.env.billing.provider]: BillingProvider;
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(BillingProvider).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: config.env.billing.provider,
        message: "What do you want to use for billing?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getBillingProviderConfig = async (provider: BillingProvider) => {
  switch (provider) {
    case BillingProvider.STRIPE:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing.stripe.secretKey,
            message: "Enter your Stripe secret key",
          },
          {
            type: "text",
            name: config.env.billing.stripe.webhookSecret,
            message: "Enter your Stripe webhook secret",
          },
        ],
        {
          onCancel,
        },
      );
    case BillingProvider.LEMON_SQUEEZY:
      return prompts(
        [
          {
            type: "text",
            name: config.env.billing.lemonsqueezy.storeId,
            message: "Enter your Lemon Squeezy store ID",
          },
          {
            type: "text",
            name: config.env.billing.lemonsqueezy.apiKey,
            message: "Enter your Lemon Squeezy API key",
          },
          {
            type: "text",
            name: config.env.billing.lemonsqueezy.signingSecret,
            message: "Enter your Lemon Squeezy signing secret",
          },
        ],
        {
          onCancel,
        },
      );
  }
};

export const getBillingConfig = async () => {
  const provider = await getBillingProvider();
  const config = await getBillingProviderConfig(provider.BILLING_PROVIDER);

  return { ...provider, ...config };
};
