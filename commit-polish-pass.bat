@echo off
cd /d "C:\ClaudeWork\Imu\TrackVolt-App"
git add src/components/log/WorkoutLogger.tsx src/db/database.ts src/components/ErrorBoundary.tsx src/pages/OnboardingPage.tsx
git commit -m "polish: CrossFit log layout, food re-seed, i18n ErrorBoundary, onboarding UX - CrossFit log page: hero card Full Class, centered WOD/Strength grid, enhanced Events card - Food library: version-aware re-seed (preserves custom foods, updates 32->211 automatically) - ErrorBoundary: trilingual i18n fallback (en/zh-TW/zh-CN), card-press on buttons - OnboardingPage: stagger-children animations, card-press on all buttons, build-safe emojis via String.fromCodePoint"
git push origin main
echo.
echo Done! Changes committed and pushed.
pause
