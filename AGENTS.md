# AGENTS.md — READ THIS FIRST BEFORE ANY CHANGES

## Current State (March 5, 2026 — Session 3)
⚠️ **CRITICAL: LOCAL CODE IS BEHIND PRODUCTION BY ~30+ FILES!**

The local source is an EARLIER version. Production (deployment GTeJwY1rw) has:
- 11 hooks in src/hooks/ (all missing locally)
- 3 service files in src/services/ (all missing locally)
- ~15 extra components in src/components/ (all missing locally)
- 2 serverless functions in api/ (missing locally)
- Richer page implementations (e.g., 60 achievements vs local’s 12)

⚠️ **DO NOT DEPLOY LOCAL CODE** — it would OVERWRITE production with simpler versions!

**Recovery plan:** Extract production source from Vercel Source tab, then save locally and push to GitHub.
See TRACKVOLT_MASTER_DOC.md Section 8 for full gap analysis.

## NON-NEGOTIABLE SAFETY RULES
1. DO NOT deploy/publish/overwrite production unless user types exactly: **"CONFIRM DEPLOY"**
2. DO NOT delete/reset anything unless user types exactly: **"CONFIRM DESTRUCTIVE"**
3. DO NOT change domains, env vars, API keys, billing, or paid services unless user types exactly: **"CONFIRM SECRETS"**
4. DO NOT rebuild the app from scratch. Work only on the existing project.
5. DO NOT start implementing feature changes until user says: **"CONFIRM BUILD"**

## Safe Production Reference
- **Last known good deployment ID:** GTeJwY1rw
- **Platform:** Vercel (project: crosstrack)
- **URL:** https://trackvolt.app
- **Dashboard:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack
- **Deployments:** https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments

## Session Startup Protocol
1. Read ONLY these 3 files first: AGENTS.md, TRACKVOLT_MASTER_DOC.md, CHANGELOG_TRACKVOLT.md
2. If you need to explore many files, delegate via subagent and write summaries back into TRACKVOLT_MASTER_DOC.md
3. Keep the main conversation short; do heavy exploration via subagent workflow
4. Note current Vercel deployment ID before any deployment work

## Rules for Any AI Agent Working Here

### NEVER DO:
1. ❌ Never run `npx vercel --prod` without user typing "CONFIRM DEPLOY"
2. ❌ Never delete files/data without user typing "CONFIRM DESTRUCTIVE"
3. ❌ Never modify `.vercel/project.json`
4. ❌ Never modify env vars, API keys, or domain config without "CONFIRM SECRETS"
5. ❌ Never assume production = local (they may differ)

### ALWAYS DO:
1. ✅ Read memory files before any work
2. ✅ Test with `npm run build` before considering deployment
3. ✅ Stop and tell the user — do NOT deploy automatically
4. ✅ Remember: TypeScript strict mode is ON — unused imports = build failure
5. ✅ Update CHANGELOG_TRACKVOLT.md after each session

### HOW TO SAFELY MAKE CHANGES:
1. Edit local source files
2. Run `npm run build` to verify no TypeScript errors
3. Run `npm run dev` to test locally at localhost:5174
4. **STOP and tell the user** — do NOT deploy automatically
5. User decides when/if to deploy with "CONFIRM DEPLOY"

## Emergency Rollback
If production breaks:
1. Go to https://vercel.com/imteyazmdkaish-1195s-projects/crosstrack/deployments
2. Find deployment **GTeJwY1rw**
3. Click ... → Promote
4. Hard refresh browser: Ctrl+Shift+R

## Tech Stack
- React 19 + TypeScript + Vite 7 + Tailwind CSS v4
- Zustand 5 (state) + Dexie (IndexedDB) + Recharts
- Lucide React icons + react-i18next (en + zh-TW + zh-CN)
- PWA with vite-plugin-pwa (aggressive service worker caching)
- tsconfig: noUnusedLocals=true, noUnusedParameters=true

## Design System
- Brand color: #C8FF00 (volt green) — use sparingly
- Background: #0D0D14 (app), #13131E (card), #1A1A28 (raised)
- Text: #F0F0F8 (primary), #8888A0 (secondary), #50505E (muted)
- All cards: glass-card class, rounded, layered backgrounds for depth
- Mobile first: max-width 512px, bottom tab bar with raised Log button

## Vercel Project Config
- Project ID: prj_HRKKptQiVRpYrBtmsCVahz3Zv7ah
- Org ID: team_S7ukXJeYnSsExx3B9QOmqqMD

## File Access Notes
- MCP filesystem tool has direct read/write access to `C:\ClaudeWork\Imu\TrackVolt-App\`
- Bash tool runs in Linux VM — CANNOT access Windows filesystem
- Vite dev server auto-reloads when files are written via MCP filesystem

---
*Last updated: March 5, 2026 — Session 2*
