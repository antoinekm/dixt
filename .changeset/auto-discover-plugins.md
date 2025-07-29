---
"dixt": minor
---

Add automatic plugin discovery system

- Plugins are now automatically discovered from package.json dependencies
- Added `autoDiscoverPlugins` option (defaults to true)
- Added `pluginOptionsPath` option to customize options directory (defaults to "options" with fallback to "src/options")
- Simplified plugin setup - no more manual imports needed
- Backwards compatible with existing plugin configurations