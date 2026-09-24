export const EnvPath = {
  ROOT: "./",
} as const;

export type EnvPath = (typeof EnvPath)[keyof typeof EnvPath];

export const edgeEnv = {
  productName: "VITE_PRODUCT_NAME",
  contactEmail: "CONTACT_EMAIL",
  emailFrom: "EMAIL_FROM",
  auth: {
    password: "VITE_AUTH_PASSWORD",
    anonymous: "VITE_AUTH_ANONYMOUS",
    google: {
      clientId: "GOOGLE_CLIENT_ID",
      clientSecret: "GOOGLE_CLIENT_SECRET",
    },
    github: {
      clientId: "GITHUB_CLIENT_ID",
      clientSecret: "GITHUB_CLIENT_SECRET",
    },
    cloudflare: {
      clientId: "CLOUDFLARE_CLIENT_ID",
      clientSecret: "CLOUDFLARE_CLIENT_SECRET",
    },
  },
  turnstile: {
    siteKey: "VITE_TURNSTILE_SITE_KEY",
    secretKey: "TURNSTILE_SECRET_KEY",
  },
  stripe: {
    secretKey: "STRIPE_SECRET_KEY",
    webhookSecret: "STRIPE_WEBHOOK_SECRET",
  },
  analytics: {
    webAnalyticsToken: "VITE_CF_WEB_ANALYTICS_TOKEN",
  },
};

export const envInPaths = {
  [EnvPath.ROOT]: [
    edgeEnv.productName,
    edgeEnv.contactEmail,
    edgeEnv.emailFrom,
    edgeEnv.auth.password,
    edgeEnv.auth.anonymous,
    edgeEnv.auth.google.clientId,
    edgeEnv.auth.google.clientSecret,
    edgeEnv.auth.github.clientId,
    edgeEnv.auth.github.clientSecret,
    edgeEnv.auth.cloudflare.clientId,
    edgeEnv.auth.cloudflare.clientSecret,
    edgeEnv.turnstile.siteKey,
    edgeEnv.turnstile.secretKey,
    edgeEnv.stripe.secretKey,
    edgeEnv.stripe.webhookSecret,
    edgeEnv.analytics.webAnalyticsToken,
  ],
};
