import path from "pathe";
import {
  VIRTUAL_MODULE_ID,
  RESOLVED_VIRTUAL_MODULE_ID,
  PLUGIN_NAME,
  WATCH_DEBOUNCE_MS,
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
  console.log("plugin created");

  const { assetsDir, root, typesFileRef } = options;
  const globBase = path.relative(root, assetsDir);

  async function regenerateTypes(): Promise<void> {
    if (!typesFileRef.url) {
      return;
    }

    const assets = await scanAssets(assetsDir);
    const directories = getDirectories(assets);
    const dts = generateTypes(assets, directories);
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
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return buildRuntimeModule(globBase);
      }
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
        if (!path.normalize(changedPath).startsWith(path.normalize(assetsDir))) {
          return;
        }

        handleFsEvent();
      };

      server.watcher.on("add", onEvent);
      server.watcher.on("unlink", onEvent);
      server.watcher.on("addDir", onEvent);
      server.watcher.on("unlinkDir", onEvent);
    },
  };
}
