import { defineConfig } from "oxfmt";

export default defineConfig({
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  sortImports: {
    newlinesBetween: false,
    groups: [
      ["value-external"],

      ["value-internal"],
      ["value-parent", "value-sibling", "value-index"],
      ["type-external", "type-internal", "type-parent", "type-sibling", "type-index"],
      "unknown",
    ],
  },
  ignorePatterns: ["pnpm-lock.yaml", "dist", "node_modules"],
});
