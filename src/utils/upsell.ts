import color from "picocolors";

import { config } from "~/config";
import { logger } from "~/utils/logger";
import { hasRepoAccess, hasSshAccess } from "~/utils/upstream";

type UpsellCampaign = "clone_fail" | "new_success" | "update";

const withUtm = (url: string, campaign: UpsellCampaign) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=cli&utm_medium=terminal&utm_campaign=${campaign}`;
};

export const logCoreUpsell = () => {
  const campaign = "clone_fail" as const;
  const coreUrl = withUtm(config.products.core.url, campaign);

  logger.info(
    `\nNo access to the Core repository? A license unlocks GitHub access.`,
  );
  logger.log(`\nGet Core Kit - ${color.underline(coreUrl)}`);
};

export const logAddOnUpsell = async (campaign: "new_success" | "update") => {
  try {
    const useSsh = await hasSshAccess();
    const [hasAi, hasOpenClaw] = await Promise.all([
      hasRepoAccess(config.products.ai.repository, { useSsh }),
      hasRepoAccess(config.products.openclaw.repository, { useSsh }),
    ]);

    if (hasAi) {
      const url = withUtm(config.products.ai.url, campaign);
      logger.info(
        `\nWant AI templates too? Check out AI Kit - ${color.underline(url)}`,
      );
      return;
    }

    if (hasOpenClaw) {
      const url = withUtm(config.products.openclaw.url, campaign);
      logger.info(
        `\nShipping an OpenClaw wrapper? Check out OpenClaw Kit - ${color.underline(url)}`,
      );
    }
  } catch {
    // Upsell should never break the happy path.
  }
};
