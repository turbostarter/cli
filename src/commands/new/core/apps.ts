import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { logger, onCancel } from "~/utils";
import { applyFileModifications } from "~/utils/file";

import { App } from "./config/definitions";
import { fileModificationsByMissingApp } from "./config/file-modifications";

const appsSchema = z
  .array(z.enum(App))
  .refine(
    (apps) => apps.includes(App.WEB),
    "You must ship a web app, to ensure backend services work.",
  );

export const getApps = async () => {
  while (true) {
    const result = await prompts(
      {
        type: "multiselect",
        name: "apps",
        message: `What do you want to ship?`,
        instructions: false,
        choices: [
          { title: "Web app", value: App.WEB, selected: true },
          { title: "Mobile app", value: App.MOBILE, selected: false },
          {
            title: "Browser extension",
            value: App.EXTENSION,
            selected: false,
          },
        ],
        hint: `You ${color.bold("must")} ship a web app, to ensure backend services work.`,
      },
      {
        onCancel,
      },
    );

    const parsed = appsSchema.safeParse(result.apps);
    if (parsed.success) return parsed.data;
    logger.error(parsed.error.issues[0].message);
  }
};

export const modifyFilesForMissingApps = async (cwd: string, apps: App[]) => {
  const files = Object.values(App)
    .filter((app) => !apps.includes(app))
    .flatMap((app) => fileModificationsByMissingApp[app]);
  await applyFileModifications(cwd, files);
};
