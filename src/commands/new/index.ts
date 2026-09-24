import { Command } from "commander";
import path, { join } from "node:path";
import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { Kit } from "~/config";
import { logAddOnUpsell, logger, onCancel, slugify } from "~/utils";

import { initializeAiProject } from "./ai";
import { kits } from "./common";
import { initializeCoreProject } from "./core";
import { initializeEdgeProject } from "./edge";
import { validatePrerequisites } from "./prerequisites";

import type { NewProject } from "./common";

const kitSchema = z.enum(Kit);

const newOptionsSchema = z.object({
  cwd: z.string().min(1),
  kit: kitSchema.optional(),
});

const projectNameSchema = z
  .string()
  .refine((name) => name.trim().length > 0, "Name is required!")
  .refine(
    (name) => slugify(name).length > 0,
    "Name must contain at least one letter or number.",
  );

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
  return kitSchema.parse(result.kit);
};

const getProjectName = async (): Promise<string> => {
  const result = await prompts(
    {
      type: "text",
      name: "name",
      message: "Enter your project name.",
      validate: (value: string) => {
        const parsed = projectNameSchema.safeParse(value);
        return parsed.success || parsed.error.issues[0].message;
      },
    },
    { onCancel },
  );
  return projectNameSchema.parse(result.name);
};

export const newCommand = new Command()
  .name("new")
  .description("create a new TurboStarter project")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. Defaults to the current directory.",
    process.cwd(),
  )
  .option(
    "-k, --kit <kit>",
    `skip kit selection (${Object.values(Kit).join(", ")})`,
  )
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

      if (kit === Kit.CORE) await initializeCoreProject(project);
      if (kit === Kit.AI) await initializeAiProject(project);
      if (kit === Kit.EDGE) await initializeEdgeProject(project);

      logger.log(
        `\n🎉 ${kits[kit].label} is ready in ${color.greenBright(join(project.cwd, project.name))}!\n`,
      );
      logger.log(`> cd ${project.name}\n> pnpm dev\n`);
      if (kit === Kit.AI)
        logger.info("AI features need the provider keys you choose to use.");
      if (kit === Kit.EDGE)
        logger.info(
          "Edge keeps all service bindings. pnpm dev needs Cloudflare credentials and your own Flagship app ID because AI and Flagship use remote bindings.",
        );
      logger.info(`Problems? ${color.underline(kits[kit].docs)}`);
      if (kit === Kit.CORE) await logAddOnUpsell("new_success");
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  });
