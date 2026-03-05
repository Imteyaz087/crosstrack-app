# TrackVolt — Bug Report
**Date:** March 1, 2026
**Reviewer:** Product Audit Team
**App Version:** 0.0.0 (Pre-release PWA)
**Live URL:** https://crosstrack-rouge.vercel.app

---

## Summary
**40 bugs found: 10 critical, 10 high, 14 medium, 6 low**

---

## Bug Table

| # | Severity | Screen | Bug Description | Steps to Reproduce | Expected | Actual | File:Line |
|---|----------|--------|------------------|-------------------|----------|--------|-----------|
| 1 | 🔴 CRITICAL | Global | No React Error Boundary wrapper | Trigger any unhandled exception in any component | App displays error boundary UI or graceful error message | White screen; entire app crashes | `App.tsx` |
| 2 | 🔴 CRITICAL | HeartRatePage | BLE listener memory leak on unmount | Visit HeartRatePage multiple times, check DevTools Memory | Event listener removed when component unmounts | Listener accumulates with each visit; memory grows unbounded | `HeartRatePage.tsx:41-52` |
| 3 | 🔴 CRITICAL | Timer | Timer interval memory leak in useTimerEngine | Rapidly change timer dependencies or start/stop timer many times | Only one active interval at a time | Multiple intervals stack up; timer runs multiple times simultaneously | `useTimerEngine.ts:86-127` |
| 4 | 🔴 CRITICAL | BarcodeScanner | setInterval not cleared on unmount | Open barcode scanner, start scanning, navigate away before scan completes | Interval cleared when component unmounts | Interval continues running in background; browser becomes sluggish | `BarcodeScanner.tsx:88-101` |
| 5 | 🔴 CRITICAL | AICoachPage | Division by zero in ACR calculation | Load AICoachPage when last week has 0 workout minutes | Displays "0" or "N/A" or baseline value | Displays "Infinity"; comparison logic breaks | `AICoachPage.tsx:71-72` |
| 6 | 🔴 CRITICAL | BodyMeasurementsPage | Division by zero in percentage change | Log first body measurement as 0, then log second measurement | Displays "N/A" or error message | Displays "Infinity" or "NaN"; calculation breaks | `BodyMeasurementsPage.tsx:58` |
| 7 | 🔴 CRITICAL | PRDetection | RX vs Scaled workout comparison | Log "Fran Scaled" and "Fran RX" with different times, check PR comparison | RX and Scaled PRs tracked separately by division | "Fran Scaled 4:30" shown as personal record when "Fran RX 5:00" exists (different category) | `usePRDetection.ts:163-168` |
| 8 | 🔴 CRITICAL | CloudSync | Database import without transaction rollback | Trigger data import, simulate failure midway (e.g., network drop) | Import rolls back; original data preserved | Data partially wiped; tables cleared but import incomplete | `useStore.ts:349-351` |
| 9 | 🔴 CRITICAL | Security | Firebase config stored unencrypted in localStorage | Open DevTools Console, type `localStorage.getItem('firebaseConfig')` | Firebase config encrypted or stored securely server-side | Full Firebase API keys and project config visible in plain text; exploitable via XSS | `firebase.ts:31-37` |
| 10 | 🔴 CRITICAL | Security | Gemini API key in URL query string | Open Network tab in DevTools while using AI Coach; check request URLs | API key passed in Authorization header or request body | API key visible in URL bar, browser history, referrer headers, proxy logs, and analytics | `gemini.ts:33` |
| 11 | 🟠 HIGH | PhotoLogPage | Camera stream not stopped on unmount | Open PhotoLogPage, capture a photo, navigate away before capture completes | Camera stream stops when component unmounts | Camera stays active in background; device back camera light stays on | `PhotoLogPage.tsx:35-62` |
| 12 | 🟠 HIGH | WorkoutForm | resetAll() missing critical field resets | Complete a workout entry with specific weight unit and strength scheme, start new entry | All form fields reset to initial state | `weightUnit`, `strengthSchemeType`, `strengthInterval`, `strengthSets` retain previous values; user sees old config | `useWorkoutForm.ts:265-272` |
| 13 | 🟠 HIGH | useStore | saveMovementPR sortBy returns Promise used synchronously | Add multiple PRs for same movement, check which is marked as "best" | Function correctly identifies and saves the best PR value | Wrong PR marked as personal record due to async/sync mismatch | `useStore.ts:254` |
| 14 | 🟠 HIGH | OnboardingPage | canNext validation always true after step 1 | Go through onboarding: step 1 → step 2, skip required fields, click next | Next button disabled if required fields incomplete | User can skip required fields and proceed through all steps without completing them | `OnboardingPage.tsx:183` |
| 15 | 🟠 HIGH | RecoveryLogger | No numeric range validation on Readiness/RPE/Soreness | Input "99" in Readiness field (should be 1-10), submit | Input rejected or clamped to 1-10 range | System accepts "99"; invalid data saved to database | `RecoveryLogger.tsx:40-62` |
| 16 | 🟠 HIGH | CycleTracking | Ovulation prediction uses fixed rigid formula | Log cycle with 35-day length, check predicted ovulation day | Ovulation predicted within range of day 19-23 (12-16 days before period) | Ovulation always predicted at day 21 (fixed `cycleLen - 14`); real cycle variation ignored | `useCycleTracking.ts:194-200` |
| 17 | 🟠 HIGH | MacroBar | Division by zero on target prop | Render MacroBar with `target={0}` | Component handles gracefully without errors | Visual bar calculation breaks; potential NaN or undefined rendering | `MacroBar.tsx` |
| 18 | 🟠 HIGH | CycleLogger | Symptom buttons below 44px minimum touch target | Tap symptom selection buttons on small screen or with gloved finger | Buttons are at least 44x44px per Apple HIG | Buttons are 36px high; difficult to tap accurately | `CycleLogger.tsx:181` |
| 19 | 🟠 HIGH | WorkoutLogger | Plus/Minus weight adjustment buttons too small | Tap +/- buttons to adjust weight on mobile device | Buttons at least 44x44px minimum | Buttons are 32x36px; too small for reliable mobile tapping | `WorkoutLogger.tsx:545,556` |
| 20 | 🟠 HIGH | Localization | 200+ hardcoded English strings bypass i18n | Switch app language to non-English (if available) | All user-facing strings appear in selected language | Strings remain in English: "Training", "Body & Nutrition", "Wellness & Recovery", phase labels, button text, toast messages, form labels | Multiple files: WorkoutLogger, RecoveryLogger, HyroxLogger, CardioLogger, CycleLogger, CycleOnboarding, CycleCalendar, BarcodeScanner, AchievementToast, PRToast, InstallPrompt, OnboardingTour, LogModeSelector |
| 21 | 🟡 MEDIUM | HeartRatePage | Max heart rate hardcoded to age 30 | Load HeartRatePage for user with different age (e.g., 25 or 45) | Max HR calculated using user's actual age from profile | Max HR always calculated as `220 - 30 = 190` regardless of user age | `HeartRatePage.tsx:89` |
| 22 | 🟡 MEDIUM | TimerPage | Edit/Delete buttons under 44px minimum | Tap edit or delete button on timer with finger on mobile | Button at least 44x44px | Buttons are 40x40px; below accessibility minimum | `TimerPage.tsx:186-197` |
| 23 | 🟡 MEDIUM | HyroxLogger | Plus/Minus station time buttons too small | Tap +/- to adjust Hyrox station times | Buttons at least 44x44px | Buttons are 40x40px | `HyroxLogger.tsx:162-167` |
| 24 | 🟡 MEDIUM | WaterTracker | Add/Remove quick adjust buttons too small | Tap quick adjust buttons on WaterTracker | Buttons at least 44x44px | Buttons are 40x40px | `WaterTracker.tsx:162-167` |
| 25 | 🟡 MEDIUM | MealLogger | Meal type selection buttons too small | Tap breakfast/lunch/dinner meal type buttons | Buttons at least 44px high | Buttons are 40px high | `MealLogger.tsx:113` |
| 26 | 🟡 MEDIUM | CloudSync | Download without transaction protection | Start cloud data download, network fails midway | Download fails atomically; original data intact | Data corruption possible; partial data overwrites original | `CloudSyncPage.tsx` |
| 27 | 🟡 MEDIUM | Streak Calculation | Timezone edge case in calcStreak | Log activity near midnight on DST transition date | Streak calculated correctly across timezone change | Streak calculation returns wrong value; uses `getDay()` and `setDate()` which fail across DST | `macros.ts:83-93` |
| 28 | 🟡 MEDIUM | CycleTracking | RED-S detection window too short | User with persistent low calorie intake for 6 months | RED-S flagged after 6 months of low energy availability | RED-S only checks 90-day window; detection misses chronic cases; logic error in `missedPeriods` comparison | `useCycleTracking.ts:283-299` |
| 29 | 🟡 MEDIUM | Timer Parsing | parseTime returns NaN for invalid input | Enter non-numeric characters in timer input field | Error message displayed or input rejected | NaN propagated to timer calculations; timer displays "NaN:NaN" | `macros.ts:61-65` |
| 30 | 🟡 MEDIUM | MealLogger | No confirmation before meal deletion | Tap delete button on logged meal | Confirmation dialog asks "Delete this meal?" | Meal immediately deleted with no confirmation; accidental deletion possible | `MealLogger.tsx` |
| 31 | 🟡 MEDIUM | OnboardingPage | Dead state variable unused | Review OnboardingPage code | `_direction` state used for navigation logic | `_direction` state set but never read; dead code | `OnboardingPage.tsx:12` |
| 32 | 🟡 MEDIUM | Dependencies | npm audit: High severity vulnerabilities | Run `npm audit` in project root | 0 high/critical vulnerabilities | 4 high severity vulnerabilities: `serialize-javascript` <=7.0.2 RCE via RegExp.flags (via `vite-plugin-pwa`) | `package.json` dependency chain |
| 33 | 🟡 MEDIUM | GroceryPage | div with role="checkbox" instead of native element | Open GroceryPage, navigate with keyboard, try to interact with checkboxes | Native `<input type="checkbox">` with proper keyboard support and ARIA | Custom div with `role="checkbox"`; keyboard navigation broken, screen reader support degraded | `GroceryPage.tsx:63` |
| 34 | 🟡 MEDIUM | CycleOnboarding | No error feedback on async failure | Complete cycle onboarding form, trigger network error during `onComplete()` call | Error message displayed; user can retry or close | User sees no error message and remains stuck on onboarding screen | `CycleOnboarding.tsx` |
| 35 | 🔵 LOW | TrainingPage | Unused import: isToday as isDateToday | Code review | All imports used | Unused import clutters code; unnecessary bundle weight | `TrainingPage.tsx:5` |
| 36 | 🔵 LOW | LoadingSpinner | Missing aria role for screen readers | Use screen reader on page with LoadingSpinner | Screen reader announces "Loading..." | Screen reader silent; no loading state announcement | `LoadingSpinner.tsx` |
| 37 | 🔵 LOW | AchievementToast | Hardcoded "Achievement Unlocked!" string | Switch app to non-English language | Toast text appears in selected language | Toast always shows "Achievement Unlocked!" in English | `AchievementToast.tsx` |
| 38 | 🔵 LOW | PRToast | navigator.vibrate() not in try-catch | Trigger PR toast on browser without vibration support | Vibration gracefully handled or ignored | Uncaught exception if vibration not supported | `PRToast.tsx` |
| 39 | 🔵 LOW | HeartRatePage | Calorie formula undocumented | Inspect HeartRatePage calorie calculation | Formula has inline comment with scientific basis or citation | Formula `(duration / 60) * (avgHR * 0.1) * 0.5` has no documentation or scientific justification | `HeartRatePage.tsx:100` |
| 40 | 🔵 LOW | OfflineBar | z-index 80 potential stacking context conflict | Open modal/toast while OfflineBar visible | OfflineBar does not overlap modals or toasts | OfflineBar (z-index: 80) may appear above modals/toasts depending on stacking context | `OfflineBar.tsx` |

---

## Severity Breakdown

### 🔴 Critical (10 bugs)
These bugs cause app crashes, data loss, security vulnerabilities, or complete feature breakage. They must be fixed before any public release.

- **No Error Boundary** — Complete app crash on any unhandled error
- **Memory Leaks (3)** — BLE listener, Timer intervals, BarcodeScanner intervals cause gradual performance degradation
- **Division by Zero (2)** — ACR calculation and body measurement percentage cause Infinity/NaN
- **PR Comparison Bug** — RX vs Scaled workouts conflated
- **Database Import Vulnerability** — Data loss on failed import
- **Security: Firebase Config** — API keys exposed in plain text
- **Security: Gemini API Key** — API key in URL query string, visible in browser history and logs

**Recommendation:** Block all releases until critical bugs are resolved. Implement error boundary immediately. Audit all memory management. Move API keys to secure backend. Fix all division-by-zero checks.

### 🟠 High (10 bugs)
These bugs cause significant feature degradation, accessibility issues, or data integrity problems. Should be fixed before first production release.

- **Camera Not Released** — Camera stays active after PhotoLogPage unmount
- **Form Reset Incomplete** — User config persists across new workout entries
- **PR Detection Async Bug** — Wrong PR marked as personal record
- **Validation Bypass** — Users skip required onboarding fields
- **Input Range Missing** — Invalid recovery values (>10) accepted
- **Cycle Prediction Inflexible** — Ovulation always predicted at fixed day
- **Small Touch Targets (4)** — Multiple buttons below 44px minimum; poor mobile UX
- **Localization Bypass** — 200+ hardcoded English strings

**Recommendation:** Fix all validation logic and input constraints. Implement proper cleanup in effect hooks. Ensure all user-facing strings use i18n. Audit all touch target sizes against HIG/WCAG.

### 🟡 Medium (14 bugs)
These bugs affect specific features, edge cases, or non-critical functionality. Should be addressed before general availability.

- **Hardcoded Age** — Max HR always calculated for 30-year-old
- **Small Touch Targets (4)** — TimerPage, HyroxLogger, WaterTracker, MealLogger buttons undersized
- **Cloud Sync Without Transactions** — Potential data corruption
- **Timezone Bug** — Streak calculation fails on DST transition
- **RED-S Detection** — Window too short; misses chronic cases
- **Timer Parser** — Returns NaN for invalid input
- **No Delete Confirmation** — Accidental meal deletion possible
- **Dead Code** — `_direction` variable unused
- **Security Vulnerabilities** — 4 high-severity npm packages
- **Accessibility Issues (2)** — `div[role="checkbox"]` instead of native input; LoadingSpinner no aria-role
- **No Error Feedback** — CycleOnboarding silent failure

**Recommendation:** Implement comprehensive input validation. Add transaction support for cloud sync. Fix all timezone edge cases. Audit dependencies and update vulnerable packages. Add confirmation dialogs for destructive actions. Ensure all semantic HTML and ARIA labels.

### 🔵 Low (6 bugs)
Minor code quality, documentation, or non-critical accessibility issues.

- Unused import
- Missing screen reader announcement
- Hardcoded toast string
- Uncaught exception in vibration API
- Undocumented formula
- Potential z-index conflict

**Recommendation:** Clean up unused imports. Add i18n for all toast messages. Wrap third-party API calls in try-catch. Document calculation formulas. Review z-index stacking context.

---

## Risk Assessment

### Highest Priority
1. **Error Boundary** — Prevents catastrophic app crashes
2. **Memory Leaks** — Cause long-term device slowdown and eventual crash
3. **API Key Security** — Exposes backend to abuse and cost overruns
4. **Database Integrity** — Import process can permanently lose user data
5. **Form Validation** — Allows invalid data to persist

### User Experience Impact
- **Touch Target Sizing** — Affects all mobile users, especially those with limited dexterity
- **Localization** — Blocks international expansion
- **Camera Cleanup** — Drains battery and violates user expectations

### Data Security & Privacy
- Firebase config in localStorage
- Gemini API key in URL query string
- No input validation on sensitive health data
- RED-S detection produces false negatives

---

## Recommendations

### Immediate Actions (Before Alpha Release)
1. Implement Error Boundary component wrapping all routes
2. Add proper cleanup to all useEffect hooks (remove event listeners, clear intervals, stop streams)
3. Move Firebase config and API keys to secure backend with authentication
4. Add transaction support to database import/export
5. Implement comprehensive input validation with range checks
6. Fix all division-by-zero edge cases

### Short-term (Week 1-2)
1. Audit and increase all touch targets to 44x44px minimum
2. Migrate all hardcoded strings to i18n system
3. Add error boundaries to individual features
4. Implement confirmation dialogs for destructive actions
5. Update vulnerable npm packages

### Medium-term (Week 3-4)
1. Comprehensive accessibility audit (WCAG 2.1 AA)
2. Memory profiling and performance testing
3. Timezone edge case testing and fixes
4. Improve cycle prediction algorithm with wider ovulation window
5. Add transaction support throughout cloud sync

### Long-term (Before GA)
1. Full security audit by third-party firm
2. Load testing for concurrent users
3. International localization and RTL support
4. Comprehensive error logging and monitoring
5. User acceptance testing on real devices

---

## Testing Checklist

- [ ] Error Boundary catches all component errors without white screen
- [ ] Memory usage stable over 30+ navigation cycles (no leaks)
- [ ] Timer intervals clear properly on unmount
- [ ] Camera and streams release on component unmount
- [ ] Form reset completes all fields
- [ ] PR comparison correctly filters by RX/Scaled division
- [ ] Database import rolls back on failure
- [ ] All inputs validate range and type
- [ ] All touch targets 44px or larger
- [ ] All user strings use i18n keys
- [ ] Delete operations require confirmation
- [ ] All API keys in secure backend headers, never in URLs or localStorage
- [ ] Screen reader announces loading states and errors
- [ ] Offline mode functions correctly
- [ ] PWA install prompt functions on supported devices

---

## Conclusion

The TrackVolt (CrossTrack) PWA has 40 identified bugs across critical, high, medium, and low severity categories. The most urgent issues are the complete lack of error boundaries, multiple memory leaks, and security vulnerabilities exposing API keys. While the core feature set is functional, several critical stability and security fixes are required before any public release. Estimated effort to resolve: 2-3 weeks of focused development.
