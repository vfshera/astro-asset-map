# astro-asset-map

## 0.1.1

### Patch Changes

- [#20](https://github.com/vfshera/astro-asset-map/pull/20) [`cc061e1`](https://github.com/vfshera/astro-asset-map/commit/cc061e142ecacba0522c187a3d24e1d2a3f05836) Thanks [@vfshera](https://github.com/vfshera)! - Disable source map generation during publish

## 0.1.0

### Minor Changes

- [#16](https://github.com/vfshera/astro-asset-map/pull/16) [`7c557be`](https://github.com/vfshera/astro-asset-map/commit/7c557be2dc692c91fc0479de33d8fcfe6280acd0) Thanks [@vfshera](https://github.com/vfshera)! - feat: implement core asset map integration

  - `assetMap()` Astro integration with Vite plugin + ambient type injection
  - Virtual module `astro-asset-map:runtime` backed by `import.meta.glob`
  - Asset scanner via `tinyglobby` for supported image formats in `src/assets`
  - Dev watcher with debounced type regeneration on file add/remove
  - Generated types: `AssetMap`, `AssetPath`, `AssetDirectory`, `AssetFn`
  - Subpath export `astro-asset-map/utils` with `createUnknownAssetError()` (fuzzy path suggestions via Levenshtein) and `debounce()`
