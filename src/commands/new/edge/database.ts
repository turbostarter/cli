import { execa } from "execa";
import ora from "ora";

export const prepareLocalD1 = async (cwd: string) => {
  const spinner = ora("Preparing local D1 database...").start();
  try {
    await execa("pnpm", ["db:setup"], { cwd });
    spinner.succeed("Local D1 database ready!");
  } catch (error) {
    spinner.fail("Failed to prepare local D1 database.");
    throw error;
  }
};
