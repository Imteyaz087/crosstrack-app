# TrackVolt (CrossTrack) PWA

Mobile-first fitness PWA for CrossFit / hybrid athletes.

## Stack
- React 19 + TypeScript 5 + Vite 7
- Tailwind CSS 4
- Zustand + Dexie (IndexedDB)
- PWA via `vite-plugin-pwa`

## Project Paths
- Source root: `C:\ClaudeWork\Imu\TrackVolt-App`
- Live app: https://trackvolt.app
- Static production snapshot: `C:\ClaudeWork\Imu\TrackVolt-v2`

## Install
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm install
```

## Run Dev
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm run dev
```

## Build
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm run build
```

## Environment Setup
Keep all local configuration inside `C:\ClaudeWork\Imu\TrackVolt-App`.

1. Create a local env file:
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
copy .env.example .env.local
```

2. Fill only the values you actually use:
- `VITE_FIREBASE_*` for Firebase Cloud Sync
- `USDA_API_KEY` for the serverless nutrition search API

Notes:
- Firebase is optional. If `VITE_FIREBASE_*` is blank, the app can still be configured from `Settings > Cloud Sync` at runtime.
- `npm run dev` starts the Vite client app.
- `api/nutrition-search.ts` reads `USDA_API_KEY` in a serverless environment. For deployed use, keep that value in Vercel env settings, not in source control.
- `.env.local` stays portable because it lives inside this project folder, but it should remain private to your machine/account.

## Capacitor / iOS Prep
Capacitor is now initialized in this project root.

Files/folders:
- `capacitor.config.ts`
- `ios/`

Sync the current web build into the native wrapper:
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm run cap:sync
```

Copy web assets only:
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm run cap:copy
```

Mac-only follow-up for actual iOS builds:
```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npx cap open ios
```

Notes:
- Current bundle id in `capacitor.config.ts` is `app.trackvolt`, inferred from the live domain `trackvolt.app`.
- Xcode, Simulator, code signing, TestFlight, and App Store submission still require macOS.

## Deploy (Manual only)
Do not run production deploy unless user explicitly confirms with `CONFIRM DEPLOY`.

```bash
cd C:\ClaudeWork\Imu\TrackVolt-App
npm run build
npx vercel --prod
```

## Handoff
- Preferred: push this folder to GitHub repo `https://github.com/Imteyaz087/crosstrack-app`
- Backup: `C:\ClaudeWork\Imu\TrackVolt-App.zip` (generated, excludes `node_modules`, `.git`, `dist`)

## Safety Gates
- Deploy/publish requires: `CONFIRM DEPLOY`
- Delete/reset requires: `CONFIRM DESTRUCTIVE`
- Secrets/domain/env/billing changes require: `CONFIRM SECRETS`
