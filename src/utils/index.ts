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

export * from "./logger";
export * from "./upstream";
