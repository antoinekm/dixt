# create-dixt-bot

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
