---
"dixt": minor
"create-dixt-bot": patch
---

Add dixt CLI with Next.js-style commands

- New commands: `dixt dev`, `dixt build`, `dixt start`
- Auto-detects TypeScript vs JavaScript projects
- CLI integrated directly in dixt package (no separate dependency needed)
- Uses chokidar for file watching and tsx loader for TypeScript execution
- Clean output without implementation details (no [tsx] messages)
- Graceful shutdown handling
- Updated create-dixt-bot to generate projects with dixt CLI commands
- Updated workshop to use new CLI commands
