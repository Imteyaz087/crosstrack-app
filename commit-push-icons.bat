@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App
echo Committing and pushing icon files...
git add public/favicon.ico public/favicon.svg public/apple-touch-icon.png public/icon-192.png public/icon-512.png
git status
git commit -m "fix: update favicon and app icons with new TrackVolt logo - favicon.ico, favicon.svg, apple-touch-icon, icon-192, icon-512 - Production was still showing old default icon"
git push origin main
echo Pushed! Logo should update on trackvolt.app shortly.
pause
