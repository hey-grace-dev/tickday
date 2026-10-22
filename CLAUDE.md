@AGENTS.md

## Working from Claude Code cloud sessions

The owner works from a phone, so everything is verified and shipped through GitHub Actions.

- The cloud environment's network policy blocks `*.expo.dev`. `EXPO_OFFLINE=1` is set in
  `.claude/settings.json` so `npx expo ...` commands don't stall on it. Never run `eas` locally;
  EAS commands only run in CI (see below).
- Before pushing, run `npx expo lint` and `npx tsc --noEmit`, and for UI changes
  `npx expo export --platform web` to confirm the bundle builds.
- `docs.expo.dev` is not reachable from here; check versioned APIs against the installed packages in
  `node_modules` instead of memory.

## Deploy pipeline (`.github/workflows/`)

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | push / PR | lint + typecheck |
| `web-preview.yml` | push to main | web build to GitHub Pages (`https://<owner>.github.io/<repo>/`) |
| `eas-setup.yml` | manual, once | `eas init` + `eas update:configure`, commits app.json |
| `eas-update.yml` | push to main | OTA update to the `preview` channel |
| `eas-build.yml` | manual, or tag | cloud build. Tag `build-<platform>-<profile>[-n]` (e.g. `build-android-preview-1`) or `v*` (Android production) |

All EAS workflows need the `EXPO_TOKEN` repo secret.

- Web preview is for quick UI checks only. Native-only APIs (camera, notifications, ...) must be
  checked on a device build.
- OTA updates only reach builds with the same runtime version. After adding a package with native
  code or changing native config, a new build is required (push a `build-...` tag).

## App structure

- `src/app/(tabs)/`: 오늘 (`index`), 친구들 (`friends`), 기록 (`history`), 설정 (`settings`). Tabs use `NativeTabs` on
  device and a custom bottom bar on web (`src/components/app-tabs.web.tsx`).
- `src/app/habit/[id].tsx`: create (`/habit/new`) / edit modal. `src/app/pro.tsx`: one-time purchase
  screen (purchase not wired up yet).
- `src/store/habits.ts`: zustand store persisted to AsyncStorage (localStorage on web). Pure date,
  streak and growth-level logic lives in `src/lib/`. Bump the store `version` and add a `migrate`
  step whenever the persisted shape changes.
- Product concept (keep it distinct from goal apps like 「오늘의목표」): users keep **routines**
  (code still calls them `Habit`), grouped by time of day (아침/오후/저녁/언제든), checked with one
  tap. Each routine has a hand-drawn character (`src/components/doodle.tsx`, no emoji anywhere) that
  grows with total checks (Lv.1-5 at 0/3/10/30/66 checks: body gets bigger, then sparkles, flower,
  crown). Growth is shown in the 친구들 tab (`friends`) and per-character page (`src/app/friend/[id].tsx`).
- Routines can graduate (`archivedAt`, kept in 친구들 with their EXP) or be deleted (undo toast in
  the root layout). Past days are edited from the History calendar. Settings links to
  `src/app/reminders.tsx` (expo-notifications daily reminder per time slot, native only) and
  `src/app/backup.tsx` (backup as pasted JSON text, validated in `src/lib/backup.ts`).
- Web pages are statically rendered at build time, so anything that depends on "now" or stored data
  must wait for `useHydrated()` to avoid hydration mismatches.
