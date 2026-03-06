# TrackVolt Live App Audit — Updated 2026-03-06
> Audited by Claude (Cowork) + Codex — compared live trackvolt.app vs local codebase

---

## STATUS SUMMARY

| Area | Status | Notes |
|---|---|---|
| PWA icons | ✅ FIXED | icon-192.png, icon-512.png, icon-512-maskable.png created |
| PWA screenshots | ✅ FIXED | 7 screenshots in public/screenshots/ |
| types/index.ts | ✅ FIXED | Dead interfaces removed, fields aligned |
| .env.example | ✅ FIXED | Codex added portability template |
| Capacitor | ✅ DONE | Codex installed 8.1.0, ios/ folder created, cap:sync verified |
| Build | ✅ PASSES | tsc --noEmit + vite build both clean |
| Dead file cleanup | ⏳ PENDING | Run `node backup-and-cleanup.mjs` |
| OG image | ✅ PRESENT | og-image.png in public/ |
| favicon.ico | ✅ PRESENT | favicon.ico in public/ |
| apple-touch-icon | ✅ PRESENT | apple-touch-icon.png in public/ |

---

## REMAINING ACTION: Backup + Cleanup

Run this single command to backup everything and remove dead files:
```cmd
cd C:\ClaudeWork\Imu\TrackVolt-App
node backup-and-cleanup.mjs
```

This will:
1. Git commit everything as-is (safety net)
2. Delete 7 stray root-level files (BarcodeScanner.tsx, CycleCalendar.tsx, etc.)
3. Delete 6 dead src files (PlaceholderPage.tsx, Toast.tsx, InstallBanner.tsx, etc.)
4. Delete 7 helper scripts (fix-icons.mjs, take-screenshots.mjs, etc.)
5. Git commit the cleanup
6. Self-delete

### Files being removed:

**Root strays (duplicates of src/ files):**
- BarcodeScanner.tsx, CycleCalendar.tsx, CycleLogger.tsx, MealLogger.tsx
- useCycleTracking.ts, useWorkoutForm.ts, zh-CN.ts

**Dead source files (not imported by any production code):**
- src/components/PlaceholderPage.tsx
- src/components/Toast.tsx
- src/components/InstallBanner.tsx (InstallPrompt.tsx is used instead)
- src/data/foodLibrary.ts
- src/data/movements.ts
- src/i18n/zhCN.ts.bak

**Helper scripts (already did their job):**
- fix-icons.mjs, take-screenshots.mjs, setup-icons.mjs, generate-icons.js
- check-imports.cjs, verify-store-usage.cjs, unpack-source.cjs

---

## MANIFEST ASSET CHECKLIST

All assets the PWA manifest expects — verified present:

| Expected | File Exists | Size Correct |
|---|---|---|
| /icon-192.png | ✅ | 192x192 |
| /icon-512.png | ✅ | 512x512 |
| /favicon.svg | ✅ | — |
| /og-image.png | ✅ | 1200x630 |
| /robots.txt | ✅ | — |
| /apple-touch-icon.png | ✅ | 180x180 |
| /favicon.ico | ✅ | — |
| /screenshots/today-dashboard.png | ✅ | 1290x2796 |
| /screenshots/workout-log.png | ✅ | 1290x2796 |
| /screenshots/nutrition-macros.png | ✅ | 1290x2796 |
| /screenshots/progress-prs.png | ✅ | 1290x2796 |
| /screenshots/cycle-training.png | ✅ | 1290x2796 |
| /screenshots/achievements.png | ✅ | 1290x2796 |
| /screenshots/offline-first.png | ✅ | 1290x2796 |

---

## LIVE APP FEATURES REVIEW

### What Works Well
- **Today Dashboard:** Greeting, date, quick actions (WOD Timer, 1RM Calc, Quick Log), training summary, PR display, macros, smart nudges, training insights, grocery preview
- **Training Page:** Calendar with workout markers, "Log CrossFit" CTA, Movement PRs, PR Board, Recent Workouts
- **Log Page:** 3-category grid (Training, Body & Nutrition, Wellness & Recovery) + Quick Templates
- **Eat Page:** Daily nutrition with meal slots + template support
- **More Page:** 18 sub-pages across 5 categories
- **Achievements:** 60 badges with Bronze/Silver/Gold tiers
- **Progress:** Multi-tab with time filters and 14-day heatmap
- **Settings:** Profile, targets, language (EN/繁中/简中), Gemini AI, Firebase sync, data export/import
- **i18n:** Full trilingual support

### UX Improvements (for after iOS launch)

**Priority A — Should fix:**
1. Quick stats row labels on Today page — hard to read at a glance
2. Macro bars at 0% — show "No meals logged" instead of zeros
3. No splash/launch screen — blank dark screen before content loads
4. Maskable icon uses same file as regular (could look better with padding)

**Priority B — Nice to have:**
1. No onboarding recap / feature tour
2. Dark-only (no light mode)
3. Haptic feedback needs Capacitor
4. No push notifications
5. Share cards could be more prominent

**Priority C — iOS-specific polish:**
1. Safe area / notch handling
2. Pull-to-refresh
3. Swipe-back gesture
4. App Store metadata
5. In-app review prompt (ReviewPrompt.tsx needs Capacitor plugin)

---

## iOS DEPLOYMENT CHECKLIST

| Step | Status | Notes |
|---|---|---|
| Local matches live | ✅ 100% | All assets aligned |
| Capacitor init | ✅ DONE | Codex — 8.1.0 installed |
| iOS project created | ✅ DONE | Codex — ios/ folder exists |
| cap:sync verified | ✅ DONE | Codex — passes clean |
| Dead file cleanup | ⏳ PENDING | Run backup-and-cleanup.mjs |
| App icons (Xcode sizes) | ⏳ PENDING | Have 1024x1024 master, need asset catalog |
| Splash screens | ⏳ PENDING | Need launch storyboard |
| Apple Developer account | ❓ UNKNOWN | User needs to set up ($99/yr) |
| Privacy policy URL | ⏳ PENDING | Required for App Store |
| App Store description | ⏳ PENDING | |
| TestFlight build | ⏳ PENDING | Needs Mac with Xcode |
| App Store submission | ⏳ PENDING | |

---

## PORTABILITY STATUS

| Check | Status |
|---|---|
| All code in C:\ClaudeWork\Imu\ | ✅ |
| No absolute paths in source | ✅ (Codex verified) |
| .env.example for secrets | ✅ (Codex added) |
| node_modules regenerable | ✅ (npm install) |
| ios/ included in project | ✅ |
| dist/ regenerable | ✅ (npm run build) |

**To move to a new laptop:** Copy `C:\ClaudeWork\Imu\` → run `npm install` → run `npm run build` → done.

---

*Last updated: 2026-03-06 by Claude (Cowork)*
