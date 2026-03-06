@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App
echo Committing emoji fix...
git add src/pages/TimerPage.tsx
git commit -m "fix: use Unicode escape sequences for emojis in WOD Timer - Emojis rendered as ?? in production builds due to encoding issues - Replaced literal emoji chars with Unicode escape sequences - Same emojis (fire, timer, runner, boom, chill, party) now build-safe - Consistent rendering across dev and production environments"
echo Done! You can now deploy.
pause
