import { promises } from "fs";
import _ from "lodash";
import { join } from "path";
import { Project } from "ts-morph";

import { logger } from "~/utils/logger";

import type { SourceFile } from "ts-morph";
import type { z } from "zod";

type BivariantCallback<TInput, TOutput> = {
  bivarianceHack(input: TInput): TOutput;
}["bivarianceHack"];

type GeneralFile = {
  path: string;
} & (
  | {
      action: "remove";
    }
  | {
      action: "modify";
      modify: (content: string) => string;
    }
);

type JsonFile<Schema extends z.ZodType, Data = z.infer<Schema>> = {
  path: `${string}.json`;
} & (
  | {
      action: "remove";
    }
  | {
      action: "modify";
      schema: Schema;
      modify: BivariantCallback<Data, unknown>;
    }
);

type TypescriptFile = {
  path: `${string}.ts` | `${string}.tsx`;
} & (
  | {
      action: "remove";
    }
  | {
      action: "modify";
      modify: (file: SourceFile) => void;
    }
);

type Directory = {
  path: string;
} & {
  action: "remove";
};

export type File = GeneralFile | TypescriptFile | JsonFile<z.ZodType, unknown>;
export type Entry = File | Directory;

export function file<S extends z.ZodType>(file: JsonFile<S>): JsonFile<S>;
export function file<T extends TypescriptFile>(file: T): T;
export function file<F extends GeneralFile>(file: F): F;
export function file(file: File) {
  return file;
}

export const directory = <D extends Directory>(directory: D) => directory;

export const isJsonFile = (file: Entry): file is JsonFile<z.ZodType, unknown> =>
  file.path.endsWith(".json");

export const isTypescriptFile = (file: Entry): file is TypescriptFile =>
  [".ts", ".tsx"].some((extension) => file.path.endsWith(extension));

export const isTextFile = (
  file: Entry,
): file is Extract<GeneralFile, { action: "modify" }> =>
  file.action === "modify" && !isJsonFile(file) && !isTypescriptFile(file);

export const removePath = async ({
  cwd,
  path,
}: {
  cwd: string;
  path: string;
}) => {
  const fullPath = join(cwd, path);
  await promises.rm(fullPath, { recursive: true, force: true });
};

export const applyFileModifications = async (cwd: string, files: Entry[]) => {
  const project = new Project({ skipAddingFilesFromTsConfig: true });

  for (const file of files) {
    if (file.action === "remove") {
      await removePath({ cwd, path: file.path });
    } else if (isJsonFile(file)) {
      const path = join(cwd, file.path);
      const parsed: unknown = JSON.parse(await promises.readFile(path, "utf8"));
      const result = file.schema.safeParse(parsed);
      if (!result.success) {
        const issues = result.error.issues
          .map(
            (issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`,
          )
          .join("; ");
        logger.info(
          `Skipping ${file.path}: template JSON does not match the expected shape (${issues}). Review this file after setup.`,
        );
        continue;
      }
      await promises.writeFile(
        path,
        JSON.stringify(file.modify(result.data), null, 2),
      );
    } else if (isTypescriptFile(file)) {
      const source = project.addSourceFileAtPath(join(cwd, file.path));
      file.modify(source);
      await source.save();
    } else if (isTextFile(file)) {
      await modifyTextFile({ cwd, path: file.path, modify: file.modify });
    }
  }
};

export const removeDependency = <T extends Record<string, unknown>>(
  data: T,
  dependency: string,
) => {
  return _.transform(
    data,
    (result: Record<string, unknown>, value, key) => {
      if (["dependencies", "devDependencies"].includes(key)) {
        result[key] =
          value && typeof value === "object"
            ? _.omit(value, dependency)
            : value;
      } else {
        result[key] = value;
      }
    },
    {},
  ) as T;
};

export const removePatchedDependency = (
  content: string,
  dependency: string,
) => {
  const withoutEntry = content.replace(
    new RegExp(
      `^  ${dependency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:.*\\n?`,
      "m",
    ),
    "",
  );

  return withoutEntry.replace(/\n*patchedDependencies:\n(?! {2}\S)/, "\n");
};

export const modifyTextFile = async ({
  cwd,
  path,
  modify,
}: {
  cwd: string;
  path: string;
  modify: (content: string) => string;
}) => {
  const fullPath = join(cwd, path);
  const content = await promises.readFile(fullPath, "utf8");
  await promises.writeFile(fullPath, modify(content));
};

export const replaceInFile = async ({
  cwd,
  path,
  pattern,
  value,
}: {
  cwd: string;
  path: string;
  pattern: RegExp | string;
  value: string;
}) => {
  await modifyTextFile({
    cwd,
    path,
    modify: (content) => content.replace(pattern, value),
  });
};

export const replaceInFiles = async ({
  cwd,
  paths,
  pattern,
  value,
}: {
  cwd: string;
  paths: string[];
  pattern: RegExp | string;
  value: string;
}) => {
  await Promise.all(
    paths.map(async (path) => {
      await replaceInFile({ cwd, path, pattern, value });
    }),
  );
};
