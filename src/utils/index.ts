import _ from "lodash";

import { logger } from "~/utils/logger";

import type { z } from "zod";

export const getLabel = (value: string) => {
  return value
    .split("-")
    .map((word) => _.capitalize(word))
    .join(" ");
};

export const onCancel = () => {
  logger.error("Operation cancelled.");
  process.exit(0);
};

export const enforceSchema = <Schema extends z.ZodType>(
  data: unknown,
  schema: Schema,
): data is z.infer<Schema> => {
  return schema.safeParse(data).success;
};

export const getErrorOutput = (error: unknown) => {
  if (error instanceof Error && "stderr" in error) {
    const stderr = String((error as { stderr: unknown }).stderr);
    if (stderr) {
      return stderr;
    }
  }

  if (error instanceof Error && "stdout" in error) {
    const stdout = String((error as { stdout: unknown }).stdout);
    if (stdout) {
      return stdout;
    }
  }

  return error instanceof Error ? error.message : String(error);
};

export * from "./logger";
export * from "./upstream";
