import { PACKAGE_NAME, VALID_INPUT_FORMATS } from "./constants.js";

const VALID_GLOB_EXTENSIONS = VALID_INPUT_FORMATS.join(",");

/**
 * Builds the source code for the virtual module.
 *
 * @param globBase - posix path from project root to the assets dir, e.g. "src/assets"
 */

export function buildRuntimeModule(globBase: string): string {
  const escapedBase = RegExp.escape(globBase);

  return `// Auto-generated runtime for ${PACKAGE_NAME}. Do not edit.

import { createUnknownAssetError } from "${PACKAGE_NAME}/utils";

const modules = import.meta.glob("/${globBase}/**/*.{${VALID_GLOB_EXTENSIONS}}", {
  eager: true,
  import: "default"
});

const stripPrefix = new RegExp("^/${escapedBase}/");

const assetMap = {};

for (const [file, mod] of Object.entries(modules)) {
  assetMap[file.replace(stripPrefix, "")] = mod;
}

const assetPaths = Object.freeze(Object.keys(assetMap));

const directories = Object.freeze(
  [...new Set(assetPaths.filter((p) => p.includes("/")).map((p) => p.split("/")[0]))]
);

function asset(path) {
  if (path in assetMap) return assetMap[path];
  
  throw createUnknownAssetError(path, assetPaths, directories);
}

asset.exists = function exists(path) {
  return Object.prototype.hasOwnProperty.call(assetMap, path);
};

asset.list = function list(directory) {
  if (!directory) return assetPaths;
  const prefix = directory + "/";

  return assetPaths.filter((key) => key.startsWith(prefix));
};

export { asset };
`;
}
