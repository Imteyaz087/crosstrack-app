# TrackVolt — Improvement Roadmap
**Date:** March 1, 2026
**Based on:** Bug Report, UX Audit, Performance Audit, Security Audit, Competitor Analysis

---

## PRIORITY 1 — FIX NOW (Blocks App Store / Production Release)

| # | Issue | Type | Screen | Est. Effort | Details |
|---|-------|------|--------|-------------|---------|
| 1 | Add React Error Boundary | Bug | App.tsx | Quick (<1hr) | Wrap root in ErrorBoundary component with fallback UI showing "Something went wrong" + refresh button |
| 2 | Fix HeartRatePage BLE listener leak | Bug | HeartRatePage | Quick | Add cleanup in useEffect return: `characteristic.removeEventListener('characteristicvaluechanged', handler)` |
| 3 | Fix Timer interval memory leak | Bug | useTimerEngine | Medium (1-4hr) | Refactor interval management: clear previous before creating new. Use single stable interval ref. |
| 4 | Fix BarcodeScanner interval leak | Bug | BarcodeScanner | Quick | Clear scan interval in useEffect cleanup and when component transitions states |
| 5 | Fix Gemini API key exposure | Security | gemini.ts | Medium | Move to backend proxy or use environment variable + server-side endpoint. Never pass key in URL. |
| 6 | Fix Firebase config storage | Security | firebase.ts | Quick | Move to env vars via Vite's `import.meta.env.VITE_FIREBASE_*` |
| 7 | Fix npm vulnerabilities | Security | package.json | Quick | `npm audit fix --force` to update vite-plugin-pwa |
| 8 | Fix division by zero in AICoachPage | Bug | AICoachPage | Quick | Add `if (lastWeek === 0) return` guard before division |
| 9 | Fix division by zero in BodyMeasurements | Bug | BodyMeasurementsPage | Quick | Add `if (first === 0)` guard |
| 10 | Add Content Security Policy | Security | index.html | Quick | Add `<meta http-equiv="Content-Security-Policy">` |
| 11 | Fix database import transaction safety | Bug | useStore.ts | Medium | Wrap import in Dexie transaction with rollback on error |
| 12 | Fix PR detection RX vs Scaled | Bug | usePRDetection | Quick | Add `rxOrScaled` filter to benchmark comparison query |

## PRIORITY 2 — FIX BEFORE LAUNCH (Major User Impact)

| # | Issue | Type | Screen | Est. Effort | Details |
|---|-------|------|--------|-------------|---------|
| 13 | Fix all touch targets < 44px | UX | Multiple | Medium | Audit and fix: WorkoutLogger +/- buttons, TimerPage edit/delete, HyroxLogger +/-, WaterTracker, CycleLogger symptoms, MealLogger meal types |
| 14 | Fix 200+ hardcoded English strings | i18n | Multiple | Large (4-8hr) | Systematic sweep: add keys to en.ts, replace all hardcoded strings with t() calls in 20+ components |
| 15 | Add zh-TW and zh-CN cycle translations | i18n | zh-TW.ts, zh-CN.ts | Medium | Add all `cycle.*` keys to Chinese locale files |
| 16 | Fix RecoveryLogger range validation | Bug | RecoveryLogger | Quick | Add `min={1} max={10}` validation, show error if out of range |
| 17 | Fix useWorkoutForm resetAll() | Bug | useWorkoutForm | Quick | Add missing setters: `setWeightUnit, setStrengthSchemeType, setStrengthInterval, setStrengthSets` |
| 18 | Fix saveMovementPR sortBy async bug | Bug | useStore.ts | Quick | Await sortBy or use synchronous sort: `existing.sort((a,b) => a.value - b.value)` |
| 19 | Fix OnboardingPage canNext validation | Bug | OnboardingPage | Quick | Replace `step > 1` with proper per-step validation |
| 20 | Add confirmation dialogs for delete | UX | MealLogger, WorkoutLogger | Medium | Add "Are you sure?" modal before all destructive actions |
| 21 | Add error states and retry | UX | Multiple | Medium | Show error UI with retry button for failed network requests and DB operations |
| 22 | Fix contrast: text-slate-500 fails WCAG AA | A11y | Multiple | Medium | Change label colors from slate-500 to slate-400 (passes 4.5:1 on dark bg) |
| 23 | Fix text-[10px] minimum size | A11y | Multiple | Medium | Increase all 10px labels to 11px or 12px minimum |
| 24 | Add prefers-reduced-motion support | A11y | CSS | Quick | Add `@media (prefers-reduced-motion: reduce)` to disable animations |

## PRIORITY 3 — IMPROVE SOON (Better Experience)

| # | Issue | Type | Screen | Est. Effort | Details |
|---|-------|------|--------|-------------|---------|
| 25 | Code-split routes with React.lazy | Perf | App.tsx | Medium | Lazy-load MorePage, ProgressPage, SettingsPage to cut main bundle from 816KB to ~300KB |
| 26 | Lazy-load Firebase SDK | Perf | firebase.ts | Medium | Dynamic import() Firebase only when user configures it |
| 27 | Lazy-load Recharts | Perf | ProgressPage | Quick | Dynamic import() recharts only on ProgressPage mount |
| 28 | Move JSON data to IndexedDB | Perf | movements.json, benchmarkWods.json | Medium | Seed on first load, cache in DB. Removes 154KB from bundle. |
| 29 | Remove unused dependencies | Perf | package.json | Quick | Remove `react-is`, `@anthropic-ai/sdk`, evaluate `react-router-dom` necessity |
| 30 | Add loading skeletons | UX | TodayPage, TrainingPage | Medium | Show skeleton cards while data loads instead of blank screen |
| 31 | Add undo for delete actions | UX | MealLogger, WorkoutLogger | Medium | Implement soft-delete with 5-second undo toast |
| 32 | Add "Discard changes?" dialog | UX | All loggers | Medium | Prompt when leaving form with unsaved changes |
| 33 | Improve cycle prediction accuracy | Feature | useCycleTracking | Medium | Use variable ovulation window (12-16 days) instead of fixed 14. Weight by user's logged data. |
| 34 | Fix RED-S detection logic | Feature | useCycleTracking | Medium | Extend window to 6 months per IOC guidelines. Fix missedPeriods calculation. |
| 35 | Add proper ARIA labels | A11y | Multiple | Medium | Audit all buttons, inputs, form elements for aria-label coverage |
| 36 | Add keyboard focus indicators | A11y | CSS | Quick | Add `focus-visible:ring-2 focus-visible:ring-cyan-400` to all interactive elements |
| 37 | Fix HeartRatePage hardcoded age | Bug | HeartRatePage | Quick | Read age from profile.age instead of hardcoded 30 |
| 38 | Refactor WorkoutLogger props | Code | WorkoutLogger | Large | Extract to useReducer or context to eliminate 78-prop drilling |
| 39 | Add scroll-to-top on tab switch | UX | App.tsx | Quick | Reset scroll position when switching tabs |
| 40 | Add page transitions | UX | App.tsx | Medium | Subtle fade or slide transitions between tab views |

## PRIORITY 4 — NICE TO HAVE (Polish & Future)

| # | Issue | Type | Screen | Est. Effort | Details |
|---|-------|------|--------|-------------|---------|
| 41 | Add pull-to-refresh | UX | TodayPage | Medium | Reload data on pull gesture |
| 42 | Add swipe between tabs | UX | TabBar | Large | Gesture navigation for tab switching |
| 43 | Add "Repeat yesterday" button | UX | LogModeSelector | Medium | Quick re-log previous day's workout |
| 44 | Add educational content per cycle phase | Feature | CycleLogger | Large | Articles, videos about training in each phase |
| 45 | Add social features / sharing | Feature | New | Large | Share PRs, workout results, leaderboards |
| 46 | Expand food database | Feature | MealLogger | Large | Integrate USDA database or larger API |
| 47 | Add wearable device sync | Feature | New | Large | Apple Health, Garmin Connect API |
| 48 | Add GPS route tracking | Feature | CardioLogger | Large | Browser Geolocation API for run routes |
| 49 | Add offline action queue | Perf | Service Worker | Large | Queue actions taken offline, sync when connected |
| 50 | Add Web Crypto encryption for cycle data | Security | useCycleTracking | Medium | Optional encryption for sensitive health data |
| 51 | Add onboarding tutorial | UX | New | Medium | Interactive walkthrough for first workout, meal log |
| 52 | Add help/FAQ section | UX | MorePage | Medium | In-app help for features, terminology, formulas |
| 53 | Remove OnboardingPage dead state | Code | OnboardingPage | Quick | Remove unused `_direction` state variable |
| 54 | Remove unused TrainingPage import | Code | TrainingPage | Quick | Remove `isToday as isDateToday` |
