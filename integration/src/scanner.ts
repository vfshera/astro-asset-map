import path from "pathe";
import { glob } from "tinyglobby";
import type { ScannedAsset } from "./types.js";

/**
 * Scans the assets directory and returns a normalized, sorted list of assets.
 */
export async function scanAssets(assetsDir: string): Promise<ScannedAsset[]> {
  const entries = await glob("**/*", {
    cwd: assetsDir,
    onlyFiles: true,
    dot: false,
    expandDirectories: false,
  });

  return entries
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
    if (rest.length > 0 && first) dirs.add(first);
  }
  return [...dirs].sort((a, b) => a.localeCompare(b));
}
