import { describe, expect, it } from "vitest";
import { buildRuntimeModule } from "./runtime.js";

describe("buildRuntimeModule", () => {
  it("generates a runtime module with correct glob path", () => {
    const result = buildRuntimeModule("src/assets");

    expect(result).toContain('import.meta.glob("/src/assets/**/*.{');
    expect(result).toContain("stripPrefix");
    expect(result).toContain("assetMap");
    expect(result).toContain("function asset(path)");
    expect(result).toContain("asset.exists");
    expect(result).toContain("asset.list");
    expect(result).toContain("export { asset }");
  });

  it("caches assetPaths and directories at module init", () => {
    const result = buildRuntimeModule("src/assets");

    expect(result).toContain("const assetPaths = Object.freeze(Object.keys(assetMap))");
    expect(result).toContain("const directories = Object.freeze(");
  });

  it("imports createUnknownAssetError from astro-asset-map/utils", () => {
    const result = buildRuntimeModule("src/assets");

    expect(result).toContain('import { createUnknownAssetError } from "astro-asset-map/utils"');
  });

  it("calls createUnknownAssetError on lookup failure", () => {
    const result = buildRuntimeModule("src/assets");

    expect(result).toContain("throw createUnknownAssetError(path, assetPaths, directories)");
  });
});
