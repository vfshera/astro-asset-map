# astro-asset-map

Generate a type-safe asset map for Astro.

`astro-asset-map` lets you reference files in `src/assets` without writing import statements while remaining fully compatible with `astro:assets`.

```astro
---
import { Image } from "astro:assets";
import { asset } from "astro-asset-map:runtime";
---

<Image
  src={asset("images/car.webp")}
  alt="Car"
/>
```

## Features

- 🖼️ Works seamlessly with `astro:assets`
- ⚡ No manual asset imports
- 🔒 Fully type-safe asset paths
- 🔍 Typed asset discovery
- 🚀 Zero configuration
- 📁 Uses the standard `src/assets` directory

---

## Installation

```bash
npm install astro-asset-map
```

```bash
pnpm add astro-asset-map
```

```bash
bun add astro-asset-map
```

---

## Setup

Add the integration to your Astro config.

```ts
import { defineConfig } from "astro/config";
import { assetMap } from "astro-asset-map";

export default defineConfig({
  integrations: [assetMap()],
});
```

---

## Usage

### Loading an asset

Instead of

```astro
---
import car from "../assets/images/car.webp";
---

<Image src={car} alt="Car" />
```

use

```astro
---
import { Image } from "astro:assets";
import { asset } from "astro-asset-map:runtime";
---

<Image
  src={asset("images/car.webp")}
  alt="Car"
/>
```

`asset()` returns a `Promise`, which Astro's `<Image>` accepts directly — no `await` needed.

---

## API

### `asset(path)`

Returns a `Promise` of the imported asset module. Astro's `<Image src>` accepts this directly — no `await` needed:

```ts
const logo = asset("images/logo.svg");
```

Or `await` it and access `.default` for a raw import:

```ts
const logo = (await asset("images/logo.svg")).default;
```

Since an `.svg` default import is an [Astro component](https://docs.astro.build/en/guides/images/#svg-components), you can render it directly:

```astro
---
import { asset } from "astro-asset-map:runtime";

const Favicon = (await asset("favicon.svg")).default;
---

<Favicon />
```

Unknown paths throw an error.

---

### Public assets

Files in the `public` directory can be referenced with a `public:` prefix. Unlike `src/assets` assets, public assets return a plain URL **string** — not a Promise.

```ts
asset("public:favicon.svg"); // "/favicon.svg" (string)
```

A public URL string also works with Astro's `<Image>` (it accepts URL strings for public assets):

```astro
<Image src={asset("public:favicon.svg")} alt="Icon" />
```

Unlike `src/assets` assets, public ones aren't imported or processed — they are a passthrough to `/` and are not validated against the filesystem at runtime. `exists()` and `list()` include public assets (`public:...` paths) alongside `src/assets`.

---

### `asset.exists(path)`

Checks whether an asset exists.

```ts
if (asset.exists("images/logo.svg")) {
  // ...
}
```

This also acts as a TypeScript type guard.

---

### `asset.list()`

Returns every asset path.

```ts
const assets = asset.list();
```

Example:

```ts
["images/car.webp", "images/logo.svg", "icons/menu.svg"];
```

---

### `asset.list(directory)`

Returns assets within a directory.

```ts
const images = asset.list("images");
```

Example:

```ts
["images/car.webp", "images/logo.svg"];
```

The directory argument is fully typed.

---

## Type Safety

Asset paths are generated automatically.

```ts
asset("images/logo.svg"); // ✅

asset("images/log.svg"); // ❌ TypeScript error
```

Directory names are also typed.

```ts
asset.list("images"); // ✅

asset.list("photos"); // ❌ TypeScript error
```

---

## How it works

During development and build, `astro-asset-map` scans `src/assets` and the `public` directory and generates a typed asset map.

At runtime, assets are resolved using a lightweight lookup generated from `import.meta.glob()`.

Whenever assets are added or removed, the generated types are updated automatically.

---

## Requirements

- Astro 6+
- Assets must live inside `src/assets` (or `public` via the `public:` prefix)

---

## Why?

Astro's asset pipeline is excellent, but importing every image can become repetitive.

```astro
import hero from "../assets/images/hero.webp";
import logo from "../assets/images/logo.svg";
import avatar from "../assets/images/avatar.png";
```

With `astro-asset-map`, assets can be referenced by path instead.

```ts
asset("images/hero.webp");
asset("images/logo.svg");
asset("images/avatar.png");
```

while retaining full type safety and compatibility with `astro:assets`.

---

## License

MIT
