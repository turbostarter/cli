import color from "picocolors";

import { ServiceType } from "~/config";
import { logger } from "~/utils";

import { getDatabaseConfig } from "../database";

import { getAnalyticsConfig } from "./config/analytics";
import { getBillingConfig } from "./config/billing";
import { getEmailConfig } from "./config/email";
import { getFlagsConfig } from "./config/flags";
import { getMonitoringConfig } from "./config/monitoring";
import { getStorageConfig } from "./config/storage";

import type { App } from "./config/definitions";

export const getProvidersConfig = async (apps: App[]) => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const configuredEnv: Record<string, string> = {};

  const db = await getDatabaseConfig(configuredEnv);
  const databaseEnv = db.type === ServiceType.CLOUD ? db.env : {};
  Object.assign(configuredEnv, databaseEnv);

  const email = await getEmailConfig(configuredEnv);
  Object.assign(configuredEnv, email.env);

  const billing = await getBillingConfig(apps, configuredEnv);
  Object.assign(configuredEnv, billing.env);

  const analytics = await getAnalyticsConfig(apps, configuredEnv);
  Object.assign(configuredEnv, analytics.env);

  const storage = await getStorageConfig(configuredEnv);
  Object.assign(configuredEnv, storage.env);

  const monitoring = await getMonitoringConfig(apps, configuredEnv);
  Object.assign(configuredEnv, monitoring.env);

  const flags = await getFlagsConfig(apps, configuredEnv);
  Object.assign(configuredEnv, flags.env);

  const env = {
    ...databaseEnv,
    ...billing.env,
    ...email.env,
    ...storage.env,
    ...analytics.env,
    ...monitoring.env,
    ...flags.env,
  };

  return { db, email, billing, analytics, storage, monitoring, flags, env };
};
