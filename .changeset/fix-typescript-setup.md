---
"create-dixt-bot": patch
---

Fix TypeScript project setup and improve UX

- Fix top-level await issue by wrapping bot.start() in IIFE
- Add tsx to devDependencies for TypeScript projects
- Remove ESM type from package.json for CommonJS compatibility
- Update Discord setup guide to include all 3 Privileged Gateway Intents (Presence, Server Members, Message Content)
- Simplify bot invitation with direct link in next steps instead of separate note
