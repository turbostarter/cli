import { Command } from "commander";
import path, { join } from "node:path";
import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { logAddOnUpsell, logger, onCancel, slugify } from "~/utils";

import { initializeAiProject } from "./ai";
import { getProjectName, kits } from "./common";
import { initializeCoreProject } from "./core";
import { initializeEdgeProject } from "./edge";
import { validatePrerequisites } from "./prerequisites";

import type { Kit, NewProject } from "./common";

const newOptionsSchema = z.object({
  cwd: z.string(),
  kit: z.enum(["core", "ai", "edge"]).optional(),
});

const selectKit = async (): Promise<Kit> => {
  const result = await prompts(
    {
      type: "select",
      name: "kit",
      message: "Which kit do you want to use?",
      choices: Object.entries(kits).map(([value, kit]) => ({
        title: kit.label,
        value,
      })),
    },
    { onCancel },
  );
  return z.enum(["core", "ai", "edge"]).parse(result.kit);
};

export const newCommand = new Command()
  .name("new")
  .description("create a new TurboStarter project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. Defaults to the current directory.",
    process.cwd(),
  )
  .option("--kit <kit>", "skip kit selection (core, ai, edge)")
  .action(async (opts: z.infer<typeof newOptionsSchema>) => {
    try {
      logger.log(`\n${color.bgRedBright(color.white(" TurboStarter "))}\n`);
      const options = newOptionsSchema.parse(opts);
      const kit = options.kit ?? (await selectKit());
      await validatePrerequisites();

      const projectName = await getProjectName();
      const project: NewProject = {
        cwd: path.resolve(options.cwd),
        name: slugify(projectName),
        projectName,
      };

      if (kit === "core") await initializeCoreProject(project);
      if (kit === "ai") await initializeAiProject(project);
      if (kit === "edge") await initializeEdgeProject(project);

      logger.log(
        `\n🎉 ${kits[kit].label} is ready in ${color.greenBright(join(project.cwd, project.name))}!\n`,
      );
      logger.log(`> cd ${project.name}\n> pnpm dev\n`);
      if (kit === "ai")
        logger.info("AI features need the provider keys you choose to use.");
      if (kit === "edge")
        logger.info(
          "Cloudflare AI, Flagship, email delivery, and deployment need cloud configuration later.",
        );
      logger.info(`Problems? ${color.underline(kits[kit].docs)}`);
      if (kit === "core") await logAddOnUpsell("new_success");
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  });
