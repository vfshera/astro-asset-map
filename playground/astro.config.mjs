// @ts-check
import { defineConfig } from "astro/config";
import { assetMap } from "astro-asset-map";

// https://astro.build/config
export default defineConfig({
  integrations: [assetMap()],
});
