import prompts from "prompts";
import { z } from "zod";

import { ServiceType } from "~/config";
import { onCancel } from "~/utils";

const databaseTypeSchema = z.object({
  type: z.enum([ServiceType.LOCAL, ServiceType.CLOUD]),
});

const databaseUrlSchema = z.string().trim().min(1, "Database URL is required.");

const cloudDatabaseSchema = z.object({ DATABASE_URL: databaseUrlSchema });

const getDatabaseCloudConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const key = "DATABASE_URL";

  const answer = await prompts(
    [
      {
        type: "text",
        name: key,
        message: "Enter your database URL",
        initial: configuredEnv[key],
        validate: (value: string) =>
          databaseUrlSchema.safeParse(value).success ||
          "Database URL is required.",
      },
    ],
    {
      onCancel,
    },
  );
  return cloudDatabaseSchema.parse(answer);
};

export const getDatabaseConfig = async (
  configuredEnv: Record<string, string>,
) => {
  const response = databaseTypeSchema.parse(
    await prompts(
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
    ),
  );

  if (response.type === ServiceType.CLOUD) {
    return {
      type: ServiceType.CLOUD,
      env: await getDatabaseCloudConfig(configuredEnv),
    };
  }

  return { type: ServiceType.LOCAL };
};
