import color from "picocolors";

import { config, Kit } from "~/config";
import { logger } from "~/utils/logger";
import { hasRepoAccess, hasSshAccess } from "~/utils/upstream";

type UpsellCampaign = "new_success" | "update";

const link = (text: string, url: string) =>
  `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;

const withUtm = (url: string, campaign: UpsellCampaign) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=cli&utm_medium=terminal&utm_campaign=${campaign}`;
};

const displayHost = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "");

const productLink = (label: string, url: string, campaign: UpsellCampaign) => {
  const href = withUtm(url, campaign);
  return `${link(color.underline(label), href)} - ${link(color.underline(displayHost(url)), href)}`;
};

const upsellLogByProduct = {
  [Kit.CORE]: (campaign: UpsellCampaign) =>
    `\nWant to ship web, mobile and extension? Start in minutes with ${productLink(config.products[Kit.CORE].label, config.products[Kit.CORE].url, campaign)}`,
  [Kit.AI]: (campaign: UpsellCampaign) =>
    `\nWant 10+ ready AI templates too? Check out ${productLink(config.products[Kit.AI].label, config.products[Kit.AI].url, campaign)}`,
  [Kit.EDGE]: (campaign: UpsellCampaign) =>
    `\nReady to ship your app to the edge? Take a look at ${productLink(config.products[Kit.EDGE].label, config.products[Kit.EDGE].url, campaign)}`,
  openclaw: (campaign: UpsellCampaign) =>
    `\nShipping an OpenClaw wrapper? Check out ${productLink(config.products.openclaw.label, config.products.openclaw.url, campaign)}`,
} satisfies Record<string, (campaign: UpsellCampaign) => string>;

const getProductsWithoutAccess = async () => {
  const useSsh = await hasSshAccess();

  const products = [...Object.values(Kit), "openclaw"] as const;
  const accessArray = await Promise.all(
    products.map(
      async (product) =>
        !(await hasRepoAccess(config.products[product].repository, { useSsh })),
    ),
  );

  return products.filter((_, idx) => accessArray[idx]);
};

export const logAddOnUpsell = async (campaign: "new_success" | "update") => {
  try {
    const productsWithoutAccess = await getProductsWithoutAccess();
    const product = productsWithoutAccess.at(0);

    if (!product) {
      return;
    }

    logger.info(upsellLogByProduct[product](campaign));

    return;
  } catch {
    // Upsell should never break the happy path.
  }
};
