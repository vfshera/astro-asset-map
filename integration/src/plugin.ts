import path from "pathe";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { scanAssets, getDirectories } from "./scanner.js";
import { generateTypes } from "./generator.js";
import { buildRuntimeModule } from "./runtime.js";
import {
  VIRTUAL_MODULE_ID,
  RESOLVED_VIRTUAL_MODULE_ID,
  PLUGIN_NAME,
} from "./constants.js";
import type { AssetsVitePluginOptions } from "./types.js";

export function assetsMapVitePlugin(options: AssetsVitePluginOptions): Plugin {
  const { assetsDir, root, typesFileRef } = options;
  const globBase = path.relative(root, assetsDir);

  async function regenerateTypes(): Promise<void> {
    if (!typesFileRef.url) {
      // Config:done hasn't run yet (shouldn't happen for buildStart/dev
      // Watch events, but guard anyway rather than throwing).
      return;
    }

    const assets = await scanAssets(assetsDir);
    const directories = getDirectories(assets);
    const dts = generateTypes(assets, directories);
    const filePath = fileURLToPath(typesFileRef.url);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, dts, "utf-8");
  }

  return {
    name: `vite-${PLUGIN_NAME}`,

    async buildStart() {
      await regenerateTypes();
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID){ return RESOLVED_VIRTUAL_MODULE_ID;}
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return buildRuntimeModule(globBase);
      }
    },

    configureServer(server) {
      server.watcher.add(assetsDir);

      const handleFsEvent = async (changedPath: string) => {
        if (
          !path.normalize(changedPath).startsWith(path.normalize(assetsDir))
        ) {
          return;
        }

        await regenerateTypes();

        const mod = server.moduleGraph.getModuleById(
          RESOLVED_VIRTUAL_MODULE_ID,
        );

        if (mod) {
          server.moduleGraph.invalidateModule(mod);

          server.ws.send({ type: "full-reload" });
        }
      };

      server.watcher.on("add", handleFsEvent);
      server.watcher.on("unlink", handleFsEvent);
      server.watcher.on("addDir", handleFsEvent);
      server.watcher.on("unlinkDir", handleFsEvent);
    },
  };
}
