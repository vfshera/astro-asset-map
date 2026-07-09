import { PLUGIN_NAME } from "./constants.js";

/**
 * Builds the source code for the virtual module.
 *
 * @param globBase - posix path from project root to the assets dir, e.g. "src/assets"
 */

export function buildRuntimeModule(globBase: string): string {
  const escapedBase = RegExp.escape(globBase);

  return `// Auto-generated runtime for ${PLUGIN_NAME}. Do not edit.
const modules = import.meta.glob("/${globBase}/**/*", {
  eager: true,
  import: "default"
});

const stripPrefix = new RegExp("^/${escapedBase}/");

const assetMap = {};

for (const [file, mod] of Object.entries(modules)) {
  assetMap[file.replace(stripPrefix, "")] = mod;
}

function asset(path) {
  if (!(path in assetMap)) {
    throw new Error('[${PLUGIN_NAME}] Unknown asset: "' + path + '". ' +
      'Did you mean one of: ' + Object.keys(assetMap).slice(0, 5).join(", ") + '...?');
  }
  return assetMap[path];
}

asset.exists = function exists(path) {
  return Object.prototype.hasOwnProperty.call(assetMap, path);
};

asset.list = function list(directory) {
  const keys = Object.keys(assetMap);
  if (!directory) return keys;
  const prefix = directory + "/";
  return keys.filter((key) => key.startsWith(prefix));
};

export { asset };
`;
}
