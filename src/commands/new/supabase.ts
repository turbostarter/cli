import { execa } from "execa";
import ora from "ora";

import { setEnvironmentVariable } from "~/commands/new/config/env";
import { validateDockerInstalled } from "~/commands/new/prerequisites";
import { config } from "~/config";

const getSupabaseKey = (out: string) => {
  return /anon key:\s([^\s]+)/.exec(out)?.[1];
};

export const startSupabase = async (cwd: string) => {
  await validateDockerInstalled();

  const spinner = ora(`Starting Supabase...`).start();

  try {
    const out = await execa("pnpm", ["db:setup"], { cwd });
    const key = getSupabaseKey(out.stdout);

    if (key) {
      await setEnvironmentVariable(cwd, config.env.supabase.key, key);
    }

    spinner.succeed("Supabase successfully started!");
  } catch {
    spinner.fail("Failed to start Supabase!");
    process.exit(1);
  }
};
