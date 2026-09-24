import { configureEnvGroups } from "../common";

const edgeGroups = [
  {
    title: "contact and sender email",
    entries: [
      { key: "CONTACT_EMAIL", label: "Contact inbox email" },
      { key: "EMAIL_FROM", label: "Sender email address" },
    ],
  },
  {
    title: "authentication methods and OAuth",
    entries: [
      {
        key: "VITE_AUTH_PASSWORD",
        label: "Enable password authentication? (true/false)",
        boolean: true,
      },
      {
        key: "VITE_AUTH_ANONYMOUS",
        label: "Enable anonymous authentication? (true/false)",
        boolean: true,
      },
      { key: "GOOGLE_CLIENT_ID", label: "Google client ID" },
      {
        key: "GOOGLE_CLIENT_SECRET",
        label: "Google client secret",
        secret: true,
      },
      { key: "GITHUB_CLIENT_ID", label: "GitHub client ID" },
      {
        key: "GITHUB_CLIENT_SECRET",
        label: "GitHub client secret",
        secret: true,
      },
      { key: "CLOUDFLARE_CLIENT_ID", label: "Cloudflare client ID" },
      {
        key: "CLOUDFLARE_CLIENT_SECRET",
        label: "Cloudflare client secret",
        secret: true,
      },
    ],
  },
  {
    title: "Turnstile",
    entries: [
      { key: "VITE_TURNSTILE_SITE_KEY", label: "Turnstile site key" },
      {
        key: "TURNSTILE_SECRET_KEY",
        label: "Turnstile secret key",
        secret: true,
      },
    ],
  },
  {
    title: "Stripe",
    entries: [
      { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", secret: true },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Stripe webhook secret",
        secret: true,
      },
    ],
  },
  {
    title: "Cloudflare Web Analytics",
    entries: [
      { key: "VITE_CF_WEB_ANALYTICS_TOKEN", label: "Web Analytics token" },
    ],
  },
];

export const configureEdgeProviders = async (cwd: string) =>
  configureEnvGroups(cwd, ".", edgeGroups);
