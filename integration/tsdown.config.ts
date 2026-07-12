import { defineConfig } from "tsdown";

export default defineConfig((options) => {
  const dev = !!options.watch;

  return {
    entry: ["src/index.ts", "src/utils.ts"],
    format: ["esm"],
    target: "es2022",
    unbundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    minify: !dev,
    publint: true,
    attw: { ignoreRules: ["cjs-resolves-to-esm"], profile: "esm-only" },
    copy: [{ from: "../LICENSE", to: "." }],
  };
});
