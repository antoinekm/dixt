---
"create-dixt-bot": patch
---

Fix tsx dependency for TypeScript projects

- Add tsx to devDependencies in generated TypeScript projects
- Fix tsx loader path to use project's node_modules instead of dixt's
