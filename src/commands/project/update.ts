import { Command } from "commander";
import { execa } from "execa";
import { promises } from "fs";
import ora from "ora";
import path from "path";
import color from "picocolors";
import { z } from "zod";

import { config } from "~/config";
import {
  getUpstreamRemoteUrl,
  hasSshAccess,
  httpsUrl,
  isUpstreamUrlValid,
  logger,
  setUpstreamRemote,
  sshUrl,
  getErrorOutput,
  isGitClean,
} from "~/utils";

const projectUpdateOptionsSchema = z.object({
  cwd: z.string(),
});

type ProjectUpdateResult =
  | {
      success: true;
      alreadyUpToDate: boolean;
    }
  | {
      success: false;
      hasConflicts: true;
      conflicts: string[];
    }
  | {
      success: false;
      reason: string;
    };

export const projectUpdateCommand = new Command()
  .name("update")
  .description(
    "pull the latest changes from the upstream TurboStarter repository",
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. Defaults to the current directory.",
    process.cwd(),
  )
  .action(async (opts: z.infer<typeof projectUpdateOptionsSchema>) => {
    const spinner = ora("Pulling latest changes from upstream...").start();

    try {
      const options = projectUpdateOptionsSchema.parse({
        cwd: opts.cwd,
      });
      const result = await updateProject({ cwd: options.cwd });

      if (result.success) {
        if (result.alreadyUpToDate) {
          spinner.succeed("Already up to date.");
        } else {
          spinner.succeed(
            `Successfully pulled latest changes from ${color.cyan(config.repository)}.`,
          );
        }
        return;
      }

      if ("hasConflicts" in result) {
        spinner.fail("Merge conflicts detected.");
        logger.warn(`\n${result.conflicts.length} conflicting file(s):`);
        result.conflicts.forEach((conflictPath) => {
          logger.log(`  - ${conflictPath}`);
        });
        logger.warn("\nPlease resolve them manually:");
        logger.log("  1. Fix the conflicting files");
        logger.log(`  2. Run: ${color.bold("git add .")}`);
        logger.log(`  3. Run: ${color.bold("git commit")}`);
      } else {
        spinner.fail("Failed to pull from upstream.");
        logger.error(`\n${result.reason}`);
      }

      process.exit(1);
    } catch (error) {
      spinner.fail("Failed to pull from upstream.");
      logger.error(getErrorOutput(error));
      process.exit(1);
    }
  });

const updateProject = async ({
  cwd,
}: z.infer<
  typeof projectUpdateOptionsSchema
>): Promise<ProjectUpdateResult> => {
  const projectValidation = await isWithinTurboStarterProject(cwd);

  if (!projectValidation.valid) {
    return {
      success: false,
      reason: projectValidation.reason,
    };
  }

  const gitClean = await isGitClean({ cwd });

  if (!gitClean) {
    return {
      success: false,
      reason:
        "Git working directory has uncommitted changes. Please commit or stash them before pulling upstream updates.",
    };
  }

  let currentUpstreamUrl = await getUpstreamRemoteUrl({ cwd });

  if (!currentUpstreamUrl) {
    const useSsh = await hasSshAccess();
    const url = useSsh
      ? sshUrl(config.repository)
      : httpsUrl(config.repository);
    await setUpstreamRemote(url, { cwd });
    currentUpstreamUrl = url;
  } else if (!isUpstreamUrlValid(currentUpstreamUrl, config.repository)) {
    const useSsh = currentUpstreamUrl.startsWith("git@");
    const expectedUrl = useSsh
      ? sshUrl(config.repository)
      : httpsUrl(config.repository);

    return {
      success: false,
      reason:
        `Upstream remote points to "${currentUpstreamUrl}" but expected "${expectedUrl}". ` +
        "Please run: git remote set-url upstream <correct-url>",
    };
  }

  await execa("git", ["fetch", "upstream"], { cwd });

  try {
    const { stdout } = await execa(
      "git",
      ["merge", "upstream/main", "--no-edit"],
      {
        cwd,
      },
    );

    return {
      success: true,
      alreadyUpToDate: stdout.includes("Already up to date"),
    };
  } catch (error) {
    const output = getErrorOutput(error);
    const hasMergeConflicts =
      output.includes("CONFLICT") || output.includes("Automatic merge failed");

    if (!hasMergeConflicts) {
      return {
        success: false,
        reason: `Merge failed: ${output}`,
      };
    }

    const { stdout } = await execa(
      "git",
      ["diff", "--name-only", "--diff-filter=U"],
      {
        cwd,
      },
    );
    const conflicts = stdout
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      success: false,
      hasConflicts: true,
      conflicts,
    };
  }
};

const isWithinTurboStarterProject = async (
  cwd: string,
): Promise<{ valid: true } | { valid: false; reason: string }> => {
  const normalizedCwd = path.resolve(cwd);
  const requiredMarkers = [
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json",
    "apps/web/package.json",
    "packages/api/package.json",
  ];

  const missingMarkers = (
    await Promise.all(
      requiredMarkers.map(async (marker) => {
        try {
          await promises.access(path.join(normalizedCwd, marker));
          return undefined;
        } catch {
          return marker;
        }
      }),
    )
  ).filter(Boolean);

  if (missingMarkers.length > 0) {
    return {
      valid: false,
      reason:
        "This does not appear to be a TurboStarter project root. " +
        "Please run this command from your project root (or pass --cwd).",
    };
  }

  return { valid: true };
};
