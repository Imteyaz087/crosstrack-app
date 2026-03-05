# TrackVolt

A mobile-first fitness PWA for CrossFit athletes — training, nutrition, and progress tracking.

- **Live:** [trackvolt.app](https://trackvolt.app)
- **Local dev:** `npm run dev` → http://localhost:5173

---

## Local vs Production Data

**Data is stored locally per device/origin.** The app uses IndexedDB (Dexie), which is scoped by `protocol + domain + port`. Therefore:

| Origin | Database |
|--------|----------|
| `https://trackvolt.app` | Production data |
| `http://localhost:5173` | Local/dev data |

**localhost data ≠ production data.** There is no backend/cloud sync. If you see different entries on prod vs local, that's expected.

### Syncing local with production

1. On **trackvolt.app**: Settings → Export DB to JSON (download file).
2. On **localhost**: Settings → Import (Overwrite) → select the downloaded file.

---

## DEV tools (localhost only)

When running `npm run dev`, Settings shows a **Developer Tools** section:

- **Export DB to JSON** — Download full backup
- **Import (Overwrite)** — Replace local DB with imported file
- **Import (Merge)** — Add imported data without clearing existing
- **Reset Local DB** — Clear all data and reseed defaults

Use these to debug with prod-like data or reset a corrupted local DB.

---

## Quick Start

```bash
npm install
npm run dev
```

See [AGENTS.md](../AGENTS.md) in the parent folder for full development guidelines.
