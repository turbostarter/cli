import { App } from "~/config";

import { getAnalyticsExtensionConfig } from "./extension";
import { getAnalyticsMobileConfig } from "./mobile";
import { getAnalyticsWebConfig } from "./web";

import type { AnalyticsProvider } from "~/config";

export const getAnalyticsConfig = async (apps: App[]) => {
  const providers: Partial<AnalyticsProvider> = {};
  const env: Record<string, string> = {};

  if (apps.includes(App.WEB)) {
    const { provider, env: webEnv } = await getAnalyticsWebConfig();
    providers[App.WEB] = provider;
    Object.assign(env, webEnv);
  }

  if (apps.includes(App.MOBILE)) {
    const { provider, env: mobileEnv } = await getAnalyticsMobileConfig();
    providers[App.MOBILE] = provider;
    Object.assign(env, mobileEnv);
  }

  if (apps.includes(App.EXTENSION)) {
    const { provider, env: extensionEnv } = await getAnalyticsExtensionConfig();
    providers[App.EXTENSION] = provider;
    Object.assign(env, extensionEnv);
  }

  return { providers, env };
};
