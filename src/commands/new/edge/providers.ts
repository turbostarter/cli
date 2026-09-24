import color from "picocolors";

import { edgeEnv } from "~/commands/new/edge/config";
import { logger } from "~/utils";

import { configureEnvGroups } from "../common";

const groups = [
  {
    title: "contact and sender email",
    entries: [
      { key: edgeEnv.contactEmail, label: "Contact inbox email" },
      { key: edgeEnv.emailFrom, label: "Sender email address" },
    ],
  },
  {
    title: "authentication methods and OAuth",
    entries: [
      {
        key: edgeEnv.auth.password,
        label: "Enable password authentication? (true/false)",
        boolean: true,
      },
      {
        key: edgeEnv.auth.anonymous,
        label: "Enable anonymous authentication? (true/false)",
        boolean: true,
      },
      { key: edgeEnv.auth.google.clientId, label: "Google client ID" },
      {
        key: edgeEnv.auth.google.clientSecret,
        label: "Google client secret",
        secret: true,
      },
      { key: edgeEnv.auth.github.clientId, label: "GitHub client ID" },
      {
        key: edgeEnv.auth.github.clientSecret,
        label: "GitHub client secret",
        secret: true,
      },
      { key: edgeEnv.auth.cloudflare.clientId, label: "Cloudflare client ID" },
      {
        key: edgeEnv.auth.cloudflare.clientSecret,
        label: "Cloudflare client secret",
        secret: true,
      },
    ],
  },
  {
    title: "Turnstile",
    entries: [
      { key: edgeEnv.turnstile.siteKey, label: "Turnstile site key" },
      {
        key: edgeEnv.turnstile.secretKey,
        label: "Turnstile secret key",
        secret: true,
      },
    ],
  },
  {
    title: "Stripe",
    entries: [
      {
        key: edgeEnv.stripe.secretKey,
        label: "Stripe secret key",
        secret: true,
      },
      {
        key: edgeEnv.stripe.webhookSecret,
        label: "Stripe webhook secret",
        secret: true,
      },
    ],
  },
  {
    title: "Cloudflare Web Analytics",
    entries: [
      {
        key: edgeEnv.analytics.webAnalyticsToken,
        label: "Web Analytics token",
      },
    ],
  },
];

export const configureProviders = async () => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  return {
    env: {
      CONTACT_EMAIL: "hello@example.com",
      EMAIL_FROM: `noreply@example.com`,
      ...(await configureEnvGroups(groups)),
    },
  };
};
