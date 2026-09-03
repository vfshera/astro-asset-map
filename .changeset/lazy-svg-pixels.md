---
"astro-asset-map": major
---

`asset()` now returns a `Promise<typeof import(...)>` instead of the default export directly. Astro's `<Image src>` accepts this natively — no `await` needed. For raw imports (including SVG rendered as an Astro component), access `.default` after awaiting: `(await asset("path")).default`. Public assets (`public:...`) continue to return a plain string URL.

Assets are now resolved lazily via a non-eager glob, so the underlying module isn't bundled until `asset()` is actually called. `exists()` and `list()` now include `public:`-prefixed paths alongside `src/assets`.
