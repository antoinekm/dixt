# create-dixt-bot

## 5.0.4

### Patch Changes

- 00a2597: Fix tsx dependency for TypeScript projects

  - Add tsx to devDependencies in generated TypeScript projects
  - Fix tsx loader path to use project's node_modules instead of dixt's

## 5.0.3

### Patch Changes

- 1ab594d: Add interactive Discord credentials setup

  - Interactive prompts for Discord Application ID and Bot Token with step-by-step guide
  - Automatically create .env file with credentials
  - Add `--skip-env` flag to skip credentials setup
  - Add detailed Discord setup instructions in generated README

## 5.0.2

### Patch Changes

- 9a132df: Improve create-dixt-bot CLI

  - Add CLI options for non-interactive usage (`--typescript`, `--pm`, `--plugins`, `--no-example`, `--skip-install`)
  - Fetch latest package versions from npm registry instead of hardcoding
  - Fix template file paths (add `.template` extension)
  - Fix typo in success message output
  - Add better error handling with try/catch
  - Support non-TTY environments
  - Update README with `@latest` installation instructions

## 5.0.1

### Patch Changes

- 85beb0f: Fix create-dixt-bot package build in release workflow

  - Add build step for create-dixt-bot in release workflow to ensure dist/ folder is included in published package
  - Add create-dixt-bot to fixed versioning alongside dixt and plugins
  - Add build:create script for building create-dixt-bot

## 5.0.0

### Major Changes

- d6b4bbf: Add create-dixt-bot CLI tool for scaffolding new dixt bots

  **New Package: create-dixt-bot**

  A powerful CLI tool to quickly scaffold new dixt Discord bot projects with an interactive setup wizard.

  **Features:**

  - 🎨 Interactive prompts with `@clack/prompts`
  - ✅ TypeScript or JavaScript project setup
  - 🔌 Plugin selection from official dixt plugins
  - 📝 Generates example custom plugin
  - 📦 Support for pnpm, npm, and yarn
  - 🚀 Auto-installs dependencies
  - 📄 Creates ready-to-use project structure

  **Usage:**

  ```bash
  npx create-dixt-bot my-bot
  pnpm create dixt-bot my-bot
  yarn create dixt-bot my-bot
  ```

  **Generated Project Includes:**

  - Pre-configured package.json
  - TypeScript config (if selected)
  - .env.example with all required variables
  - .gitignore
  - Example plugin with slash command
  - README with setup instructions

### Patch Changes

- 4c0ac91: Add dixt CLI with Next.js-style commands

  - New commands: `dixt dev`, `dixt build`, `dixt start`
  - Auto-detects TypeScript vs JavaScript projects
  - CLI integrated directly in dixt package (no separate dependency needed)
  - Uses chokidar for file watching and tsx loader for TypeScript execution
  - Clean output without implementation details (no [tsx] messages)
  - Graceful shutdown handling
  - Updated create-dixt-bot to generate projects with dixt CLI commands
  - Updated workshop to use new CLI commands
