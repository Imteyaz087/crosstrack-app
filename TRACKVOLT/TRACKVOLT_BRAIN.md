# TRACKVOLT BRAIN — Project Memory & Agent Onboarding
> **Read this file FIRST before any work on TrackVolt.**
> Last updated: 2026-03-07

---

## IDENTITY

| Field | Value |
|---|---|
| App Name | TrackVolt |
| Internal Name | CrossTrack |
| Live URL | https://trackvolt.app |
| Owner | Aron (yimuren1@gmail.com) |
| Repo | https://github.com/Imteyaz087/crosstrack-app.git |
| Deploy | Vercel (project: "crosstrack") |
| Domain | trackvolt.app (Namecheap) |
| Vision | Apple Design Award-worthy hybrid athlete OS |

---

## WHAT IS TRACKVOLT?

TrackVolt is a fitness PWA for CrossFit, HYROX, running, and general athletic performance. It combines workout logging, nutrition tracking, recovery scoring, cycle-aware training, timers, achievements, and share cards into one premium dark-themed mobile app.

**Core promise:** One app for hybrid athletes to log, understand, and improve everything that matters.

**Strategic position:** Where category leaders each own one vertical (SugarWOD for CrossFit, Strava for running, MacroFactor for nutrition, WHOOP for recovery), TrackVolt unifies the most-used parts into one faster workflow.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa |
| State | Zustand 5 |
| Database | Dexie 4 (IndexedDB) — CrossTrackDB v6, 16+ tables |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | react-i18next (en, zh-TW, zh-CN) |
| Dates | date-fns |
| Routing | React Router DOM v7 |
| iOS | Capacitor 8.1.0 (ios/ folder exists) |
| Auth | Firebase (optional) |
| AI | Gemini (WOD scanner) |
| API | Vercel serverless (nutrition-search, barcode-lookup) |

---

## SAFETY RULES — NON-NEGOTIABLE

1. **No deploy** without user typing exactly: `CONFIRM DEPLOY`
2. **No destructive ops** (delete/overwrite/reset) without: `CONFIRM DESTRUCTIVE`
3. **No secrets/env changes** without: `CONFIRM SECRETS`
4. **No feature changes** without: `CONFIRM BUILD`
5. Never modify `.vercel/project.json`
6. Never assume local = production (they may differ)
7. Always run `npm run build` before any deploy discussion

**Emergency rollback:** Vercel dashboard → deployment GTeJwY1rw → Promote

---

## SESSION STARTUP PROTOCOL

1. Read `TRACKVOLT/TRACKVOLT_BRAIN.md` (this file)
2. Read `TRACKVOLT/AGENTS.md` for agent-specific rules
3. Read `TRACKVOLT/AI_SYNC/CLAUDE_SYNC.md` or `CODEX_SYNC.md` depending on which agent you are
4. Check `TRACKVOLT/FINDINGS/` for any claims or pending work
5. Run `npm run build` to verify green state before changes
6. Update `TRACKVOLT/CHANGELOG_TRACKVOLT.md` after each session

---

## SOURCE STRUCTURE

**Root:** `C:\ClaudeWork\Imu\TrackVolt-App\`

```
src/
├── App.tsx                 — Root component, tab routing via Zustand
├── main.tsx                — Entry point
├── index.css               — Design tokens (CSS custom properties)
├── pages/ (25 pages)       — All real implementations
│   ├── TodayPage.tsx       — Home dashboard (StreakRing, ReadinessCard, CelebrationOverlay)
│   ├── LogPage.tsx         — Multi-mode logging hub (16 modes)
│   ├── TrainingPage.tsx    — Calendar + programs + PRs
│   ├── NutritionPage.tsx   — Meal tracking by type
│   ├── MorePage.tsx        — Sub-nav hub (18 sub-pages)
│   ├── TimerPage.tsx       — AMRAP/EMOM/Tabata/ForTime WOD timer
│   └── ... (20 more sub-pages)
├── components/ (26 components + 2 subfolders)
│   ├── CelebrationOverlay.tsx  — Full-screen dopamine hit
│   ├── StreakRing.tsx           — SVG arc streak gauge
│   ├── ReadinessCard.tsx       — Recovery readiness gauge
│   ├── TabBar.tsx              — Bottom 5-tab navigation
│   ├── log/ (22 components)    — All logging UIs
│   └── sharecard/              — Share card generation
├── hooks/ (16 hooks)
│   ├── useStreak.ts            — Streak calculation
│   ├── useReadiness.ts         — Readiness/recovery scoring
│   ├── useWorkoutForm.ts       — Workout form state
│   ├── useMealForm.ts          — Meal logging state + API search
│   ├── useCycleTracking.ts     — Cycle/period tracking
│   ├── usePRDetection.ts       — Auto PR detection
│   └── ... (10 more hooks)
├── services/
│   ├── firebase.ts             — Firebase auth/sync
│   ├── gemini.ts               — Gemini AI (WOD scanning)
│   └── nutritionApi.ts         — USDA + OpenFoodFacts client
├── stores/useStore.ts          — Zustand global state + DB ops
├── db/database.ts              — Dexie schema v6 (16+ tables)
├── types/index.ts              — All TypeScript interfaces
├── data/                       — Seed data (movements, benchmarks, achievements)
├── utils/                      — Helpers (macros, emoji)
└── i18n/                       — Translations (en, zh-TW, zh-CN)

api/                            — Vercel serverless functions
├── nutrition-search.ts         — USDA FoodData Central proxy
└── barcode-lookup.ts           — OpenFoodFacts proxy
```

---

## DESIGN SYSTEM

| Token | Value | Usage |
|---|---|---|
| Brand accent | #22d3ee (cyan-400) | Primary actions, active states |
| Legacy volt | #C8FF00 | Sparingly for brand punch |
| bg-app (ct-bg) | #0f172a | Page background |
| bg-card (ct-surface) | #1e293b | Card backgrounds |
| bg-raised (ct-elevated) | #334155 | Elevated surfaces |
| text-primary (ct-1) | #f1f5f9 | Main text |
| text-secondary (ct-2) | #94a3b8 | Supporting text |
| border (ct-border) | rgba(148,163,184,0.15) | Dividers |

**Animations:** Spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)` for dopamine moments.
**Touch targets:** Minimum 44px, all interactive elements.
**Layout:** Mobile-first, max-width 512px, bottom tab bar with raised Log button.

---

## COMPLETE FEATURE LIST

### Logging (16 modes in LogPage)
- CrossFit WOD (AMRAP/ForTime/EMOM/Chipper/Strength with benchmark picker, WOD scanner)
- HYROX race logging (8 stations)
- Cardio/Running (6 types with splits, pace, elevation)
- Meal logging (food search, barcode scanner, custom food, USDA API, templates)
- Body metrics (weight, sleep hours, energy 1-5)
- Water tracking (glass-based visual tracker)
- Recovery logging (readiness, RPE, soreness, resting HR)
- Cycle tracking (period, flow, symptoms, mood, energy, calendar overlay)
- CrossFit Events (Open, Quarterfinals, Semifinals, Games)
- WOD Scanner (Gemini AI photo-to-workout)

### Dashboard (TodayPage)
- StreakRing (SVG arc, weekly progress, freeze support)
- ReadinessCard (composite score from sleep/energy/cycle/training)
- Weekly training summary
- Latest PR display
- Macro progress
- Quick action tiles
- CelebrationOverlay (save/pr/streak/achievement types)

### Training
- Workout history (search, stats, monthly groups)
- Weekly planner (7-day programming)
- PR Wall (showcase with categories, timeline)
- Movement PRs (per-movement tracking)
- Benchmark WODs (40+ Girls/Heroes/Open catalog)
- My Benchmarks (personal benchmark results)

### Nutrition
- Meal tracking by type (breakfast/lunch/dinner/snack)
- Macro targets with progress
- USDA + OpenFoodFacts API search
- Barcode scanner (native BarcodeDetector API)
- Custom food creator
- Meal templates (6 pre-seeded)
- Meal prep planning
- Grocery checklist

### Body & Health
- Body measurements (11 metrics with trends)
- Heart rate logging (resting + zones)
- Photo log (IndexedDB storage)
- Cycle tracking (phase-aware training recommendations, Dr. Stacy Sims research)

### Tools
- WOD Timer (AMRAP/EMOM/Tabata/ForTime/Rest with voice cues)
- 1RM Calculator
- AI Coach (training insights from data)
- Cloud Sync (JSON export/import)

### Gamification
- 60 achievements (Bronze/Silver/Gold tiers, 5 categories)
- Streak system with freeze support
- PR detection and celebration
- CelebrationOverlay for dopamine hits
- Share card generation

---

## CROSS-AGENT COLLABORATION

### Active Agents
- **Claude (Cowork):** Visual audit, UI/UX polish, component wiring, design, documentation
- **Codex:** Build/config, native setup, state centralization, hook contracts

### Protocol
- Claim files before editing (CLAIM/DONE in FINDINGS)
- Cowork owns: presentation, polish, audit, docs
- Codex owns: build, config, native, state centralization
- Both: check FINDINGS before touching shared files
- Conflict resolution: user decides

### Key Shared Files (touch carefully)
- `src/stores/useStore.ts` — All state + DB operations
- `src/db/database.ts` — DB schema + seed data
- `src/types/index.ts` — All TypeScript interfaces
- `src/pages/LogPage.tsx` — Most complex page (539 lines)
- `src/index.css` — Design tokens
- `.vercel/project.json` — Never modify

---

## VERCEL CONFIG

| Field | Value |
|---|---|
| Dashboard | https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack |
| Project ID | prj_HRKKptQiVRpYrBtmsCVahz3Zv7ah |
| Org ID | team_S7ukXJeYnSsExx3B9QOmqqMD |
| Last good deploy | GTeJwY1rw |
| Deployments | https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments |

---

## DEV COMMANDS

```bash
npm run dev          # Dev server (localhost:5174)
npm run build        # tsc --noEmit + vite build
npm run preview      # Preview production build
npm run cap:sync     # Sync web → iOS
npm run cap:copy     # Copy web → iOS
```

---

## DATABASE (Dexie / IndexedDB)

**Database:** CrossTrackDB — Version 6

| Table | Key Indexes | Purpose |
|---|---|---|
| dailyLogs | date | Weight, sleep, water, energy |
| workouts | date, workoutType, name | All logged workouts |
| foodLibrary | name, category | Food database (211+ items) |
| mealLogs | date, mealType | Individual food entries |
| mealTemplates | name, mealType | Saved meal templates |
| groceryItems | category, weekStartDate | Grocery checklist |
| programDays | weekNumber, dayOfWeek | Training program |
| profile | — | User settings/targets |
| movementPRs | movementName, category | Movement PRs |
| benchmarkWods | name, category | Benchmark catalog |
| timerPresets | name, mode | Timer presets |
| weeklyPlans | weekStart, dayOfWeek | Weekly plans |
| cycleSettings | — | Cycle tracking config |
| cycleLogs | date | Daily cycle logs |
| eventLogs | eventId, year | CrossFit event results |
| nutritionCache | cacheKey, expiresAt | API response cache |

---

## PORTABILITY

Everything must live inside `C:\ClaudeWork\Imu\`. Copying this folder gives the complete project.
- `.env.example` exists with all required env var names
- No absolute paths outside this folder
- ZIP backup available at `C:\ClaudeWork\Imu\TrackVolt-App.zip`
- Git remote: `origin -> https://github.com/Imteyaz087/crosstrack-app.git`

---

## iOS STATUS

- Capacitor 8.1.0 installed, `ios/` folder exists
- Bundle ID: `app.trackvolt`
- **NOT ready for App Store** — missing: privacy policy URL, support URL, Info.plist permission strings, Xcode/TestFlight validation

---

*This file is the single source of truth for project memory. Update after every session.*
