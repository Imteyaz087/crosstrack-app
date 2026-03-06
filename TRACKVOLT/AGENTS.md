# AGENTS.md — READ THIS FIRST BEFORE ANY CHANGES

## Current State (March 5, 2026 — Session 3)
⚠️ **CRITICAL: LOCAL CODE IS BEHIND PRODUCTION BY ~30+ FILES!**

The local source is an EARLIER version. Production (deployment GTeJwY1rw) has:
- 11 hooks in src/hooks/ (all missing locally)
- 3 service files in src/services/ (all missing locally)
- ~15 extra components in src/components/ (all missing locally)
- 2 serverless functions in api/ (missing locally)
- Richer page implementations (e.g., 60 achievements vs local's 12)

⚠️ **DO NOT DEPLOY LOCAL CODE** — it would OVERWRITE production with simpler versions!

**Recovery plan:** Extract production source from Vercel Source tab, then save locally and push to GitHub.
See TRACKVOLT_MASTER_DOC.md Section 8 for full gap analysis.

## NON-NEGOTIABLE SAFETY RULES
1. DO NOT deploy/publish/overwrite production unless user types exactly: **"CONFIRM DEPLOY"**
2. DO NOT delete/reset anything unless user types exactly: **"CONFIRM DESTRUCTIVE"**
3. DO NOT change domains, env vars, API keys, billing, or paid services unless user types exactly: **"CONFIRM SECRETS"**
4. DO NOT rebuild the app from scratch. Work only on the existing project.
5. DO NOT start implementing feature changes until user says: **"CONFIRM BUILD"**

## Safe Production Reference
- **Last known good deployment ID:** GTeJwY1rw
- **Platform:** Vercel (project: crosstrack)
- **URL:** https://trackvolt.app
- **Dashboard:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack
- **Deployments:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments

## Session Startup Protocol
1. Read ONLY these 3 memory files first: AGENTS.md, TRACKVOLT_MASTER_DOC.md, CHANGELOG_TRACKVOLT.md
2. Before making changes, also read `CODEX_SYNC.md` and `LIVE_APP_AUDIT.md` for cross-agent coordination and the latest full live-app audit
3. If you need to explore many files, delegate via subagent and write summaries back into TRACKVOLT_MASTER_DOC.md
4. Keep the main conversation short; do heavy exploration via subagent workflow
5. Note current Vercel deployment ID before any deployment work

## Rules for Any AI Agent Working Here

### NEVER DO:
1. ❌ Never run `npx vercel --prod` without user typing "CONFIRM DEPLOY"
2. ❌ Never delete files/data without user typing "CONFIRM DESTRUCTIVE"
3. ❌ Never modify `.vercel/project.json`
4. ❌ Never modify env vars, API keys, or domain config without "CONFIRM SECRETS"
5. ❌ Never assume production = local (they may differ)

### ALWAYS DO:
1. ✅ Read memory files before any work
2. ✅ Read `CODEX_SYNC.md` and `LIVE_APP_AUDIT.md` before making changes when cross-agent work is active
3. ✅ Test with `npm run build` before considering deployment
4. ✅ Stop and tell the user — do NOT deploy automatically
5. ✅ Remember: TypeScript strict mode is ON — unused imports = build failure
6. ✅ Update CHANGELOG_TRACKVOLT.md after each session

### HOW TO SAFELY MAKE CHANGES:
1. Edit local source files
2. Run `npm run build` to verify no TypeScript errors
3. Run `npm run dev` to test locally at localhost:5174
4. **STOP and tell the user** — do NOT deploy automatically
5. User decides when/if to deploy with "CONFIRM DEPLOY"

## Emergency Rollback
If production breaks:
1. Go to https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments
2. Find deployment **GTeJwY1rw**
3. Click ... → Promote
4. Hard refresh browser: Ctrl+Shift+R

## Tech Stack
- React 19 + TypeScript + Vite 7 + Tailwind CSS v4
- Zustand 5 (state) + Dexie (IndexedDB) + Recharts
- Lucide React icons + react-i18next (en + zh-TW + zh-CN)
- PWA with vite-plugin-pwa (aggressive service worker caching)
- tsconfig: noUnusedLocals=true, noUnusedParameters=true

## Design System
- Brand color: #C8FF00 (volt green) — use sparingly
- Background: #0D0D14 (app), #13131E (card), #1A1A28 (raised)
- Text: #F0F0F8 (primary), #8888A0 (secondary), #50505E (muted)
- All cards: glass-card class, rounded, layered backgrounds for depth
- Mobile first: max-width 512px, bottom tab bar with raised Log button

## Vercel Project Config
- Project ID: prj_HRKKptQiVRpYrBtmsCVahz3Zv7ah
- Org ID: team_S7ukXJeYnSsExx3B9QOmqqMD

## File Access Notes
- MCP filesystem tool has direct read/write access to `C:\\ClaudeWork\\Imu\\TrackVolt-App\\`
- Bash tool runs in Linux VM — CANNOT access Windows filesystem
- Vite dev server auto-reloads when files are written via MCP filesystem

---
*Last updated: March 5, 2026 — Session 2*

## Session Note (2026-03-06)
- Confirmed working source root: `C:\\ClaudeWork\\Imu\\TrackVolt-App`
- Do parity checks against live `https://trackvolt.app` before any deploy discussion
- Source handoff artifact available: `C:\\ClaudeWork\\Imu\\TrackVolt-App.zip`

## Session Note (2026-03-06, Verification Pass)
- Workspace root remains `C:\\ClaudeWork\\Imu\\TrackVolt-App`
- Do not start feature implementation from this prompt alone; wait for explicit `CONFIRM BUILD`
- Current handoff options remain valid: GitHub remote configured and ZIP package present at `C:\\ClaudeWork\\Imu\\TrackVolt-App.zip`

## Session Note (2026-03-06, Build Parity Pass)
- Live `CardioLogger` currently matches local; avoid redundant Run rewrites unless live behavior changes.
- For future CrossFit parity work, compare directly against the live lazy chunks (`LogPage-*`, `WorkoutLogger-*`) before editing local source.

## Session Note (2026-03-06, WOD Detail Pass)
- Re-checked live `https://trackvolt.app/assets/WorkoutLogger-BYhetOm3.js` before editing the local CrossFit logger.
- Local `WorkoutLogger.tsx` now goes beyond the prior parity pass with a step-two scope toggle, a larger workout header, a wider benchmark chip rail, and an inline benchmark detail card for WOD logging.
- `npm run build` passed after the update. No deploy was performed.

## Session Note (2026-03-06, Parity Audit)
- Confirmed current live shell parity by comparing local `App.tsx`, `MorePage.tsx`, and `LogPage.tsx` structure against live bundles `index-Cny5lKgo.js`, `MorePage-ClAdLFQh.js`, and `LogPage-0NaviZgC.js`.
- Confirmed local PWA asset mismatch: manifest expects `/icon-192.png`, `/icon-512.png`, and `/screenshots/*.png`, but local `public/` / `dist/` do not expose those live paths yet.
- Confirmed no Capacitor setup exists yet (`@capacitor/*`, `capacitor.config.*`, `ios/` all absent).
- Shared findings recorded in `CODEX_FINDINGS.md`.

## Session Note (2026-03-06, PWA Asset Parity Fix)
- Added the live manifest asset paths locally: `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and the full `public/screenshots/` set.
- Rebuilt the app and confirmed `dist/manifest.webmanifest` now points to files that actually exist in local `dist/`.
- Remaining next steps after this pass: `.env.example` portability doc and Capacitor setup.

## Session Note (2026-03-06, Audit Coordination Rule)
- `LIVE_APP_AUDIT.md` is now a required pre-change read alongside `CODEX_SYNC.md`.
- Reason: Claude Cowork is maintaining the latest full live-app audit there, and both agents need to start from the same parity reference.

## Session Note (2026-03-06, Portability Env Setup)
- Added `.env.example` so the workspace can be copied to a new laptop with a safe local-env template already included.
- Updated `.gitignore` to ignore filled env files while keeping `.env.example` tracked.
- Added README setup notes for Firebase (`VITE_FIREBASE_*`) and USDA (`USDA_API_KEY`) without exposing any real secret values.

## Session Note (2026-03-06, Capacitor Bootstrap)
- Installed `@capacitor/core`, `@capacitor/cli`, and `@capacitor/ios` at `8.1.0`.
- Added `capacitor.config.ts` with `appId: app.trackvolt`, `appName: TrackVolt`, and `webDir: dist`.
- Generated the native `ios/` wrapper locally inside `TrackVolt-App` so the workspace remains portable.
- Added README commands for `npm run cap:sync`, `npm run cap:copy`, and later `npx cap open ios` on macOS.
- Verified `npm run cap:sync` passes and updates `ios/App/App/public` from the current web build.

## Session Note (2026-03-06, CrossFit Timer + Movement Sync)
- Re-checked live CrossFit parity directly against `https://trackvolt.app/assets/TimerPage-Dv8_lL0f.js` and `https://trackvolt.app/assets/WorkoutLogger-BYhetOm3.js` before editing local source.
- Local `src/data/movements.json` now matches the current live movement picker scale with 165 movements across 7 categories.
- Local `src/pages/TimerPage.tsx` now uses the live-style WOD timer flow: launcher cards, preset CRUD, config screens, get-ready countdown, voice/beep cues, interval transitions, and progress dots.
- `npm run build` passed after the parity patch. No deploy was performed.

## Session Note (2026-03-07, Product Audit Coordination)
- Product/market audits should use current official product pages first, then compare those patterns against `LIVE_APP_AUDIT.md`, local source, and package capabilities.
- Treat roadmap ideas in three buckets:
  - parity-critical: needed so TrackVolt does not feel behind category leaders
  - differentiation bets: hybrid-athlete workflows that major apps split across multiple products
  - later/nice-to-have: social or AI ideas that do not improve the daily logging loop yet
- Current audit priority order:
  1. make the daily logging loop faster and more rewarding
  2. add better readiness/recovery guidance from existing inputs before chasing complex wearables work
  3. improve running/HYROX credibility with splits, zones, imports, and share outputs before full GPS mapping
  4. improve nutrition trust with better search, barcode confidence, and adaptive targets

## Session Note (2026-03-07, Cross-Agent Product Thesis)
- Shared product thesis for both agents:
  - `TrackVolt = hybrid athlete operating system`
  - fastest logging + clearest daily guidance + premium sharing + offline reliability
- Shared warning:
  - do not keep expanding page count unless it improves the main athlete loop
  - prioritize compounding quality in `Today`, `Log`, benchmark history, readiness, running/HYROX depth, and nutrition trust

## Session Note (2026-03-07, iOS Launch Audit)
- Current App Store status is **not ready**.
- Confirmed blockers:
  - public privacy-policy URL or public support URL is not prepared yet
  - `ios/App/App/Info.plist` is missing native permission strings for camera/photo-based flows
  - no macOS/Xcode/TestFlight validation has happened

## Session Note (2026-03-07, Build Repair + Cross-Agent Protocol)
- Repaired the current local build break by fixing `src/pages/TimerPage.tsx` to match its callers again.
- Verification now passes again:
  - `npm run build`
  - `npm run cap:sync`
- Cross-agent protocol agreed in `CODEX_FINDINGS.md`:
  - claim high-conflict files before editing them
  - Codex owns build/config/native/state centralization work
  - Cowork owns visual audit, presentation, and polish work

## 2026-03-07 - Hook contract update
- Codex owns `src/hooks/useStreak.ts` and `src/hooks/useReadiness.ts`.
- Cowork should consume the exported interfaces from `CODEX_FINDINGS.md` before finalizing `StreakRing` and `ReadinessCard`.
- `useReadiness()` intentionally allows an unavailable state (`score/status/recommendation` can be null when sleep and energy are both missing).
- Safety unchanged: no deploy, no destructive cleanup, no secrets changes.

## 2026-03-07 - Timer regression restore
- User explicitly prefers the prior rich CrossFit WOD timer over the simplified replacement.
- `src/pages/TimerPage.tsx` should stay on the advanced config flow unless the user asks otherwise.
- If Cowork touches timer-adjacent UI, preserve these restored capabilities:
  - work duration minutes/seconds
  - sets
  - rest-between-sets toggle
  - rest minutes/seconds
  - preset add/edit/delete
- Green build verified after a minimal noUnusedLocals cleanup in `src/components/ReadinessCard.tsx`.

## 2026-03-07 - Timer UI direction update
- Preserve the richer CrossFit timer setup and keep these AMRAP configuration fields visible and first-class:
  - work duration minutes
  - work duration seconds
  - number of sets
  - rest-between-sets toggle
  - rest minutes
  - rest seconds
- Current timer presentation is intentionally moving toward a denser, instrument-like setup screen rather than a plain form.
- If Cowork proposes timer polish, keep the CrossFit field density and sticky start CTA intact.

## 2026-03-07 - Timer active-state and box-cue pass
- Completed a second WOD timer polish pass focused on the live workout experience rather than setup only.
- `src/pages/TimerPage.tsx` now uses clearer phase states during active timing:
  - stronger countdown/work/rest/done visual separation
  - better current-block and next-cue context
  - larger center timer stage with ring + progress strip
- `src/hooks/useTimerAudio.ts`, `src/hooks/useTimerVoice.ts`, and `src/hooks/useTimerEngine.ts` were updated so the timer sounds and spoken prompts feel closer to a real box timer.
- Build verification remains green with `npm run build`.

## 2026-03-07 - Timer setup visual QA
- Added a second setup-screen polish pass to `src/pages/TimerPage.tsx` after checking the screen in a real local mobile browser capture.
- Replaced the corrupted emoji markers with a consistent icon system and fixed the broken start-button label.
- Added a compact stat strip under the session summary so key timer facts are visible immediately.
- Verification included a local Chrome mobile screenshot and a green `npm run build`.

## 2026-03-07 - Premium timer protocol pass
- Added a final design-focused pass to the WOD Timer setup screen after real mobile-browser QA.
- `src/pages/TimerPage.tsx` now has a more premium protocol-panel feel: stronger header framing, better spec cards, richer footer dock, and more breathing room.
- `src/components/InstallPrompt.tsx` now suppresses the install banner when full-screen workout tools are open so it does not cheapen the timer experience.
- Verification: `npm run build` passed and the clean mobile screenshot is `C:/ClaudeWork/Imu/trackvolt-timer-amrap-mobile-final.png`.