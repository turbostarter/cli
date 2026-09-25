import { Service } from "~/config";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export const StorageProvider = {
  S3: "s3",
} as const;

export const EmailProvider = {
  RESEND: "resend",
  SENDGRID: "sendgrid",
  POSTMARK: "postmark",
  PLUNK: "plunk",
  MAILGUN: "mailgun",
  NODEMAILER: "nodemailer",
} as const;

export const EnvPath = {
  ROOT: "./",
  WEB: "./apps/web",
  MOBILE: "./apps/mobile",
  EXTENSION: "./apps/extension",
} as const;

export const App = {
  WEB: "web",
  MOBILE: "mobile",
  EXTENSION: "extension",
} as const;

export const BillingProvider = {
  [App.WEB]: {
    STRIPE: "stripe",
    LEMON_SQUEEZY: "lemon-squeezy",
    POLAR: "polar",
    DODO_PAYMENTS: "dodo-payments",
  },
  [App.MOBILE]: {
    REVENUECAT: "revenuecat",
    SUPERWALL: "superwall",
  },
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

export const MonitoringProvider = {
  [App.WEB]: {
    SENTRY: "sentry",
    POSTHOG: "posthog",
  },
  [App.MOBILE]: {
    SENTRY: "sentry",
    POSTHOG: "posthog",
  },
  [App.EXTENSION]: {
    SENTRY: "sentry",
    POSTHOG: "posthog",
  },
} as const;

export const FlagsProvider = {
  [App.WEB]: {
    IN_MEMORY: "in-memory",
    POSTHOG: "posthog",
    GROWTHBOOK: "growthbook",
  },
  [App.MOBILE]: {
    IN_MEMORY: "in-memory",
    POSTHOG: "posthog",
    GROWTHBOOK: "growthbook",
  },
  [App.EXTENSION]: {
    IN_MEMORY: "in-memory",
    POSTHOG: "posthog",
    GROWTHBOOK: "growthbook",
  },
} as const;

export type StorageProvider =
  (typeof StorageProvider)[keyof typeof StorageProvider];
export type EmailProvider = (typeof EmailProvider)[keyof typeof EmailProvider];
export type EnvPath = (typeof EnvPath)[keyof typeof EnvPath];
export type App = (typeof App)[keyof typeof App];
export type BillingProvider = {
  [
    K in Mutable<keyof typeof BillingProvider>
  ]: (typeof BillingProvider)[K][keyof (typeof BillingProvider)[K]];
};
export type AnalyticsProvider = {
  [
    K in Mutable<keyof typeof AnalyticsProvider>
  ]: (typeof AnalyticsProvider)[K][keyof (typeof AnalyticsProvider)[K]];
};
export type MonitoringProvider = {
  [
    K in Mutable<keyof typeof MonitoringProvider>
  ]: (typeof MonitoringProvider)[K][keyof (typeof MonitoringProvider)[K]];
};
export type FlagsProvider = {
  [
    K in Mutable<keyof typeof FlagsProvider>
  ]: (typeof FlagsProvider)[K][keyof (typeof FlagsProvider)[K]];
};

export const coreEnv = {
  productName: "PRODUCT_NAME",
  [Service.DB]: {
    url: "DATABASE_URL",
  },
  billing: {
    [App.WEB]: {
      [BillingProvider[App.WEB].STRIPE]: {
        secretKey: "STRIPE_SECRET_KEY",
        webhookSecret: "STRIPE_WEBHOOK_SECRET",
      },
      [BillingProvider[App.WEB].LEMON_SQUEEZY]: {
        apiKey: "LEMON_SQUEEZY_API_KEY",
        signingSecret: "LEMON_SQUEEZY_SIGNING_SECRET",
        storeId: "LEMON_SQUEEZY_STORE_ID",
      },
      [BillingProvider[App.WEB].POLAR]: {
        accessToken: "POLAR_ACCESS_TOKEN",
        webhookSecret: "POLAR_WEBHOOK_SECRET",
        organizationSlug: "POLAR_ORGANIZATION_SLUG",
      },
      [BillingProvider[App.WEB].DODO_PAYMENTS]: {
        apiKey: "DODO_PAYMENTS_API_KEY",
        webhookKey: "DODO_PAYMENTS_WEBHOOK_KEY",
        environment: "DODO_PAYMENTS_ENVIRONMENT",
      },
    },
    [App.MOBILE]: {
      [BillingProvider[App.MOBILE].REVENUECAT]: {
        appleApiKey: "EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY",
        googleApiKey: "EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY",
        webhookSecret: "REVENUECAT_WEBHOOK_SECRET",
        apiKey: "REVENUECAT_API_KEY",
      },
      [BillingProvider[App.MOBILE].SUPERWALL]: {
        appleApiKey: "EXPO_PUBLIC_SUPERWALL_APPLE_API_KEY",
        googleApiKey: "EXPO_PUBLIC_SUPERWALL_GOOGLE_API_KEY",
        webhookSecret: "SUPERWALL_WEBHOOK_SECRET",
      },
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
    [EmailProvider.MAILGUN]: {
      apiKey: "MAILGUN_API_KEY",
      domain: "MAILGUN_DOMAIN",
      apiUrl: "MAILGUN_API_URL",
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
  monitoring: {
    [App.WEB]: {
      [MonitoringProvider[App.WEB].SENTRY]: {
        dsn: "NEXT_PUBLIC_SENTRY_DSN",
      },
      [MonitoringProvider[App.WEB].POSTHOG]: {
        key: "NEXT_PUBLIC_POSTHOG_KEY",
        host: "NEXT_PUBLIC_POSTHOG_HOST",
      },
    },
    [App.MOBILE]: {
      [MonitoringProvider[App.MOBILE].SENTRY]: {
        dsn: "EXPO_PUBLIC_SENTRY_DSN",
      },
      [MonitoringProvider[App.MOBILE].POSTHOG]: {
        key: "EXPO_PUBLIC_POSTHOG_KEY",
        host: "EXPO_PUBLIC_POSTHOG_HOST",
      },
    },
    [App.EXTENSION]: {
      [MonitoringProvider[App.EXTENSION].SENTRY]: {
        dsn: "VITE_SENTRY_DSN",
      },
      [MonitoringProvider[App.EXTENSION].POSTHOG]: {
        key: "VITE_POSTHOG_KEY",
        host: "VITE_POSTHOG_HOST",
      },
    },
  },
  flags: {
    [App.WEB]: {
      [FlagsProvider[App.WEB].IN_MEMORY]: {},
      [FlagsProvider[App.WEB].POSTHOG]: {
        key: "NEXT_PUBLIC_POSTHOG_KEY",
        host: "NEXT_PUBLIC_POSTHOG_HOST",
      },
      [FlagsProvider[App.WEB].GROWTHBOOK]: {
        clientKey: "NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY",
        apiHost: "NEXT_PUBLIC_GROWTHBOOK_API_HOST",
      },
    },
    [App.MOBILE]: {
      [FlagsProvider[App.MOBILE].IN_MEMORY]: {},
      [FlagsProvider[App.MOBILE].POSTHOG]: {
        key: "EXPO_PUBLIC_POSTHOG_KEY",
        host: "EXPO_PUBLIC_POSTHOG_HOST",
      },
      [FlagsProvider[App.MOBILE].GROWTHBOOK]: {
        clientKey: "EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY",
        apiHost: "EXPO_PUBLIC_GROWTHBOOK_API_HOST",
      },
    },
    [App.EXTENSION]: {
      [FlagsProvider[App.EXTENSION].IN_MEMORY]: {},
      [FlagsProvider[App.EXTENSION].POSTHOG]: {
        key: "VITE_POSTHOG_KEY",
        host: "VITE_POSTHOG_HOST",
      },
      [FlagsProvider[App.EXTENSION].GROWTHBOOK]: {
        clientKey: "VITE_GROWTHBOOK_CLIENT_KEY",
        apiHost: "VITE_GROWTHBOOK_API_HOST",
      },
    },
  },
} as const;

export const envInPaths = {
  [EnvPath.ROOT]: [coreEnv.productName, coreEnv.db.url],
  [EnvPath.WEB]: [
    coreEnv.email.resend.apiKey,
    coreEnv.email.sendgrid.apiKey,
    coreEnv.email.plunk.apiKey,
    coreEnv.email.postmark.apiKey,
    coreEnv.email.mailgun.apiKey,
    coreEnv.email.mailgun.domain,
    coreEnv.email.mailgun.apiUrl,
    coreEnv.email.nodemailer.user,
    coreEnv.email.nodemailer.password,
    coreEnv.email.nodemailer.host,
    coreEnv.email.nodemailer.port,
    coreEnv.storage.s3.region,
    coreEnv.storage.s3.bucket,
    coreEnv.storage.s3.endpoint,
    coreEnv.storage.s3.accessKeyId,
    coreEnv.storage.s3.secretAccessKey,
    coreEnv.billing[App.WEB].stripe.secretKey,
    coreEnv.billing[App.WEB].stripe.webhookSecret,
    coreEnv.billing[App.WEB]["lemon-squeezy"].apiKey,
    coreEnv.billing[App.WEB]["lemon-squeezy"].signingSecret,
    coreEnv.billing[App.WEB]["lemon-squeezy"].storeId,
    coreEnv.billing[App.WEB].polar.accessToken,
    coreEnv.billing[App.WEB].polar.webhookSecret,
    coreEnv.billing[App.WEB].polar.organizationSlug,
    coreEnv.billing[App.WEB]["dodo-payments"].apiKey,
    coreEnv.billing[App.WEB]["dodo-payments"].webhookKey,
    coreEnv.billing[App.WEB]["dodo-payments"].environment,
    coreEnv.billing[App.MOBILE].revenuecat.webhookSecret,
    coreEnv.billing[App.MOBILE].revenuecat.apiKey,
    coreEnv.billing[App.MOBILE].superwall.webhookSecret,
    coreEnv.analytics[App.WEB]["google-analytics"].measurementId,
    coreEnv.analytics[App.WEB]["google-analytics"].secret,
    coreEnv.analytics[App.WEB].mixpanel.token,
    coreEnv.analytics[App.WEB]["open-panel"].clientId,
    coreEnv.analytics[App.WEB]["open-panel"].secret,
    coreEnv.analytics[App.WEB].plausible.domain,
    coreEnv.analytics[App.WEB].plausible.host,
    coreEnv.analytics[App.WEB].posthog.key,
    coreEnv.analytics[App.WEB].posthog.host,
    coreEnv.analytics[App.WEB].umami.host,
    coreEnv.analytics[App.WEB].umami.websiteId,
    coreEnv.analytics[App.WEB].umami.apiHost,
    coreEnv.analytics[App.WEB].umami.apiKey,
    coreEnv.analytics[App.WEB].vemetric.token,
    coreEnv.monitoring[App.WEB].sentry.dsn,
    coreEnv.monitoring[App.WEB].posthog.key,
    coreEnv.monitoring[App.WEB].posthog.host,
    coreEnv.flags[App.WEB].posthog.key,
    coreEnv.flags[App.WEB].posthog.host,
    coreEnv.flags[App.WEB].growthbook.clientKey,
    coreEnv.flags[App.WEB].growthbook.apiHost,
  ],
  [EnvPath.MOBILE]: [
    coreEnv.billing[App.MOBILE].revenuecat.appleApiKey,
    coreEnv.billing[App.MOBILE].revenuecat.googleApiKey,
    coreEnv.billing[App.MOBILE].superwall.appleApiKey,
    coreEnv.billing[App.MOBILE].superwall.googleApiKey,
    coreEnv.analytics[App.MOBILE].mixpanel.token,
    coreEnv.analytics[App.MOBILE].posthog.key,
    coreEnv.analytics[App.MOBILE].posthog.host,
    coreEnv.monitoring[App.MOBILE].sentry.dsn,
    coreEnv.flags[App.MOBILE].posthog.key,
    coreEnv.flags[App.MOBILE].posthog.host,
    coreEnv.flags[App.MOBILE].growthbook.clientKey,
    coreEnv.flags[App.MOBILE].growthbook.apiHost,
  ],
  [EnvPath.EXTENSION]: [
    coreEnv.analytics[App.EXTENSION]["google-analytics"].measurementId,
    coreEnv.analytics[App.EXTENSION]["google-analytics"].secret,
    coreEnv.analytics[App.EXTENSION].posthog.key,
    coreEnv.analytics[App.EXTENSION].posthog.host,
    coreEnv.monitoring[App.EXTENSION].sentry.dsn,
    coreEnv.flags[App.EXTENSION].posthog.key,
    coreEnv.flags[App.EXTENSION].posthog.host,
    coreEnv.flags[App.EXTENSION].growthbook.clientKey,
    coreEnv.flags[App.EXTENSION].growthbook.apiHost,
  ],
};

export const providerConfigFiles = {
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
  billing: {
    [App.WEB]: {
      files: [
        "packages/billing/web/src/providers/index.ts",
        "packages/billing/web/src/providers/env.ts",
      ],
      pattern: new RegExp(
        `(${Object.values(BillingProvider[App.WEB]).join("|")})`,
        "gi",
      ),
    },
    [App.MOBILE]: {
      files: [
        "packages/billing/mobile/src/providers/index.ts",
        "packages/billing/mobile/src/providers/env.ts",
        "packages/billing/mobile/src/providers/server.ts",
      ],
      pattern: new RegExp(
        `(${Object.values(BillingProvider[App.MOBILE]).join("|")})`,
        "gi",
      ),
    },
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
  monitoring: {
    [App.WEB]: {
      files: ["packages/monitoring/web/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(MonitoringProvider[App.WEB]).join("|")})`,
        "gi",
      ),
    },
    [App.MOBILE]: {
      files: ["packages/monitoring/mobile/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(MonitoringProvider[App.MOBILE]).join("|")})`,
        "gi",
      ),
    },
    [App.EXTENSION]: {
      files: ["packages/monitoring/extension/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(MonitoringProvider[App.EXTENSION]).join("|")})`,
        "gi",
      ),
    },
  },
  flags: {
    [App.WEB]: {
      files: [
        "packages/flags/web/src/providers/index.ts",
        "packages/flags/web/src/providers/server.ts",
        "packages/flags/web/src/providers/env.ts",
      ],
      pattern: new RegExp(
        `(${Object.values(FlagsProvider[App.WEB]).join("|")})`,
        "gi",
      ),
    },
    [App.MOBILE]: {
      files: ["packages/flags/mobile/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(FlagsProvider[App.MOBILE]).join("|")})`,
        "gi",
      ),
    },
    [App.EXTENSION]: {
      files: ["packages/flags/extension/src/providers/index.ts"],
      pattern: new RegExp(
        `(${Object.values(FlagsProvider[App.EXTENSION]).join("|")})`,
        "gi",
      ),
    },
  },
};
