import { App } from "~/config";

import { getBillingMobileConfig } from "./mobile";
import { getBillingWebConfig } from "./web";

import type { BillingProvider } from "~/config";

export const getBillingConfig = async (apps: App[]) => {
  const providers: Partial<BillingProvider> = {};
  const env: Record<string, string> = {};

  if (apps.includes(App.WEB)) {
    const { provider, env: webEnv } = await getBillingWebConfig();
    providers[App.WEB] = provider;
    Object.assign(env, webEnv);
  }

  if (apps.includes(App.MOBILE)) {
    const { provider, env: mobileEnv } = await getBillingMobileConfig();
    providers[App.MOBILE] = provider;
    Object.assign(env, mobileEnv);
  }

  return { providers, env };
};
