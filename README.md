# TurboStarter CLI

Official CLI for creating and managing your TurboStarter projects.

## Quick start

Run without installing globally:

```bash
npx @turbostarter/cli@latest <command>
pnpm dlx @turbostarter/cli@latest <command>
bunx @turbostarter/cli@latest <command>
```

Or install globally and run:

```bash
npm install -g @turbostarter/cli
pnpm install -g @turbostarter/cli
bunx install -g @turbostarter/cli

turbostarter <command>
```

> [!NOTE]
> Commands that interact with the TurboStarter repository (updating, plugins, etc.) must be launched from the root of the repository, as they will read and write files from the codebase.

## Usage

```bash
Usage: turbostarter [options] [command]

Your TurboStarter assistant for starting new projects, adding plugins and more.

Options:
  -v, --version   display the version number
  -h, --help      display help for command

Commands:
  new             create a new TurboStarter project
  project         manage your TurboStarter project
  help [command]  display help for command
```

Running `turbostarter --help` shows the full command list.

### Creating new project

Create a new TurboStarter project:

```bash
npx turbostarter@latest new
```

Options:

- `-c, --cwd <cwd>`: Working directory where the new project folder is created (defaults to current directory).

What it does:

- Prompts for project name and app targets (web, mobile, extension).
- Optionally walks through provider configuration (db, billing, email, storage, analytics, monitoring).
- Clones the TurboStarter template repository.
- Configures git remotes.
- Applies app-specific file modifications.
- Installs dependencies and formats files.
- Starts required local services when needed.

### Managing existing project

Set of commands for managing your existing TurboStarter project.

### Updating project

Update an existing TurboStarter project with the latest upstream changes:

```bash
npx turbostarter@latest project update
```

Options:

- `-c, --cwd <cwd>`: Path to the TurboStarter project root (defaults to current directory).

What it does:

- Validates the target folder is a TurboStarter project root.
- Verifies the git working tree is clean before updating.
- Ensures `upstream` remote points to `turbostarter/core` (SSH or HTTPS).
- Fetches upstream and merges `upstream/main` into the current branch.
- Prints conflicting files with next steps if merge conflicts occur.

## Development

From this repository:

```bash
pnpm install
pnpm dev
```

Useful scripts:

| Script                     | Description           |
| -------------------------- | --------------------- |
| `pnpm build`               | Build CLI to `dist/`  |
| `pnpm start`               | Run built CLI         |
| `pnpm typecheck`           | Run TypeScript checks |
| `pnpm lint`                | Run ESLint            |
| `pnpm format`/`format:fix` | Check/fix formatting  |

## Documentation

Visit [https://turbostarter.dev/docs/web/cli](https://turbostarter.dev/docs/web/cli) to view the documentation.

## License

Licensed under the [GNU General Public License v3.0](./LICENSE).
