import { App } from "../definitions";

import { getFlagsExtensionConfig } from "./extension";
import { getFlagsMobileConfig } from "./mobile";
import { getFlagsWebConfig } from "./web";

import type { FlagsProvider } from "../definitions";

export const getFlagsConfig = async (
  apps: App[],
  configuredEnv: Record<string, string>,
) => {
  const providers: Partial<FlagsProvider> = {};
  const env: Record<string, string> = {};

  if (apps.includes(App.WEB)) {
    const { provider, env: webEnv } = await getFlagsWebConfig(configuredEnv);
    providers[App.WEB] = provider;
    Object.assign(env, webEnv);
  }

  if (apps.includes(App.MOBILE)) {
    const { provider, env: mobileEnv } =
      await getFlagsMobileConfig(configuredEnv);
    providers[App.MOBILE] = provider;
    Object.assign(env, mobileEnv);
  }

  if (apps.includes(App.EXTENSION)) {
    const { provider, env: extensionEnv } =
      await getFlagsExtensionConfig(configuredEnv);
    providers[App.EXTENSION] = provider;
    Object.assign(env, extensionEnv);
  }

  return { providers, env };
};
