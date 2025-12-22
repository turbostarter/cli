import { App } from "~/config";

import { getMonitoringExtensionConfig } from "./extension";
import { getMonitoringMobileConfig } from "./mobile";
import { getMonitoringWebConfig } from "./web";

import type { MonitoringProvider } from "~/config";

export const getMonitoringConfig = async (apps: App[]) => {
  const providers: Partial<MonitoringProvider> = {};
  const env: Record<string, string> = {};

  if (apps.includes(App.WEB)) {
    const { provider, env: webEnv } = await getMonitoringWebConfig();
    providers[App.WEB] = provider;
    Object.assign(env, webEnv);
  }

  if (apps.includes(App.MOBILE)) {
    const { provider, env: mobileEnv } = await getMonitoringMobileConfig();
    providers[App.MOBILE] = provider;
    Object.assign(env, mobileEnv);
  }

  if (apps.includes(App.EXTENSION)) {
    const { provider, env: extensionEnv } =
      await getMonitoringExtensionConfig();
    providers[App.EXTENSION] = provider;
    Object.assign(env, extensionEnv);
  }

  return { providers, env };
};
