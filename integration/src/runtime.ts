import { PLUGIN_NAME, VALID_INPUT_FORMATS } from "./constants.js";

const VALID_GLOB_EXTENSIONS = [
  ...VALID_INPUT_FORMATS,
  ...VALID_INPUT_FORMATS.map((ext) => ext.toUpperCase()),
].join(",");

/**
 * Builds the source code for the virtual module.
 *
 * @param globBase - posix path from project root to the assets dir, e.g. "src/assets"
 */

export function buildRuntimeModule(globBase: string): string {
  const escapedBase = RegExp.escape(globBase);

  return `// Auto-generated runtime for ${PLUGIN_NAME}. Do not edit.
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

function levenshtein(a, b) {
  const alen = a.length;
  const blen = b.length;
  const matrix = [];

  for (let i = 0; i <= blen; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= alen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= blen; i++) {
    for (let j = 1; j <= alen; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[blen][alen];
}

function findClosest(str, candidates) {
  let best;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    const d = levenshtein(str, candidate);
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }

  return best;
}

function createUnknownAssetError(path, assetPaths, directories) {
  const slashIdx = path.indexOf("/");
  const directory = slashIdx !== -1 ? path.slice(0, slashIdx) : undefined;
  const THRESHOLD = 5;

  if (directory && !directories.includes(directory)) {
    const suggested = findClosest(directory, directories);
    if (suggested) {
      return new Error('[${PLUGIN_NAME}]\n\nUnknown directory "' + directory + '".\n\nDid you mean "' + suggested + '"?');
    }
  }

  const closestAsset = findClosest(path, assetPaths);
  if (closestAsset) {
    const distance = levenshtein(path, closestAsset);
    if (distance <= THRESHOLD) {
      const closeMatches = assetPaths.filter(
        (p) => p !== closestAsset && levenshtein(path, p) <= THRESHOLD,
      );

      if (closeMatches.length > 0) {
        const all = [closestAsset, ...closeMatches].slice(0, 5);
        return new Error('[${PLUGIN_NAME}]\n\nUnknown asset "' + path + '".\n\nDid you mean one of:\n\n' + all.map((p) => '\\u2022 ' + p).join("\\n"));
      }

      return new Error('[${PLUGIN_NAME}]\n\nUnknown asset "' + path + '".\n\nDid you mean "' + closestAsset + '"?');
    }
  }

  if (directories.length > 0) {
    return new Error('[${PLUGIN_NAME}]\n\nUnknown asset "' + path + '".\n\nAvailable directories:\n\n' + directories.map((d) => '\\u2022 ' + d).join("\\n") + '\\n\\nUse \`asset.list()\` to inspect available assets.');
  }

  return new Error('[${PLUGIN_NAME}]\n\nUnknown asset "' + path + '".');
}

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
