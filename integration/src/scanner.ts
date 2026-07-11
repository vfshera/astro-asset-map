import path from "pathe";
import { glob } from "tinyglobby";
import { VALID_INPUT_FORMATS } from "./constants.js";
import type { ScannedAsset } from "./types.js";

const VALID_EXT_REGEX = new RegExp(`\\.(${VALID_INPUT_FORMATS.join("|")})$`, "i");

/**
 * Scans the assets directory and returns a normalized, sorted list of assets
 * matching VALID_INPUT_FORMATS.
 */
export async function scanAssets(assetsDir: string): Promise<ScannedAsset[]> {
  const entries = await glob("**/*", {
    cwd: assetsDir,
    onlyFiles: true,
    dot: false,
    expandDirectories: false,
  });

  return entries
    .filter((relPath) => VALID_EXT_REGEX.test(relPath))
    .map(path.normalize)
    .sort((a, b) => a.localeCompare(b))
    .map((relPath) => ({
      path: relPath,
      absolute: path.join(assetsDir, relPath),
    }));
}

/**
 * Derives the set of top-level asset directories from a scanned asset list.
 * e.g. "images/car.webp" -> "images"
 */
export function getDirectories(assets: ScannedAsset[]): string[] {
  const dirs = new Set<string>();
  for (const asset of assets) {
    const [first, ...rest] = asset.path.split("/");
    if (rest.length > 0 && first) {
      dirs.add(first);
    }
  }

  return [...dirs].sort((a, b) => a.localeCompare(b));
}
