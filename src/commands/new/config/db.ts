import prompts from "prompts";

import { config, DatabaseType } from "~/config";
import { onCancel } from "~/utils";

const getDatabaseCloudConfig = async () => {
  return prompts(
    [
      {
        type: "text",
        name: config.env.db.url,
        message: "Enter your database URL",
      },
    ],
    {
      onCancel,
    },
  );
};

export const getDatabaseConfig = async () => {
  const response = await prompts(
    [
      {
        type: "select",
        name: "type",
        message: "How do you want to use database?",
        choices: [
          {
            title: "Local (powered by Docker)",
            value: DatabaseType.LOCAL,
            selected: true,
          },
          {
            title: `Cloud`,
            value: DatabaseType.CLOUD,
          },
        ],
      },
    ],
    {
      onCancel,
    },
  );

  if (response.type === DatabaseType.CLOUD) {
    const dbConfig = await getDatabaseCloudConfig();

    return { ...response, env: dbConfig };
  }

  return response;
};
