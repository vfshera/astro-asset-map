import { describe, expect, it } from "vitest";
import { generateTypes } from "./generator.js";
import type { ScannedAsset } from "./types.js";

describe("generateTypes", () => {
  it("generates declarations with root-level and nested assets", () => {
    const assets: ScannedAsset[] = [
      { path: "favicon.svg", absolute: "/root/src/assets/favicon.svg" },
      { path: "images/logo.svg", absolute: "/root/src/assets/images/logo.svg" },
      { path: "images/banner.webp", absolute: "/root/src/assets/images/banner.webp" },
      { path: "fonts/roboto.woff2", absolute: "/root/src/assets/fonts/roboto.woff2" },
    ];

    const directories = ["fonts", "images"];
    const result = generateTypes(assets, directories);

    expect(result).toContain('"favicon.svg"');
    expect(result).toContain('"images/logo.svg"');
    expect(result).toContain('"images/banner.webp"');
    expect(result).toContain('"fonts/roboto.woff2"');
    expect(result).toContain("type AssetDirectory =");
    expect(result).toContain('| "fonts"');
    expect(result).toContain('| "images"');
    expect(result).toContain("exists(path: string): path is AssetPath;");
    expect(result).toContain("list(): readonly AssetPath[];");
    expect(result).toContain('declare module "astro-asset-map:runtime"');
  });

  it("generates empty state when no assets exist", () => {
    const assets: ScannedAsset[] = [];
    const directories: string[] = [];

    const result = generateTypes(assets, directories);

    expect(result).toContain("// no assets found in the configured directory");
    expect(result).toContain("| never");
  });

  it("handles mixed root and nested assets", () => {
    const assets: ScannedAsset[] = [
      { path: "root-file.txt", absolute: "/a/root-file.txt" },
      { path: "sub/deep/file.txt", absolute: "/a/sub/deep/file.txt" },
    ];

    const directories = ["sub"];
    const result = generateTypes(assets, directories);

    expect(result).toContain('"root-file.txt"');
    expect(result).toContain('"sub/deep/file.txt"');
    expect(result).toContain("type AssetDirectory =");
    expect(result).toContain('| "sub"');
  });
});
