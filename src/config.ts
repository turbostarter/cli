export const SupabaseType = {
  LOCAL: "local",
  CLOUD: "cloud",
} as const;

export const StorageProvider = {
  S3: "s3",
} as const;

export const BillingProvider = {
  STRIPE: "stripe",
  LEMON_SQUEEZY: "lemon-squeezy",
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
  DB: "./packages/db",
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

export type SupabaseType = (typeof SupabaseType)[keyof typeof SupabaseType];
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
  supabase: {
    key: "SUPABASE_ANON_KEY",
    url: "SUPABASE_URL",
  },
  billing: {
    provider: "BILLING_PROVIDER",
    stripe: {
      secretKey: "STRIPE_SECRET_KEY",
      webhookSecret: "STRIPE_WEBHOOK_SECRET",
    },
    lemonsqueezy: {
      apiKey: "LEMON_SQUEEZY_API_KEY",
      signingSecret: "LEMON_SQUEEZY_SIGNING_SECRET",
      storeId: "LEMON_SQUEEZY_STORE_ID",
    },
  },
  email: {
    provider: "EMAIL_PROVIDER",
    resend: {
      apiKey: "RESEND_API_KEY",
    },
    sendgrid: {
      apiKey: "SENDGRID_API_KEY",
    },
    plunk: {
      apiKey: "PLUNK_API_KEY",
    },
    postmark: {
      apiKey: "POSTMARK_API_KEY",
    },
    nodemailer: {
      user: "NODEMAILER_USER",
      password: "NODEMAILER_PASSWORD",
      host: "NODEMAILER_HOST",
      port: "NODEMAILER_PORT",
    },
  },
  storage: {
    provider: "STORAGE_PROVIDER",
    s3: {
      region: "S3_REGION",
      endpoint: "S3_ENDPOINT",
      accessKeyId: "S3_ACCESS_KEY_ID",
      secretAccessKey: "S3_SECRET_ACCESS_KEY",
    },
  },
} as const;

export const envInPaths = {
  [EnvPath.ROOT]: [env.db.url, env.supabase.key, env.supabase.url],
  [EnvPath.WEB]: [
    env.billing.provider,
    env.billing.stripe.secretKey,
    env.billing.stripe.webhookSecret,
    env.billing.lemonsqueezy.apiKey,
    env.billing.lemonsqueezy.signingSecret,
    env.billing.lemonsqueezy.storeId,
    env.email.provider,
    env.email.resend.apiKey,
    env.email.sendgrid.apiKey,
    env.email.plunk.apiKey,
    env.email.postmark.apiKey,
    env.email.nodemailer.user,
    env.email.nodemailer.password,
    env.storage.provider,
    env.storage.s3.region,
    env.storage.s3.endpoint,
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

export const config = {
  name: "TurboStarter",
  repository: "https://github.com/turbostarter/main.git",
  env,
} as const;
