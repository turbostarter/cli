import { Command } from "commander";

import { projectUpdateCommand } from "~/commands/project/update";

export const projectCommand = new Command()
  .name("project")
  .description("manage your TurboStarter project")
  .addCommand(projectUpdateCommand);
