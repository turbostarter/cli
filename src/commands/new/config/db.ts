import prompts from "prompts";

import { config, Service, ServiceType } from "~/config";
import { onCancel } from "~/utils";

const getDatabaseCloudConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const urlKey = config.env[Service.DB].url;

  return prompts(
    [
      {
        type: "text",
        name: urlKey,
        message: "Enter your database URL",
        initial: configuredEnv[urlKey],
      },
    ],
    {
      onCancel,
    },
  );
};

export const getDatabaseConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const response = await prompts(
    [
      {
        type: "select",
        name: "type",
        message: "How do you want to use database?",
        choices: [
          {
            title: "Local (powered by Docker)",
            value: ServiceType.LOCAL,
            selected: true,
          },
          {
            title: `Cloud`,
            value: ServiceType.CLOUD,
          },
        ],
      },
    ],
    {
      onCancel,
    },
  );

  if (response.type === ServiceType.CLOUD) {
    const dbConfig = await getDatabaseCloudConfig(configuredEnv);

    return { ...response, env: dbConfig };
  }

  return response;
};
