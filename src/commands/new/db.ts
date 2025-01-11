import { execa } from "execa";
import ora from "ora";

import { validateDockerInstalled } from "~/commands/new/prerequisites";

export const startDatabase = async (cwd: string) => {
  await validateDockerInstalled();

  const spinner = ora(`Starting PostgreSQL database...`).start();

  try {
    await execa("pnpm", ["db:setup"], { cwd });

    spinner.succeed("Database successfully started!");
  } catch (error) {
    console.error(error);
    spinner.fail("Failed to start database!");
    process.exit(1);
  }
};
