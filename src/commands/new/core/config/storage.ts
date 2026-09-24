import prompts from "prompts";

import { config, StorageProvider } from "~/config";
import { onCancel } from "~/utils";
import { getLabel } from "~/utils";

const getStorageProvider = async (): Promise<{
  provider: StorageProvider;
}> => {
  return prompts(
    [
      {
        type: "select",
        choices: Object.values(StorageProvider).map((provider) => ({
          title: getLabel(provider),
          value: provider,
        })),
        name: "provider",
        message: "What do you want to use for storage?",
      },
    ],
    {
      onCancel,
    },
  );
};

const getStorageProviderConfig = (configuredEnv: Record<string, string>) => {
  return prompts(
    [
      {
        type: "text",
        name: config.env.storage.s3.region,
        message: "Enter your S3 region",
        initial: configuredEnv[config.env.storage.s3.region] ?? "us-east-1",
      },
      {
        type: "text",
        name: config.env.storage.s3.endpoint,
        message: "Enter your S3 endpoint",
        initial:
          configuredEnv[config.env.storage.s3.endpoint] ??
          "https://s3.amazonaws.com",
      },
      {
        type: "text",
        name: config.env.storage.s3.bucket,
        message: "Enter your default S3 bucket name",
        initial: configuredEnv[config.env.storage.s3.bucket],
      },
      {
        type: "text",
        name: config.env.storage.s3.accessKeyId,
        message: "Enter your S3 access key ID",
        initial: configuredEnv[config.env.storage.s3.accessKeyId],
      },
      {
        type: "text",
        name: config.env.storage.s3.secretAccessKey,
        message: "Enter your S3 secret access key",
        initial: configuredEnv[config.env.storage.s3.secretAccessKey],
      },
    ],
    {
      onCancel,
    },
  );
};

export const getStorageConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const { provider } = await getStorageProvider();
  const env = await getStorageProviderConfig(configuredEnv);

  return { provider, env };
};
