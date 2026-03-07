# Codex Findings

## 2026-03-06
- Coordination ambiguity: `CODEX_SYNC.md` says the local codebase should match live `trackvolt.app` exactly, but it also says `src/components/log/WorkoutLogger.tsx` is intentionally different from production and must not be overwritten. Treat this as an approved local divergence unless the user explicitly asks to converge that file back to live parity.
- Coordination note: `CODEX_SYNC.md` is located at `C:\ClaudeWork\Imu\TrackVolt-App\CODEX_SYNC.md`, not at the parent workspace root.
- Parity audit (confirmed): the app shell and lazy page map currently align with live production. `src/App.tsx`, `src/pages/MorePage.tsx`, and `src/pages/LogPage.tsx` match the live bundle structure from `index-Cny5lKgo.js`, `MorePage-ClAdLFQh.js`, and `LogPage-0NaviZgC.js`.
- Parity gap (confirmed): local PWA packaging does not match live. `vite.config.ts` and `dist/manifest.webmanifest` point to `/icon-192.png`, `/icon-512.png`, and `/screenshots/*.png`, but local `public/` and `dist/` do not contain those paths. Local build contains `AppIcon-192x192.png` / `AppIcon-512x512.png` instead, and `public/screenshots/` is missing. Live production serves the manifest targets with HTTP 200.
- iOS readiness gap (confirmed): there is no Capacitor setup yet. No `@capacitor/*` packages in `package.json`, no `capacitor.config.*`, and no `ios/` project folder.
- Portability result (confirmed): no absolute path references outside `C:\ClaudeWork\Imu\` were found in `src/`, `public/`, root config files, or the main project docs during this audit.
- Portability risk (confirmed): there is no `.env.example`, while `src/services/firebase.ts` uses `VITE_FIREBASE_*` env vars and `api/nutrition-search.ts` uses `process.env.USDA_API_KEY`. A copied folder will still build, but cloud/API-backed features will need manual secret re-entry unless a safe example/setup doc is added.
- Update (resolved locally): the PWA packaging parity gap is now fixed in the latest build. Local `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `public/screenshots/*` are now present and match the manifest references.
- Update (resolved locally): the portability risk is now addressed. `.env.example` has been added with all env var names needed by the codebase, and `.gitignore` has been updated to track `.env.example` while ignoring real `.env` files.
- Update (resolved locally): Capacitor 8.1.0 is now installed with a fresh `capacitor.config.ts` and `ios/` native project. `npm run cap:sync` passes and correctly copies the web build into `ios/App/App/public`.

*This file contains coordination notes, audit findings, and cross-agent guidance. Keep updating it as work progresses.*

## 2026-03-07 - Current critical audit after CrossFit/PWA/nutrition passes
- Current repo state: `npm run build` is PASSING, but `npm run lint` is FAILING with 83 errors and 24 warnings. The project is buildable, but not code-health clean.
- Highest-priority immediate engineering issue is not feature breadth; it is correctness and maintainability debt in a few concentrated files.
- Most critical file by lint/error density is `src/stores/useStore.ts`. It contains a large cluster of `no-unused-expressions` and `no-explicit-any` issues. This is the central state file, so it is the highest structural risk in the app.
- Next critical correctness files:
  - `src/services/firebase.ts` (`any` usage, unused vars)
  - `src/components/UpdatePrompt.tsx` (setState inside effect)
  - `src/components/SaveCelebration.tsx` (Math.random during render)
  - `src/pages/TodayPage.tsx` (memoization/dependency lint issues)
- Product-critical status: CrossFit logger, WOD timer, PWA update flow, and nutrition Chinese/Taiwan search have all moved forward, but the new Today-page decision-layer change is still LOCAL ONLY in `src/pages/TodayPage.tsx`. It is not yet committed, pushed, or deployed.
- Coordination risk: `WorkoutLogger.tsx` and `TimerPage.tsx` remain high-conflict files and should continue to have one editor at a time.
- Documentation drift exists. `RELEASE_STATUS.md` currently claims no blocking issues, but current lint state and deploy history are stale relative to that file. Coworker should treat release docs as needing refresh after the current round of commits.

### Recommended priority order now
1. Decide whether to keep the new Today-page decision-layer UX in `src/pages/TodayPage.tsx`.
2. If yes, commit/push/deploy it as a stable checkpoint.
3. Then fix lint debt in this order:
   - `src/stores/useStore.ts`
   - `src/services/firebase.ts`
   - `src/components/UpdatePrompt.tsx`
   - `src/components/SaveCelebration.tsx`
   - `src/pages/TodayPage.tsx`
4. After that, refresh `RELEASE_STATUS.md` and related docs so launch/readiness notes match reality.

### What should NOT happen right now
- Do not start more broad feature work before deciding the Today-page change and reducing the current lint/correctness debt.
- Do not use production alone as proof that branch/local work is missing; PWA caching still matters.

## 2026-03-07 - TodayPage product decision and research synthesis
- Decision: KEEP the new `Today Focus` concept in `src/pages/TodayPage.tsx`, but do not treat the current page as finished yet.
- Why: the Today page should be TrackVolt's decision surface, not a long dashboard. The current direction is correct because it creates one clear recommendation near the top instead of scattered nudges.

### External product signals
- WHOOP home: current official home redesign emphasizes clarity, metrics at a glance, easier shortcuts, and weekly plans on the home screen. This supports keeping a small number of top-level signals and a visible weekly progress module.
- Oura Today: official product/support docs say the Today tab should surface the most timely, relevant information for that day and change dynamically throughout the day. This strongly supports TrackVolt using a dynamic top card rather than a static dashboard-first layout.
- Oura also separates `Today` from deeper `Vitals/Trends`. This supports keeping long-term analytics out of the top of TodayPage.
- MacroFactor: official product materials emphasize configurable dashboard pins, timeline-style logging, and fast access to today's most relevant nutrition context. This supports making secondary tiles customizable later, but not before the core decision layer is right.
- Strava's redesigned Record experience emphasizes reducing context switching by keeping the core action and the relevant stats together. For TrackVolt, that means Today should keep the recommendation and the next action close together.
- Lose It user feedback and public threads repeatedly show confusion around calorie-bonus/exercise-sync logic. TrackVolt should avoid putting an exercise-calorie bonus concept at the center of Today. Imports should inform, not distort daily targets.

### Product decision for TrackVolt TodayPage
TodayPage should have 4 jobs only:
1. Orient the athlete
2. Give one clear recommendation
3. Make the next action fast
4. Show a small number of trustworthy supporting metrics

### Recommended TodayPage structure
1. Header + streak
2. `Today Focus` card (single best action)
3. `Today's Session` card
4. Quick tools row
5. `Readiness` card
6. `Nutrition today` card
7. `This week` progress card
8. Lower-priority cards: cycle, sleep detail, latest PR, grocery preview, AI coach

### What to keep
- Header with date/greeting
- StreakRing
- New `Today Focus` card
- Today's workout hero
- Quick tools
- Readiness card
- Nutrition card
- Weekly progress card

### What to demote lower
- AI Coach quick access
- Grocery preview
- latest PR card
- deeper sleep/recovery detail
- long-term or trend-heavy content

### What to remove or fix before calling TodayPage done
- The old lower `WORKOUT SUGGESTION` should stay removed.
- The current `avgCalories` weekly summary logic in `src/pages/TodayPage.tsx` is placeholder/fake (`calTarget * 0.8`). Do not center or trust that metric until it is computed from real stored meal data.
- The current `suggestion` memo in `TodayPage.tsx` needs cleanup because lint flags missing `t` dependency / manual memoization preservation issues.
- Keep the top of the page limited to one primary recommendation. Do not add more hero cards above the workout card.

### UX guidance
- The top of TodayPage should feel calmer than LogPage.
- Use strong contrast only for the single primary action.
- Avoid multiple bright CTA cards before the user sees `Today's Session`.
- Keep fact chips on the decision card to 2 max.
- Prefer action verbs like `View workout`, `Open logger`, `Log a meal`, `Recover today`.

### Best immediate next step
- Commit the current `Today Focus` direction after a small cleanup pass, not a redesign from scratch.
- Then fix the correctness issues in `TodayPage.tsx` (memo/lint + fake avgCalories summary), and only after that decide whether shortcut customization is worth adding.

## 2026-03-07 - Deep audit of CrossFit log flow (LogPage + WorkoutLogger + TimerPage)
- Strategic conclusion: TrackVolt's main moat is still `fastest CrossFit logging with hybrid depth`. The CrossFit log flow should optimize for post-class fatigue, not for maximum visible feature count.
- Current strength: the app already supports rare breadth in one flow: Full Class, WOD Only, Strength Only, Events, benchmark selection, PR detection, movement details, WOD scan, rich timer, and edit-history. This breadth is a differentiator if the flow stays fast.
- Current weakness: the logger still asks the athlete to make too many decisions too early. The top of the WOD section contains benchmark chips, Scan, All, WOD type pills, WOD name, description, time cap, movements, and score. That is powerful, but it still creates cognitive drag.

### Product rule for CrossFit log UX
- The CrossFit logger should behave like a premium coaching console and answer this sequence naturally:
  1. What am I logging?
  2. What was my result?
  3. Do I want to attach details?
  4. Save.
- This is the fastest mental model for tired post-class users.

### What current leading products reinforce
- SugarWOD emphasizes prepare, track, celebrate, plus community accountability. Good lesson: results and celebration matter immediately after save; community is secondary to the logging loop itself.
- SugarWOD also highlights “today’s workout activity at a glance” and threaded coach/athlete interaction. Good lesson: one workout context at a time, not too many competing widgets.
- BTWB emphasizes benchmark history and automatic PR updates by category. Good lesson: historical memory is a retention engine, and it should be easy to compare today vs last time.
- SmartWOD emphasizes simple design, integrated timer, presets, and fast timer access. Good lesson: timer utility must stay frictionless and obvious.
- WHOOP home redesign emphasizes clarity, shortcuts, and weekly plans on the home screen. Good lesson for TrackVolt: top-level surfaces should reduce decision load, not add to it.

### Most important improvements still worth making in CrossFit log
1. Score-first discipline
- After the workout type and name are set, the score/result should visually dominate the page.
- The current logger is improved, but the benchmark/top-control cluster still competes too much with scoring.
- Recommendation: keep movements above score only as a lightweight summary and optional details area; do not let movement editing become the visual focus before result entry.

2. Collapse secondary actions harder
- `Scan` and `All` are useful, but they should feel secondary until needed.
- Recommendation: keep only one visible secondary action in the WOD header and move the other into a kebab/secondary drawer or merged `Library` control. This will calm the top of the WOD area.

3. Make benchmark selection more selective
- Quick benchmark chips are useful for repeat benchmarks, but the current list can still create scanning noise.
- Recommendation: default to 5-6 most-used chips (`Fran`, `Grace`, `Helen`, `Murph`, `DT`, `Annie`) and reveal the rest only after tapping `More` or `All`.

4. Improve the empty-to-filled movement journey
- Current WOD movements empty state is much better than before, but filled state should become even more summary-driven.
- Recommendation: once movements exist, show a single-line summary first (`3 movements · Thrusters · Pull-ups · Double-unders`) and keep the detailed weight/detail rows behind an explicit expand action. This reduces page length and lowers fatigue.

5. Strength section should default to fewer fields
- Current Strength UI is much better (quick lifts, 5x5 style presets, lbs first, Heavy Single labels), but `Start` and `End` weights still assume a progression entry flow.
- Recommendation: default to a single `Work weight` field for programmed sets and an optional `Show progression` toggle for start/end. Most athletes only care about the top working load.

6. Save moment should work harder
- Current calmer save area is a good step, but this is still a major retention opportunity.
- Recommendation: on save, show one immediate meaning layer:
  - PR delta
  - benchmark delta
  - repeat workout delta
  - streak effect
- This should feel like progress, not just form submission.

7. Recent workouts should become repeat shortcuts, not just edit history
- Current recent workout cards are useful, but underleveraged.
- Recommendation: add explicit actions like:
  - `Repeat structure`
  - `Use as template`
  - `Compare last`
- Human behavior signal: athletes repeat structures constantly; reducing re-entry friction increases daily use.

8. Full Class should stay the default identity
- `Full Class`, `WOD Only`, `Strength Only`, and `CrossFit Events` are the right top-level set.
- `Full Class` is the strongest default name because it matches gym reality and clearly differentiates from single-section logging.

### Biggest business/retention implication
- CrossFit users return when the app remembers their training life and makes logging feel easier than remembering it manually.
- The real business win is not more feature breadth. It is:
  - faster repeat logging
  - better benchmark memory
  - stronger post-save emotional reward
  - clean timer integration

### Recommended priority order inside CrossFit log
1. Simplify WOD top controls (`Scan`/`All`/benchmark row)
2. Make score/result more visually primary
3. Compress filled movement details behind summary/expand
4. Reduce Strength default fields (single work-weight default)
5. Upgrade recent workouts into repeat-template shortcuts
6. Strengthen post-save delta/celebration layer

### Files most relevant for this work
- `src/pages/LogPage.tsx`
- `src/components/log/WorkoutLogger.tsx`
- `src/hooks/useWorkoutForm.ts`
- `src/components/log/MovementPicker.tsx`
- `src/pages/TimerPage.tsx`
- `src/components/CelebrationOverlay.tsx`
- `src/hooks/usePRDetection.ts`

### Recommendation to coworker
- Do not add more visible controls to the CrossFit logger.
- Optimize the existing flow around post-class fatigue, one primary result, and repeat behavior.
- Treat benchmark memory + save meaning as the main retention loop after the core form is stable.

## 2026-03-07 - Direct note to coworker on current CrossFit ownership

### Current status of the two owned files
- `src/components/log/WorkoutLogger.tsx`
- `src/pages/TimerPage.tsx`

I checked current branch state directly before writing this note:
- there is no code drift in either file
- both files match the committed branch state exactly
- the current concern is coordination, not recovery

### Safe baselines already committed
- `60fbec1` `Simplify strength logging and harden timer behavior`
- `d195c80` `Align strength weight flow with CrossFit sets`
- `122399c` `Improve CrossFit strength quick weight flow`
- `a68f8d4` `Clarify CrossFit strength quick weight targeting`
- `b78dc07` `Refine CrossFit WOD logging flow`
- `16a303f` `Fix CrossFit launcher copy encoding`

### WOD timer decision
- The richer WOD timer is not optional.
- Keep the premium/richer timer behavior and structure.
- Do not simplify it back to the stripped-down version.

What must stay in the timer:
- rich AMRAP configuration
- multiple sets support
- rest between sets
- richer timer states
- wake lock / vibration cues
- the timer should feel like a real training tool, not a generic stopwatch

### CrossFit logger direction that is currently agreed
- `Full Class` stays
- `WOD Only` stays
- `Strength Only` stays
- `CrossFit Events` stays
- `lbs` first in strength logging
- quick lift picks stay
- readable rep presets stay
- Build to Heavy uses coach language (`Heavy Single`, `Heavy Triple`, `Heavy 5`)
- Programmed Sets uses `Start -> End`
- Build to Heavy uses one `Top Weight`
- one shared quick-weight row stays
- filled WOD movements stay summary-first

### Coordination rule
- Please do not directly rewrite `WorkoutLogger.tsx` or `TimerPage.tsx` while Codex is stabilizing them.
- If you want to change these flows, put the proposal in shared notes first and let Codex apply the implementation pass.

### What to decide later, not now
- recent workouts as repeat/template shortcuts
- stronger post-save delta feedback
- final Today-page decision layer

### Bottom line
- CrossFit logger and WOD timer should keep moving toward lower friction and higher clarity.
- The premium timer should be preserved.
- Do not trade away the richer timer or the current CrossFit-specific logging language for generic simplification.
