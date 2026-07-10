import { describe, expect, it } from "vitest";
import { createUnknownAssetError } from "./error.js";

const KNOWN_PATHS = [
  "images/logo.svg",
  "images/banner.webp",
  "images/hero.webp",
  "blog/hero.webp",
  "products/hero.webp",
  "fonts/roboto.woff2",
];

const KNOWN_DIRECTORIES = ["images", "blog", "products", "fonts"];

describe("createUnknownAssetError", () => {
  it("suggests the closest directory when directory is invalid", () => {
    const err = createUnknownAssetError("imags/logo.svg", KNOWN_PATHS, KNOWN_DIRECTORIES);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown directory "imags"');
    expect(err.message).toContain('Did you mean "images"');
  });

  it("suggests the closest asset when a single close match exists", () => {
    const err = createUnknownAssetError("images/log.svg", KNOWN_PATHS, KNOWN_DIRECTORIES);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown asset "images/log.svg"');
    expect(err.message).toContain('Did you mean "images/logo.svg"');
  });

  it("suggests multiple close matches", () => {
    const paths = [
      "images/hero.webp",
      "blog/hero.webp",
      "products/hero.webp",
      "images/hero.heic",
    ];
    const dirs = ["images", "blog", "products"];
    const err = createUnknownAssetError("images/hero.png", paths, dirs);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown asset "images/hero.png"');
    expect(err.message).toContain("Did you mean one of:");
    expect(err.message).toContain("images/hero.webp");
    expect(err.message).toContain("images/hero.heic");
  });

  it("lists available directories when no close match exists", () => {
    const err = createUnknownAssetError("images/zyxwvut.txt", KNOWN_PATHS, KNOWN_DIRECTORIES);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown asset "images/zyxwvut.txt"');
    expect(err.message).toContain("Available directories:");
    expect(err.message).toContain("images");
    expect(err.message).toContain("blog");
    expect(err.message).toContain("products");
    expect(err.message).toContain("fonts");
    expect(err.message).toContain("Use `asset.list()` to inspect available assets");
  });

  it("handles empty asset paths", () => {
    const err = createUnknownAssetError("anything.txt", [], []);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown asset "anything.txt"');
    expect(err.message).toContain("The assets directory is empty or does not exist");
  });

  it("handles root-level asset (no slash) when no close match", () => {
    const err = createUnknownAssetError("nonexistent.txt", KNOWN_PATHS, KNOWN_DIRECTORIES);

    expect(err.message).toContain("[astro-asset-map]");
    expect(err.message).toContain('Unknown asset "nonexistent.txt"');
    expect(err.message).toContain("Available directories:");
  });
});
