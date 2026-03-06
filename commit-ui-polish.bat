@echo off
cd /d C:\ClaudeWork\Imu\TrackVolt-App

echo === Staging UI polish files ===
git add src/index.css
git add src/components/TabBar.tsx
git add src/pages/TodayPage.tsx

echo === Creating commit ===
git commit -m "feat: UI micro-interaction polish — glass cards, tab bounce, ambient gradient, glowing bars" -m "- Enhanced card-press with depth response (brightness + translateY)" -m "- Glass-card frosted surface treatment for hero workout card" -m "- Ambient gradient header backdrop (brand cyan/purple radial wash)" -m "- Glowing progress bars (bar-glow pseudo-element with blur)" -m "- Surface-highlight inner glow on nutrition + metrics cards" -m "- Tab icon bounce animation on selection (spring physics)" -m "- Smoother page slide transitions (spring easing curve)" -m "- Active tab label now semibold for stronger visual hierarchy" -m "" -m "Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo === Done! ===
git log --oneline -3
pause
