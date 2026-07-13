---
"astro-asset-map": minor
---

feat: implement core asset map integration

- `assetMap()` Astro integration with Vite plugin + ambient type injection
- Virtual module `astro-asset-map:runtime` backed by `import.meta.glob`
- Asset scanner via `tinyglobby` for supported image formats in `src/assets`
- Dev watcher with debounced type regeneration on file add/remove
- Generated types: `AssetMap`, `AssetPath`, `AssetDirectory`, `AssetFn`
- Subpath export `astro-asset-map/utils` with `createUnknownAssetError()` (fuzzy path suggestions via Levenshtein) and `debounce()`
