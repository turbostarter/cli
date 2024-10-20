import { execa } from "execa";
import ora from "ora";
import color from "picocolors";

import { logger } from "~/utils/logger";

export const validateNodeInstalled = async () => {
  try {
    await execa("node", ["--version"]);
  } catch {
    logger.error(
      "Node.js is not installed. Please install Node.js and try again.\n",
    );
    logger.info(
      `To install Node.js, visit: ${color.underline("https://nodejs.org/en/")}`,
    );

    process.exit(1);
  }
};

export const validatePnpmInstalled = async () => {
  try {
    await execa("pnpm", ["--version"]);
  } catch {
    try {
      await execa("npm", ["install", "-g", "pnpm"]);
    } catch {
      logger.error(
        "pnpm is not installed. Please install pnpm manually and try again. \n",
      );
      logger.info(
        `To install pnpm, visit: ${color.underline("https://pnpm.io/installation")}`,
      );

      process.exit(1);
    }
  }
};

export const validateDockerInstalled = async () => {
  try {
    await execa("docker", ["--version"]);
  } catch {
    logger.error(
      "Docker is not installed. Please install Docker and try again.",
    );
    logger.info(
      `To install Docker, visit: ${color.underline("https://docs.docker.com/get-docker/")}`,
    );
    process.exit(1);
  }
};

const validateGitInstalled = async () => {
  try {
    await execa("git", ["--version"]);
  } catch {
    logger.error("Git is not installed. Please install Git and try again.");
    logger.info(
      `To install Git, visit: ${color.underline("https://git-scm.com/downloads")}`,
    );
    process.exit(1);
  }
};

export const validatePrerequisites = async () => {
  const spinner = ora("Checking prerequisites... \n").start();
  try {
    await validateGitInstalled();
    await validateNodeInstalled();
    await validatePnpmInstalled();
    spinner.succeed("All prerequisites are satisfied, let's start! 🚀\n");
  } catch {
    spinner.fail("Failed to check prerequisites.");
    process.exit(1);
  }
};
