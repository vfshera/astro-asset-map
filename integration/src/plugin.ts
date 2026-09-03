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
import type { AssetsVitePluginOptions, ScannedAsset } from "./types.js";
import type { Plugin } from "vite";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function assetsMapVitePlugin(options: AssetsVitePluginOptions): Plugin {
  const { assetsDir, publicDir, root, typesFileRef } = options;
  const globBase = path.relative(root, assetsDir);

  let cache: Map<string, ScannedAsset> | null = null;

  async function writeTypes(): Promise<void> {
    if (!typesFileRef.url || !cache) {
      return;
    }

    const all = [...cache.values()];
    const assets = all.filter((a) => !a.path.startsWith(PUBLIC_ASSET_PREFIX));
    const directories = [...getDirectories(assets), PUBLIC_ASSET_PREFIX];

    const dts = generateTypes(all, directories);

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

  async function initCache(): Promise<void> {
    const [assets, publicAssets] = await Promise.all([
      scanAssets(assetsDir),
      scanAssets(publicDir),
    ]);

    cache = new Map();
    for (const a of assets) {
      cache.set(a.path, a);
    }

    for (const a of publicAssets) {
      const key = `${PUBLIC_ASSET_PREFIX}${a.path}`;
      cache.set(key, { ...a, path: key });
    }

    await writeTypes();
  }

  return {
    name: PLUGIN_NAME,

    async buildStart() {
      await initCache();
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }

      return null;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const publicAssets = cache
          ? [...cache.keys()].filter((k) => k.startsWith(PUBLIC_ASSET_PREFIX))
          : [];

        return buildRuntimeModule(globBase, publicAssets);
      }

      return null;
    },

    configureServer(server) {
      server.watcher.add(assetsDir);

      const handleFsEvent = debounce(async () => {
        await writeTypes();

        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      }, WATCH_DEBOUNCE_MS);

      const onEvent = (changedPath: string, kind: "add" | "unlink") => {
        if (!cache) {
          // BuildStart hasn't finished yet; its scan will cover this
          return;
        }

        const changed = path.normalize(changedPath);
        const isInAssetsDir = changed.startsWith(path.normalize(assetsDir));
        const isInPublicDir = changed.startsWith(path.normalize(publicDir));

        if (!VALID_ASSET_EXT_REGEX.test(changed)) {
          return;
        }

        if (!isInAssetsDir && !isInPublicDir) {
          return;
        }

        const dir = isInAssetsDir ? assetsDir : publicDir;
        const relPath = path.normalize(path.relative(dir, changed));
        const key = isInAssetsDir ? relPath : `${PUBLIC_ASSET_PREFIX}${relPath}`;

        if (kind === "add") {
          cache.set(key, { path: key, absolute: changed });
        } else {
          cache.delete(key);
        }

        handleFsEvent();
      };

      server.watcher.on("add", (p) => onEvent(p, "add"));
      server.watcher.on("unlink", (p) => onEvent(p, "unlink"));
    },
  };
}
