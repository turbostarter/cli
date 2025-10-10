export const ServiceType = {
  LOCAL: "local",
  CLOUD: "cloud",
} as const;

export const Service = {
  DB: "db",
};

export const StorageProvider = {
  S3: "s3",
} as const;

export const BillingProvider = {
  STRIPE: "stripe",
  LEMON_SQUEEZY: "lemon-squeezy",
  POLAR: "polar",
} as const;

export const EmailProvider = {
  RESEND: "resend",
  SENDGRID: "sendgrid",
  POSTMARK: "postmark",
  PLUNK: "plunk",
  NODEMAILER: "nodemailer",
} as const;

export const EnvPath = {
  ROOT: "./",
  WEB: "./apps/web",
  MOBILE: "./apps/mobile",
  EXTENSION: "./apps/extension",
} as const;

export const EnvFile = {
  EXAMPLE: ".env.example",
  LOCAL: ".env.local",
} as const;

export const App = {
  WEB: "web",
  MOBILE: "mobile",
  EXTENSION: "extension",
} as const;

export const AnalyticsProvider = {
  [App.WEB]: {
    GOOGLE_ANALYTICS: "google-analytics",
    MIXPANEL: "mixpanel",
    OPEN_PANEL: "open-panel",
    PLAUSIBLE: "plausible",
    POSTHOG: "posthog",
    UMAMI: "umami",
    VEMETRIC: "vemetric",
    VERCEL: "vercel",
  },
  [App.MOBILE]: {
    GOOGLE_ANALYTICS: "google-analytics",
    MIXPANEL: "mixpanel",
    POSTHOG: "posthog",
  },
  [App.EXTENSION]: {
    GOOGLE_ANALYTICS: "google-analytics",
    POSTHOG: "posthog",
  },
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];
export type Service = (typeof Service)[keyof typeof Service];
export type StorageProvider =
  (typeof StorageProvider)[keyof typeof StorageProvider];
export type BillingProvider =
  (typeof BillingProvider)[keyof typeof BillingProvider];
export type EmailProvider = (typeof EmailProvider)[keyof typeof EmailProvider];
export type EnvPath = (typeof EnvPath)[keyof typeof EnvPath];
export type EnvFile = (typeof EnvFile)[keyof typeof EnvFile];
export type App = (typeof App)[keyof typeof App];
export type AnalyticsProvider = {
  [K in App]: (typeof AnalyticsProvider)[K][keyof (typeof AnalyticsProvider)[K]];
};

const env = {
  db: {
    url: "DATABASE_URL",
  },
  billing: {
    [BillingProvider.STRIPE]: {
      secretKey: "STRIPE_SECRET_KEY",
      webhookSecret: "STRIPE_WEBHOOK_SECRET",
    },
    [BillingProvider.LEMON_SQUEEZY]: {
      apiKey: "LEMON_SQUEEZY_API_KEY",
      signingSecret: "LEMON_SQUEEZY_SIGNING_SECRET",
      storeId: "LEMON_SQUEEZY_STORE_ID",
    },
    [BillingProvider.POLAR]: {
      accessToken: "POLAR_ACCESS_TOKEN",
      webhookSecret: "POLAR_WEBHOOK_SECRET",
      organizationSlug: "POLAR_ORGANIZATION_SLUG",
    },
  },
  email: {
    [EmailProvider.RESEND]: {
      apiKey: "RESEND_API_KEY",
    },
    [EmailProvider.SENDGRID]: {
      apiKey: "SENDGRID_API_KEY",
    },
    [EmailProvider.PLUNK]: {
      apiKey: "PLUNK_API_KEY",
    },
    [EmailProvider.POSTMARK]: {
      apiKey: "POSTMARK_API_KEY",
    },
    [EmailProvider.NODEMAILER]: {
      user: "NODEMAILER_USER",
      password: "NODEMAILER_PASSWORD",
      host: "NODEMAILER_HOST",
      port: "NODEMAILER_PORT",
    },
  },
  storage: {
    [StorageProvider.S3]: {
      region: "S3_REGION",
      bucket: "S3_BUCKET",
      endpoint: "S3_ENDPOINT",
      accessKeyId: "S3_ACCESS_KEY_ID",
      secretAccessKey: "S3_SECRET_ACCESS_KEY",
    },
  },
  analytics: {
    [App.WEB]: {
      [AnalyticsProvider[App.WEB].GOOGLE_ANALYTICS]: {
        measurementId: "NEXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID",
        secret: "GOOGLE_ANALYTICS_SECRET",
      },
      [AnalyticsProvider[App.WEB].MIXPANEL]: {
        token: "NEXT_PUBLIC_MIXPANEL_TOKEN",
      },
      [AnalyticsProvider[App.WEB].OPEN_PANEL]: {
        clientId: "NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID",
        secret: "OPEN_PANEL_SECRET",
      },
      [AnalyticsProvider[App.WEB].PLAUSIBLE]: {
        domain: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
        host: "NEXT_PUBLIC_PLAUSIBLE_HOST",
      },
      [AnalyticsProvider[App.WEB].POSTHOG]: {
        key: "NEXT_PUBLIC_POSTHOG_KEY",
        host: "NEXT_PUBLIC_POSTHOG_HOST",
      },
      [AnalyticsProvider[App.WEB].UMAMI]: {
        host: "NEXT_PUBLIC_UMAMI_HOST",
        websiteId: "NEXT_PUBLIC_UMAMI_WEBSITE_ID",
        apiHost: "UMAMI_API_HOST",
        apiKey: "UMAMI_API_KEY",
      },
      [AnalyticsProvider[App.WEB].VEMETRIC]: {
        token: "NEXT_PUBLIC_VEMETRIC_PROJECT_TOKEN",
      },
      [AnalyticsProvider[App.WEB].VERCEL]: {},
    },
    [App.MOBILE]: {
      [AnalyticsProvider[App.MOBILE].GOOGLE_ANALYTICS]: {},
      [AnalyticsProvider[App.MOBILE].MIXPANEL]: {
        token: "EXPO_PUBLIC_MIXPANEL_TOKEN",
      },
      [AnalyticsProvider[App.MOBILE].POSTHOG]: {
        key: "EXPO_PUBLIC_POSTHOG_KEY",
        host: "EXPO_PUBLIC_POSTHOG_HOST",
      },
    },
    [App.EXTENSION]: {
      [AnalyticsProvider[App.EXTENSION].GOOGLE_ANALYTICS]: {
        measurementId: "VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID",
        secret: "VITE_GOOGLE_ANALYTICS_SECRET",
      },
      [AnalyticsProvider[App.EXTENSION].POSTHOG]: {
        key: "VITE_POSTHOG_KEY",
        host: "VITE_POSTHOG_HOST",
      },
    },
  },
} as const;

export const envInPaths = {
  [EnvPath.ROOT]: [env.db.url],
  [EnvPath.WEB]: [
    env.billing.stripe.secretKey,
    env.billing.stripe.webhookSecret,
    env.billing["lemon-squeezy"].apiKey,
    env.billing["lemon-squeezy"].signingSecret,
    env.billing["lemon-squeezy"].storeId,
    env.billing.polar.accessToken,
    env.billing.polar.webhookSecret,
    env.billing.polar.organizationSlug,
    env.email.resend.apiKey,
    env.email.sendgrid.apiKey,
    env.email.plunk.apiKey,
    env.email.postmark.apiKey,
    env.email.nodemailer.user,
    env.email.nodemailer.password,
    env.storage.s3.accessKeyId,
    env.storage.s3.secretAccessKey,
    env.analytics[App.WEB]["google-analytics"].measurementId,
    env.analytics[App.WEB]["google-analytics"].secret,
    env.analytics[App.WEB].mixpanel.token,
    env.analytics[App.WEB]["open-panel"].clientId,
    env.analytics[App.WEB]["open-panel"].secret,
    env.analytics[App.WEB].plausible.domain,
    env.analytics[App.WEB].plausible.host,
    env.analytics[App.WEB].posthog.key,
    env.analytics[App.WEB].posthog.host,
    env.analytics[App.WEB].umami.host,
    env.analytics[App.WEB].umami.websiteId,
    env.analytics[App.WEB].umami.apiHost,
    env.analytics[App.WEB].umami.apiKey,
    env.analytics[App.WEB].vemetric.token,
  ],
  [EnvPath.MOBILE]: [
    env.analytics[App.MOBILE].mixpanel.token,
    env.analytics[App.MOBILE].posthog.key,
    env.analytics[App.MOBILE].posthog.host,
  ],
  [EnvPath.EXTENSION]: [
    env.analytics[App.EXTENSION]["google-analytics"].measurementId,
    env.analytics[App.EXTENSION]["google-analytics"].secret,
    env.analytics[App.EXTENSION].posthog.key,
    env.analytics[App.EXTENSION].posthog.host,
  ],
};

export const appSpecificFiles = {
  [App.WEB]: [],
  [App.MOBILE]: [
    "apps/mobile",
    "packages/ui/mobile",
    "packages/analytics/mobile",
    ".github/workflows/publish-mobile.yml",
  ],
  [App.EXTENSION]: [
    "apps/extension",
    "packages/analytics/extension",
    ".github/workflows/publish-extension.yml",
  ],
};

export const providerConfigFiles = {
  billing: {
    files: [
      "packages/billing/src/providers/index.ts",
      "packages/billing/src/providers/env.ts",
    ],
    pattern: new RegExp(`(${Object.values(BillingProvider).join("|")})`, "gi"),
  },
  email: {
    files: [
      "packages/email/src/providers/index.ts",
      "packages/email/src/providers/env.ts",
    ],
    pattern: new RegExp(`(${Object.values(EmailProvider).join("|")})`, "gi"),
  },
  storage: {
    files: [
      "packages/storage/src/providers/index.ts",
      "packages/storage/src/providers/env.ts",
    ],
    pattern: new RegExp(`(${Object.values(StorageProvider).join("|")})`, "gi"),
  },
  analytics: {
    [App.WEB]: {
      files: [
        "packages/analytics/web/src/providers/index.tsx",
        "packages/analytics/web/src/providers/server.ts",
        "packages/analytics/web/src/providers/env.ts",
      ],
      pattern: new RegExp(
        `(${Object.values(AnalyticsProvider[App.WEB]).join("|")})`,
        "gi",
      ),
    },
    [App.MOBILE]: {
      files: ["packages/analytics/mobile/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(AnalyticsProvider[App.MOBILE]).join("|")})`,
        "gi",
      ),
    },
    [App.EXTENSION]: {
      files: ["packages/analytics/extension/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(AnalyticsProvider[App.EXTENSION]).join("|")})`,
        "gi",
      ),
    },
  },
};

export const servicesPackages: Record<Service, string> = {
  [Service.DB]: "@turbostarter/db",
};

export const config = {
  name: "TurboStarter",
  repository: "https://github.com/turbostarter/core.git",
  env,
} as const;
