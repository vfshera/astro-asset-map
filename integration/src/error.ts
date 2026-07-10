import { closest, distance } from "fastest-levenshtein";
import { MAX_EDIT_DISTANCE } from "./constants.js";

export function createUnknownAssetError(
  path: string,
  assetPaths: readonly string[],
  directories: readonly string[],
): Error {
  const slashIdx = path.indexOf("/");
  const directory = slashIdx !== -1 ? path.slice(0, slashIdx) : undefined;

  if (directory && !directories.includes(directory)) {
    const suggested = closest(directory, directories);
    if (suggested) {
      return new Error(
        `[astro-asset-map]\n\nUnknown directory "${directory}".\n\nDid you mean "${suggested}"?`,
      );
    }
  }

  if (assetPaths.length > 0) {
    const candidate = closest(path, assetPaths);
    const editDist = distance(path, candidate);

    if (editDist <= MAX_EDIT_DISTANCE) {
      const closeMatches = assetPaths.filter(
        (p) => p !== candidate && distance(path, p) <= MAX_EDIT_DISTANCE,
      );

      if (closeMatches.length > 0) {
        const all = [candidate, ...closeMatches].slice(0, 5);

        return new Error(
          `[astro-asset-map]\n\nUnknown asset "${path}".\n\nDid you mean one of:\n\n${all.map((p) => `• ${p}`).join("\n")}`,
        );
      }

      return new Error(
        `[astro-asset-map]\n\nUnknown asset "${path}".\n\nDid you mean "${candidate}"?`,
      );
    }
  }

  if (directories.length > 0) {
    return new Error(
      `[astro-asset-map]\n\nUnknown asset "${path}".\n\nAvailable directories:\n\n${directories.map((d) => `• ${d}`).join("\n")}\n\nUse \`asset.list()\` to inspect available assets.`,
    );
  }

  return new Error(
    `[astro-asset-map]\n\nUnknown asset "${path}".\n\nThe assets directory is empty or does not exist.`,
  );
}
