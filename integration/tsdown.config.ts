import { defineConfig } from "tsdown";
import pkg from "./package.json";

export default defineConfig((options) => {
  const dev = !!options.watch;

  return {
    entry: ["src/**/*.(ts|js)"],
    format: ["esm"],
    target: "node18",
    bundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    minify: !dev,
    external: Object.keys(pkg.peerDependencies),
    tsconfig: "tsconfig.json",
  };
});
