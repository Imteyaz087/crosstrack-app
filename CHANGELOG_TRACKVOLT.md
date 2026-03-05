# TrackVolt Changelog
**Purpose:** Record what changed each session. Read before new work.

---

## 2026-03-05 — Session 4: TypeScript Build Fixes

**Why:** `npm run build` was failing with 36+ TypeScript errors. Needed to fix all errors so build passes.

**What was fixed:**
- **AchievementsPage** — Removed unused `useStore`
- **AICoachPage** — `w.isPR` → `w.prFlag`, `w.isRX` → `w.rxOrScaled === 'RX'`, removed unused `consecutiveDays` state
- **BenchmarkPage** — Removed unused `useTranslation`
- **BodyMeasurementsPage** — Removed `useStore`, `getMeasurementsForDate`, `getTrendForMetric`; added `percent` to `getLatestAndFirstForMetric`
- **CloudSyncPage** — Replaced `addToast` usage; `db.meals` → `db.mealLogs`, `db.prLogs` → `db.movementPRs`; fixed `<style jsx>` → `<style>`
- **HeartRatePage** — Removed unused `useTranslation`
- **MealPrepPage** — `db.foods` → `db.foodLibrary`, `db.meals` → `db.mealLogs`; use store’s `addMealFromTemplate`; fixed FoodItem API (`proteinPer100g` etc.) and `fat` vs `fats`
- **MovementPRPage** — Removed unused `useTranslation`
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
