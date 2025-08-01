# dixt

## 3.0.0

### Minor Changes

- f499068: Add automatic plugin discovery system

  - Plugins are now automatically discovered from package.json dependencies
  - Added `autoDiscoverPlugins` option (defaults to true)
  - Added `pluginOptionsPath` option to customize options directory (defaults to "options" with fallback to "src/options")
  - Simplified plugin setup - no more manual imports needed
  - Backwards compatible with existing plugin configurations

## 2.2.1

### Patch Changes

- 1969509: Fix plugin version checking error handling and type safety

  - Improve error handling for npm outdated command
  - Remove any type usage for better type safety
  - Fix case where npm outdated returns exit code 1 when packages are outdated

## 2.2.0

### Minor Changes

- 1776fc2: Add automatic plugin version checking at startup

  - Check for outdated dixt plugins using npm outdated
  - Display warnings for plugins that have updates available
  - Suggest running npm update when outdated plugins are detected

## 2.1.11

### Patch Changes

- 1c819f9: Fix use of dixtplugin type generic

## 2.1.10

### Patch Changes

- 305d892: Add ability for plugins to be async

## 2.1.9

### Patch Changes

- b778b55: Add anti process exit

## 2.1.8

### Patch Changes

- 3cdb21f: Remove commands support until it isnt ready

## 2.1.7

### Patch Changes

- c91ac30: Add discord utils

## 2.1.6

### Patch Changes

- 752a395: Update DixtPluginOptions types

## 2.1.5

### Patch Changes

- 23a9b0f: Remove command support

## 2.1.4

### Patch Changes

- 81266e6: Add isString and isNumber utils

## 2.1.3

### Patch Changes

- 94fed6d: Add a better merge for options
  Improve and fix worktime
  Add worktime reminders
  Add worktime auto end

## 2.1.2

### Patch Changes

- 9d7d1bb: Add capitalize utils to dixt

## 2.1.1

### Patch Changes

- f95992f: Improve worktime end and messages customization

## 2.1.0

### Minor Changes

- 5f63963: Add Twitch Plugin
  Add Worktime Plugin (under construction)
  Update Join config
- c1f14d4: Add react plugin and improve errors message

## 2.0.1

### Patch Changes

- b005c68: Add join plugin

## 2.0.0

### Major Changes

- 13de855: Improve dixt with intents, plugins, async and better logs format

## 1.0.0

### Major Changes

- 3b2f267: Add basics
- 07d435a: Add plugin support and first logs plugin
