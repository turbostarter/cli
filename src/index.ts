#!/usr/bin/env node
import { Command } from "commander";

import { newCommand } from "~/commands/new";
import { getPackageInfo } from "~/utils";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

function main() {
  const packageInfo = getPackageInfo();

  const program = new Command()
    .name("turbostarter")
    .description(
      "Your Turbo Assistant for starting new projects, adding plugins and more.",
    )
    .version(
      packageInfo.version ?? "1.0.0",
      "-v, --version",
      "display the version number",
    );

  program.addCommand(newCommand);
  program.parse();
}

void main();
