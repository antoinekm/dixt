---
"dixt": patch
---

Fix plugin version checking error handling and type safety

- Improve error handling for npm outdated command
- Remove any type usage for better type safety
- Fix case where npm outdated returns exit code 1 when packages are outdated