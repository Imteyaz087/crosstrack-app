@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App
echo Committing and pushing emoji fix v2...
git add src/pages/TimerPage.tsx
git commit -m "fix: use String.fromCodePoint() for runtime emoji generation - Unicode escape sequences still got corrupted during Vercel build - Now emojis are generated at runtime via String.fromCodePoint() - Completely immune to build encoding issues - Same emojis: fire, timer, runner, boom, chill, party"
git push origin main
echo Pushed! Vercel deploy should start in ~30 seconds.
pause
