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
};

export const servicesPackages: Record<Service, string> = {
  [Service.DB]: "@turbostarter/db",
};

export const config = {
  name: "TurboStarter",
  repository: "https://github.com/turbostarter/main.git",
  env,
} as const;
