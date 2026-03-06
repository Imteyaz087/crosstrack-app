@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App
echo Committing and pushing log tile icon fix...
git add src/components/log/LogModeSelector.tsx
git commit -m "fix: improve log mode tile icons - larger, centered layout - Icons increased from 24px to 36px for better visibility - Tiles now use aspect-square with centered flexbox - Removed separate icon halo container for cleaner look - Labels use tighter text for better fit in grid"
git push origin main
echo Pushed! Check trackvolt.app in ~1 min.
pause
