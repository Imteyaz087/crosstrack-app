# CrossTrack UI Design Specification

**Version:** 2.0 — Apple HIG Redesign
**Date:** 2026-02-28
**Author:** Senior Apple UI Designer + World #1 CrossFit Coach
**Target Persona:** Alex, 28yo hybrid athlete (CrossFit 4x/wk, HYROX 2x/yr, Run 2x/wk)
**Design Philosophy:** "Log your WOD in 20 seconds with sweaty hands"

---

## Design System Foundation

### Grid & Spacing
All spacing follows an **8px base grid**. Every margin, padding, and gap is a multiple of 8.

| Token      | Value | Usage                              |
|------------|-------|------------------------------------|
| `space-xs` | 4px   | Icon-to-text gaps only             |
| `space-sm` | 8px   | Inline element gaps                |
| `space-md` | 16px  | Card inner padding, section gaps   |
| `space-lg` | 24px  | Between card groups                |
| `space-xl` | 32px  | Page top padding (below safe area) |

### Typography Scale (SF Pro / System)
| Role        | Size  | Weight   | Line Height | Usage                    |
|-------------|-------|----------|-------------|--------------------------|
| Hero        | 34px  | Bold     | 41px        | Timer display, PR number |
| Title 1     | 28px  | Bold     | 34px        | Page title               |
| Title 2     | 22px  | Bold     | 28px        | Section heading          |
| Title 3     | 20px  | Semibold | 25px        | Card title               |
| Body        | 17px  | Regular  | 22px        | Primary text             |
| Callout     | 16px  | Regular  | 21px        | Secondary info           |
| Subhead     | 15px  | Regular  | 20px        | Labels, descriptions     |
| Footnote    | 13px  | Regular  | 18px        | Timestamps, metadata     |

### Color Palette (Dark-First)

**Brand:** Cyan-400 `#22d3ee` (Primary accent, active states)

**Semantic:**
- **Success:** Green-400 `#4ade80` (RX, PRs, goals hit)
- **Warning:** Orange-400 `#fb923c` (HYROX, low sleep, attention)
- **Error:** Red-400 `#f87171` (Delete, failed saves)
- **Info:** Purple-400 `#a78bfa` (AI Coach, tips)

**Neutral (Dark Mode — Primary):**
- **Background:** Slate-950 `#020617`
- **Elevated:** Slate-900 `#0f172a` (Cards), Slate-800 `#1e293b` (Modals)
- **Borders:** Slate-700 `#334155` (with 50% opacity)
- **Text Primary:** Slate-100 `#f1f5f9`
- **Text Secondary:** Slate-400 `#94a3b8`
- **Text Tertiary:** Slate-500 `#64748b`

### Touch Targets (Gym Context)
- **Minimum:** 44 × 44px (Apple HIG standard)
- **Gym-context CTA:** 56 × full width (Save Workout, Log Meal)
- **Comfortable:** 48 × 48px (most interactive elements)

---

## Core Component Specifications

### 1. WOD Card (Workout Summary)

**Hero component on Dashboard. Shows today's workout at a glance.**

```
┌────────────────────────────────────┐
│ TODAY'S TRAINING                 > │  ← overline + chevron
│                                    │
│ Fran                               │  ← h3, white, bold
│ ForTime — 3:42                     │  ← caption, slate-400
│                                    │
│ [RX] [PR!]                         │  ← badge row
└────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `linear-gradient(135deg, #0f172acc, #0f172a66)` |
| Border | `1px solid #33415580` |
| Border radius | 16px |
| Padding | 16px |
| Min height | 96px |

**States:**
- **Default:** As shown
- **Pressed:** `scale(0.98)`, `opacity(0.9)`, 100ms
- **Empty:** Icon + "No workout logged yet" + "Tap to log your WOD" (cyan-400)

---

### 2. Exercise Input (Score Entry)

**Most critical input in the app. Used for ForTime, AMRAP, and weight values.**

**ForTime (MM:SS):**
```
┌──────┐   ┌──────┐
│  03  │ : │  42  │
└──────┘   └──────┘
 minutes    seconds
```

| Property | Value |
|----------|-------|
| Input type | `text` with `inputMode="numeric"` |
| Width | 80px per field |
| Height | 56px |
| Font | 28px, bold, monospace |
| Background | Slate-800 `#1e293b` |
| Border | None default, `2px cyan-400` on focus |
| Text align | Center |

**States:**
- **Default:** Slate-800 bg, white text, no border
- **Focus:** `ring-2 ring-cyan-400`, slight `scale(1.02)`
- **Error:** `ring-2 ring-red-400`, input shakes (150ms, 3x)

---

### 3. Timer Display

**Large, centered, unmistakable. Used in Timer page overlay.**

```
       12:34
       ─────
      [▶ Start]
```

| Property | Value |
|----------|-------|
| Font | Hero (34px), monospace, bold |
| Color | Cyan-400 when running, Slate-100 when stopped |
| Font variant | `tabular-nums` (digits don't shift) |

**States:**
- **Stopped:** White text, "Start" button
- **Running:** Cyan text, pulsing colon, "Stop" button (red)
- **Finished:** Green flash, final time

---

### 4. Nutrition Card

**Daily macro overview. Used on Dashboard and Nutrition page.**

```
┌──────────────────────────────────────┐
│ 🔥 1,847              / 2,000 cal 92%│
│                                      │
│ Protein ████████░░░░  128/150g       │
│ Carbs   ██████░░░░░░  156/200g       │
│ Fat     █████████░░░   52/60g        │
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | Slate-900 at 60% opacity |
| Border | `1px solid #33415580` |
| Border radius | 16px |
| Padding | 16px |

**Macro Bar (horizontal progress bar):**
- Track height: 10px
- Colors: Protein (Green-400), Carbs (Orange-400), Fat (Pink-400)
- Over-target: Red-500

---

### 5. PR Badge

**Celebrates personal records. Always pulsing.**

```
  ┌─────┐
  │ PR! │  ← pulsing glow
  └─────┘
```

| Property | Value |
|----------|-------|
| Background | Red-400 at 10% opacity |
| Text | Red-400, 11px, bold |
| Padding | 2px 10px |
| Border radius | 9999px (pill) |
| Animation | `pulse` — scale 1.0 ↔ 1.05, 2s loop |

**Variants:**
- **Default PR:** Red theme
- **RX badge:** Green theme
- **Scaled badge:** Orange theme
- **Elite badge:** Purple theme

---

### 6. Streak Counter

**Shows consecutive days of logging. Powerful motivational element.**

```
  ┌──────────────┐
  │ 🔥 12d       │
  └──────────────┘
```

| Property | Value |
|----------|-------|
| Background | Orange-400 at 10% opacity |
| Border | `1px solid #fb923c33` |
| Text | Orange-400, 12px, bold |
| Icon | Flame (14px), orange-400 |
| Padding | 6px 12px |
| Border radius | 9999px |
| Animation | Flame flicker (opacity 0.7 ↔ 1.0, 2s) |

---

### 7. Bottom Tab Navigation

**Fixed bottom navigation. Primary way to move between sections.**

```
┌──────────────────────────────────────────────┐
│  🏠    🏋    ⊕    🍽    •••                │
│ Today  Train  Log   Eat   More               │
│   ·                                          │
└──────────────────────────────────────────────┘
```

| Property | Inactive | Active |
|----------|----------|--------|
| Icon size | 22px | 22px |
| Icon color | Slate-500 | Cyan-400 |
| Label | 10px, slate-500 | 10px, cyan-400 |
| Indicator | None | 4px dot above icon |

**CTA (Log) Button:**
- Size: 48 × 48px
- Shape: Circle
- Background: Cyan-400 at 80% opacity (inactive), 100% (active)
- Position: Raised -12px above bar
- Shadow: `0 4px 12px #22d3ee33`

---

### 8. Empty State

**Consistent pattern when no data exists.**

```
┌──────────────────────────────────────┐
│                                      │
│          ┌──────────┐                │
│          │   🏋‍♂️    │                │
│          └──────────┘                │
│                                      │
│      No workouts logged yet          │
│                                      │
│   Start tracking your WODs to see    │
│   your progress and hit new PRs      │
│                                      │
│     [+ Log Your First WOD]           │
│                                      │
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | Dashed border, rounded-2xl, p-8 |
| Icon container | 56 × 56px, rounded-2xl |
| Icon | 28px, slate-500 |
| Title | 15px, slate-400 |
| CTA | Cyan bg at 15%, rounded-xl |

---

### 9. Loading Skeleton

**Shimmer placeholders shown while data loads.**

| Property | Value |
|----------|-------|
| Background | `linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)` |
| Animation | Shimmer 1.5s ease-in-out infinite |
| Border radius | 8px |

---

### 10. Input Field

**All number inputs use `type="text"` with `inputMode="numeric"`.**

```
┌─────────────────────────────┐
│ 150                         │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 40px |
| Background | Slate-800 |
| Border | `1px solid #33415580` |
| Focus | `ring-2 ring-cyan-400` |
| Font | 15px, regular |

**Never use `type="number"`** — causes browser spinner issues on iOS/Android.

---

## Design Principles

1. **Dark-first.** Gym is dimly lit; phone shouldn't blind Alex between sets.
2. **Sweaty hands.** All touch targets ≥ 44px. No tiny buttons.
3. **Data-forward.** Show numbers prominently. Small illustrations, big data.
4. **Instant feedback.** Button press = immediate visual response (100ms).
5. **Accessibility:** WCAG AA contrast (4.5:1), semantic HTML, ARIA labels.
6. **System fonts.** SF Pro (Apple), Segoe UI (Windows), Roboto (Android). Zero custom fonts.
7. **Monospace for scores.** Times, reps, PRs in `SF Mono` to prevent digit shift during updates.
8. **No animations on scroll.** Parallax, fade-on-scroll, etc. = slower on old phones.
9. **Offline-first.** All data stored locally. Sync is optional.

---

## Implementation Notes

- All spacing via **8px grid** (multiples only)
- All colors via **CSS custom properties** (no raw hex values in components)
- All icons via **Lucide React** (v0.263+)
- All type scales via **Tailwind** (no arbitrary font-sizes)
- All focus rings via **focus-visible:ring-2** (keyboard navigation)
- All responsive via **mobile-first breakpoints** (no max-width until 768px)

---

**This spec is the single source of truth for all UI decisions. Every screen, every component, every interaction should trace back to a decision documented here.**
