# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `pnpm install` — install deps (pnpm only; `packageManager` is pinned in package.json, `nodeLinker: hoisted` in pnpm-workspace.yaml). Node version is pinned in `.nvmrc`.
- `pnpm start` / `pnpm ios` / `pnpm android` / `pnpm web` — run the app via Expo CLI.
- `pnpm exec tsc --noEmit` — typecheck.
- `pnpm exec expo install <pkg>` (add `--dev` for devDependencies) — add dependencies so Expo resolves SDK 57-compatible versions; don't `pnpm add` directly.
- `pnpm lint` (`expo lint`) has no ESLint config committed yet and will prompt to bootstrap one.
- No test runner is configured.

## Architecture

- Router root is `src/app/` (expo-router, `main: expo-router/entry`), not the repo root. `src/app/_layout.tsx` is the root layout and imports `src/global.css` — that import is load-bearing for NativeWind.
- Path aliases (tsconfig.json): `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.
- NativeWind v4 wiring spans three files that must stay consistent: babel.config.js (`jsxImportSource: "nativewind"` + `nativewind/babel`), metro.config.js (`withNativeWind(config, { input: "./src/global.css" })`), tailwind.config.js (`content: ["./src/**/*.{js,jsx,ts,tsx}"]`, `nativewind/preset`).
- `app.json` experiments: `typedRoutes` (route strings are typechecked via generated `.expo/types`) and `reactCompiler` (both on — avoid manual `useMemo`/`useCallback`).
- `ios/`/`android/` are not present (CNG-managed, gitignored) — regenerate with prebuild rather than hand-editing native projects.

## Conventions

- `example/` is the stock Expo template output, kept locally (gitignored, not part of the app) as a reference for themed components, tab navigation, and web platform splits (`*.web.tsx`). Read it for patterns; don't import from it.
- Filenames are kebab-case; platform-specific implementations use `.web.tsx` suffixes (see `example/src/components/`).
