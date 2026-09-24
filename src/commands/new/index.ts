import { Command } from "commander";
import path, { join } from "node:path";
import color from "picocolors";
import prompts from "prompts";
import * as z from "zod";

import { config, Kit } from "~/config";
import { logger, onCancel, slugify } from "~/utils";

import { initializeAiProject } from "./ai";
import { initializeCoreProject } from "./core";
import { initializeEdgeProject } from "./edge";
import { validatePrerequisites } from "./prerequisites";

import type { NewProject } from "./common";

const projectInitializer = {
  [Kit.CORE]: initializeCoreProject,
  [Kit.AI]: initializeAiProject,
  [Kit.EDGE]: initializeEdgeProject,
} satisfies Record<Kit, (project: NewProject) => Promise<void>>;

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
      choices: Object.values(Kit).map((kit) => ({
        title:
          kit === Kit.EDGE
            ? `${config.products[kit].label} (new)`
            : config.products[kit].label,
        value: kit,
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
    `specify the kit you want to use (${Object.values(Kit).join(", ")})`,
  )
  .action(async (opts: z.infer<typeof newOptionsSchema>) => {
    try {
      logger.log(`\n${color.bgRedBright(color.white(" TurboStarter "))}\n`);
      const options = newOptionsSchema.parse(opts);
      const kit = options.kit ?? (await selectKit());
      await validatePrerequisites();

      const projectName = await getProjectName();
      const project = {
        cwd: path.resolve(options.cwd),
        name: slugify(projectName),
        projectName,
      } satisfies NewProject;

      await projectInitializer[kit](project);

      logger.log(
        `\n🎉 ${config.products[kit].label} is ready in ${color.greenBright(join(project.cwd, project.name))}!\n`,
      );
      logger.log(`> cd ${project.name}\n> pnpm dev\n`);
      logger.info(`Problems? ${color.underline(config.products[kit].docs)}`);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });
