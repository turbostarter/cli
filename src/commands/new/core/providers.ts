import color from "picocolors";

import { logger } from "~/utils";

import { getDatabaseConfig } from "../database";

import { getAnalyticsConfig } from "./config/analytics";
import { getBillingConfig } from "./config/billing";
import { getEmailConfig } from "./config/email";
import { getFlagsConfig } from "./config/flags";
import { getMonitoringConfig } from "./config/monitoring";
import { getStorageConfig } from "./config/storage";

import type { App } from "~/config";

export const getProvidersConfig = async (apps: App[]) => {
  logger.info(
    `\nLet's configure it!\nYou can skip any step by pressing ${color.bold("enter")}.\n`,
  );

  const configuredEnv: Record<string, string> = {};

  const db = await getDatabaseConfig(configuredEnv);
  Object.assign(configuredEnv, "env" in db ? db.env : {});

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
    ...("env" in db ? db.env : {}),
    ...billing.env,
    ...email.env,
    ...storage.env,
    ...analytics.env,
    ...monitoring.env,
    ...flags.env,
  };

  return { db, email, billing, analytics, storage, monitoring, flags, env };
};
