---
"dixt-plugin-presence": minor
---

Add support for dynamic presence functions and fix options merging

- Add support for functions in presences array to enable dynamic content (e.g., counters, timestamps)
- Fix presence options merging to properly replace default presences instead of merging them
- Remove unused merge import and improve type safety