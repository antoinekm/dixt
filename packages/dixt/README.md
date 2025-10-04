# dixt

🔌 Plugin. Command. Done.

> A modern Discord bot framework built with Discord.js, featuring a powerful plugin-based architecture and automatic slash command registration.

[![npm version](https://badge.fury.io/js/dixt.svg)](https://www.npmjs.com/package/dixt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔌 **Plugin System** - Modular architecture with automatic plugin discovery
- ⚡ **Slash Commands** - Built-in slash command system with auto-registration
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive types
- 🗄️ **Database Ready** - Optional MongoDB integration via Mongoose
- 🔄 **Auto-Discovery** - Automatically discovers and loads plugins from dependencies
- 📦 **Monorepo** - Managed with pnpm workspaces and Turbo for optimal DX

## Quick Start

### Create a new bot with CLI (Recommended)

The fastest way to get started:

```bash
npx create-dixt-bot@latest my-bot
# or
pnpm create dixt-bot@latest my-bot
# or
yarn create dixt-bot@latest my-bot
```

The CLI will guide you through:
- ✅ TypeScript setup
- ✅ Plugin selection
- ✅ Example plugin creation
- ✅ Package manager choice
- ✅ Auto-install dependencies

### Manual Installation

```bash
npm install dixt@latest discord.js
# or
pnpm add dixt@latest discord.js
# or
yarn add dixt@latest discord.js
```

### Basic Usage

```typescript
import dixt from "dixt";

const bot = new dixt({
  application: {
    id: "YOUR_APPLICATION_ID",
    name: "My Bot",
    bot: {
      token: "YOUR_BOT_TOKEN",
    },
  },
});

await bot.start();
```

### Environment Variables

Create a `.env` file:

```env
DIXT_APPLICATION_ID=your_application_id
DIXT_APPLICATION_NAME=My Bot
DIXT_BOT_TOKEN=your_bot_token
DIXT_DATABASE_URI=mongodb://localhost:27017/mybot  # Optional
```

## CLI Commands

Dixt includes a built-in CLI for managing your bot development workflow:

### Development

```bash
dixt dev
```

- Auto-detects TypeScript or JavaScript projects
- Watches for file changes and auto-restarts
- Uses tsx for TypeScript execution (no build needed)

### Build

```bash
dixt build
```

- Compiles TypeScript to JavaScript (skips for JS projects)
- Uses your project's `tsconfig.json`

### Production

```bash
dixt start
```

- Runs the compiled production build
- For TypeScript: runs `dist/index.js`
- For JavaScript: runs `src/index.js`

These commands are automatically added to your `package.json` when using `create-dixt-bot`.

## Plugin System

### Using Plugins

Install plugins as dependencies:

```bash
pnpm add dixt-plugin-logs dixt-plugin-roles
```

Plugins are **automatically discovered** from your `package.json` dependencies matching the `dixt-plugin-*` pattern.

### Creating a Plugin

Create a local plugin in your project:

```typescript
// plugins/my-plugin.ts
import { Events } from "discord.js";
import { DixtPlugin } from "dixt";

const myPlugin: DixtPlugin = (instance, options) => {
  instance.client.on(Events.ClientReady, () => {
    console.log("My plugin loaded!");
  });

  return {
    name: "my-plugin",
  };
};

export default myPlugin;
```

Then register it manually:

```typescript
import dixt from "dixt";
import myPlugin from "./plugins/my-plugin";

const bot = new dixt({
  plugins: [myPlugin],
  autoDiscoverPlugins: true, // Still loads dixt-plugin-* from npm
});
```

**Publishing to npm:** Name your package `dixt-plugin-*` and it will be **automatically discovered** from dependencies!

### Plugin with Options

Create an options file in `options/my-plugin.ts`:

```typescript
export default {
  channel: "123456789",
  enabled: true,
};
```

## Slash Commands

### Adding Commands to Plugins

Plugins can return slash commands that are automatically registered:

```typescript
import { SlashCommandBuilder } from "discord.js";
import { DixtPlugin, DixtSlashCommandBuilder } from "dixt";

const myPlugin: DixtPlugin = (instance) => {
  const pingCommand: DixtSlashCommandBuilder = {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!"),
    execute: async (interaction) => {
      await interaction.reply("Pong!");
    },
  };

  return {
    name: "my-plugin",
    commands: [pingCommand],
  };
};
```

### Built-in Commands

- `/help` - List all available commands or get info about a specific command

### Command with Autocomplete

```typescript
const exampleCommand: DixtSlashCommandBuilder = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("Example command")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("Pick an option")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  execute: async (interaction) => {
    const choice = interaction.options.getString("choice");
    await interaction.reply(`You chose: ${choice}`);
  },
  autocomplete: async (interaction) => {
    const focusedValue = interaction.options.getFocused();
    const choices = ["option1", "option2", "option3"];
    const filtered = choices.filter(choice =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice }))
    );
  },
};
```

## Available Plugins

Official plugins maintained by the dixt team:

- **dixt-plugin-affix** - Add prefix/suffix to member nicknames based on roles
- **dixt-plugin-join** - Welcome messages for new members
- **dixt-plugin-logs** - Comprehensive server logging
- **dixt-plugin-presence** - Custom bot presence/status
- **dixt-plugin-react** - Auto-react to messages in specific channels
- **dixt-plugin-reports** - User reporting system
- **dixt-plugin-roles** - Self-assignable roles with reaction buttons
- **dixt-plugin-twitch** - Twitch stream notifications
- **dixt-plugin-worktime** - Track voice channel work time

## Development

### Project Structure

```
dixt/
├── packages/
│   ├── dixt/                    # Core framework
│   ├── dixt-plugin-*/          # Official plugins
│   └── dixt-plugin-template/   # Plugin template
├── workshop/                    # Development workspace
└── docs/                        # Documentation site
```

### Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build core only
pnpm build:core

# Build all plugins
pnpm build:plugins

# Development mode
pnpm dev

# Lint & fix
pnpm lint:fix

# Testing workspace
cd workshop && pnpm dev
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

### Release Process

This project uses [Changesets](https://github.com/changesets/changesets). When contributing, create a changeset to describe your changes:

```bash
pnpm changeset
```

Versioning and publishing are handled automatically via CI.

## License

MIT © [Antoine Kingue](https://github.com/antoinekm)

## Links

- [Documentation](https://dixt.vercel.app)
- [NPM Package](https://www.npmjs.com/package/dixt)
- [GitHub Repository](https://github.com/antoinekm/dixt)
- [Discord Community](https://discord.com/invite/n7vQFX2Vnn)
- [Issues](https://github.com/antoinekm/dixt/issues)

---

Built with ❤️ using [Discord.js](https://discord.js.org)
