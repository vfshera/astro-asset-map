import { describe, expect, it } from "vitest";
import { scanAssets, getDirectories } from "./scanner.js";
import type { ScannedAsset } from "./types.js";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
  const tmp = await mkdtemp(join(tmpdir(), "astro-asset-map-test-"));
  try {
    await fn(tmp);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

describe("scanAssets", () => {
  it("includes image files and excludes non-image files", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "logo.svg"), "");
      await writeFile(join(dir, "photo.jpg"), "");
      await writeFile(join(dir, "notes.txt"), "");
      await writeFile(join(dir, "data.json"), "");

      const result = await scanAssets(dir);

      const paths = result.map((a) => a.path);
      expect(paths).toEqual(["logo.svg", "photo.jpg"]);
    });
  });

  it("returns empty array when no image files exist", async () => {
    await withTempDir(async (dir) => {
      await writeFile(join(dir, "readme.md"), "");

      const result = await scanAssets(dir);

      expect(result).toEqual([]);
    });
  });
});

describe("getDirectories", () => {
  it("returns directory names from nested assets", () => {
    const assets: ScannedAsset[] = [
      { path: "images/logo.svg", absolute: "/a/images/logo.svg" },
      { path: "images/banner.webp", absolute: "/a/images/banner.webp" },
      { path: "fonts/roboto.woff2", absolute: "/a/fonts/roboto.woff2" },
    ];

    const result = getDirectories(assets);

    expect(result).toEqual(["fonts", "images"]);
  });

  it("returns empty array for root-level assets only", () => {
    const assets: ScannedAsset[] = [
      { path: "favicon.svg", absolute: "/a/favicon.svg" },
      { path: "robots.txt", absolute: "/a/robots.txt" },
    ];

    const result = getDirectories(assets);

    expect(result).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    const result = getDirectories([]);

    expect(result).toEqual([]);
  });

  it("handles deep nesting", () => {
    const assets: ScannedAsset[] = [{ path: "a/b/c/file.txt", absolute: "/x/a/b/c/file.txt" }];

    const result = getDirectories(assets);

    expect(result).toEqual(["a"]);
  });

  it("returns directories in sorted order", () => {
    const assets: ScannedAsset[] = [
      { path: "z/last.txt", absolute: "/x/z/last.txt" },
      { path: "a/first.txt", absolute: "/x/a/first.txt" },
      { path: "m/mid.txt", absolute: "/x/m/mid.txt" },
    ];

    const result = getDirectories(assets);

    expect(result).toEqual(["a", "m", "z"]);
  });

  it("deduplicates multiple assets in the same directory", () => {
    const assets: ScannedAsset[] = [
      { path: "images/a.svg", absolute: "/a/images/a.svg" },
      { path: "images/b.svg", absolute: "/a/images/b.svg" },
      { path: "images/c.svg", absolute: "/a/images/c.svg" },
    ];

    const result = getDirectories(assets);

    expect(result).toEqual(["images"]);
  });

  it("handles mixed root and nested assets", () => {
    const assets: ScannedAsset[] = [
      { path: "root.txt", absolute: "/a/root.txt" },
      { path: "sub/file.txt", absolute: "/a/sub/file.txt" },
    ];

    const result = getDirectories(assets);

    expect(result).toEqual(["sub"]);
  });
});
