import fs from "fs-extra";
import _ from "lodash";
import path from "path";

import { logger } from "~/utils/logger";

import type { PackageJson } from "type-fest";

export const getPackageInfo = () => {
  const packageJsonPath = path.join("package.json");

  return fs.readJSONSync(packageJsonPath) as PackageJson;
};

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
