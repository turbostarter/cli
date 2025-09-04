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

const getStorageProviderConfig = () => {
  return prompts(
    [
      {
        type: "text",
        name: config.env.storage.s3.region,
        message: "Enter your S3 region",
        initial: "us-east-1",
      },
      {
        type: "text",
        name: config.env.storage.s3.endpoint,
        message: "Enter your S3 endpoint",
        initial: "https://s3.amazonaws.com",
      },
      {
        type: "text",
        name: config.env.storage.s3.bucket,
        message: "Enter your default S3 bucket name",
      },
      {
        type: "text",
        name: config.env.storage.s3.accessKeyId,
        message: "Enter your S3 access key ID",
      },
      {
        type: "text",
        name: config.env.storage.s3.secretAccessKey,
        message: "Enter your S3 secret access key",
      },
    ],
    {
      onCancel,
    },
  );
};

export const getStorageConfig = async () => {
  const { provider } = await getStorageProvider();
  const env = await getStorageProviderConfig();

  return { provider, env };
};
