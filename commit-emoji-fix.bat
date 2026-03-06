@echo off
cd /d "%~dp0"

echo === Adding build-safe emoji fixes ===

git add src/utils/emoji.ts
git add src/pages/MealPrepPage.tsx
git add src/components/log/CardioLogger.tsx
git add src/components/log/WaterTracker.tsx
git add src/components/log/EventScoreEntry.tsx
git add src/components/log/BenchmarkWodPicker.tsx
git add src/components/log/MovementPicker.tsx
git add src/components/log/CycleLogger.tsx
git add src/hooks/useCycleTracking.ts
git add src/hooks/useStreakCelebration.ts
git add src/i18n/en.ts
git add src/i18n/zh-TW.ts
git add src/i18n/zh-CN.ts

git commit -m "fix: replace literal emoji chars with runtime String.fromCodePoint() to survive Vercel build encoding - Centralized emoji utility (E) in src/utils/emoji.ts - Fixed 10 files: MealPrepPage, CardioLogger, WaterTracker, EventScoreEntry, BenchmarkWodPicker, MovementPicker, CycleLogger, useCycleTracking, useStreakCelebration - Replaced em-dashes and right arrows in all i18n files (en, zh-TW, zh-CN) - All emojis now render correctly on production instead of showing garbled chars"

echo === Pushing to main ===
git push origin main

echo === Done! ===
pause
