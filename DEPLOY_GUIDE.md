# CrossTrack — Deploy Guide

## Option 1: Deploy to Vercel (Recommended, 2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with your GitHub account
3. Import your repository OR use "Upload" to drag the CrossTrack-App folder
4. Vercel auto-detects Vite → Click "Deploy"
5. Done! You get a URL like `crosstrack-xxx.vercel.app`

## Option 2: Deploy to Netlify (2 minutes)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder onto the page
3. Done! You get a URL immediately
4. Optionally: sign up to claim a custom domain

## Option 3: Deploy via GitHub + Vercel (best for updates)

```bash
# 1. Create repo on GitHub
gh repo create crosstrack --public --source=. --push

# 2. Deploy
npx vercel --prod
```

## Option 4: Run Locally

```bash
cd CrossTrack-App
npm install
npm run dev
# Open http://localhost:5173
```

## PWA Install Instructions (after deploy)

### iPhone:
1. Open the deployed URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android:
1. Open the deployed URL in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home screen" or "Install app"
4. Tap "Install"

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Dexie.js (IndexedDB)
- Zustand (state management)
- Recharts (charts)
- react-i18next (EN + 繁中)
- vite-plugin-pwa (offline support)
