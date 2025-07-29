---
"dixt": minor
---

Add automatic plugin version checking at startup

- Check for outdated dixt plugins using npm outdated
- Display warnings for plugins that have updates available
- Suggest running npm update when outdated plugins are detected