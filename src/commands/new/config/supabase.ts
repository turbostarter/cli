import prompts from "prompts";

import { config, SupabaseType } from "~/config";
import { onCancel } from "~/utils";

const getSupabaseCloudConfig = async () => {
  return prompts(
    [
      {
        type: "text",
        name: config.env.supabase.url,
        message: "Enter your Supabase project URL",
      },
      {
        type: "text",
        name: config.env.supabase.key,
        message: "Enter your Supabase project anononymous key",
      },
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

export const getSupabaseConfig = async () => {
  const response = await prompts(
    [
      {
        type: "select",
        name: "type",
        message: "How do you want to use Supabase?",
        choices: [
          {
            title: "Local (powered by Docker)",
            value: SupabaseType.LOCAL,
            selected: true,
          },
          {
            title: `Cloud`,
            value: SupabaseType.CLOUD,
          },
        ],
      },
    ],
    {
      onCancel,
    },
  );

  if (response.type === SupabaseType.CLOUD) {
    const supabaseConfig = await getSupabaseCloudConfig();

    return { ...response, env: supabaseConfig };
  }

  return response;
};
