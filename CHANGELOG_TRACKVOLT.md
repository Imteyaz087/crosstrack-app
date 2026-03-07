# TrackVolt Changelog
**Purpose:** Record what changed each session. Read before new work.

---

## 2026-03-07 — Session: Lint Cleanup + Faster Meal Logging

**Why:** Codex audit found 93 lint errors including 10 setState-in-effect bugs causing cascading renders, 3 impure render calls (Math.random during render), and 1 variable-access-before-declaration. Meal logging was too slow for daily use — no favorites, no clone, no quick-add.

**What changed:**

### Lint Cleanup (13 files, 23 errors eliminated)
- **0 remaining setState-in-effect** (was 10) — CelebrationOverlay, InstallPrompt, OnboardingTour, CycleLogger, useCountUp, useStreakCelebration, HeartRatePage, BodyMeasurementsPage, ProgressPage, SettingsPage
- **0 remaining impure render calls** (was 3) — CelebrationOverlay ConfettiParticle, HeartRatePage duration
- **0 remaining components-during-render** (was 8) — all in TimerPage
- **0 remaining variable-before-declaration** (was 1) — useWorkoutForm resetAll
- Pattern: lazy state init `useState(() => ...)`, `queueMicrotask()`, derived values, moved declarations

### Faster Meal Logging (7 files)
- **Favorite Foods**: `isFavorite` flag on FoodItem, DB v7 migration, star toggle on food rows, dedicated Favorites section above Recents
- **Clone Yesterday**: One-tap "Repeat Yesterday's [meal type]" button copies all meals from yesterday
- **Quick-Add Macros**: When no food matches, expand to enter raw cal/P/C/F directly — creates custom food + logs it
- New store methods: `toggleFavoriteFood()`, `cloneYesterdayMeals()`
- New useMealForm helpers: `handleQuickAdd()`, favorite/clone wiring
- New i18n keys: favorites, clone, quickAdd sections

### Files touched
- types/index.ts, db/database.ts, stores/useStore.ts, hooks/useMealForm.ts
- components/log/MealLogger.tsx, pages/LogPage.tsx, i18n/en.ts
- CelebrationOverlay, InstallPrompt, OnboardingTour, CycleLogger
- useCountUp, useStreakCelebration, useTimerEngine, useWorkoutForm
- HeartRatePage, TimerPage, BodyMeasurementsPage, ProgressPage, SettingsPage, App.tsx

---

## 2026-03-07 — Session: Visual QA Pass + Empty State System

**Why:** New users opening TrackVolt saw dashes, spinners, and no guidance. The app felt broken on first launch. Settings had undersized touch targets and hardcoded English strings. A CSS variable bug meant the body text color was undefined.

**What changed:**

### TodayPage.tsx
- Added `dataReady` loading state — shows `TodayPageSkeleton` shimmer while 8 data sources load
- Added first-time welcome hero card (gradient, Target icon, CTA) for users with zero data
- Body metrics grid: replaced ugly " - " dashes with dashed-border empty tiles showing "+" / "Add" — makes it obvious they're tappable
- Imported `TodayPageSkeleton` and `Target` icon

### NutritionPage.tsx
- Added page-level empty state hero (orange gradient, UtensilsCrossed icon) when zero meals logged
- Previously showed 5 identical empty meal sections with no guidance

### SettingsPage.tsx
- Training day buttons: `w-9 h-9` (36px) → `w-11 h-11` (44px) — meets touch target minimum
- Language buttons: `min-h-[32px]` → `min-h-[44px]`
- Firebase setup/save buttons: added `min-h-[44px]`
- Gemini save key button: added `min-h-[44px]`
- 3 hardcoded English strings → i18n with fallbacks: `apiKeySaved`, `invalidKeyFormat`, `firebaseSaved`

### index.css
- Fixed `var(--ct-text-1)` → `var(--color-ct-1)` — body text color was referencing undefined variable
- Fixed `var(--ct-bg)` → `var(--color-ct-bg)` — body background was referencing undefined variable

### LogPage.tsx
- Enhanced `LazyFallback` — added "Loading..." text below spinner for better perceived performance

### Documentation
- Migrated all docs from `TRACKVOLT/` subfolder to project root per new memory structure
- Created subfolders: `AI_SYNC/`, `AUDITS/`, `FINDINGS/`, `ROADMAP/`

**Build:** tsc + vite build both pass. PWA 73 entries precached.
**Deploy:** NOT deployed.

---

## 2026-03-05 — Session 4: TypeScript Build Fixes

**Why:** `npm run build` was failing with 36+ TypeScript errors. Needed to fix all errors so build passes.

**What was fixed:**
- **AchievementsPage** — Removed unused `useStore`
- **AICoachPage** — `w.isPR` → `w.prFlag`, `w.isRX` → `w.rxOrScaled === 'RX'`, removed unused `consecutiveDays` state
- **BenchmarkPage** — Removed unused `useTranslation`
- **BodyMeasurementsPage** — Removed unused `useStore`, `getMeasurementsForDate`, `getTrendForMetric`; added `percent` to `getLatestAndFirstForMetric`
- **CloudSyncPage** — Replaced `addToast` usage; `db.meals` → `db.mealLogs`, `db.prLogs` → `db.movementPRs`; fixed `<style jsx>` → `<style>`
- **HeartRatePage** — Removed unused `useTranslation`
- **MealPrepPage** — `db.foods` → `db.foodLibrary`, `db.meals` → `db.mealLogs`; use store's `addMealFromTemplate`; fixed FoodItem API (`proteinPer100g` etc.) and `fat` vs `fats`
- **MovementPRPage** — Removed unused `useTranslation`; converted to inline styles
- **PhotoLogPage** — Removed unused `useTranslation`; fixed `<style jsx>` → `<style>`
- **PRWallPage** — Removed unused `db`, `Calendar`, type imports
- **WeeklyPlannerPage** — Fixed `ProgramDay` typing; cast for `db.programDays` queries
- **WorkoutHistoryPage** — Removed unused style consts and `setTypeFilter`
- **WorkoutTemplatesPage** — Removed unused `useEffect`

**Result:** Build passes. `tsc -b && vite build` completes; PWA assets generated. Main bundle ~1 MB (Rollup suggests code-splitting).

**Deploy:** NOT deployed.

---

## 2026-03-05 — Session 3: Production Source Code Gap Analysis

**Why:** User wants local code to match production exactly. Investigated Vercel deployments and compared source trees.

**What was discovered:**
- GitHub repo (Imteyaz087/crosstrack-app) is EMPTY — only .gitkeep file
- Vercel deployment GTeJwY1rw is still the CURRENT production deployment
- Two Vercel accounts: imteyazmdkaish@gmail.com (active, has crosstrack project) and imteyaz087@gmail.com
- **CRITICAL: Local code is MISSING ~30+ files compared to production!**

**Missing from local (found in production Vercel source):**
- `api/` folder (2 serverless functions: barcode-lookup.ts, nutrition-search.ts)
- `src/hooks/` folder (11 hooks: useAchievement, useCountUp, useCycleTracking, useHaptic, usePRDetection, useStreakCeleb, useTimerAudio, useTimerEngine, useTimerVoice, useUnsavedChanges, useWorkoutForm)
- `src/services/` folder (3 files: firebase.ts, gemini.ts, nutritionApi.ts)
- `src/components/log/` subfolder (BarcodeScanner, MealLogger, etc.)
- `src/components/sharecard/` subfolder
- ~15 additional components (ConfirmDialog, EmptyState, OnboardingTour, PRToast, SaveCelebration, SkeletonCard, etc.)
- `src/test/` folder
- `src/design-tokens.json`
- Root-level: check-imports.cjs, verify-store-usage.cjs, eslint.config.js, research/, scripts/

**Page differences found:**
- AchievementsPage: Production has 60 achievements with Bronze/Silver/Gold tiers. Local has 12 hardcoded badges.
- Other pages likely differ too (production uses hooks and components that local doesn't have)

**What changed (files modified):**
- TRACKVOLT_MASTER_DOC.md — Added comprehensive gap analysis in Section 8
- CHANGELOG_TRACKVOLT.md — This entry
- AGENTS.md — Added DO NOT DEPLOY warning

**Deploy:** ⚠️ DO NOT DEPLOY. Local code would OVERWRITE production with simpler versions.

**Next steps:**
1. User needs to log into Vercel and help extract production source files
2. OR use Vercel API/CLI to download deployment source
3. Save production source locally, then push to GitHub

---

## 2026-03-05 — Session 2: Memory System + Handoff Setup

**Why:** User established structured workflow with safety rules, memory files, handoff plan.

**What changed:**
- Updated AGENTS.md with NON-NEGOTIABLE safety rules (CONFIRM DEPLOY, CONFIRM DESTRUCTIVE, CONFIRM SECRETS)
- Updated TRACKVOLT_MASTER_DOC.md with complete 23-page inventory, full DB schema (16 tables), design system docs
- Updated CHANGELOG_TRACKVOLT.md (this file)
- No code changes this session — analysis and documentation only

**Production vs Local parity:** Menu structure is IDENTICAL (18 items in More menu). Local has rewritten implementations from Session 1 that differ in details from production.

**Deploy:** NOT deployed. Awaiting "CONFIRM DEPLOY" from user.

**Next steps:** 
1. Run `npm run build` to verify TypeScript
2. GitHub repo push for source code handoff
3. iOS strategy decision (PWA vs Capacitor)

---

## 2026-03-05 — Session 1: Placeholder Pages Implementation

**Why:** 14 of 19 More sub-pages were "Coming soon" placeholders. Needed real implementations.

**What changed:**
- **LogPage.tsx** — Complete rewrite with multi-step CrossFit logging flow (Full Class/WOD Only/Strength Only/Events), fixed i18n keys
- **WorkoutHistoryPage.tsx** — Full implementation: search, stats, workouts grouped by month
- **WorkoutTemplatesPage.tsx** — Benchmark WODs catalog with search, filter (All/Girls/Heroes/Open)
- **PRWallPage.tsx** — PR showcase with stats, category filters, timeline view
- **MovementPRPage.tsx** — Movement PR tracking with Add PR form, category filters, improvement badges
- **BenchmarkPage.tsx** — User's logged benchmark results with expandable attempt history
- **WeeklyPlannerPage.tsx** — 7-day training planner with workout type quick-set
- **MealPrepPage.tsx** — Meal template management with macro calculation
- **BodyMeasurementsPage.tsx** — 11 body measurements with trend tracking
- **AchievementsPage.tsx** — 12 gamification badges across 5 categories
- **HeartRatePage.tsx** — Resting HR + zone logging with trend visualization
- **AICoachPage.tsx** — Training insights computed from logged data
- **PhotoLogPage.tsx** — Photo capture with base64 IndexedDB storage
- **CloudSyncPage.tsx** — Export/import JSON, data overview, integrity check

**Fixes applied:**
- BenchmarkPage: wrong import `useWorkoutStore` → `useStore`, removed missing CSS import
- MovementPRPage: removed non-existent CSS import, converted to inline styles
- AchievementsPage: fixed i18n key `t('achievements')` → `t('more.achievements')`

**Deploy:** NOT deployed. Local-only changes.

---

## 2026-03-05 — Session 0: TypeScript Fixes + LogPage Redesign

**What changed:**
- Fixed TypeScript build errors (unused imports in useStore.ts, TodayPage.tsx)
- LogPage redesign: 9 cards in 3 categories replacing flat 6-card grid
- i18n keys added for new categories
- Deployment incident: accidentally deployed old version to Vercel, recovered via GTeJwY1rw rollback

**Deploy:** Rolled back to GTeJwY1rw after accidental deploy.

---

*Update this file after each session with date, what changed, why, and deploy status.*

## 2026-03-06 - Session 5: Workspace Lock + Handoff Package + Parity Baseline

**Why:** Establish a repeatable memory-first workflow, avoid zero-start sessions, and ensure a safe source-code handoff.

**What was done:**
- Locked active source folder to `C:\ClaudeWork\Imu\TrackVolt-App`
- Verified framework/build stack from code: React 19 + TypeScript + Vite + PWA plugin
- Read required memory files first (`AGENTS.md`, `TRACKVOLT_MASTER_DOC.md`, `CHANGELOG_TRACKVOLT.md`)
- Generated handoff ZIP: `C:\ClaudeWork\Imu\TrackVolt-App.zip`
- Verified ZIP content excludes `node_modules`, `.git`, and `dist`
- Replaced `README.md` with exact install/dev/build/deploy commands and safety gates
- Pulled live production HTML + manifest from `https://trackvolt.app` to baseline visible production capabilities

**Deploy:** NOT deployed.

**Next steps:**
1. If you want GitHub handoff instead of ZIP, run authenticated push from this folder
2. Run a focused parity sweep page-by-page against live UI before any build/deploy action
3. Continue feature work only after you provide `CONFIRM BUILD`

## 2026-03-06 - Session 6 CrossFit Local Parity Fix
- Patched `src/components/log/WorkoutLogger.tsx` to expose the richer local/live CrossFit workflow already supported by `LogPage` and `useWorkoutForm`
- Added step-based entry flow: Full Class, WOD Only, Strength Only
- Added visible shortcuts for `CrossFit Events` and `Scan WOD`
- Added benchmark picker/suggestions, previous-result edit shortcuts, richer score input modes, strength build/programmed controls, and movement picker UI
- `npm run build` passed after the patch
- No deploy performed

## 2026-03-06 - Session 7: CrossFit Entry Screen Matched To Live Layout

**Why:** User provided the live CrossFit entry screen and asked for the same feature layout locally.

**What changed:**
- Updated `src/components/log/WorkoutLogger.tsx` step-one layout to match the live CrossFit launcher more closely
- Reworked first screen to use:
  - full-width `Full Class` card
  - two half-width cards for `WOD Only` and `Strength Only`
  - full-width `CrossFit Events` card
  - recent workouts list styled for tap-to-edit
- Kept deeper logging flow intact (benchmark picker, strength details, movement picker, WOD save flow)

**Verification:**
- `npm run build` passed

**Deploy:** NOT deployed.

## 2026-03-06 - Session 8: No-Code Verification Refresh

**Why:** User re-established the TrackVolt coworker instructions and asked to continue from the same project location without starting feature implementation.

**What was verified:**
- Active project root remains `C:\ClaudeWork\Imu\TrackVolt-App`
- Framework/build stack remains React 19 + TypeScript + Vite 7 + PWA
- README still contains install/dev/build/deploy-safe commands
- Git handoff remote is still configured
- ZIP handoff package still exists
- Live production metadata still advertises the same core feature set

**Deploy:** NOT deployed.

**Code changes:** None in this verification pass.

## 2026-03-06 - Session 9: Deep CrossFit Form Parity Refresh

**Why:** User asked for the local CrossFit internals to match the current live app instead of only matching the launcher screen.

**What changed:**
- Compared local `LogPage.tsx` against the live `LogPage-0NaviZgC.js`, `WorkoutLogger-BYhetOm3.js`, and `CardioLogger-CfeceYK0.js` bundles from `https://trackvolt.app`
- Confirmed local `CardioLogger.tsx` already matches the current live Run / Cardio flow, so no Run patch was needed in this pass
- Rebuilt local `src/components/log/WorkoutLogger.tsx` step-two UI toward live production:
  - header-level `kg / lbs` toggle
  - gradient Strength and WOD sections
  - quick benchmark chips plus full benchmark picker
  - quick time-cap chips
  - steppers for AMRAP / EMOM / Tabata score entry
  - richer programmed/build strength controls
  - quick weight chips and production-style PR / Benchmark toggles
  - production-style movements editor, notes area, and save layout
- `npm run build` passed after the update

**Deploy:** NOT deployed.

**Next steps:**
1. Manual local QA on CrossFit create/edit flows against live production
2. Repeat the same live-chunk comparison workflow for any remaining parity gaps on other pages

## 2026-03-06 - Session 10: WOD Only / Full Class Detail Upgrade

**Why:** User asked for the main CrossFit logger, especially `WOD Only` and the whole-workout path, to carry more of the live app detail and feel stronger than the previous parity pass.

**What changed:**
- Re-checked the current live `WorkoutLogger-BYhetOm3.js` bundle from `https://trackvolt.app`
- Updated `src/components/log/WorkoutLogger.tsx` again to deepen the WOD experience:
  - added an in-flow scope switch for `Full Class`, `WOD Only`, and `Strength Only`
  - expanded the quick benchmark rail to cover the wider live-style benchmark set
  - added an inline benchmark detail card with scheme, movement list, score type, cap, RX / Scaled standards, and elite target
  - increased the step-two workout title emphasis so the active logger state is clearer on mobile
- `npm run build` passed after the patch

**Deploy:** NOT deployed.

**Next steps:**
1. Manual local device QA on `WOD Only` and `Full Class`
2. If the user wants, continue polishing the benchmark picker and movement-entry ergonomics

## 2026-03-06 - Session 11: Strict Local-vs-Live Parity Audit

**Why:** User asked to proceed with a strict local-vs-live audit focused on production parity, iOS readiness, and portability inside `C:\ClaudeWork\Imu\`.

**What was verified:**
- Compared local `App.tsx`, `MorePage.tsx`, and `LogPage.tsx` structure against the current live bundles from `https://trackvolt.app`
- Confirmed current source-level shell parity for top-level tabs, More subpage routing, and LogPage lazy logger wiring
- Confirmed a local packaging parity gap:
  - `vite.config.ts` / local manifest reference `/icon-192.png`, `/icon-512.png`, and `/screenshots/*.png`
  - local `public/` / `dist/` currently ship `AppIcon-192x192.png` / `AppIcon-512x512.png` and no `screenshots/` directory
  - live production serves the manifest asset paths successfully, so local is behind here
- Confirmed no Capacitor setup exists yet (`@capacitor/*` absent, no `capacitor.config.*`, no `ios/` folder)
- Confirmed no absolute path leaks outside `C:\ClaudeWork\Imu\` in source/config/docs during this audit
- Logged shared issues to `CODEX_FINDINGS.md`

**Deploy:** NOT deployed.

**Next steps:**
1. Fix local PWA asset parity non-destructively by adding the live manifest asset filenames and screenshots paths locally
2. Add a safe `.env.example` / setup note for portability without exposing secrets
3. After parity is clean, begin Capacitor integration for iOS readiness

## 2026-03-06 - Session 12: PWA Packaging Parity Fix

**Why:** The strict parity audit found that local packaging was behind live production even though page wiring was aligned. The manifest referenced live asset paths that did not exist locally.

**What changed:**
- Added local copies of the live manifest icon paths:
  - `public/icon-192.png`
  - `public/icon-512.png`
  - `public/icon-512-maskable.png`
- Added `public/screenshots/` and pulled in the live screenshot set:
  - `today-dashboard.png`
  - `workout-log.png`
  - `nutrition-macros.png`
  - `progress-prs.png`
  - `cycle-training.png`
  - `achievements.png`
  - `offline-first.png`
- Rebuilt and verified local `dist/` now contains the exact manifest asset paths referenced by `dist/manifest.webmanifest`

**Verification:**
- `npm run build` passed
- `dist/` now contains `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `dist/screenshots/*`

**Deploy:** NOT deployed.

**Next steps:**
1. Add `.env.example` / secret setup notes for portability
2. Start Capacitor integration for iOS readiness after portability docs are in place

## 2026-03-06 - Session 13: Shared Audit Rule Update

**Why:** User asked to make `LIVE_APP_AUDIT.md` a required coordination file because Claude Cowork is saving the full live parity audit there.

**What changed:**
- Updated `AGENTS.md` startup rules so future sessions must read:
  - `AGENTS.md`
  - `TRACKVOLT_MASTER_DOC.md`
  - `CHANGELOG_TRACKVOLT.md`
  - `CODEX_SYNC.md`
  - `LIVE_APP_AUDIT.md`
- Recorded the new coordination rule in `TRACKVOLT_MASTER_DOC.md`

**Deploy:** NOT deployed.

**Next steps:**
1. Follow the new startup rule on every session before editing
2. Keep writing shared parity findings to `CODEX_FINDINGS.md`

## 2026-03-06 - Session 14: Today and Log Parity Audit

**Why:** User asked what to do next to match the live app, then approved the next parity pass on the main `Today` and `Log` entry screens.

**What was verified:**
- Pulled the current live bundles from `https://trackvolt.app`:
  - `index-Cny5lKgo.js`
  - `TodayPage-DNaUIE2-.js`
  - `LogPage-0NaviZgC.js`
- Confirmed local `src/pages/TodayPage.tsx` matches the live dashboard structure and behavior entry points
- Confirmed local `src/pages/LogPage.tsx` and `src/components/log/LogModeSelector.tsx` match the live logger launcher structure and lazy logger wiring
- Confirmed no new local code gap was found in these two screens during this pass

**Files updated:**
- `CODEX_FINDINGS.md`
- `TRACKVOLT_MASTER_DOC.md`

**Deploy:** NOT deployed.

**Next steps:**
1. Add `.env.example` and portable secret setup notes
2. After portability docs are in place, start Capacitor integration for iOS readiness

## 2026-03-06 - Session 15: Portable Env Setup

**Why:** The parity audits found a portability gap: the project could be copied to a new laptop, but there was no safe env template or setup note for Firebase and USDA-backed features.

**What changed:**
- Added `.env.example` with the confirmed env variable names used by the codebase
- Updated `.gitignore` to ignore real env files while keeping `.env.example` committed
- Updated `README.md` with the local portable env setup flow and notes for Firebase / USDA usage
- Recorded the resolution in `CODEX_FINDINGS.md`

**Deploy:** NOT deployed.

**Next steps:**
1. Start Capacitor integration for iOS readiness
2. Keep production parity checks focused on remaining non-entry screens only if new gaps appear

## 2026-03-06 - Session 16: Capacitor iOS Bootstrap

**Why:** After closing the portability-doc gap, the next planned step was to prepare the project for iOS release readiness without touching production deploy.

**What changed:**
- Installed:
  - `@capacitor/core@8.1.0`
  - `@capacitor/ios@8.1.0`
  - `@capacitor/cli@8.1.0`
- Added `capacitor.config.ts` with:
  - `appId: app.trackvolt`
  - `appName: TrackVolt`
  - `webDir: dist`
- Added package scripts:
  - `cap:sync`
  - `cap:copy`
- Generated the native `ios/` wrapper inside the project root
- Updated `README.md` with the Capacitor/iOS workflow and macOS follow-up note
- Recorded the status in `CODEX_FINDINGS.md`

**Verification:**
- `npm run cap:sync` passed
- Web build copied successfully into `ios/App/App/public`

**Deploy:** NOT deployed.

**Next steps:**
1. Run a full `npm run cap:sync` verification pass
2. Then move to iOS polish items: splash/icon completeness, safe-area QA, and native plugin review

## 2026-03-06 - Session 17: CrossFit Timer + Movement Library Live Sync

**Why:** User reported that live CrossFit parity was still missing in the main WOD flow, especially the WOD Timer and the movement picker inside `WOD Only`.

**What changed:**
- Re-audited the live CrossFit bundles from `https://trackvolt.app`:
  - `TimerPage-Dv8_lL0f.js`
  - `WorkoutLogger-BYhetOm3.js`
- Synced `src/data/movements.json` from the live `WorkoutLogger` bundle:
  - local movement dataset grew from 11 items to 165 items
  - categories now match the live app surface: weightlifting, gymnastics, monostructural, kettlebell, dumbbell, bodyweight, odd-objects
- Updated `src/components/log/MovementPicker.tsx`:
  - clone before sorting to avoid mutating the shared movement array
  - increase list height so the full live-sized picker is usable on mobile
- Replaced the older simplified `src/pages/TimerPage.tsx` with the live-style WOD timer experience using the existing local timer hooks:
  - launcher cards for `AMRAP`, `EMOM`, `For Time`, `Tabata`, and `Rest Timer`
  - quick preset add/edit/delete flow
  - mode-specific config screens before start
  - 10-second get-ready countdown
  - voice + beep cues
  - work/rest transitions, set/round progress dots, done state, restart state

**Verification:**
- `npm run build` passed

**Deploy:** NOT deployed.

**Next steps:**
1. Manual local QA of the CrossFit `WOD Only` flow with the now-full movement dataset
2. Compare any remaining CrossFit deltas against live screenshots before touching `WorkoutLogger.tsx` again

## 2026-03-07 - Session 18: Deep Product and Market Audit

**Why:** User requested a strategy-grade audit of live `trackvolt.app` against category leaders in functional fitness, running, nutrition, recovery, and health ecosystems.

**What changed:**
- Researched current official product pages across the benchmark set and synthesized the shared success patterns:
  - fastest possible logging/capture
  - visible progress and streak loops
  - personalized coaching or plan adaptation
  - premium share/community outputs
  - strong trust signals around data quality and insights
- Audited TrackVolt against those patterns using:
  - live app references
  - `LIVE_APP_AUDIT.md`
  - local source/code capability scan
  - current build/package footprint
- Captured the main product direction in `TRACKVOLT_MASTER_DOC.md` and coordination guidance in `AGENTS.md`
- Logged the most actionable roadmap findings for the parallel agent in `CODEX_FINDINGS.md`

**Key conclusions:**
- TrackVolt already has rare breadth for a hybrid-athlete PWA and should lean harder into that "one app instead of five" position.
- The next wins are product quality, habit loops, and insight quality, not new surface-area sprawl.
- Highest-value gaps are:
  - faster/rewarding daily logging loop
  - stronger readiness/recovery scoring from existing inputs
  - more credible running/HYROX analytics and imports
  - more trustworthy nutrition search/barcode/adaptive targets

**Deploy:** NOT deployed.

**Next steps:**
1. Convert the audit into a ranked build backlog
2. Ship quick wins around clarity, reward loops, and insight surfaces
3. Then tackle the first serious competitive layer: readiness + running/HYROX + nutrition trust

## 2026-03-07 - Session 19: Cross-Agent Strategy Handoff

**Why:** User asked for the audit findings and product judgment to be written back to the shared memory so Claude Cowork and Codex operate from the same "world-class TrackVolt" plan.

**What changed:**
- Added a direct cross-agent strategy memo to `CODEX_FINDINGS.md`
- Expanded `TRACKVOLT_MASTER_DOC.md` with the world-class product direction
- Captured the core product thesis:
  - TrackVolt should be built as the `hybrid athlete operating system`
  - the path is not "more pages"; it is a faster daily loop, stronger guidance, better depth in running/HYROX/nutrition, then stronger momentum/share/community layers

**Key guidance for both agents:**
1. Preserve live parity first
2. Make daily logging frictionless
3. Turn existing data into clear daily guidance
4. Deepen trust in specialist areas before expanding surface area
5. Build premium shareability and retention loops after the core is excellent

**Deploy:** NOT deployed.

**Next steps:**
1. Turn the strategy memo into a ranked implementation backlog
2. Start with quick wins on Today, logging, and post-save reward/share moments

## 2026-03-07 - Session 20: Strict iOS Launch Readiness Audit

**Why:** User clarified that the immediate goal is App Store launch readiness, not general roadmap planning.

**What was verified:**
- Re-checked the actual native project files in `ios/`, not just prior notes
- Confirmed Capacitor/iOS wrapper exists, including:
  - `capacitor.config.ts`
  - `ios/App/App/Info.plist`
  - icon asset catalog
  - launch storyboard
- Re-ran local verification:
  - `npm run build`
  - `npm run cap:sync`

**What was found:**
- Launch readiness is **NOT complete**
- Current blocking issues:
  1. local build is failing again
  2. `cap:sync` fails because the build fails
  3. native camera/photo permission strings are missing from `Info.plist`
  4. no public privacy-policy URL is prepared
  5. no public support URL is prepared
  6. no macOS/Xcode/TestFlight validation has been done

**Important notes:**
- The in-app privacy page exists in source, but that is not the same as a public URL usable in App Store Connect
- Screenshot base assets already exist and are a good starting point for App Store submission assets

**Deploy:** NOT deployed.

**Next steps:**
1. Restore `npm run build` to green
2. Add native permission metadata
3. Prepare public privacy/support URLs
4. Then move to Xcode/TestFlight validation

## 2026-03-07 - Session 21: Cowork Letter Response + Build Repair

**Why:** User asked Codex to read the direct Cowork letter in `CODEX_FINDINGS.md`, answer all five questions, and fix the broken build before anything else.

**What changed:**
- Read the full cross-agent letter and appended a direct reply under:
  - `### Codex Response to Cowork (2026-03-07)`
- Added explicit answers covering:
  - agreement/disagreement on priorities
  - current build diagnosis
  - ownership boundaries
  - proposed division of labor
  - a simple file-claim protocol for high-conflict files
- Repaired the active build regression in `src/pages/TimerPage.tsx`
  - restored optional `onClose` prop expected by `TodayPage.tsx` and `MorePage.tsx`
  - removed stale unused imports/state
  - replaced `NodeJS.Timeout` typing with `ReturnType<typeof setInterval>`
  - corrected workout save `scoreUnit` to `time`

**Verification:**
- `npm run build` passed
- `npm run cap:sync` passed

**Important note:**
- One earlier `vite` out-dir permission failure happened only because `build` and `cap:sync` were run in parallel against the same `dist/` folder during verification. Sequential checks are clean.

**Deploy:** NOT deployed.

**Next steps:**
1. Add native iOS permission strings
2. Prepare public privacy/support URLs
3. Then choose whether to start streak/readiness centralization or continue launch blockers first

## 2026-03-07
- Added `src/hooks/useStreak.ts` and `src/hooks/useReadiness.ts` to centralize Today-page streak/readiness logic for upcoming UI work.
- Published the exact TypeScript hook interfaces back to `CODEX_FINDINGS.md` so Cowork can finalize `StreakRing` and `ReadinessCard` against stable contracts.
- Confirmed `npm run build` passes after the new hooks.
- Next: wire the hooks into `TodayPage.tsx` after Cowork finishes the presentational components.

## 2026-03-07
- Restored `src/pages/TimerPage.tsx` from the simplified timer back to the richer CrossFit WOD timer flow after the user rejected the stripped-down version.
- The restored timer again supports advanced AMRAP/For Time config (minutes, seconds, sets, rest toggle, rest minutes/seconds), EMOM/Tabata config, preset CRUD, and the active timer states.
- Kept `onClose` optional so Today/More entry points still compile.
- Also removed two unused locals from `src/components/ReadinessCard.tsx` so the project remains buildable under strict TypeScript.
- Verified `npm run build` passes.

## 2026-03-07
- Polished `src/pages/TimerPage.tsx` so the WOD Timer setup feels more premium while preserving the exact CrossFit AMRAP details the user requires.
- Main UI changes:
  - better hierarchy in the setup header
  - session summary strip
  - redesigned adjuster cards
  - stronger rest toggle block
  - sticky bottom summary + start action above the tab bar
  - slightly richer active timer presentation
- Also fixed `src/services/firebase.ts` type narrowing so the project still builds under strict TypeScript.
- Verified `npm run build` passes.

## 2026-03-07
- Finished the WOD timer active-state pass after the earlier setup polish.
- Updated `src/pages/TimerPage.tsx` so countdown/work/rest/done now feel more premium and easier to read while training: stronger phase identity, larger timer stage, clearer status blocks, and a progress strip under the ring.
- Tuned `src/hooks/useTimerAudio.ts`, `src/hooks/useTimerVoice.ts`, and `src/hooks/useTimerEngine.ts` so cues feel more like a real box timer with shorter spoken commands and cleaner go/rest/done patterns.
- Applied a minimal enum-casing fix in `src/hooks/useCelebrationShare.ts` to unblock build verification.
- Verified `npm run build` passes.

## 2026-03-07
- Ran a real local mobile-browser QA pass on the WOD Timer setup screen and captured `C:/ClaudeWork/Imu/trackvolt-timer-amrap-mobile-check.png`.
- Improved `src/pages/TimerPage.tsx` again to make the setup look more elite and readable:
  - replaced broken `??` markers with a consistent icon system
  - added a compact work / sets / rest stat row
  - improved session summary wording for single-effort modes
  - fixed the start button label and strengthened footer copy
- Applied a minimal `src/pages/TodayPage.tsx` prop fix so the build stays green.
- Verified `npm run build` passes.

## 2026-03-07
- Added a premium UI/UX pass to the WOD Timer setup screen in `src/pages/TimerPage.tsx`.
- Changes focused on wow factor without removing the CrossFit fields:
  - `Timer Protocol` hero framing
  - clearer spec-card treatment for work / sets / rest
  - richer sticky CTA dock and stronger spacing
  - full-screen timer states now mark themselves so global overlays can back off
- Updated `src/components/InstallPrompt.tsx` so the install banner suppresses itself when a full-screen workout tool is open.
- Verified with a clean mobile-browser capture at `C:/ClaudeWork/Imu/trackvolt-timer-amrap-mobile-final.png`.
- Verified `npm run build` passes.

## 2026-03-07
- Ran a broader external innovation scan across official health/fitness companies plus some Reddit user-sentiment threads.
- Converted the results into a 60-idea TrackVolt innovation bank inside `CODEX_FINDINGS.md` so Claude can review and choose what is worth shipping.
- Highest-leverage themes from the scan:
  - readiness / daily decision layer
  - event and benchmark intelligence
  - session-aware fueling
  - women�s physiology + privacy trust
  - coachable share cards
  - cross-domain timeline and explainable scores

## 2026-03-07
- Performed a deeper local audit to separate immediate engineering/product issues from later strategic improvements.
- Main findings saved to `CODEX_FINDINGS.md`:
  - lint currently fails badly even though build passes
  - `useStore.ts` remains over-centralized and loosely typed in sync/import paths
  - several critical files are already too large for safe iteration
  - test coverage is nearly absent
  - iOS/App Store blockers still remain outside the web build
- Recommended order remains: stabilize engineering quality, clear launch blockers, then improve the Today decision layer and event/benchmark retention surfaces.

## 2026-03-07
- Added a new product note to `CODEX_FINDINGS.md` based on the user's Lose It inspiration and Taiwan/China nutrition-data priorities.
- Main recommendation to Claude:
  - yes to easier meal logging
  - yes to official Taiwan nutrition data immediately
  - yes to Apple Health / Health Connect import planning
  - yes to weight/fat-loss goal projection
  - yes to exercise search/create, but only as a hybrid-athlete exercise library rather than a generic calorie-burn module
- Important nuance recorded: Taiwan data looks immediately actionable from official open data, while mainland China nutrition data likely needs a more careful/possibly licensed approach.

## 2026-03-07
- Added a concrete `must do now / should do next / later` implementation board for the Lose It-inspired priorities.
- The board maps nutrition speed, Taiwan data, goal projection, Apple Health sync, exercise library, and later China-data work to exact TrackVolt files so Claude can decide sequencing without re-auditing the codebase.

## 2026-03-07
- Improved the clarity of `kg / lbs` controls in the CrossFit logging flow.
- Updated `src/components/log/WorkoutLogger.tsx` so the top unit toggle is larger, easier to tap, and has more visual separation between `kg` and `lbs`.
- Also widened and strengthened the unit selector in `src/pages/MovementPRPage.tsx` so `kg / lb / rep / sec / m` choices read more clearly.
- Verified `npm run build` passes.

## 2026-03-07
- Reordered the CrossFit weight-unit toggle so `lbs` appears first in the logger UI while preserving `lbs` as the existing default state.
- `kg` remains available as a one-tap switch whenever needed.
- Verified `npm run build` passes.

## 2026-03-07
- Improved CrossFit benchmark quick-select behavior in `src/hooks/useWorkoutForm.ts`.
- Re-tapping an already-selected benchmark WOD now clears the benchmark autofill instead of forcing manual text deletion.
- The clear action resets benchmark-driven fields only: WOD name, description, benchmark flag, benchmark picker state, time cap, and auto-added movements.
- Verified `npm run build` passes.

## 2026-03-07 - Strength Rep Scheme Recommendation

Context: reviewed the Full Class strength UI in `src/components/log/WorkoutLogger.tsx` and compared current presets against common CrossFit heavy-day patterns.

Recommendation:
- Keep core default presets focused on universally recognizable class-strength patterns:
  - `5 x 5` -> `5-5-5-5-5`
  - `5 x 3` -> `3-3-3-3-3`
  - `5 x 2` -> `2-2-2-2-2`
  - `5 x 1` -> `1-1-1-1-1`
  - `3 x 8` -> `8-8-8`
  - `Wave 3/2/1` -> `3-3-3-2-2-1-1`
- Move `6-6-6-6-6` and `12-12-12-12` out of the primary preset row. They are valid but read more like volume/accessory presets than default class-strength presets.
- Keep custom text entry for any non-standard programming.

UI/UX recommendation for this page:
- Show human-readable chips like `5 x 5`, not only raw dashed strings.
- Auto-sync `Sets` from the selected scheme so the user cannot choose mismatched values.
- Make the rep scheme row wrap or use a 2-row grid instead of a cramped horizontal rail.
- Default strength weight logging to one clear `Work Weight` / `Top Set` field, with `Start -> End` as an advanced/progression option.
- Rename `Every` to `Interval` or `Every 2:00` style wording for clearer scanning.

Reasoning:
- Official CrossFit heavy-day examples strongly support repeated 5s, 3s, 2s, and singles, while higher-rep work exists but is better treated as secondary volume/accessory work.

## 2026-03-07 - Strength Logging Simplification

Updated `src/components/log/WorkoutLogger.tsx` strength programmed-sets UX to reduce decision load.

Changes:
- Replaced raw rep-scheme chips with coach-style presets:
  - `5 x 5`, `5 x 3`, `5 x 2`, `5 x 1`, `3 x 8`, `Wave 3/2/1`
- Each preset now auto-fills both `strengthRepScheme` and `strengthSets`
- Manual rep-scheme entry now auto-counts set total from dashed input
- Renamed `Every` label to `Interval`
- Added helper copy so users understand that tapping a preset fills the strength prescription

Reason:
- Strength logging should read like a class prescription, not make users mentally translate dashed strings into set count.

Verification:
- `npm run build` passes

## 2026-03-07 - Strength Movement Quick Pick

Updated `src/components/log/WorkoutLogger.tsx` strength movement entry to reduce typing.

Changes:
- Added quick-pick chips for major strength lifts:
  - Back Squat, Front Squat, Deadlift, Strict Press, Push Press, Push Jerk, Bench Press, Power Clean, Squat Clean, Power Snatch, Squat Snatch, Clean & Jerk
- Added `All Lifts` expandable picker with search powered by `src/data/movements.json`
- Strength movement can now be selected from the library or typed manually
- Re-tapping an active quick-pick or active picker item clears it

Reason:
- Common strength movements should be one tap away. Users should not need to type repeated class lifts manually.

Verification:
- `npm run build` passes

## 2026-03-07 - Strength to WOD Section Boundary Polish

Updated `src/components/log/WorkoutLogger.tsx` to improve the transition from Strength to WOD.

Changes:
- `% of 1RM` is now treated as a strength footer with:
  - top padding
  - subtle divider line
- WOD section now gets extra top margin when it appears below Strength in Full Class mode

Reason:
- The previous layout visually glued Strength and WOD together, making the page feel dense and harder to scan.
- Strength now closes cleanly before WOD starts.

Also fixed unrelated project build issue:
- Removed dead `initializeDB` import and call from `src/App.tsx`
- `src/db/database.ts` exports `db` only; the old initializer no longer exists

Verification:
- `npm run build` passes

## 2026-03-07 - Build to Heavy Label Simplification

Updated the Full Class / Strength "Build to Heavy" choices to remove duplicate labels.

Changes:
- UI options are now only: `1RM`, `3RM`, `5RM`
- Removed redundant duplicates: `Heavy Single`, `Heavy 3`, `Heavy 5`
- Default build target is now `1RM`
- Old saved values are normalized on load:
  - `Heavy Single` -> `1RM`
  - `Heavy 3` -> `3RM`
  - `Heavy 5` -> `5RM`

Reason:
- The old UI showed two names for the same target, which made the page look noisier and harder to scan.

Verification:
- `npm run build` passes

## 2026-03-07 - Build Target Labels: Coach Language in UI

Updated strength build-target UX to use coach-language labels in the logger:
- `Heavy Single`
- `Heavy Triple`
- `Heavy 5`

Implementation details:
- `useWorkoutForm.ts`
  - default build target reverted to `Heavy Single`
  - old saved values normalize to current UI labels:
    - `1RM` or `Heavy Single` -> `Heavy Single`
    - `3RM`, `Heavy 3`, or `Heavy Triple` -> `Heavy Triple`
    - `5RM` or `Heavy 5` -> `Heavy 5`
- `usePRDetection.ts`
  - still maps build targets to PR metric types `1rm` / `3rm` / `5rm`
- `WorkoutLogger.tsx`
  - selector buttons now show only coach-facing labels

Reason:
- Coach instructions should read like the whiteboard.
- PR/history/analytics should continue to use standard RM metrics.

Verification:
- `npm run build` passes

## 2026-03-07 - WOD Movements Above Score

User clarified via screenshot that in the Full Class / WOD area, the `Movements` block should appear above `Score` (`Rounds / + Reps`).

Implemented in `src/components/log/WorkoutLogger.tsx`:
- extracted the WOD movements editor into a reusable section
- moved it above the score card in the WOD layout
- preserved existing movement behavior and controls

Reason:
- Matches the user's intended mental flow for WOD logging in Full Class mode.
- Implemented directly from screenshot feedback rather than inferred redesign.

Verification:
- `npm run build` passes

## 2026-03-07 - CrossFit Logger WOD Polish

Refined the Full Class / WOD section in src/components/log/WorkoutLogger.tsx without changing the core logging flow.

Changes:
- Upgraded the Movements block to behave like a real summary area:
  - empty state is now a tappable premium add card instead of plain helper text
  - filled state now shows movement count, quick preview chips, and an Edit action
- Added a compact pre-save summary card above the main save button so users can confirm the session at a glance
- Relaxed the lower action stack with better spacing between RX / Scaled / Elite, PR / Benchmark, notes, and save

Why:
- CrossFit logging should feel fast and readable when the athlete is tired.
- The WOD area needs to explain itself without forcing the user to parse a dense form.

Verification:
- 
pm run build passed.

## 2026-03-07 - Movements Empty State Simplification

Refined the WOD Movements empty state in src/components/log/WorkoutLogger.tsx.

Changes:
- Removed the duplicate large + icon inside the empty card
- Kept the single primary Add action in the section header on the right
- Updated helper copy so the empty card points users to the right-side action

Why:
- The previous empty state showed two competing add controls for the same job.
- Keeping one clear add action is cleaner and easier to understand.

## 2026-03-07 - Movements Empty State Copy Update

Updated the WOD Movements empty-state helper text in src/components/log/WorkoutLogger.tsx.

Change:
- Replaced Use the Add button... with Tap here... because the entire empty card is clickable.

Why:
- The copy should match the actual interaction model.
- This makes the empty state clearer on mobile.

## 2026-03-07 - Contextual Movements Header Action

Adjusted the WOD Movements header action in src/components/log/WorkoutLogger.tsx.

Changes:
- Empty state: removed the redundant right-side Add button
- Picker open: header now shows Close
- Movements already added: header shows Add so users can append more

Why:
- The empty card itself is the primary add action when no movements exist.
- The header action should only appear when it adds value.

## 2026-03-07 - Full Class Strength to WOD Boundary Cleanup

Refined the Full Class Strength -> WOD transition in src/components/log/WorkoutLogger.tsx.

Changes:
- Increased the vertical separation between the Strength and WOD cards
- Added a subtle divider line between the two sections in Full Class
- Softened both section shells so Strength and WOD feel calmer and less noisy
  - Strength now uses a deeper muted purple shell
  - WOD now uses a deeper muted cyan shell

Why:
- Margin alone was not enough. The two sections looked too visually similar and too tightly stacked.
- The page now reads as two clear phases: lift first, WOD second.

## 2026-03-07 - CrossFit-First WOD Visual Simplification

Refined the top of the Full Class / WOD area in src/components/log/WorkoutLogger.tsx to better match TrackVolt's CrossFit-first purpose.

Changes:
- Softened the Scan and All buttons so they no longer compete with the form
- Wrapped the benchmark quick-select row in a calmer shell with a small Popular Benchmarks label
- Reduced benchmark chip intensity and size to lower visual noise
- Upgraded the score card with a calmer premium shell and a small helper line (Rounds plus extra reps, Finish time, etc.)
- For AMRAP, the score inputs now sit inside clearer sub-cards for Rounds and + Reps

Why:
- The WOD logger should feel like a premium coaching console, not a dense control panel.
- CrossFit users need fast recognition and low-fatigue interaction after class.

Verification:
- 
pm run build passed.

## 2026-03-07 - Movements Empty Card CTA Cue

Refined the empty WOD Movements card in src/components/log/WorkoutLogger.tsx.

Changes:
- Added a visible + cue inside the empty state card on the right
- Kept the card itself as the single primary click target while the movements list is empty

Why:
- The empty state now signals the action more clearly without reintroducing a separate header Add button.

## 2026-03-07 - WOD Empty State + Save Area Refinement

Finished a final polish pass on the Full Class / WOD section in src/components/log/WorkoutLogger.tsx.

Changes:
- Empty movements copy now reads No WOD movements added yet, with WOD visually tied to the section color
- Save summary card was softened to a calmer premium shell
- Main save button was adjusted to feel cleaner and less harsh while remaining the primary CTA

Why:
- The wording now feels more CrossFit-specific.
- The save area should feel confident and premium, not overly bright or noisy.
# 2026-03-07

## Brand / first-screen logo update
- Replaced the old inline `T` bolt mark on the first app surfaces with the TrackVolt orange wordmark/bar hero image.
- Updated:
  - `src/pages/OnboardingPage.tsx`
  - `src/components/LoadingSpinner.tsx`
- Kept the existing `public/og-image.png` as the source asset because it already matches the desired WhatsApp/brand-preview treatment.
- `npm run build` passed.
## 2026-03-07 - Full Class restore on current HEAD

Restored the agreed Full Class improvements in `src/components/log/WorkoutLogger.tsx` on top of the current branch state after a later commit had removed part of the work.

Restored:
- `lbs` shown first in the unit toggle with clearer spacing/tap targets
- Strength quick picks plus `All Lifts` picker
- readable strength presets (`5 x 5`, `5 x 3`, `5 x 2`, `5 x 1`, `3 x 8`, `Wave 3/2/1`) with auto-fill for `Sets`
- `Build to Heavy` cleaned back to `Heavy Single`, `Heavy Triple`, `Heavy 5`
- clearer Strength -> WOD separation in Full Class
- WOD `Movements` block restored with contextual header action and clickable empty state card
- WOD `Score` block restored below `Movements` with clearer AMRAP helper copy

Verification:
- `npm run build` passed
