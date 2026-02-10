import { promises } from "fs";
import _ from "lodash";
import { join } from "path";

import type { SourceFile } from "ts-morph";
import type * as z from "zod/v4/core";

type BivariantCallback<TInput, TOutput> = {
  bivarianceHack(input: TInput): TOutput;
}["bivarianceHack"];

type GeneralFile = {
  path: string;
} & {
  action: "remove";
};

type JsonFile<Schema extends z.$ZodType, Data = z.infer<Schema>> = {
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

export type File = GeneralFile | TypescriptFile | JsonFile<z.$ZodType, unknown>;
export type Entry = File | Directory;

export function file<S extends z.$ZodType>(file: JsonFile<S>): JsonFile<S>;
export function file<T extends TypescriptFile>(file: T): T;
export function file<F extends GeneralFile>(file: F): F;
export function file(file: File) {
  return file;
}

export const directory = <D extends Directory>(directory: D) => directory;

export const isJsonFile = (
  file: Entry,
): file is JsonFile<z.$ZodType, unknown> => file.path.endsWith(".json");

export const isTypescriptFile = (file: Entry): file is TypescriptFile =>
  [".ts", ".tsx"].some((extension) => file.path.endsWith(extension));

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
  const fullPath = join(cwd, path);
  const content = await promises.readFile(fullPath, "utf8");
  const newContent = content.replace(pattern, value);
  await promises.writeFile(fullPath, newContent);
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
