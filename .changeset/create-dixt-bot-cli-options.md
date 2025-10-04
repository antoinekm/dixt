---
"create-dixt-bot": patch
"dixt": patch
---

Improve create-dixt-bot CLI

- Add CLI options for non-interactive usage (`--typescript`, `--pm`, `--plugins`, `--no-example`, `--skip-install`)
- Fetch latest package versions from npm registry instead of hardcoding
- Fix template file paths (add `.template` extension)
- Fix typo in success message output
- Add better error handling with try/catch
- Support non-TTY environments
- Update README with `@latest` installation instructions
