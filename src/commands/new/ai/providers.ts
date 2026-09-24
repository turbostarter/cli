import { configureEnvGroups } from "../common";

const aiGroups = [
  {
    title: "AI Gateway",
    entries: [
      { key: "AI_GATEWAY_API_KEY", label: "AI Gateway API key", secret: true },
    ],
  },
  {
    title: "other model providers",
    entries: [
      ["OPENAI_API_KEY", "OpenAI API key"],
      ["ANTHROPIC_API_KEY", "Anthropic API key"],
      ["GOOGLE_GENERATIVE_AI_API_KEY", "Google Generative AI API key"],
      ["XAI_API_KEY", "xAI API key"],
      ["DEEPSEEK_API_KEY", "DeepSeek API key"],
      ["REPLICATE_API_TOKEN", "Replicate API token"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "AI tools",
    entries: [
      ["BRAVE_SEARCH_API_KEY", "Brave Search API key"],
      ["EXA_API_KEY", "Exa API key"],
      ["FIRECRAWL_API_KEY", "Firecrawl API key"],
      ["TAVILY_API_KEY", "Tavily API key"],
    ].map(([key, label]) => ({ key, label, secret: true })),
  },
  {
    title: "voice",
    entries: [
      { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API key", secret: true },
      { key: "LIVEKIT_API_KEY", label: "LiveKit API key", secret: true },
      { key: "LIVEKIT_API_SECRET", label: "LiveKit API secret", secret: true },
      { key: "LIVEKIT_URL", label: "LiveKit URL" },
    ],
  },
  {
    title: "S3 storage",
    entries: [
      { key: "S3_REGION", label: "S3 region" },
      { key: "S3_BUCKET", label: "S3 bucket" },
      { key: "S3_ENDPOINT", label: "S3 endpoint" },
      { key: "S3_ACCESS_KEY_ID", label: "S3 access key ID", secret: true },
      {
        key: "S3_SECRET_ACCESS_KEY",
        label: "S3 secret access key",
        secret: true,
      },
    ],
  },
];

export const configureProviders = async (cwd: string) =>
  configureEnvGroups(cwd, "apps/web", aiGroups);
