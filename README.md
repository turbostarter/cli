# Turbostarter CLI

Your TurboStarter assistant for starting new projects, adding plugins and more.

## Installation

You can run commands using `npx`:

```
npx turbostarter <command>
```

This ensures that you always run the latest version of the CLI.

## Usage

Running the CLI without any arguments will display the general information about the CLI:

```
Usage: turbostarter [options] [command]

Your Turbo Assistant for starting new projects, adding plugins and more.

Options:
  -v, --version   display the version number
  -h, --help      display help for command

Commands:
  new             create a new TurboStarter project
  help [command]  display help for command
```

### Creating a new project

To create a new TurboStarter project, run the following command:

```
npx turbostarter new
```

The CLI will ask you a few questions about the project (e.g. name, supabase, billing etc.) and then create a new project in the working directory.

The command will also install all dependencies and run the project setup scripts.

## Documentation

Visit [https://turbostarter.dev/docs/web/cli](https://turbostarter.dev/docs/web/cli) to view the documentation.

## License

Licensed under the [GNU General Public License v3.0](https://github.com/turbostarter/cli/blob/main/LICENSE).
