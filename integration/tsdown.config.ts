import { defineConfig } from "tsdown";

export default defineConfig((options) => {
  const dev = !!options.watch;

  return {
    entry: ["src/index.ts"],
    format: ["esm"], target: "es2022",
    bundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    minify: !dev,
    copy: [{ from: "../README.md", to: "." }],
    publint: true,
    attw: { ignoreRules: ["cjs-resolves-to-esm"] }
  };
});
