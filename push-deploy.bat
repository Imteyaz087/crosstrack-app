@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App
echo Pushing to GitHub (triggers Vercel deploy)...
git push origin master
echo Deploy triggered! Check trackvolt.app in ~1 min.
pause
