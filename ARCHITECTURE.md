# TrackVolt Architecture
> Last updated: 2026-03-07

## App Architecture

```
┌─────────────────────────────────────────┐
│              App.tsx (Router)           │
│         Zustand activeTab state         │
├─────┬─────┬─────┬─────┬────────────────┤
│Today│Train│ Log │ Eat │     More       │
│Page │Page │Page │Page │  (18 pages)    │
└──┬──┴──┬──┴──┬──┴──┬──┴───────┬────────┘
   │     │     │     │          │
   ▼     ▼     ▼     ▼          ▼
┌─────────────────────────────────────────┐
│           Custom Hooks Layer            │
│  useStreak, useReadiness, useWorkout-   │
│  Form, useMealForm, useCycleTracking,   │
│  usePRDetection, useMetricForm, etc.    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Zustand Store (useStore)        │
│    Global state + DB operation layer    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      Dexie (IndexedDB) — v6 Schema     │
│     16+ tables, offline-first data     │
└─────────────────────────────────────────┘

External Services (optional):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Firebase │  │  Gemini  │  │  USDA +  │
│  (auth)  │  │(WOD scan)│  │   OFF    │
└──────────┘  └──────────┘  └──────────┘
      ▲              ▲            ▲
      │              │            │
┌─────┴──────────────┴────────────┴──────┐
│    Vercel Serverless Functions (api/)   │
│  nutrition-search.ts, barcode-lookup.ts │
└────────────────────────────────────────┘
```

## Key Patterns

### Component Architecture
- **Pure presentational components**: All data via props, no internal state computation
- **Hook-based logic**: Business logic lives in custom hooks, never in components
- **Lazy loading**: Heavy components (WorkoutLogger, HyroxLogger, etc.) loaded via React.lazy()

### Data Flow
1. User action → Component callback
2. Callback → Hook method (useWorkoutForm, useMealForm, etc.)
3. Hook → Zustand store action
4. Store → Dexie (IndexedDB) persistence
5. Store → React re-render via Zustand subscription

### State Management
- **Zustand** for global app state (active tab, loaded data, DB operations)
- **React useState** for local component state (form inputs, UI toggles)
- **Custom hooks** bridge between components and store (useStreak, useReadiness, etc.)

### Offline-First
- All data stored in IndexedDB via Dexie
- Service worker caches app shell + API responses
- nutritionApi.ts has offline fallback to local food library
- Firebase sync is optional add-on, not required

### API Proxy Pattern
- Client calls `/api/nutrition-search` or `/api/barcode-lookup`
- Vercel serverless functions proxy to USDA/OpenFoodFacts
- Service worker caches responses (7-30 day TTL)
- Client-side nutritionApi.ts adds IndexedDB caching layer on top

### Design Token System
- CSS custom properties in `index.css` (ct-bg, ct-surface, ct-border, ct-1, ct-2)
- Tailwind v4 reads these directly
- Brand color: #22d3ee (cyan-400) for actions
- Spring physics animations: cubic-bezier(0.34, 1.56, 0.64, 1)

## File Size Budget
- Main bundle: ~150KB (gzipped ~43KB)
- WorkoutLogger chunk: ~155KB (largest lazy chunk)
- Firebase chunk: ~333KB (only loaded if sync enabled)
- Total PWA precache: ~2.8MB
