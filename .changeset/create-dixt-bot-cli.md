---
"create-dixt-bot": major
---

Add create-dixt-bot CLI tool for scaffolding new dixt bots

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
