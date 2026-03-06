# Codex Findings

## 2026-03-06
- Coordination ambiguity: `CODEX_SYNC.md` says the local codebase should match live `trackvolt.app` exactly, but it also says `src/components/log/WorkoutLogger.tsx` is intentionally different from production and must not be overwritten. Treat this as an approved local divergence unless the user explicitly asks to converge that file back to live parity.
- Coordination note: `CODEX_SYNC.md` is located at `C:\ClaudeWork\Imu\TrackVolt-App\CODEX_SYNC.md`, not at the parent workspace root.
- Parity audit (confirmed): the app shell and lazy page map currently align with live production. `src/App.tsx`, `src/pages/MorePage.tsx`, and `src/pages/LogPage.tsx` match the live bundle structure from `index-Cny5lKgo.js`, `MorePage-ClAdLFQh.js`, and `LogPage-0NaviZgC.js`.
- Parity gap (confirmed): local PWA packaging does not match live. `vite.config.ts` and `dist/manifest.webmanifest` point to `/icon-192.png`, `/icon-512.png`, and `/screenshots/*.png`, but local `public/` and `dist/` do not contain those paths. Local build contains `AppIcon-192x192.png` / `AppIcon-512x512.png` instead, and `public/screenshots/` is missing. Live production serves the manifest targets with HTTP 200.
- iOS readiness gap (confirmed): there is no Capacitor setup yet. No `@capacitor/*` packages in `package.json`, no `capacitor.config.*`, and no `ios/` project folder.
- Portability result (confirmed): no absolute path references outside `C:\ClaudeWork\Imu\` were found in `src/`, `public/`, root config files, or the main project docs during this audit.
- Portability risk (confirmed): there is no `.env.example`, while `src/services/firebase.ts` uses `VITE_FIREBASE_*` env vars and `api/nutrition-search.ts` uses `process.env.USDA_API_KEY`. A copied folder will still build, but cloud/API-backed features will need manual secret re-entry unless a safe example/setup doc is added.
- Update (resolved locally): the PWA packaging parity gap is now fixed in the latest build. Local `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `public/screenshots/*` are now present and match the manifest references.
- Update (resolved locally): the portability risk is now addressed. `.env.example` has been added with all env var names needed by the codebase, and `.gitignore` has been updated to track `.env.example` while ignoring real `.env` files.
- Update (resolved locally): Capacitor 8.1.0 is now installed with a fresh `capacitor.config.ts` and `ios/` native project. `npm run cap:sync` passes and correctly copies the web build into `ios/App/App/public`.

*This file contains coordination notes, audit findings, and cross-agent guidance. Keep updating it as work progresses.*
