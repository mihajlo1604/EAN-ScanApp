# Copilot instructions for EAN-ScanApp

Purpose: Give AI coding agents the minimal, actionable context to be productive in this repository.

## Quick facts

- Framework: Expo (React Native) using `expo-router` (file-based routing).
- Language: TypeScript (strict mode enabled via `tsconfig.json`).
- Main scripts: `npm install`, `npm run start` (launches Expo), `npm run android|ios|web`, `npm run lint`, `npm run reset-project`.
- Import alias: `@/*` maps to project root (see `tsconfig.json`).

## Where to look first (key files)

- `app/_layout.tsx` — Root layout and navigation (Stack). Modal routes are declared here (example: `app/modal.tsx`).
- `app/index.tsx` — Main scanning UI (current implementation stores scanned items in local state and has Excel export logic).
- `components/` — Shared UI primitives (e.g. `themed-text.tsx`, `themed-view.tsx`, `three-dot-menu.tsx`).
- `hooks/use-theme-color.ts` and `constants/theme.ts` — Theme color system and tokens.
- `package.json` — Available scripts and notable dependencies (e.g. `expo-camera`, `expo-barcode-scanner`, `xlsx`).

## Architecture & conventions (what agents must know)

- Routing: `expo-router` file-based routing. Adding a route => create a file under `app/` (e.g. `app/new-screen.tsx`). Modal screens are declared in `_layout.tsx` or set `presentation: 'modal'` on `Stack.Screen`.
- Theming: Use `ThemedText` / `ThemedView` and `useThemeColor` to read tokens from `constants/theme.ts`. Themes are provided via `ThemeProvider` in `_layout.tsx` and `use-color-scheme` hook.
- Path aliasing: Use `@/` imports for internal modules (e.g., `import { ThemedText } from '@/components/themed-text'`).
- Styling: Small components use `StyleSheet.create` and local styles; prefer the shared themed primitives for consistent colors.
- Reanimated: `react-native-reanimated` is imported in `_layout.tsx` (keep this import; it's part of setup for Reanimated).

## Data & integration patterns

- Local state: the app currently stores items in component state (see `app/index.tsx`).
- Export: Excel export uses `xlsx` to build a workbook, `expo-file-system` to write to `FileSystem.cacheDirectory`, and `expo-sharing` to share. Note: `app/index.tsx` warns about a known high-severity vulnerability in `xlsx` — treat dependency updates with care and run `npm audit` or evaluate replacement libraries.
- Native features: Camera and barcode scanner dependencies are present (`expo-camera`, `expo-barcode-scanner`), so scanning flows should request permissions and use Expo APIs.

## Development & debugging workflows

- Start dev server: `npm run start` (opens Expo Dev Tools). Use `npm run android` / `npm run ios` to launch/platform-specific targets.
- Linting: `npm run lint` (uses Expo linter). Fix lint issues before submitting PRs.
- Type checks: Project uses TypeScript `strict` mode — run `tsc --noEmit` locally if you want explicit type checking beyond IDE checks.
- No CI/tests detected: There are no test files or CI config in the repo; expect local verification steps only.

## Safety & maintenance notes

- Dependency caution: `xlsx` flagged in code — do not upgrade or remove without verifying CVE/advisory and ensuring replacement behavior matches the export flow (sheet creation, base64 output, file writing to cache directory).
- Permissions & platform behavior: When adding camera/scanner features, handle runtime permissions for Android and iOS and test on emulators + real devices.

## Small, actionable rules for PRs

- Keep changes scoped and include a short description in the PR explaining why the change is needed.
- Follow existing patterns: use `@/` imports, use `Themed*` components for UI when color/contrast matters, add a small code comment when deviating from patterns.
- Run `npm run lint` and `tsc --noEmit` locally before opening PR.

---

If anything in the repo is outdated or you want more detail (e.g., a sample PR checklist, or examiner heuristics for dependency updates), tell me what to include and I will iterate.
