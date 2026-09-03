import { PACKAGE_NAME, PUBLIC_ASSET_PREFIX, VALID_INPUT_FORMATS } from "./constants.js";

const VALID_GLOB_EXTENSIONS = VALID_INPUT_FORMATS.join(",");

/**
 * Builds the source code for the virtual module.
 *
 * @param globBase - posix path from project root to the assets dir, e.g. "src/assets"
 */

export function buildRuntimeModule(globBase: string, publicAssets: string[]): string {
  const escapedBase = RegExp.escape(globBase);

  return `// Auto-generated runtime for ${PACKAGE_NAME}. Do not edit.

import { createUnknownAssetError } from "${PACKAGE_NAME}/utils";

const modules = import.meta.glob("/${globBase}/**/*.{${VALID_GLOB_EXTENSIONS}}");

const stripPrefix = new RegExp("^/${escapedBase}/");

const assetMap = {};

for (const [file, mod] of Object.entries(modules)) {
  assetMap[file.replace(stripPrefix, "")] = mod;
}

for (const path of ${JSON.stringify(publicAssets)}) {
  assetMap[path] = () => path.replace("${PUBLIC_ASSET_PREFIX}", "/");
}

const assetPaths = Object.freeze(Object.keys(assetMap));

const directories = Object.freeze(
  [...new Set(assetPaths.filter((p) => p.includes("/")).map((p) => {
    const seg = p.split("/")[0]
  
    if(seg.startsWith("${PUBLIC_ASSET_PREFIX}")) {
      return "${PUBLIC_ASSET_PREFIX}";
    }

    return seg;
  }))]
);

function exists(path) {
  return Object.prototype.hasOwnProperty.call(assetMap, path);
}

function asset(path) {
  if (exists(path)) {
    return assetMap[path]();
  }

  throw createUnknownAssetError(path, assetPaths, directories);
}

asset.exists = exists;

asset.list = function list(directory) {
  if (!directory) return assetPaths;
  const prefix = directory === "${PUBLIC_ASSET_PREFIX}" ? "${PUBLIC_ASSET_PREFIX}" : directory + "/";
 
  return assetPaths.filter((key) => key.startsWith(prefix));
};

export { asset };
`;
}
