# TrackVolt App — Master Project Document
**Owner:** Aron (imteyazmdkaish@gmail.com)
**Last Updated:** March 5, 2026
**Purpose:** Complete project memory backup — read this at the start of every new session

---

## 1. What Is This App?

**TrackVolt** is a fitness Progressive Web App (PWA) built specifically for CrossFit, HYROX, and general athletic performance tracking. It is designed to be a premium, dark-themed mobile app with a volt green (#C8FF00) brand identity.

- **Live URL:** https://trackvolt.app
- **Brand name:** TrackVolt (internal project name: CrossTrack)
- **Target users:** CrossFit athletes, HYROX competitors, and fitness-focused people
- **Aron's vision:** A universal, premium fitness app that feels like an Apple Design Award winner — clean, dark, fast, with great visual hierarchy

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa |
| State Management | Zustand 5 |
| Local Database | Dexie (IndexedDB wrapper) |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | react-i18next (English + Traditional Chinese) |
| Date Utils | date-fns |
| Routing | React Router DOM v7 |
| Deployment | Vercel (project: "crosstrack") |
| Domain | trackvolt.app (registered on Namecheap) |

---

## 3. Deployment & Infrastructure

### Vercel
- **Project name:** crosstrack
- **Project ID:** prj_HRKKptQiVRpYrBtmsCVahz3Zv7ah
- **Org ID:** team_S7ukXJeYnSsExx3B9QOmqqMD
- **Dashboard:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack
- **Deployments page:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments

### Important Deployment IDs (save these!)
| ID | Status | Notes |
|---|---|---|
| GTeJwY1rw | ✅ CURRENT PRODUCTION | Full feature version — always protect this |

### How to Deploy
1. Run `npm run build` inside `C:\ClaudeWork\Imu\TrackVolt-App\` first
2. Confirm build succeeds (zero TypeScript errors)
3. Run `npx vercel --prod` from that folder
4. If token error: run `npx vercel login` first
5. `.vercel/project.json` already links to the correct project

### How to Roll Back (Emergency)
1. Go to https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments
2. Find the last known good deployment ID (see table above)
3. Click `...` → **Promote** → confirm
4. Hard refresh browser: Ctrl+Shift+R (PWA service worker caches aggressively)

### Old Netlify Account
- Account was on Netlify but **exceeded credit limit** — deploys paused
- All deployment now done through **Vercel only**
- Netlify can be ignored

---

## 4. Local Development

**Source code location:** `C:\ClaudeWork\Imu\TrackVolt-App\`

```
src/
  App.tsx              — Root component, tab routing
  main.tsx             — Entry point
  index.css            — Design tokens (CSS custom properties)
  App.css              — (minimal)
  components/
    TabBar.tsx         — Bottom navigation (5 tabs)
    MacroBar.tsx       — Vertical macro progress bar component
  pages/
    TodayPage.tsx      — Home dashboard
    LogPage.tsx        — Log workouts, meals, metrics
    TrainingPage.tsx   — Calendar + program + PRs
    NutritionPage.tsx  — Meal tracking by type
    ProgressPage.tsx   — Charts, streaks, benchmarks
    GroceryPage.tsx    — Weekly grocery list
    SettingsPage.tsx   — User profile and targets
    MorePage.tsx       — Sub-navigation (Grocery, Progress, Settings)
  stores/
    useStore.ts        — Zustand global state + all DB operations
  db/
    database.ts        — Dexie DB schema + seed data
  types/
    index.ts           — All TypeScript interfaces
  utils/
    macros.ts          — Macro calculation helpers
  i18n/
    en.ts              — English translations
    zh-TW.ts           — Traditional Chinese translations
    index.ts           — i18n setup
```

### Dev Commands
```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run preview  # Preview production build
```

### TypeScript Strictness
`tsconfig.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true`
→ Build WILL FAIL if you import anything unused. Always remove unused imports.

---

## 5. Design System

### Brand Colors (CSS Custom Properties)
```css
--volt:       #C8FF00   /* PRIMARY accent — volt green */
--volt-dim:   #9FCC00   /* Hover states */
--volt-glow:  rgba(200,255,0,0.15)

--bg-app:     #0D0D14   /* Page background */
--bg-card:    #13131E   /* Cards */
--bg-raised:  #1A1A28   /* Elevated elements, inputs */
--bg-input:   #1E1E2E   /* Input fields */

--border:     rgba(255,255,255,0.06)
--border-med: rgba(255,255,255,0.10)
--border-str: rgba(200,255,0,0.25)    /* Volt accent border */

--text-primary:   #F0F0F8
--text-secondary: #8888A0
--text-muted:     #50505E
```

### Semantic Colors (for data/metrics)
- Green: `#4ade80` (protein, workouts)
- Orange: `#fb923c` (carbs, HYROX)
- Pink: `#f472b6` (fat)
- Blue: `#60a5fa` (water)
- Indigo: `#818cf8` (sleep)
- Red: `#f87171` (PRs)
- Yellow: `#facc15` (energy)
- Teal: `#2dd4bf` (recovery)

### Design Principles
- **Dark first** — deep near-black backgrounds
- **Volt green** as the only brand accent, used sparingly for CTAs and highlights
- **Rounded corners** — cards use `rounded-2xl`
- **No shadows** — depth created through layered background colors
- **Premium feel** — tight spacing, clean typography, smooth transitions
- **Mobile first** — max-width 512px, bottom tab bar

---

## 6. App Architecture — The 5 Tabs

### Tab 1: TODAY (`TodayPage.tsx`)
The home dashboard. Shows:
- Greeting with user name + date
- Current training week & phase (Base/Load/Intensity/Deload — 4-week cycle)
- Today's Training card (from program) → taps to Training tab
- Macros Today card (protein/carbs/fat/calories bars) → taps to Nutrition tab
- Quick Metrics card (weight, sleep, water, energy) → taps to Log tab

### Tab 2: LOG (`LogPage.tsx`)
The central logging hub. Two states:

**Home screen (mode = null):** 9 cards in 3 categories:
- **TRAINING:** CrossFit (Dumbbell, volt), HYROX (Timer, orange), Run/Cardio (Activity, green)
- **BODY & NUTRITION:** Meal (UtensilsCrossed, teal), Weight (Scale, purple), Water (Droplets, blue)
- **WELLNESS & RECOVERY:** Sleep (Moon, indigo), Energy (Zap, yellow), Recovery (RefreshCcw, teal)
- Plus Quick Templates section at the bottom

**Active modes:**
- `workout` — form with WOD name, type (AMRAP/ForTime/EMOM/etc), score, RX/Scaled, PR flag, benchmark flag, notes
- `meal` — food search from library, grams input, meal type selector, live macro preview
- `weight/sleep/water/energy/recovery` — simple numeric input

**Special behaviors:**
- CrossFit tap → sets WOD type to AMRAP automatically
- HYROX tap → sets WOD type to ForTime
- Run/Cardio tap → sets WOD type to Other
- Recovery saves to `dailyLog.notes` as "Recovery: X/5"

### Tab 3: TRAIN (`TrainingPage.tsx`)
- Monthly calendar (workout days highlighted in green)
- Today's Program (from seeded 4-week program)
- PR Board (workouts with prFlag = true)
- Recent Workouts list (last 5)
- "Log Workout" button → navigates to Log tab

### Tab 4: EAT (`NutritionPage.tsx`)
- Daily macro overview (bars for protein, carbs, fat, calories)
- Meal sections by type: Breakfast, Post-WOD, Lunch, Snack, Dinner
- Each section shows logged items with delete button
- Empty sections show "Add Meal" + template shortcuts

### Tab 5: MORE (`MorePage.tsx`)
Sub-navigation menu with 3 items:
- **Grocery** → GroceryPage (weekly shopping list, checkboxes)
- **Progress** → ProgressPage (streak, charts, benchmarks)
- **Settings** → SettingsPage (profile, macro targets, export/import)

---

## 7. Database Schema (Dexie / IndexedDB)

Database name: `CrossTrackDB`

| Table | Key Fields | Purpose |
|---|---|---|
| dailyLogs | date | Weight, sleep, water, energy, notes per day |
| workouts | date, workoutType, prFlag, isBenchmark | All logged workouts |
| foodLibrary | name, category | Pre-seeded food database |
| mealLogs | date, mealType, foodId | Individual food entries |
| mealTemplates | name, mealType | Saved meal templates |
| groceryItems | category, weekStartDate | Weekly grocery list |
| programDays | weekNumber, dayOfWeek | 4-week training program |
| settings | — | User profile and targets |

### Default User Settings (Aron)
- Weight: 72kg
- Goal: Recomp (Fat Loss + Muscle + Performance)
- Training time: 06:00
- Calorie target: 2100 kcal
- Protein: 180g | Carbs: 216g | Fat: 58g
- Water: 3000ml
- Language: English (also supports zh-TW)

---

## 8. Seed Data

### Food Library (17 items pre-seeded)
Proteins: Chicken Breast, Lean Beef, Eggs, Whey Protein, Greek Yogurt
Carbs: Rolled Oats, White Rice, Sweet Potato, Banana, Apple, Rice Cake, Honey
Vegetables: Broccoli, Spinach, Mixed Vegetables
Fats: Olive Oil, Almonds

### Meal Templates (6 templates)
- My Breakfast (Greek Yogurt + Oats + Whey + Banana)
- Post-WOD Shake (Whey + Rice Cakes + Honey)
- Chicken + Rice Lunch
- Afternoon Snack (Almonds + Apple)
- Chicken Dinner
- Beef Dinner

### Training Program (4-week cycle)
Phases: Base (Week 1) → Load (Week 2) → Intensity (Week 3) → Deload (Week 4)
- Monday: Strength + Metcon (Back Squat + AMRAP)
- Tuesday: Gymnastics + HIIT
- Wednesday: Olympic Lifting + WOD (Clean & Jerk + 21-15-9)
- Thursday: Engine Builder (30min cardio)
- Friday: Heavy Day + Hero WOD (Deadlift + Murph Variant)
- Saturday: Partner/Team WOD
- Sunday: REST + Mobility

### Grocery List (17 recurring items)
Auto-generated weekly list covering all meal template ingredients.

---

## 9. i18n — Languages

Supported: **English (en)** and **Traditional Chinese (zh-TW)**
- Controlled via Settings page
- All UI text uses `t('key')` from react-i18next
- Translation files: `src/i18n/en.ts` and `src/i18n/zh-TW.ts`

Key translation namespaces:
- `tabs.*` — Tab bar labels
- `today.*` — Today page content
- `log.*` — Log page labels (including crossfit, hyrox, runCardio, recovery, training, bodyNutrition, wellnessRecovery)
- `training.*` — Training page
- `meals.*` — Meal types
- `nutrition.*` — Nutrition page
- `progress.*` — Progress page
- `grocery.*` — Grocery page
- `settings.*` — Settings page
- `phases.*` — Training phases (Base, Load, Intensity, Deload)

---

## 10. Changes History

### Session 1–N (earlier, before context tracking)
- Initial app creation with full feature set
- All 8 pages built
- Database schema and seed data created
- Design system established with volt green brand

### Recent Session (March 5, 2026)
**TypeScript Fixes:**
- `useStore.ts`: Removed unused `MealType` from type import
- `TodayPage.tsx`: Removed unused `Dumbbell` from lucide-react import

**LogPage.tsx Redesign:**
- Old layout: flat 6-card grid
- New layout: 9 cards in 3 labeled categories
- New icons added: `Timer` (HYROX), `Activity` (Run), `RefreshCcw` (Recovery)
- Cards now use `min-h-[100px] flex flex-col items-center justify-center gap-2.5`
- Icon size: 28px, strokeWidth: 1.8
- Replaced Heart icon for Cycle (gender-specific) with Recovery card (universal)
- Added `handleCardClick` function that pre-selects WOD type by sport

**i18n Updates:**
- Added to en.ts and zh-TW.ts: `crossfit`, `hyrox`, `runCardio`, `recovery`, `training`, `bodyNutrition`, `wellnessRecovery`

**Deployment Incident (March 5, 2026):**
- Netlify account hit credit limit → switched to Vercel
- Accidentally deployed old/simplified version to production
- Recovered by promoting deployment `GTeJwY1rw` back to production
- ⚠️ LESSON: Always note the current good deployment ID before any deployment work

---

## 11. Known Issues & Pending Work

### Pending Improvements (not yet deployed)
1. **Log page redesign** — done in local source code but the live production version (GTeJwY1rw) may not have all these changes yet. Need to verify by comparing local vs live.
2. **GitHub connection** — GitHub repo exists but is empty (only .gitkeep). Source code is NOT pushed to GitHub yet. This means Vercel auto-deploy is not set up.

### Future Feature Ideas (from Aron's vision)
- AI Coach
- Cloud Sync (user data backup)
- Photo to Log
- Heart Rate tracking
- Achievements / badges
- Body Measurements tracking
- Weekly Planner
- PR Wall (enhanced)
- WOD Timer (built-in)
- 1RM Calculator
- My Benchmarks section
- Movement PRs
- Full HYROX-specific tracking

---

## 12. Critical Files Reference

| File | What It Does | Touch Carefully |
|---|---|---|
| `src/index.css` | All design tokens | Yes — changes affect whole app |
| `src/stores/useStore.ts` | All state + DB operations | Yes — very important |
| `src/db/database.ts` | DB schema + all seed data | Yes — schema changes need migration |
| `src/types/index.ts` | All TypeScript types | Yes — used everywhere |
| `src/pages/LogPage.tsx` | Most complex page | Yes |
| `.vercel/project.json` | Vercel project linking | Do not delete |

---

## 13. Session Startup Checklist

At the start of every new session, Claude should:
1. Read this document first
2. Check what the user wants to change
3. Note current Vercel deployment ID (safe rollback point)
4. Make changes locally → test build → then deploy
5. Update this document with what changed

---

*This document is the single source of truth for the TrackVolt project. Update it every session.*
