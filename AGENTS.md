# astro-asset-map

Type-safe asset map for Astro — reference files in `src/assets` without import statements.

## Tech Stack

- **Runtime:** Node.js >=22.12.0 (ESM only)
- **Language:** TypeScript (strict)
- **Package manager:** pnpm >=11.9.0
- **Build:** tsdown (integration), Vite (Astro)
- **Lint:** oxlint
- **Format:** oxfmt
- **Git hooks:** lefthook

## Repository Structure

- `integration/` — the `astro-asset-map` npm package
- `playground/` — Astro project for live testing

## Commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Watch mode for integration + playground |
| `pnpm build`        | Build the integration package           |
| `pnpm lint`         | Run oxlint                              |
| `pnpm lint:fix`     | Run oxlint with auto-fix                |
| `pnpm format`       | Run oxfmt                               |
| `pnpm format:check` | Check formatting without writing        |

## Code Conventions

- ESM throughout (`import`/`export`, no `require`)
- TypeScript with `astro/tsconfigs/strictest`
- `type` imports preferred (`import type { Foo }`)
- No test framework — playground is the test environment
- Blank lines between: imports/exports, types/interfaces, functions, block-like statements, before `return`/`throw`

## Commit Conventions

[Conventional Commits](https://www.conventionalcommits.org/) v1.0.0 with `@commitlint/config-conventional` types:

`build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

Format: `<type>(<scope>): <description>`

- `feat` — new feature (MINOR)
- `fix` — bug fix (PATCH)
- Use `!` or `BREAKING CHANGE:` footer for breaking changes (MAJOR)
- Scope is optional, lowercase, noun describing code area
- **Never commit directly to `main`** — always use feature/dev branches

Examples:

```
feat(devx): add oxfmt formatter with import sorting
fix(scanner): handle nested directory edge case
docs: update usage examples
```

## Architecture

- `assetMap()` returns an `AstroIntegration`
- `astro:config:setup` injects a Vite plugin
- Vite plugin provides virtual module `astro-asset-map:runtime`
- `astro:config:done` injects ambient `.d.ts` via `injectTypes()`
- Dev watcher on `src/assets` regenerates types on file add/remove
- Runtime uses `import.meta.glob("/src/assets/**/*", { eager: true })`
- Types: `AssetMap` maps relative path → `typeof import(...).default`
