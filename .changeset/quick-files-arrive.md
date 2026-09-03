---
"astro-asset-map": patch
---

The dev watcher now maintains an in-memory cache of scanned assets, updating it incrementally on add/unlink events instead of re-scanning the full tree on every filesystem change. Public-directory assets are indexed under their `public:`-prefixed keys consistently, so type generation handles both asset sources uniformly.
