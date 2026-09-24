import color from "picocolors";
import prompts from "prompts";

import { App } from "~/config";
import { logger, onCancel } from "~/utils";
import { applyFileModifications } from "~/utils/file";

import { fileModificationsByMissingApp } from "./config/file-modifications";

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

    const apps = result.apps as App[];

    if (apps.includes(App.WEB)) {
      return apps;
    } else {
      logger.error(
        `You ${color.bold("must")} ship a web app, to ensure backend services work.`,
      );
    }
  }
};

export const modifyFilesForMissingApps = async (cwd: string, apps: App[]) => {
  const files = Object.values(App)
    .filter((app) => !apps.includes(app))
    .flatMap((app) => fileModificationsByMissingApp[app]);
  await applyFileModifications(cwd, files);
};
