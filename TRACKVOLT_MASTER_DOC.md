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
