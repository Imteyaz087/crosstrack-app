# TrackVolt Critical Audit v2

**Date:** 2026-03-01
**App:** TrackVolt (CrossTrack)
**Live:** crosstrack-rouge.vercel.app
**Stack:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind v4 + Zustand 5 + Dexie 4.3

---

## SECTION A — CRITICAL (broken, wrong data, not working)

### A1. Meal Logger — "Day remaining" can show wrong values on first open
**Screen:** Log > Meal
**What's wrong:** `LogPage.tsx` calls `loadTodayMeals()` and `loadProfile()` on mount, but if the store hasn't finished the async load before MealLogger renders, `todayMacros` shows `{0,0,0,0,0}` and `targets` use fallback defaults. The component then flashes 0 before updating.
**Expected:** Show a loading state or defer render until data is ready.
**File:** `src/pages/LogPage.tsx` line 44, `src/hooks/useMealForm.ts` line 40

### A2. today() timezone was fixed — verify all date usage
**Screen:** All screens that use dates
**What's wrong:** `today()` in `macros.ts` was using `toISOString()` (UTC). This was fixed to use local date. BUT — need to verify that `database.ts` seed data, `WorkoutHistoryPage`, `ProgressPage` heatmap, and `TrainingPage` calendar ALL use the same `today()` function and not their own date logic.
**Expected:** Every date comparison in the app should use the same local-date function.
**Files:** `src/utils/macros.ts`, `src/pages/ProgressPage.tsx`, `src/pages/TrainingPage.tsx`, `src/pages/WorkoutHistoryPage.tsx`

### A3. CloudSyncPage — silent error swallowing
**Screen:** More > Cloud Sync
**What's wrong:** Multiple `catch(() => {})` and `catch { /* config not set yet */ }` blocks silently eat errors. If Firebase auth fails or sync fails, user sees nothing — no error message, no toast. Data could fail to sync with zero feedback.
**Expected:** Show error toast to user on sync failure.
**File:** `src/pages/CloudSyncPage.tsx` lines 28-36, 45, 72, 85

### A4. PhotoLogPage — JSON parse can crash
**Screen:** More > Photo to Log
**What's wrong:** AI response is parsed with `JSON.parse(jsonStr)` without try/catch around the parse itself. If the AI returns malformed JSON, the page crashes.
**Expected:** Wrap in try/catch, show "couldn't parse AI response" error.
**File:** `src/pages/PhotoLogPage.tsx` line 70

---

## SECTION B — IMPORTANT (bad UX, confusing, inconsistent)

### B1. 15 pages still have hardcoded English — no i18n
**Screen:** AICoachPage, BenchmarkPage, CardioLogger, HyroxLogger, MealLogger, MetricLogger, WorkoutLogger, HeartRatePage, NutritionPage, PhotoLogPage, TimerPage, TodayPage, TrainingPage, WorkoutHistoryPage, BodyMeasurementsPage
**What's wrong:** These pages have English strings directly in JSX instead of using `t()` i18n function. Users who switch to 繁中 or 简中 still see English buttons, labels, and messages.
**How to fix:** Wrap all user-facing strings in `t('key')` and add corresponding translations to `en.ts`, `zh-TW.ts`, `zh-CN.ts`.
**File:** All 15 pages listed above

### B2. 32 console.error statements in production store
**Screen:** All (global store)
**What's wrong:** `useStore.ts` has 32 `console.error()` calls. These clutter the browser console in production and expose internal error details to users who open DevTools.
**How to fix:** Either remove for production builds, or implement a proper error service (Sentry/LogRocket). At minimum, add a `if (import.meta.env.DEV)` guard.
**File:** `src/stores/useStore.ts` — 32 instances

### B3. Workout form is too long — requires excessive scrolling
**Screen:** Log > Workout > Full Class
**What's wrong:** The form has Movement, Time Cap, Score, Rounds/Reps, Movements & Weights, Notes — all in one long vertical scroll. On mobile, users lose context of what they've entered above.
**How to fix:** Break into 2-3 steps or use collapsible sections.
**File:** `src/components/log/WorkoutLogger.tsx`

### B4. Training calendar dates are small and cramped
**Screen:** Training page
**What's wrong:** Calendar date numbers are very small, tightly packed. Hard to tap on mobile. No visual indicator for days that have logged workouts.
**How to fix:** Increase font size, add dot indicators for logged days, ensure 44px tap targets.
**File:** `src/pages/TrainingPage.tsx`

### B5. Meal type Total row can clip on narrow screens
**Screen:** Log > Meal (any type with items)
**What's wrong:** The Total row uses a 4-column grid which is good, but on very narrow screens (320px) the text can still get tight.
**How to fix:** Already using grid-cols-4 (from latest fix). Monitor on 320px devices.
**File:** `src/components/log/MealLogger.tsx`

### B6. Missing alt text on user profile image
**Screen:** Cloud Sync page
**What's wrong:** `<img src={user.photoURL} alt="" />` — empty alt text.
**How to fix:** Change to `alt="Profile photo"` or `alt={user.displayName}`.
**File:** `src/pages/CloudSyncPage.tsx` line 202

### B7. AICoachPage — duplicate streak calculation
**Screen:** AI Coach
**What's wrong:** The streak calculation (loop through 365 days checking logDates) appears twice — once in the `useMemo` insights block and again in `handleAskAI`. Duplicated logic means double maintenance burden and potential drift.
**How to fix:** Extract to a shared utility function `calcStreak(logDates)`.
**File:** `src/pages/AICoachPage.tsx` lines 73 and 96

### B8. 4 uses of `any` type
**Screen:** N/A (code quality)
**What's wrong:** `any` types in AICoachPage (catch), CloudSyncPage (3 catches), PhotoLogPage (parsed data), HyroxLogger (updateStation value).
**How to fix:** Replace with `unknown` for catch blocks, create proper types for parsed data.
**Files:** `AICoachPage.tsx:129`, `CloudSyncPage.tsx:45,72,85`, `PhotoLogPage.tsx:80`, `HyroxLogger.tsx:47`

### B9. Magic numbers scattered in AICoachPage
**Screen:** AI Coach
**What's wrong:** Hardcoded `7`, `14`, `30`, `365`, `86400000`, `3000`, `2000`, `150` throughout the insights calculation.
**How to fix:** Extract to named constants: `MS_PER_DAY`, `WEEK_DAYS`, `MONTH_DAYS`, etc.
**File:** `src/pages/AICoachPage.tsx` lines 28-82

### B10. "NEW" badges on multiple More menu items
**Screen:** More page
**What's wrong:** Multiple features show "NEW" badge simultaneously (Workout History, Body Measurements, Weekly Planner, PR Wall). When everything is "new", nothing stands out.
**How to fix:** Either use a date-based system to auto-expire badges, or only mark the most recently added feature.
**File:** `src/pages/MorePage.tsx`

---

## SECTION C — MISSING FEATURES (expected but not built)

### C1. Superset / Complex workout logging
**Feature:** Log supersets, tri-sets, and EMOM complexes as grouped movements
**Why it matters:** CrossFit athletes frequently do supersets. Currently each movement is logged separately with no grouping.
**Priority:** HIGH

### C2. Workout templates / saved WODs
**Feature:** Save frequently done workouts as templates and re-log with one tap
**Why it matters:** Many athletes repeat benchmark WODs or follow programmed workouts. Having to re-enter "Fran" details every time is tedious.
**Priority:** HIGH

### C3. Progress photos with comparison
**Feature:** Take monthly progress photos and overlay side-by-side comparisons
**Why it matters:** Visual progress is the #1 motivator for body composition goals.
**Priority:** HIGH

### C4. Rest timer between sets
**Feature:** Auto-start a rest timer after logging a set, with configurable rest periods per movement
**Why it matters:** Strength athletes need to track rest periods for progressive overload.
**Priority:** MEDIUM

### C5. Barcode scanner for food
**Feature:** Scan food barcodes to auto-fill nutrition data (via OpenFoodFacts API)
**Why it matters:** Manual food entry is the #1 reason people stop tracking nutrition. Barcode scanning removes friction.
**Priority:** HIGH

### C6. Social / Community features
**Feature:** Share workouts with training partners, see gym leaderboard
**Why it matters:** Community accountability is core to CrossFit culture. Competing on the whiteboard drives engagement.
**Priority:** MEDIUM

### C7. Apple Health / Google Fit integration
**Feature:** Sync heart rate, steps, sleep data from wearables
**Why it matters:** Manual entry of heart rate and sleep is unreliable. Wearable sync makes data passive and accurate.
**Priority:** MEDIUM

### C8. Workout streak notifications
**Feature:** Push notification reminders when you're about to break a streak
**Why it matters:** Habit formation requires reminders. A "you've trained 5 days straight, don't break it!" notification drives retention.
**Priority:** MEDIUM

### C9. Recovery score algorithm
**Feature:** Auto-calculate daily readiness score based on sleep, soreness, HRV, training load
**Why it matters:** Prevents overtraining. Athletes need data-driven guidance on whether to push hard or take it easy.
**Priority:** MEDIUM

### C10. Export to PDF / share workout summary
**Feature:** Generate a shareable workout summary card (image or PDF) for social media
**Why it matters:** Athletes love sharing their gains. A branded shareable card is free marketing.
**Priority:** LOW

### C11. Macro tracking visualization over time
**Feature:** Show weekly/monthly macro trends as line charts (not just daily bars)
**Why it matters:** Seeing consistency or patterns over 30 days is more useful than a single day's snapshot.
**Priority:** MEDIUM

### C12. Custom food creation
**Feature:** Users can add their own foods with custom macro values
**Why it matters:** The 211 built-in foods won't cover every local or specialty food. Users need to add their own.
**Priority:** HIGH (if not already implemented — check FoodItem.isCustom field exists but may not have UI)

---

## PRIORITY RANKING (Top 10 to fix NOW)

| # | Item | Type | Impact |
|---|------|------|--------|
| 1 | A3. CloudSync silent errors | CRITICAL | Data loss risk |
| 2 | A4. PhotoLog JSON crash | CRITICAL | App crash |
| 3 | A1. Meal logger flash on first load | CRITICAL | Wrong data shown |
| 4 | B1. 15 pages missing i18n | IMPORTANT | Breaks 繁中/简中 users |
| 5 | B2. Console.error in production | IMPORTANT | Unprofessional |
| 6 | C5. Barcode scanner | MISSING | #1 retention feature |
| 7 | C12. Custom food creation UI | MISSING | Users need their foods |
| 8 | B3. Workout form too long | IMPORTANT | Mobile UX |
| 9 | B4. Calendar dates cramped | IMPORTANT | Tap target too small |
| 10 | C1. Superset logging | MISSING | Core CrossFit need |

---

## POSITIVE FINDINGS ✅

- **No dead code or unused components** — clean codebase
- **TypeScript types are well-defined** — strong type system
- **Zustand store is well-structured** — clear separation of concerns
- **IndexedDB schema has proper migrations** — v2 → v3 handled correctly
- **Fiber field handled correctly** — `(m.fiber || 0)` everywhere
- **Goal-based macro calculator** — evidence-based ISSN/ACSM targets
- **PWA features working** — InstallPrompt, OfflineBar, service worker
- **Design system tokens** — CSS custom properties, consistent typography
- **44px touch targets** — properly implemented across most components
- **useMemo used where it counts** — AICoachPage insights are memoized
