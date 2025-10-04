# dixt-plugin-react

## 5.0.6

### Patch Changes

- dixt@5.0.6

## 5.0.5

### Patch Changes

- dixt@5.0.5

## 5.0.4

### Patch Changes

- dixt@5.0.4

## 5.0.3

### Patch Changes

- dixt@5.0.3

## 5.0.2

### Patch Changes

- Updated dependencies [9a132df]
  - dixt@5.0.2

## 5.0.1

### Patch Changes

- dixt@5.0.1

## 5.0.0

### Patch Changes

- Updated dependencies [4c0ac91]
  - dixt@5.0.0

## 4.0.0

### Patch Changes

- 2868406: Add slash command system with auto-registration and built-in /help command

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
    commands: [pingCommand], // Auto-registered & handled
  };
  ```

- Updated dependencies [2868406]
  - dixt@4.0.0

## 3.0.0

### Patch Changes

- Updated dependencies [f499068]
  - dixt@3.0.0

## 2.1.13

### Patch Changes

- Updated dependencies [1969509]
  - dixt@2.2.1

## 2.1.12

### Patch Changes

- f8d5604: Move core to peer dependencies

## 2.1.11

### Patch Changes

- Updated dependencies [305d892]
  - dixt@2.1.10

## 2.1.10

### Patch Changes

- 844af5a: Fix match case

## 2.1.9

### Patch Changes

- Updated dependencies [b778b55]
  - dixt@2.1.9

## 2.1.8

### Patch Changes

- Updated dependencies [3cdb21f]
  - dixt@2.1.8

## 2.1.7

### Patch Changes

- Updated dependencies [c91ac30]
  - dixt@2.1.7

## 2.1.6

### Patch Changes

- Updated dependencies [752a395]
  - dixt@2.1.6

## 2.1.5

### Patch Changes

- Updated dependencies [23a9b0f]
  - dixt@2.1.5

## 2.1.4

### Patch Changes

- Updated dependencies [81266e6]
  - dixt@2.1.4

## 2.1.3

### Patch Changes

- 94fed6d: Add a better merge for options
  Improve and fix worktime
  Add worktime reminders
  Add worktime auto end
- Updated dependencies [94fed6d]
  - dixt@2.1.3

## 2.1.2

### Patch Changes

- Updated dependencies [9d7d1bb]
  - dixt@2.1.2

## 2.1.1

### Patch Changes

- Updated dependencies [f95992f]
  - dixt@2.1.1

## 2.1.0

### Minor Changes

- 5f63963: Add Twitch Plugin
  Add Worktime Plugin (under construction)
  Update Join config
- c1f14d4: Add react plugin and improve errors message

### Patch Changes

- Updated dependencies [5f63963]
- Updated dependencies [c1f14d4]
  - dixt@2.1.0
