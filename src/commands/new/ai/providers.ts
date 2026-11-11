import color from "picocolors";
import prompts from "prompts";

import {
  aiEnv,
  GatewayProvider,
  gatewayLabels,
} from "~/commands/new/ai/config";
import { getDatabaseConfig } from "~/commands/new/database";
import { logger, onCancel } from "~/utils";

import { configureEnvGroups } from "../common";

import type { EnvPromptGroup } from "../common";

const gatewayGroups = {
  [GatewayProvider.VERCEL]: {
    title: gatewayLabels[GatewayProvider.VERCEL],
    entries: [
      {
        key: aiEnv.providers.vercel.apiKey,
        label: "AI Gateway API key",
        secret: true,
      },
    ],
  },
  [GatewayProvider.NEON]: {
    title: gatewayLabels[GatewayProvider.NEON],
    entries: [
      {
        key: aiEnv.providers.neon.baseUrl,
        label: "Neon AI Gateway base URL",
      },
      {
        key: aiEnv.providers.neon.token,
        label: "Neon AI Gateway token",
        secret: true,
      },
    ],
  },
  [GatewayProvider.OPENROUTER]: {
    title: gatewayLabels[GatewayProvider.OPENROUTER],
    entries: [
      {
        key: aiEnv.providers.openrouter.apiKey,
        label: "OpenRouter API key",
        secret: true,
      },
    ],
  },
} as const satisfies Record<GatewayProvider, EnvPromptGroup>;

const getGatewayProvider = async (): Promise<{
  provider: GatewayProvider;
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(GatewayProvider).map((provider) => ({
          title: gatewayLabels[provider],
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use as the chat model gateway?",
      },
    ],
    { onCancel },
  );
};

const groups: EnvPromptGroup[] = [
  {
    title: "other model providers",
    entries: [
      [aiEnv.providers.openai.apiKey, "OpenAI API key"],
      [aiEnv.providers.anthropic.apiKey, "Anthropic API key"],
      [aiEnv.providers.google.apiKey, "Google Generative AI API key"],
      [aiEnv.providers.xai.apiKey, "xAI API key"],
      [aiEnv.providers.deepseek.apiKey, "DeepSeek API key"],
      [aiEnv.providers.replicate.apiToken, "Replicate API token"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "AI tools",
    entries: [
      [aiEnv.aiTools.braveSearch.apiKey, "Brave Search API key"],
      [aiEnv.aiTools.exa.apiKey, "Exa API key"],
      [aiEnv.aiTools.firecrawl.apiKey, "Firecrawl API key"],
      [aiEnv.aiTools.tavily.apiKey, "Tavily API key"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "voice",
    entries: [
      {
        key: aiEnv.voice.elevenlabs.apiKey,
        label: "ElevenLabs API key",
        secret: true,
      },
      {
        key: aiEnv.voice.livekit.apiKey,
        label: "LiveKit API key",
        secret: true,
      },
      {
        key: aiEnv.voice.livekit.apiSecret,
        label: "LiveKit API secret",
        secret: true,
      },
      { key: aiEnv.voice.livekit.url, label: "LiveKit URL" },
    ],
  },
  {
    title: "S3 storage",
    entries: [
      { key: aiEnv.storage.s3.region, label: "S3 region" },
      { key: aiEnv.storage.s3.bucket, label: "S3 bucket" },
      { key: aiEnv.storage.s3.endpoint, label: "S3 endpoint" },
      {
        key: aiEnv.storage.s3.accessKeyId,
        label: "S3 access key ID",
        secret: true,
      },
      {
        key: aiEnv.storage.s3.secretAccessKey,
        label: "S3 secret access key",
        secret: true,
      },
    ],
  },
];

export const configureProviders = async () => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const db = await getDatabaseConfig({});
  const { provider: gateway } = await getGatewayProvider();
  return {
    db,
    gateway,
    env: {
      ...db.env,
      ...(await configureEnvGroups([gatewayGroups[gateway], ...groups])),
    },
  };
};
