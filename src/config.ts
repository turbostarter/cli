export const ServiceType = {
  LOCAL: "local",
  CLOUD: "cloud",
} as const;

export const Service = {
  DB: "db",
} as const;

export const Kit = {
  CORE: "core",
  AI: "ai",
  EDGE: "edge",
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];
export type Service = (typeof Service)[keyof typeof Service];
export type Kit = (typeof Kit)[keyof typeof Kit];

export const servicesPackages: Record<Service, string> = {
  [Service.DB]: "@workspace/db",
};

export const products = {
  [Kit.CORE]: {
    repository: "turbostarter/core",
    url: "https://www.turbostarter.dev",
  },
  [Kit.AI]: {
    repository: "turbostarter/ai",
    url: "https://www.turbostarter.dev/ai",
  },
  [Kit.EDGE]: {
    repository: "turbostarter/edge",
    url: "https://www.turbostarter.dev/edge",
  },
  openclaw: {
    repository: "turbostarter/openclaw",
    url: "https://www.turbostarter.dev/openclaw",
  },
} as const;

export const config = {
  name: "TurboStarter",
  products,
} as const;
