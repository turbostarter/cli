import { execa } from "execa";
import ora from "ora";

import { validateDockerInstalled } from "~/commands/new/prerequisites";
import { servicesPackages } from "~/config";

import type { Service } from "~/config";

export const startServices = async (cwd: string, services: Service[]) => {
  await validateDockerInstalled();

  const spinner = ora(`Starting Docker services...`).start();

  try {
    await execa("pnpm", ["services:start", "--", ...services], { cwd });
    await execa(
      "pnpm",
      [
        "with-env",
        "pnpm",
        "turbo",
        "setup",
        services
          .map((service) => `--filter=${servicesPackages[service]}`)
          .join(" "),
      ],
      { cwd },
    );

    spinner.succeed("Services successfully started!");
  } catch (error) {
    console.error(error);
    spinner.fail("Failed to start services!");
    process.exit(1);
  }
};
