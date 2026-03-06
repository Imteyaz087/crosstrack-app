# TrackVolt App — Master Project Document
**Owner:** Aron (yimuren1@gmail.com)
**Last Updated:** March 5, 2026 — Session 3
**Purpose:** Complete project memory backup — read this at the start of every new session

---

## 1. What Is This App?

**TrackVolt** is a fitness Progressive Web App (PWA) for CrossFit, HYROX, and general athletic performance tracking. Premium dark theme with volt green (#C8FF00) brand identity.

- **Live URL:** https://trackvolt.app
- **Brand name:** TrackVolt (internal project name: CrossTrack)
- **Target users:** CrossFit athletes, HYROX competitors, fitness-focused people
- **Vision:** Apple Design Award-worthy fitness app — clean, dark, fast

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa |
| State Management | Zustand 5 |
| Local Database | Dexie (IndexedDB wrapper) — CrossTrackDB v6, 16 tables |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | react-i18next (en + zh-TW + zh-CN) |
| Date Utils | date-fns |
| Routing | React Router DOM v7 |
| Deployment | Vercel (project: "crosstrack") |
| Domain | trackvolt.app (Namecheap) |

---

## 3. Deployment & Infrastructure

### Vercel
- **Dashboard:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack
- **Project ID:** prj_HRKKptQiVRpYrBtmsCVahz3Zv7ah
- **Org ID:** team_S7ukXJeYnSsExx3B9QOmqqMD
- **Last known good deployment:** GTeJwY1rw

### How to Deploy (requires "CONFIRM DEPLOY" from user)
1. `npm run build` → must pass with zero errors
2. `npx vercel --prod` from project root
3. If token error: `npx vercel login` first

### Emergency Rollback
1. Go to Vercel deployments page
2. Find deployment **GTeJwY1rw** → ... → Promote
3. Hard refresh: Ctrl+Shift+R (PWA caches aggressively)

---

## 4. Source Code Location & Structure

**Path:** `C:\ClaudeWork\Imu\TrackVolt-App\`

```
src/
  App.tsx              — Root component, tab routing via Zustand activeTab
  main.tsx             — Entry point
  index.css            — Design tokens (CSS custom properties)
  components/
    TabBar.tsx         — Bottom 5-tab navigation (Today/Train/Log/Eat/More)
    MacroBar.tsx       — Vertical macro progress bar
    PlaceholderPage.tsx — (UNUSED — all pages now real implementations)
  pages/               — ALL 23 pages are REAL implementations
    TodayPage.tsx      — Home dashboard
    LogPage.tsx        — Multi-step CrossFit logging, meals, metrics
    TrainingPage.tsx   — Calendar + program + PRs
    NutritionPage.tsx  — Meal tracking by type
    MorePage.tsx       — Sub-navigation hub (18 sub-pages)
    --- Training sub-pages ---
    WorkoutHistoryPage.tsx   — Search, stats, workouts grouped by month
    WeeklyPlannerPage.tsx    — 7-day training planner
    PRWallPage.tsx           — PR showcase with stats, categories, timeline
    MovementPRPage.tsx       — Individual movement PR tracking (barbell/gymnastics/etc)
    WorkoutTemplatesPage.tsx — Benchmark WODs catalog (40+ Girls/Heroes/Open)
    BenchmarkPage.tsx        — User's logged benchmark results
    --- Body & Nutrition sub-pages ---
    MealPrepPage.tsx         — Meal template management
    GroceryPage.tsx          — Weekly grocery checklist
    BodyMeasurementsPage.tsx — 11 body measurements with trends
    HeartRatePage.tsx         — Resting HR + zone logging
    --- Training Insights sub-pages ---
    AICoachPage.tsx          — Training insights computed from data
    ProgressPage.tsx         — Charts, streaks, body composition
    AchievementsPage.tsx     — 12 gamification badges, 5 categories
    PhotoLogPage.tsx         — Photo capture with IndexedDB storage
    --- Timer & Tools ---
    TimerPage.tsx            — AMRAP/EMOM/Tabata/For Time timer
    CalcPage.tsx             — 1RM calculator
    --- App ---
    CloudSyncPage.tsx        — Export/import JSON backup, data integrity
    SettingsPage.tsx         — Profile, targets, language, export/import
  stores/
    useStore.ts        — Zustand global state + all DB operations
  db/
    database.ts        — Dexie DB schema (v6, 16 tables) + seed data
  types/
    index.ts           — All TypeScript interfaces
  data/
    benchmarkWods.ts   — 16 benchmark WODs seed data
  utils/
    macros.ts          — Macro calculation helpers
  i18n/
    en.ts, zh-TW.ts, zh-CN.ts, index.ts
```

### Dev Commands
```bash
npm run dev      # Start dev server (localhost:5174)
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
```

---

## 5. Design System

### Brand Colors (CSS Custom Properties)
```css
--volt:       #C8FF00   /* PRIMARY accent — volt green */
--bg-app:     #0D0D14   /* Page background */
--bg-card:    #13131E   /* Cards */
--bg-raised:  #1A1A28   /* Elevated elements, inputs */
--border:     rgba(255,255,255,0.06)
--text-primary:   #F0F0F8
--text-secondary: #8888A0
--text-muted:     #50505E
```

### CSS Utility Classes
- `glass-card` — standard card with glass-morphism
- `tap-target` — touch-friendly interactive element
- `page-enter` — page entry animation
- `stagger-1` through `stagger-6` — staggered entry animations

### Design Principles
- Dark first, volt green as only accent (sparingly)
- Rounded corners, no shadows — depth via layered backgrounds
- Mobile first, max-width 512px, bottom tab bar
- Log button: center, raised, gradient violet-to-blue

---

## 6. Database Schema (Dexie / IndexedDB)

Database: `CrossTrackDB` — Version 6 — 16 tables

| Table | Indexes | Purpose |
|---|---|---|
| dailyLogs | date | Weight, sleep, water, energy per day |
| workouts | date, workoutType, name, isBenchmark, prFlag | All logged workouts |
| foodLibrary | name, category, isCustom | Pre-seeded food database (211 items) |
| mealLogs | date, mealType, foodId | Individual food entries |
| mealTemplates | name, mealType | Saved meal templates (6 seeded) |
| groceryItems | category, weekStartDate, isChecked | Weekly grocery list |
| programDays | weekNumber, dayOfWeek | 4-week training program |
| settings | — | User profile and targets |
| movementPRs | movementName, category, date | Individual movement PRs |
| benchmarkWods | name, category | Benchmark WOD catalog (16 seeded) |
| timerPresets | name, mode | Timer presets |
| cycleEntries | date | Cycle tracking |
| bodyMeasurements | date, metric | Body measurements |
| heartRateLogs | date | Heart rate logs |
| photoLogs | date, workoutId | Photo logs |
| achievements | type, unlockedAt | Achievement badges |

---

## 7. Key Interfaces (from types/index.ts)

- `Workout` — id, date, workoutType (WodType), name, scoreDisplay, rxOrScaled, prFlag, isBenchmark, movements, loads, notes
- `MovementPR` — movementName, category, prType, value, unit, previousBest, date
- `FoodItem` — name, category, calories, protein, carbs, fat, fiber, servingSize
- `MealLog` — date, mealType, foodId, foodName, grams, calories, protein, carbs, fat
- `MealTemplate` — name, mealType, items (foodId, foodName, grams)
- `DailyLog` — date, weight, sleep, water, energy, notes
- `UserSettings` — name, weight, goal, trainingTime, calorieTarget, macros, waterTarget, language
- `Achievement` — type, unlockedAt
- `BodyMeasurement` — date, metric, value, unit
- `HeartRateLog` — date, type (resting/zone), bpm, zone
- `PhotoLog` — date, workoutId, blobRef

WodType = 'AMRAP' | 'ForTime' | 'EMOM' | 'Chipper' | 'Strength' | 'StrengthMetcon' | 'Other'
RxScaled = 'RX' | 'Scaled'

---

## 8. Production vs Local Parity — CRITICAL GAP ANALYSIS (Session 3)

### Menu Structure: IDENTICAL
Both production and local have the same 18-item More menu in 6 sections.

### ⚠️ MAJOR FINDING: Local is MISSING ~30+ files from production!

The Vercel deployment GTeJwY1rw (current production) has significantly MORE code than the local copy. The local code appears to be an EARLIER version that was then heavily enhanced before deployment.

#### Missing Root-Level Files/Folders
| Item | Type | What It Is |
|---|---|---|
| `api/barcode-lookup.ts` | Serverless | Vercel serverless proxy for OpenFoodFacts barcode API |
| `api/nutrition-search.ts` | Serverless | Vercel serverless proxy for USDA FoodData Central |
| `check-imports.cjs` | Script | Build verification script |
| `verify-store-usage.cjs` | Script | Store usage verification script |
| `eslint.config.js` | Config | ESLint configuration |
| `research/` | Folder | Research files |
| `scripts/` | Folder | Utility scripts |
| `.netlify/` | Folder | Netlify config (probably legacy) |

#### Missing src/hooks/ (11 hooks — ENTIRE folder missing!)
| Hook | Purpose |
|---|---|
| `useAchievement...` | Achievement detection/unlocking |
| `useCountUp.ts` | Animated number counting |
| `useCycleTracki...` | Cycle/period tracking |
| `useHaptic.ts` | Haptic feedback for interactions |
| `usePRDetection...` | Auto-detect PRs in workouts |
| `useStreakCeleb...` | Streak celebration UI |
| `useTimerAudio...` | Timer audio cues |
| `useTimerEngine...` | Core timer logic |
| `useTimerVoice...` | Voice announcements for timer |
| `useUnsavedChan...` | Warn before leaving with unsaved data |
| `useWorkoutForm...` | Workout form state management |

#### Missing src/services/ (3 files — ENTIRE folder missing!)
| Service | Purpose |
|---|---|
| `firebase.ts` | Firebase integration |
| `gemini.ts` | Gemini AI integration (WOD scanner?) |
| `nutritionApi.ts` | Client-side nutrition API service with IndexedDB caching |

#### Missing src/components/ (~15+ components)
Production has sub-folders and many more components:
- **`log/` subfolder** — BarcodeScanner, MealLogger, CustomFoodCreator (meal logging UI)
- **`sharecard/` subfolder** — Share card generation
- `AchievementToast.tsx` — Toast for unlocked achievements
- `ConfirmDialog.tsx` — Reusable confirmation dialog
- `CycleTrainingC...tsx` — Cycle training component
- `EmptyState.tsx` — Reusable empty state component
- `ErrorRetry.tsx` — Error with retry button
- `InstallPrompt.tsx` — PWA install prompt (local has InstallBanner.tsx)
- `LoadingSpinner.tsx` — Loading indicator
- `OnboardingTour.tsx` — First-time user tour
- `PRToast.tsx` — PR notification toast
- `ReviewPrompt.tsx` — App review prompt
- `SaveCelebration.tsx` — Save celebration animation
- `SaveToast.tsx` — Save confirmation toast
- `SectionLabel.tsx` — Section label component
- `SkeletonCard.tsx` — Loading skeleton
- `SleepDetailCard.tsx` — Sleep tracking card
- `SleepImportHandler.tsx` — Sleep data import
- `UndoToast.tsx` — Undo action toast
- `WeeklySummary.tsx` — Weekly summary component

#### Missing src/test/ — ENTIRE folder missing

#### Missing src/design-tokens.json — Design token file

#### Page Implementation Differences
- **AchievementsPage**: Production has 60 achievements with Bronze/Silver/Gold tiers + progress bars connected to real data. Local has 12 hardcoded badges with simpler UI.
- **Other pages**: Likely have differences too — production versions use the hooks and components listed above.

### What Local HAS That Production MAY NOT
- `PlaceholderPage.tsx` (unused component)
- `MacroBar.tsx` (vertical macro bar — may exist differently in production)
- `Toast.tsx` (generic toast — production may use SaveToast/PRToast/UndoToast instead)
- `reference/production.css` (CSS reference file)

### Recovery Strategy
**Option A: Extract all source from Vercel (Recommended)**
1. Log into Vercel → Deployment GTeJwY1rw → Source tab
2. Click each file → copy content → save locally
3. This gives us the EXACT production source
4. Then push to GitHub

**Option B: Use Vercel CLI to download deployment**
1. `npx vercel pull` — downloads project settings and env vars
2. Won't give source code though — source must come from the Source tab

**Option C: Rebuild locally using production as reference**
1. Keep current local code
2. Gradually add missing features by examining production behavior
3. Risk: slow, may introduce bugs

### ⚠️ DO NOT DEPLOY LOCAL CODE — it would OVERWRITE production with a simpler version!

---

## 9. Pending Work / Roadmap

### CRITICAL — Before Anything Else
1. ⚠️ Extract FULL production source from Vercel Source tab (deployment GTeJwY1rw)
2. Replace local files with production versions
3. Push to GitHub (repo exists at https://github.com/Imteyaz087/crosstrack-app — currently EMPTY)
4. Run `npm run build` to verify everything compiles

### After Source Recovery
1. Set up USDA_API_KEY env var in Vercel for nutrition search
2. Test all serverless functions locally
3. Visual polish pass on all pages
4. i18n completeness check

### Future
1. iOS deployment via Capacitor wrapper
2. Cloud sync backend
3. App Store submission
4. HYROX-specific tracking

---

## 10. Critical Files Reference

| File | What It Does | Touch Carefully |
|---|---|---|
| `src/index.css` | All design tokens | Yes |
| `src/stores/useStore.ts` | All state + DB operations | Yes |
| `src/db/database.ts` | DB schema + all seed data | Yes |
| `src/types/index.ts` | All TypeScript types | Yes |
| `src/pages/LogPage.tsx` | Most complex page | Yes |
| `.vercel/project.json` | Vercel project linking | Do not delete |

---

*This document is the single source of truth. Update it every session.*

---

## 2026-03-06 - Session 5 Verification Snapshot

### Confirmed Workspace
- Active source root: `C:\ClaudeWork\Imu\TrackVolt-App`
- Production snapshot folder: `C:\ClaudeWork\Imu\TrackVolt-v2`

### Confirmed Live Production Signals (https://trackvolt.app)
- Framework build output served as Vite SPA (`/assets/index-*.js`, `/assets/index-*.css`)
- PWA manifest exposes shortcuts: `Log Workout`, `WOD Timer`, `Track Nutrition`
- Live marketing/manifest feature claims include: WOD logging, PR tracking, macro tracking, cycle sync, HYROX support, timers, 1RM calculator, achievements, offline-first

### Local Screen Inventory (from `src/App.tsx` + `src/pages/MorePage.tsx`)
- Main tabs: Today, Log, Train, Eat, More
- More screens: Workout History, Weekly Planner, PR Wall, Movement PRs, Benchmark WODs, My Benchmarks, Meal Prep, Grocery, Body Measurements, Heart Rate, Training Insights, Progress, Achievements, Photo to Log, WOD Timer, 1RM Calculator, Cloud Sync, Settings

### Handoff Status
- Git remote configured: `origin -> https://github.com/Imteyaz087/crosstrack-app.git`
- ZIP handoff prepared: `C:\ClaudeWork\Imu\TrackVolt-App.zip`
- ZIP excludes: `node_modules`, `.git`, `dist`

### 2026-03-06 CrossFit Logger Sync
- Local `WorkoutLogger.tsx` was the main parity gap for the CrossFit log flow: the hook and `LogPage` already supported benchmark picking, WOD scan, CrossFit events, previous-result editing, and richer strength metadata, but the rendered component exposed only a stripped-down form.
- The local source now exposes those capabilities in the CrossFit logging UI without changing deploy state.
- Run/Cardio flow remains on the existing dedicated `CardioLogger.tsx` path and still builds successfully.

### 2026-03-06 Live CrossFit Launcher Match
- Local `WorkoutLogger.tsx` step-one screen now follows the live CrossFit launcher structure supplied by the user: headline, close button, `Full Class`, `WOD Only`, `Strength Only`, `CrossFit Events`, and recent editable workouts.
- This was a UI parity update only. No deploy was performed.

### 2026-03-06 Verification Pass
- Reconfirmed source root `C:\ClaudeWork\Imu\TrackVolt-App`
- Reconfirmed stack from code: React 19 + TypeScript + Vite 7 + Tailwind 4 + PWA plugin
- Reconfirmed handoff readiness: Git remote still points to `https://github.com/Imteyaz087/crosstrack-app.git` and ZIP backup still exists at `C:\ClaudeWork\Imu\TrackVolt-App.zip`
- Reconfirmed live production metadata claims: CrossFit WOD logging, PR tracking, macro tracking, cycle sync, HYROX support, timers, 1RM calculator, achievements, offline-first

### 2026-03-06 Deep WorkoutLogger Parity
- Fetched live `LogPage-0NaviZgC.js`, `WorkoutLogger-BYhetOm3.js`, and `CardioLogger-CfeceYK0.js` from `trackvolt.app` to compare against local source before editing.
- Confirmed `CardioLogger.tsx` already matched live production, so Run/Cardio was not the remaining gap in local.
- Upgraded local `WorkoutLogger.tsx` beyond the launcher screen so the deeper CrossFit entry UI now follows the live production pattern: unit-toggle header, gradient Strength/WOD sections, quick benchmark chips, time-cap chips, stepped score controls, richer strength programming/build controls, and polished movement entry.
- `npm run build` passed after the parity patch.

### 2026-03-06 WOD Detail Upgrade
- Live `WorkoutLogger-BYhetOm3.js` still matches the March 6 production bundle hash, so live production remains the reference for CrossFit parity work.
- `src/components/log/WorkoutLogger.tsx` now adds more detail density to the main WOD workflow:
  - inline class-format toggle in step two so the user can switch between `Full Class`, `WOD Only`, and `Strength Only` without backing out
  - expanded quick benchmark rail to include the broader live-style set (`Fran`, `Cindy`, `Grace`, `Helen`, `Murph`, `DT`, `Annie`, `Karen`, `Diane`, `Jackie`, `Fight Gone Bad`, `Filthy Fifty`, `Nancy`, `Angie`)
  - inline benchmark detail card showing category, score type, scheme, movement tags, RX/Scaled standards, elite target, and effective time cap
  - larger step-two title treatment to make the WOD / full workout view feel closer to the live main flow
- `npm run build` passed after the change.

### 2026-03-06 Local-vs-Live Audit
- Live production shell still uses `index-Cny5lKgo.js` and lazy-loads the same top-level page set the local source currently exposes: Today, Log, Train, Eat, More, and Onboarding.
- Live `MorePage-ClAdLFQh.js` matches the local `MorePage.tsx` subpage inventory and ordering for Workout History, Weekly Planner, PR Wall, Movement PRs, Benchmark WODs, My Benchmarks, Meal Prep, Grocery, Body Measurements, Heart Rate, Training Insights, Progress, Achievements, Photo Log, Timer, Calculator, Cloud Sync, and Settings.
- Live `LogPage-0NaviZgC.js` still lazy-loads the same logger suite present locally: WorkoutLogger, HyroxLogger, CardioLogger, BarcodeScanner, CustomFoodCreator, EventLogger, ShareCardExporter, WodScanner, WodScanReview, CycleLogger, and CycleOnboarding.
- The biggest remaining local parity gap is packaging, not page wiring: local `vite.config.ts` / `manifest.webmanifest` reference live asset paths (`/icon-192.png`, `/icon-512.png`, `/screenshots/*.png`) that are not yet present in local `public/` or `dist/` under those names.
- Portability audit found no absolute path leaks outside `C:\ClaudeWork\Imu\` in source/config/docs, but there is still no `.env.example` for Firebase / USDA env expectations.
- Capacitor is not integrated yet: no `@capacitor/*` packages, no `capacitor.config.*`, and no `ios/` project.

### 2026-03-06 PWA Asset Parity Fix
- Local packaging parity is now aligned with the live manifest paths:
  - added `public/icon-192.png`
  - added `public/icon-512.png`
  - added `public/icon-512-maskable.png`
  - added `public/screenshots/` with `today-dashboard.png`, `workout-log.png`, `nutrition-macros.png`, `progress-prs.png`, `cycle-training.png`, `achievements.png`, and `offline-first.png`
- These assets were pulled into the project so the copied workspace stays self-contained inside `C:\ClaudeWork\Imu\`.
- `npm run build` passed after the asset sync, and local `dist/` now contains the same manifest asset paths that live production serves.

### 2026-03-06 Audit Coordination Rule
- Cross-agent startup now requires reading `LIVE_APP_AUDIT.md` in addition to the memory files and `CODEX_SYNC.md`.
- Purpose: keep both agents aligned on the latest saved live-app audit before any local edits.

### 2026-03-06 Today and Log Parity Audit
- Fetched and checked the current live chunks:
  - `index-Cny5lKgo.js`
  - `TodayPage-DNaUIE2-.js`
  - `LogPage-0NaviZgC.js`
- Confirmed current local parity for:
  - `src/pages/TodayPage.tsx`
  - `src/pages/LogPage.tsx`
  - `src/components/log/LogModeSelector.tsx`
- Verified parity scope:
  - Today dashboard shell, quick tools, workout hero card, weekly summary, latest PR, cycle sync card, recovery score, macros card, body metrics, suggestion card, training insights card, grocery preview
  - Log page lazy logger wiring and the visible mode-selector grid sections (`Training`, `Body & Nutrition`, `Wellness & Recovery`) plus quick templates
- Outcome: no new Today/Log source gap found in this pass. Remaining tracked work stays outside these screens: portability setup docs and future Capacitor/iOS wrapper prep.

### 2026-03-06 Portability Env Setup
- Added `.env.example` in the project root with the confirmed env surface:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `USDA_API_KEY`
- Updated `.gitignore` so real env files stay local but `.env.example` remains tracked.
- Updated `README.md` with the portable local setup flow: copy `.env.example` to `.env.local`, keep secrets local, and treat Firebase / USDA configuration as optional until provided.

### 2026-03-06 Capacitor Bootstrap
- Installed Capacitor packages:
  - `@capacitor/core@8.1.0`
  - `@capacitor/cli@8.1.0`
  - `@capacitor/ios@8.1.0`
- Added `capacitor.config.ts`:
  - `appId: app.trackvolt`
  - `appName: TrackVolt`
  - `webDir: dist`
- Generated the native `ios/` wrapper inside `C:\ClaudeWork\Imu\TrackVolt-App\ios`
- Added package scripts:
  - `npm run cap:sync`
  - `npm run cap:copy`
- Updated `README.md` with the Capacitor/iOS workflow and the macOS-only boundary for Xcode build/open steps
- Verification:
  - `npm run cap:sync` passed on Windows
  - current web assets now sync into `ios/App/App/public`

### 2026-03-06 CrossFit Timer and Movement Parity
- Re-audited the live CrossFit surface using the current production bundles:
  - `TimerPage-Dv8_lL0f.js`
  - `WorkoutLogger-BYhetOm3.js`
- Confirmed two real parity gaps behind live production:
  - local `src/pages/TimerPage.tsx` was still the older simplified timer
  - local `src/data/movements.json` only contained 11 movements while live used a much larger picker dataset
- Synced the full live movement dataset into `src/data/movements.json`:
  - 165 movements
  - 7 categories: weightlifting, gymnastics, monostructural, kettlebell, dumbbell, bodyweight, odd-objects
- Updated `src/components/log/MovementPicker.tsx` so the larger live dataset is usable:
  - avoid in-place sorting of the shared array
  - increase the picker list height to better match the live overlay
- Replaced the older local `src/pages/TimerPage.tsx` UI with the live-style WOD timer flow, backed by the existing local timer hooks:
  - launcher cards for `AMRAP`, `EMOM`, `For Time`, `Tabata`, and `Rest Timer`
  - quick preset list with add, edit, and delete confirmation
  - dedicated configuration screens for each timer mode before start
  - 10-second get-ready countdown
  - voice + beep cues through `useTimerVoice` and `useTimerAudio`
  - work/rest transitions, multi-set handling, EMOM rounds, Tabata rounds, and progress dots
  - live-style running, done, and restart states
- Verification:
  - `npm run build` passed after the sync
  - no deploy performed
