---
"create-dixt-bot": patch
---

Fix create-dixt-bot package build in release workflow

- Add build step for create-dixt-bot in release workflow to ensure dist/ folder is included in published package
- Add create-dixt-bot to fixed versioning alongside dixt and plugins
- Add build:create script for building create-dixt-bot
