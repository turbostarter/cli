import { execa } from "execa";
import { promises } from "node:fs";
import { join } from "node:path";
import ora from "ora";
import color from "picocolors";
import prompts from "prompts";
import { z } from "zod";

import { config } from "~/config";
import {
  hasSshAccess,
  httpsUrl,
  logger,
  onCancel,
  setUpstreamRemote,
  sshUrl,
} from "~/utils";

import type { Kit } from "~/config";

export interface NewProject {
  cwd: string;
  name: string;
  projectName: string;
}

const configureSchema = z.object({ configure: z.boolean() });
const optionalBooleanSchema = z.union([
  z.literal(""),
  z.enum(["true", "false"]),
]);

export const getConfigureProvidersStep = async (): Promise<boolean> => {
  const result = await prompts(
    {
      type: "select",
      name: "configure",
      message: "Configure all providers now?",
      choices: [
        { title: "Yes, configure now (recommended)", value: true },
        { title: "No, just let me ship, now!", value: false },
      ],
    },
    { onCancel },
  );
  return configureSchema.parse(result).configure;
};

export const cloneKit = async (project: NewProject, kit: Kit) => {
  const spinner = ora(
    `Cloning ${config.products[kit].label} into ${project.name}...`,
  ).start();
  try {
    const repository = config.products[kit].repository;
    const url = (await hasSshAccess())
      ? sshUrl(repository)
      : httpsUrl(repository);
    await execa(
      "git",
      ["clone", "-b", "main", "--single-branch", url, project.name],
      {
        cwd: project.cwd,
      },
    );
    spinner.succeed("Repository successfully pulled!");
    return join(project.cwd, project.name);
  } catch (error) {
    spinner.fail(`Failed to clone ${config.products[kit].label}.`);
    logger.info(
      `Need access to ${config.products[kit].label}? ${color.underline(config.products[kit].url)}`,
    );
    throw error;
  }
};

export const configureGit = async (cwd: string) => {
  const spinner = ora("Configuring Git...").start();
  try {
    const { stdout: origin } = await execa(
      "git",
      ["config", "--get", "remote.origin.url"],
      { cwd },
    );
    await setUpstreamRemote(origin, { cwd });
    await execa("git", ["add", "-u"], { cwd });
    const { stdout } = await execa("git", ["diff", "--cached", "--name-only"], {
      cwd,
    });
    if (stdout.trim()) {
      await execa(
        "git",
        [
          "-c",
          "core.hooksPath=/dev/null",
          "commit",
          "-m",
          "chore: initialize project",
        ],
        { cwd },
      );
    }
    spinner.succeed("Git successfully configured!");
  } catch (error) {
    spinner.fail("Failed to configure Git!");
    throw error;
  }
};

export const copyEnvExamples = async (cwd: string, paths: string[]) => {
  for (const relativePath of paths) {
    const directory = join(cwd, relativePath);
    await promises.copyFile(
      join(directory, ".env.example"),
      join(directory, ".env.local"),
    );
  }
};

export const setEnvValue = async (
  cwd: string,
  relativePath: string,
  key: string,
  value: string,
) => {
  const file = join(cwd, relativePath, ".env.local");
  const content = await promises.readFile(file, "utf8");
  const line = `${key}=${JSON.stringify(value)}`;
  const lines = content.split("\n");
  const index = lines.findIndex((entry) => entry.startsWith(`${key}=`));
  if (index === -1) lines.push(line);
  else lines[index] = line;
  await promises.writeFile(file, lines.join("\n"));
};

export interface EnvPromptGroup {
  title: string;
  entries: {
    key: string;
    label: string;
    secret?: boolean;
    boolean?: boolean;
  }[];
}

export const configureEnvGroups = async (
  cwd: string,
  path: string,
  groups: EnvPromptGroup[],
) => {
  const configured: Record<string, string> = {};
  for (const group of groups) {
    const selected = await prompts(
      {
        type: "confirm",
        name: "configure",
        message: `Configure ${group.title}?`,
        initial: false,
      },
      { onCancel },
    );
    if (!configureSchema.parse(selected).configure) continue;

    for (const entry of group.entries) {
      const answer = await prompts(
        {
          type: "text",
          name: "value",
          message: entry.label,
          validate: (value: string) =>
            !entry.boolean ||
            optionalBooleanSchema.safeParse(value.trim()).success
              ? true
              : "Enter true or false.",
        },
        { onCancel },
      );
      const value = z.string().trim().default("").parse(answer.value);
      if (value) {
        await setEnvValue(cwd, path, entry.key, value);
        configured[entry.key] = value;
      }
    }
  }
  return configured;
};

export const installtDependencies = async (cwd: string) => {
  const spinner = ora("Installing dependencies...").start();
  try {
    await execa("pnpm", ["install"], { cwd });
    await execa("pnpm", ["format:fix"], { cwd });
    spinner.succeed("Dependencies successfully installed!");
  } catch (error) {
    spinner.fail("Failed to install dependencies!");
    throw error;
  }
};
