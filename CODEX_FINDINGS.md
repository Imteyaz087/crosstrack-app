# Codex Findings

## 2026-03-06
- Coordination ambiguity: `CODEX_SYNC.md` says the local codebase should match live `trackvolt.app` exactly, but it also says `src/components/log/WorkoutLogger.tsx` is intentionally different from production and must not be overwritten. Treat this as an approved local divergence unless the user explicitly asks to converge that file back to live parity.
- Coordination note: `CODEX_SYNC.md` is located at `C:\ClaudeWork\Imu\TrackVolt-App\CODEX_SYNC.md`, not at the parent workspace root.
- Parity audit (confirmed): the app shell and lazy page map currently align with live production. `src/App.tsx`, `src/pages/MorePage.tsx`, and `src/pages/LogPage.tsx` match the live bundle structure from `index-Cny5lKgo.js`, `MorePage-ClAdLFQh.js`, and `LogPage-0NaviZgC.js`.
- Parity gap (confirmed): local PWA packaging does not match live. `vite.config.ts` and `dist/manifest.webmanifest` point to `/icon-192.png`, `/icon-512.png`, and `/screenshots/*.png`, but local `public/` and `dist/` do not contain those paths. Local build contains `AppIcon-192x192.png` / `AppIcon-512x512.png` instead, and `public/screenshots/` is missing. Live production serves the manifest targets with HTTP 200.
- iOS readiness gap (confirmed): there is no Capacitor setup yet. No `@capacitor/*` packages in `package.json`, no `capacitor.config.*`, and no `ios/` project folder.
- Portability result (confirmed): no absolute path references outside `C:\ClaudeWork\Imu\` were found in `src/`, `public/`, root config files, or the main project docs during this audit.
- Portability risk (confirmed): there is no `.env.example`, while `src/services/firebase.ts` uses `VITE_FIREBASE_*` env vars and `api/nutrition-search.ts` uses `process.env.USDA_API_KEY`. A copied folder will still build, but cloud/API-backed features will need manual secret re-entry unless a safe example/setup doc is added.
- Update (resolved locally): the PWA packaging parity gap is now fixed in the local project. Added `public/icon-192.png`, `public/icon-512.png`, `public/icon-512-maskable.png`, and `public/screenshots/*.png`, then rebuilt successfully. `dist/` now exposes the same manifest asset paths that live production serves.
- Today/Log parity audit (confirmed): current live `TodayPage-DNaUIE2-.js` and `LogPage-0NaviZgC.js` align with local `src/pages/TodayPage.tsx`, `src/pages/LogPage.tsx`, and `src/components/log/LogModeSelector.tsx` for the dashboard layout, quick tools, weekly summary / PR / recovery / grocery cards, lazy logger wiring, and the 3-category log mode selector with quick templates.
- Today/Log parity result: no new local code gap was found in those entry screens during this pass. The remaining tracked gaps are outside these screens: portability docs (`.env.example`) and iOS readiness (no Capacitor setup yet).
- Portability update (resolved locally): added `.env.example`, updated `.gitignore` to ignore real env files while keeping `.env.example` tracked, and documented the local env setup in `README.md`. This removes the previously confirmed portability-doc gap without exposing secrets.
- iOS readiness update (resolved locally): Capacitor 8.1.0 is now installed, `capacitor.config.ts` is present, and the native `ios/` wrapper has been created inside `TrackVolt-App`. Remaining iOS work is no longer setup/bootstrap; it is now polish, native QA, icons/splash/signing, and later macOS/Xcode build steps.
- Capacitor verification (confirmed): `npm run cap:sync` passed on Windows. Current web assets are synced into `ios/App/App/public`, and the generated iOS project files now live entirely inside `C:\ClaudeWork\Imu\TrackVolt-App\ios`.
- CrossFit parity update (resolved locally): `src/data/movements.json` was far behind live. It is now synced from the current live `WorkoutLogger-BYhetOm3.js` bundle and contains 165 movements across `weightlifting`, `gymnastics`, `monostructural`, `kettlebell`, `dumbbell`, `bodyweight`, and `odd-objects`.
- Movement picker update (resolved locally): `src/components/log/MovementPicker.tsx` now clones the dataset before sorting and uses a taller scroll region so the live-sized movement library is usable on mobile.
- WOD timer parity update (resolved locally): `src/pages/TimerPage.tsx` now follows the live timer flow instead of the older simplified preset circle. Local now has the live-style mode launcher, quick preset add/edit/delete, config screens for AMRAP/EMOM/For Time/Tabata/Rest, 10-second get-ready countdown, voice/beep cues, work/rest transitions, progress dots, and restart state.
- Verification: `npm run build` passed after the movement-library sync and `TimerPage.tsx` replacement. No deploy was performed.
- Cross-agent implementation note (2026-03-06): for CrossFit parity, treat live `trackvolt.app` as the contract and patch in this order:
  1. pull the current live lazy bundle for the exact surface being fixed,
  2. match all visible labels, controls, states, and save flows first,
  3. only keep local enhancements if they do not remove or hide any live feature,
  4. prefer richer UX only after live parity is intact.
- Current CrossFit parity status:
  - `src/pages/TimerPage.tsx` is now live-style and should be treated as the local timer baseline.
  - `src/data/movements.json` now reflects the live-scale movement library (165 items / 7 categories).
  - `src/components/log/MovementPicker.tsx` was adjusted to support the larger live dataset.
  - `src/components/log/WorkoutLogger.tsx` remains intentionally richer locally; do not simplify it. If refining it further, preserve all live controls first, then improve density/polish.
- Recommended next parity method for any remaining CrossFit mismatch:
  - compare live screen-by-screen with screenshots and bundle inspection,
  - patch only the exact missing interaction or layout,
  - run `npm run build`,
  - record the delta in `CODEX_FINDINGS.md` and `CHANGELOG_TRACKVOLT.md`.
- Product direction note: user wants the local app to be at least as capable as live, but cleaner and richer. The safe rule is `live parity first, tasteful enhancement second`.
