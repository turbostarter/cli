import _ from "lodash";

import { logger } from "~/utils/logger";

export const getLabel = (value: string) => {
  return value
    .split("-")
    .map((word) => _.capitalize(word))
    .join(" ");
};

export const onCancel = () => {
  logger.break();
  logger.error("Operation cancelled.");
  process.exit(0);
};

export * from "./handle-error";
export * from "./logger";
