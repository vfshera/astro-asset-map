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

The returned value is exactly what `Image` expects.

---

## API

### `asset(path)`

Returns the imported asset.

```ts
const logo = asset("images/logo.svg");
```

Unknown paths throw an error.

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

During development and build, `astro-asset-map` scans `src/assets` and generates a typed asset map.

At runtime, assets are resolved using a lightweight lookup generated from `import.meta.glob()`.

Whenever assets are added or removed, the generated types are updated automatically.

---

## Requirements

- Astro 6+
- Assets must live inside `src/assets`

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
