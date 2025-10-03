---
"dixt": minor
"dixt-plugin-react": patch
---

Add slash command system with auto-registration and built-in /help command

This release introduces a complete slash command system integrated into the plugin architecture:

**Core Features:**
- Plugins can now return slash commands that are automatically registered with Discord
- Commands are collected during plugin loading and deployed to Discord's API on startup
- Auto-execution: InteractionCreate events route to command handlers automatically
- Autocomplete support for command options
- Type-safe implementation with DixtSlashCommandBuilder

**Built-in Commands:**
- `/help` - List all available commands with autocomplete support
- `/help <command>` - Show detailed information about a specific command

**Developer Experience:**
- Commands are defined in plugins alongside their logic
- Clean separation with commands in `src/commands/` directory
- Comprehensive error handling with user-friendly ephemeral messages
- Full TypeScript support with proper types (no `any` usage)

**Example:**
Plugins can now easily add commands:
```typescript
return {
  name: "my-plugin",
  commands: [pingCommand] // Auto-registered & handled
};
```
