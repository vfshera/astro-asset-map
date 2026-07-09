import path from "pathe";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { assetsMapVitePlugin } from "./plugin.js";
import {
  ASSETS_DIR,
  PLUGIN_NAME,
  TYPES_FILE_NAME,
  VIRTUAL_MODULE_ID,
} from "./constants.js";
import { type TypesFileRef } from "./types.js";

export function assetMap(): AstroIntegration {
  const typesFileRef: TypesFileRef = {};

  return {
    name: PLUGIN_NAME,
    hooks: {
      "astro:config:setup": ({ config, updateConfig }) => {
        const root = fileURLToPath(config.root);
        const assetsDir = path.resolve(root, ASSETS_DIR);

        updateConfig({
          vite: {
            plugins: [assetsMapVitePlugin({ assetsDir, root, typesFileRef })],
          },
        });
      },

      "astro:config:done": ({ injectTypes }) => {
        typesFileRef.url = injectTypes({
          filename: TYPES_FILE_NAME,
          content: `declare module "${VIRTUAL_MODULE_ID}" {}\n`,
        });
      },
    },
  };
}
