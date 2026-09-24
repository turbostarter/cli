# TurboStarter CLI

Official CLI for creating and managing your TurboStarter projects.

## Quick start

Run without installing globally:

```bash
npx @turbostarter/cli@latest <command>
pnpm dlx @turbostarter/cli@latest <command>
yarn dlx @turbostarter/cli@latest <command>
bunx @turbostarter/cli@latest <command>
```

Or install globally and run:

```bash
npm install -g @turbostarter/cli
pnpm install -g @turbostarter/cli
yarn install -g @turbostarter/cli
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

Create a new TurboStarter project. The first prompt asks which kit to use:

```bash
npx @turbostarter/cli@latest new
```

Options:

- `-c, --cwd <cwd>`: Working directory where the new project folder is created (defaults to current directory).
- `-k, --kit <core|ai|edge>`: Select a kit without the first prompt.

What it does:

- **Core Kit:** Choose web, mobile, or extension apps and optionally configure its providers. Web is required.
- **AI Kit:** Choose web with optional mobile, then optionally configure the database, AI providers, tools, voice, and storage. Local Postgres is started and migrated when selected.
- **Edge Kit:** Create the single Cloudflare app with all its existing Wrangler bindings and a local D1 database. The CLI sets the project name and local environment values in `wrangler.jsonc`, and replaces template production resource IDs. Because AI and Flagship remain remote bindings, `pnpm dev` needs Cloudflare credentials and your own Flagship app ID.
- For every kit, the CLI clones its repository, prepares local environment files, installs dependencies, and points `upstream` at the selected kit.

### Managing existing project

Set of commands for managing your existing TurboStarter project.

### Updating project

Update an existing TurboStarter project with the latest upstream changes:

```bash
npx @turbostarter/cli@latest project update
```

Options:

- `-c, --cwd <cwd>`: Path to the TurboStarter project root (defaults to current directory).

What it does:

- Validates the target folder is a TurboStarter project root.
- Verifies the git working tree is clean before updating.
- Detects the kit and ensures `upstream` points to its corresponding repository (SSH or HTTPS).
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
