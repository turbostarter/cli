import { execa } from "execa";
import ora from "ora";

import { setEnvironmentVariables } from "~/commands/new/config/env";
import { validateDockerInstalled } from "~/commands/new/prerequisites";
import { config } from "~/config";

const variables = [
  {
    variable: config.env.supabase.key,
    regex: /anon key:\s([^\s]+)/,
  },
  {
    variable: config.env.storage.s3.region,
    regex: /S3 Region:\s([^\s]+)/,
  },
  {
    variable: config.env.storage.s3.endpoint,
    regex: /S3 Storage URL:\s([^\s]+)/,
  },
  {
    variable: config.env.storage.s3.accessKeyId,
    regex: /S3 Access Key:\s([^\s]+)/,
  },
  {
    variable: config.env.storage.s3.secretAccessKey,
    regex: /S3 Secret Key:\s([^\s]+)/,
  },
];

const getVariablesFromOutput = (out: string) => {
  return variables.reduce((acc, variable) => {
    const match = variable.regex.exec(out);
    return match ? { ...acc, [variable.variable]: match[1] } : acc;
  }, {}) as Record<string, string>;
};

export const startSupabase = async (cwd: string) => {
  await validateDockerInstalled();

  const spinner = ora(`Starting Supabase...`).start();

  try {
    const out = await execa("pnpm", ["db:setup"], { cwd });
    const variables = getVariablesFromOutput(out.stdout);

    await setEnvironmentVariables(cwd, variables);

    spinner.succeed("Supabase successfully started!");
  } catch {
    spinner.fail("Failed to start Supabase!");
    process.exit(1);
  }
};
