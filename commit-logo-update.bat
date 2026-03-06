@echo off
echo === TrackVolt Logo Update ===
echo.

cd /d "%~dp0"

echo [1/3] Copying new logos to public/ folder...
copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-192x192.png" "public\icon-192.png"
copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-512x512.png" "public\icon-512.png"
copy /Y "TrackVolt Logo\06-App-Icons\AppIcon-180x180.png" "public\apple-touch-icon.png"
copy /Y "TrackVolt Logo\06-App-Icons\favicon.ico" "public\favicon.ico"
echo Done.
echo.

echo [2/3] Staging files for commit...
git add public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/favicon.ico
git add index.html vite.config.ts
git add src/App.tsx
git add src/components/ConfirmDialog.tsx
git add src/components/log/EventLogger.tsx
git add src/components/log/EventScoreEntry.tsx
git add src/components/log/WodScanReview.tsx
git add src/components/log/EventReview.tsx
git add src/components/log/CycleCalendar.tsx
git add src/pages/WeeklyPlannerPage.tsx
git add src/pages/OnboardingPage.tsx
git add src/pages/CalcPage.tsx
git add src/components/log/LogModeSelector.tsx
echo Done.
echo.

echo [3/3] Creating commit...
git commit -m "feat: update app icons with new TrackVolt branding + accessibility improvements" -m "Logo changes:" -m "- Replace all PWA icons (192, 512, apple-touch-icon) with new TrackVolt bolt logo" -m "- Add favicon.ico, switch from SVG favicon" -m "- Update index.html and vite.config.ts favicon references" -m "" -m "Accessibility improvements:" -m "- Upgrade form labels from text-ct-3 to text-ct-2 for WCAG AA contrast" -m "- Add dialog roles (role=dialog, aria-modal) to overlay components" -m "- Add skip-to-content link in App.tsx" -m "- Add aria-live region for screen reader tab announcements" -m "" -m "Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
echo.

echo === Done! ===
echo.
pause
