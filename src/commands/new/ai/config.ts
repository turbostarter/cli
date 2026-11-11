import { Service } from "~/config";

export const EnvPath = {
  ROOT: "./",
  WEB: "./apps/web",
  MOBILE: "./apps/mobile",
} as const;

export type EnvPath = (typeof EnvPath)[keyof typeof EnvPath];

export const GatewayProvider = {
  VERCEL: "vercel",
  NEON: "neon",
  OPENROUTER: "openrouter",
} as const;

export type GatewayProvider =
  (typeof GatewayProvider)[keyof typeof GatewayProvider];

export const gatewayLabels = {
  [GatewayProvider.VERCEL]: "Vercel AI Gateway",
  [GatewayProvider.NEON]: "Neon AI Gateway",
  [GatewayProvider.OPENROUTER]: "OpenRouter",
} as const satisfies Record<GatewayProvider, string>;

export const gatewayConfigFiles = {
  files: [
    "packages/ai/chat/src/models/gateway/index.ts",
    "packages/ai/chat/src/models/gateway/server.ts",
    "packages/ai/chat/src/models/gateway/env.ts",
  ],
  pattern: new RegExp(`(${Object.values(GatewayProvider).join("|")})`, "gi"),
};

export const aiEnv = {
  productName: "PRODUCT_NAME",
  [Service.DB]: {
    url: "DATABASE_URL",
  },
  providers: {
    [GatewayProvider.VERCEL]: {
      apiKey: "AI_GATEWAY_API_KEY",
    },
    [GatewayProvider.NEON]: {
      baseUrl: "NEON_AI_GATEWAY_BASE_URL",
      token: "NEON_AI_GATEWAY_TOKEN",
    },
    [GatewayProvider.OPENROUTER]: {
      apiKey: "OPENROUTER_API_KEY",
    },
    openai: {
      apiKey: "OPENAI_API_KEY",
    },
    anthropic: {
      apiKey: "ANTHROPIC_API_KEY",
    },
    google: {
      apiKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    },
    xai: {
      apiKey: "XAI_API_KEY",
    },
    deepseek: {
      apiKey: "DEEPSEEK_API_KEY",
    },
    replicate: {
      apiToken: "REPLICATE_API_TOKEN",
    },
  },
  aiTools: {
    braveSearch: {
      apiKey: "BRAVE_SEARCH_API_KEY",
    },
    exa: {
      apiKey: "EXA_API_KEY",
    },
    firecrawl: {
      apiKey: "FIRECRAWL_API_KEY",
    },
    tavily: {
      apiKey: "TAVILY_API_KEY",
    },
  },
  voice: {
    elevenlabs: {
      apiKey: "ELEVENLABS_API_KEY",
    },
    livekit: {
      apiKey: "LIVEKIT_API_KEY",
      apiSecret: "LIVEKIT_API_SECRET",
      url: "LIVEKIT_URL",
    },
  },
  storage: {
    s3: {
      region: "S3_REGION",
      bucket: "S3_BUCKET",
      endpoint: "S3_ENDPOINT",
      accessKeyId: "S3_ACCESS_KEY_ID",
      secretAccessKey: "S3_SECRET_ACCESS_KEY",
    },
  },
};

export const envInPaths = {
  [EnvPath.ROOT]: [aiEnv.productName, aiEnv[Service.DB].url],
  [EnvPath.WEB]: [
    aiEnv.providers.vercel.apiKey,
    aiEnv.providers.neon.baseUrl,
    aiEnv.providers.neon.token,
    aiEnv.providers.openrouter.apiKey,
    aiEnv.providers.openai.apiKey,
    aiEnv.providers.anthropic.apiKey,
    aiEnv.providers.google.apiKey,
    aiEnv.providers.xai.apiKey,
    aiEnv.providers.deepseek.apiKey,
    aiEnv.providers.replicate.apiToken,
    aiEnv.aiTools.braveSearch.apiKey,
    aiEnv.aiTools.exa.apiKey,
    aiEnv.aiTools.firecrawl.apiKey,
    aiEnv.aiTools.tavily.apiKey,
    aiEnv.voice.elevenlabs.apiKey,
    aiEnv.voice.livekit.apiKey,
    aiEnv.voice.livekit.apiSecret,
    aiEnv.voice.livekit.url,
    aiEnv.storage.s3.region,
    aiEnv.storage.s3.bucket,
    aiEnv.storage.s3.endpoint,
    aiEnv.storage.s3.accessKeyId,
    aiEnv.storage.s3.secretAccessKey,
  ],
};
