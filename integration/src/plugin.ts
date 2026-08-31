import path from "pathe";
import {
  VIRTUAL_MODULE_ID,
  RESOLVED_VIRTUAL_MODULE_ID,
  PLUGIN_NAME,
  WATCH_DEBOUNCE_MS,
  VALID_ASSET_EXT_REGEX,
  PUBLIC_ASSET_PREFIX,
} from "./constants.js";
import { generateTypes } from "./generator.js";
import { buildRuntimeModule } from "./runtime.js";
import { scanAssets, getDirectories } from "./scanner.js";
import { debounce } from "./utils.js";
import type { AssetsVitePluginOptions } from "./types.js";
import type { Plugin } from "vite";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function assetsMapVitePlugin(options: AssetsVitePluginOptions): Plugin {
  const { assetsDir, publicDir, root, typesFileRef } = options;
  const globBase = path.relative(root, assetsDir);

  async function regenerateTypes(): Promise<void> {
    if (!typesFileRef.url) {
      return;
    }

    const assets = await scanAssets(assetsDir);
    const publicAssets = await scanAssets(publicDir);
    const directories = getDirectories(assets);

    const dts = generateTypes(
      [...assets, ...publicAssets.map((a) => ({ ...a, path: `${PUBLIC_ASSET_PREFIX}${a.path}` }))],
      directories,
    );

    const filePath = fileURLToPath(typesFileRef.url);

    try {
      const existing = await fs.readFile(filePath, "utf-8");
      if (existing === dts) {
        return;
      }
    } catch {
      // File doesn't exist yet — proceed to write
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, dts, "utf-8");
  }

  return {
    name: PLUGIN_NAME,

    async buildStart() {
      await regenerateTypes();
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }

      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return buildRuntimeModule(globBase);
      }

      return null;
    },

    configureServer(server) {
      server.watcher.add(assetsDir);

      const handleFsEvent = debounce(async () => {
        await regenerateTypes();

        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);

        if (mod) {
          server.moduleGraph.invalidateModule(mod);

          server.ws.send({ type: "full-reload" });
        }
      }, WATCH_DEBOUNCE_MS);

      const onEvent = (changedPath: string) => {
        const changed = path.normalize(changedPath);

        const isInAssetsDir = changed.startsWith(path.normalize(assetsDir));
        const isInPublicDir = changed.startsWith(path.normalize(publicDir));

        if (VALID_ASSET_EXT_REGEX.test(changed) && (isInAssetsDir || isInPublicDir)) {
          handleFsEvent();
        }
      };

      server.watcher.on("add", onEvent);
      server.watcher.on("unlink", onEvent);
    },
  };
}
