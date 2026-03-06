// ============================================================
// TRACKVOLT — CrossFit Event Template Library
// Static data: Open 2026, Hero WODs, Girls Benchmarks
// ============================================================

import type { EventTemplate, EventCategory } from '../types/eventTypes'

// ─── CrossFit Open 2026 ────────────────────────────────────

const OPEN_2026: EventTemplate[] = [
  {
    name: 'CrossFit Open 26.1',
    category: 'open',
    year: 2026,
    number: '26.1',
    description: 'For Time — Wall-Ball Shots & Box Jump-Overs chipper',
    wodType: 'ForTime',
    workoutLines: [
      '20 wall-ball shots',
      '18 box jump-overs',
      '30 wall-ball shots',
      '18 box jump-overs',
      '40 wall-ball shots',
      '18 medicine-ball box step-overs',
      '66 wall-ball shots',
      '18 medicine-ball box jump-overs',
      '40 wall-ball shots',
      '18 box jump-overs',
      '30 wall-ball shots',
      '18 box jump-overs',
      '20 wall-ball shots',
    ],
    timeCapMinutes: 12,
    rxStandard: 'M: 14-lb (6-kg) medicine ball, 9-foot target, 20-inch box | F: 10-lb (4-kg) medicine ball, 9-foot target, 20-inch box',
    scaledStandard: 'M: 14-lb ball, 9-foot target, 20-inch box step-overs | F: 10-lb ball, 9-foot target, 20-inch box step-overs',
  },
  {
    name: 'CrossFit Open 26.2',
    category: 'open',
    year: 2026,
    number: '26.2',
    description: 'To be announced',
    wodType: 'Other',
    workoutLines: ['Workout to be announced'],
    rxStandard: 'TBA',
  },
  {
    name: 'CrossFit Open 26.3',
    category: 'open',
    year: 2026,
    number: '26.3',
    description: 'To be announced',
    wodType: 'Other',
    workoutLines: ['Workout to be announced'],
    rxStandard: 'TBA',
  },
]

// ─── Hero WODs ─────────────────────────────────────────────

const HERO_WODS: EventTemplate[] = [
  {
    name: 'Murph',
    category: 'hero',
    description: 'For Time — 1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 mile Run',
    wodType: 'ForTime',
    workoutLines: [
      '1 mile Run',
      '100 Pull-ups',
      '200 Push-ups',
      '300 Air Squats',
      '1 mile Run',
    ],
    timeCapMinutes: 60,
    rxStandard: 'M: 20-lb vest | F: 14-lb vest',
    scaledStandard: 'No vest, ring rows or banded pull-ups',
  },
  {
    name: 'DT',
    category: 'hero',
    description: '5 RFT — Deadlifts, Hang Cleans, Push Jerks',
    wodType: 'ForTime',
    workoutLines: [
      '5 rounds for time:',
      '12 deadlifts',
      '9 hang power cleans',
      '6 push jerks',
    ],
    rxStandard: 'M: 155 lb | F: 105 lb',
    scaledStandard: 'M: 115 lb | F: 75 lb',
  },
  {
    name: 'Nate',
    category: 'hero',
    description: 'AMRAP 20 — Muscle-ups, Handstand Push-ups, Kettlebell Swings',
    wodType: 'AMRAP',
    workoutLines: [
      '20-minute AMRAP:',
      '2 muscle-ups',
      '4 handstand push-ups',
      '8 kettlebell swings (70/53 lb)',
    ],
    timeCapMinutes: 20,
    rxStandard: 'M: 70-lb KB | F: 53-lb KB',
    scaledStandard: 'Pull-ups + dips, pike push-ups, 53/35 lb KB',
  },
  {
    name: 'Michael',
    category: 'hero',
    description: '3 RFT — Run, Back Extensions, Sit-ups',
    wodType: 'ForTime',
    workoutLines: [
      '3 rounds for time:',
      '800m Run',
      '50 back extensions',
      '50 sit-ups',
    ],
    rxStandard: 'As prescribed',
    scaledStandard: '400m Run, 30 back extensions, 30 sit-ups',
  },
  {
    name: 'Daniel',
    category: 'hero',
    description: 'For Time — Thrusters, Pull-ups',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '50 pull-ups',
      '400m Run',
      '21 thrusters (95/65 lb)',
      '800m Run',
      '21 thrusters (95/65 lb)',
      '400m Run',
      '50 pull-ups',
    ],
    rxStandard: 'M: 95 lb | F: 65 lb',
    scaledStandard: 'M: 65 lb | F: 45 lb, banded pull-ups',
  },
  {
    name: 'JT',
    category: 'hero',
    description: '21-15-9 — HSPU, Ring Dips, Push-ups',
    wodType: 'ForTime',
    workoutLines: [
      '21-15-9 reps for time:',
      'Handstand push-ups',
      'Ring dips',
      'Push-ups',
    ],
    rxStandard: 'As prescribed (strict or kipping)',
    scaledStandard: 'Pike push-ups, box dips, knee push-ups',
  },
  {
    name: 'Chad',
    category: 'hero',
    description: 'For Time — 1000 Box Step-ups with Vest',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '1,000 box step-ups (20-inch box)',
    ],
    timeCapMinutes: 60,
    rxStandard: 'M: 20-lb vest, 20-inch box | F: 14-lb vest, 20-inch box',
    scaledStandard: 'No vest, 20-inch box',
  },
  {
    name: 'Luce',
    category: 'hero',
    description: '3 RFT — Run, Clean & Jerks',
    wodType: 'ForTime',
    workoutLines: [
      '3 rounds for time:',
      '1,000m Run',
      '10 clean and jerks (155/105 lb)',
    ],
    rxStandard: 'M: 155 lb, 20-lb vest | F: 105 lb, 14-lb vest',
    scaledStandard: 'M: 115 lb, no vest | F: 75 lb, no vest',
  },
  {
    name: 'Wittman',
    category: 'hero',
    description: '7 RFT — KB Swings, Power Cleans, Box Jumps',
    wodType: 'ForTime',
    workoutLines: [
      '7 rounds for time:',
      '15 kettlebell swings (53/35 lb)',
      '15 power cleans (75/55 lb)',
      '15 box jumps (24/20 inch)',
    ],
    rxStandard: 'M: 53-lb KB, 75-lb barbell, 24-inch box | F: 35-lb KB, 55-lb barbell, 20-inch box',
    scaledStandard: 'M: 35-lb KB, 55-lb barbell | F: 26-lb KB, 35-lb barbell',
  },
  {
    name: 'Badger',
    category: 'hero',
    description: '3 RFT — Squat Cleans, Muscle-ups, Cleans',
    wodType: 'ForTime',
    workoutLines: [
      '3 rounds for time:',
      '30 squat cleans (95/65 lb)',
      '30 pull-ups',
      '800m Run',
    ],
    rxStandard: 'M: 95 lb | F: 65 lb',
    scaledStandard: 'M: 65 lb | F: 45 lb, banded pull-ups',
  },
]

// ─── Girls (Benchmark WODs) ────────────────────────────────

const GIRL_BENCHMARKS: EventTemplate[] = [
  {
    name: 'Fran',
    category: 'girl',
    description: '21-15-9 — Thrusters & Pull-ups',
    wodType: 'ForTime',
    workoutLines: [
      '21-15-9 reps for time:',
      'Thrusters',
      'Pull-ups',
    ],
    rxStandard: 'M: 95 lb | F: 65 lb',
    scaledStandard: 'M: 65 lb | F: 45 lb, banded pull-ups',
  },
  {
    name: 'Cindy',
    category: 'girl',
    description: 'AMRAP 20 — Pull-ups, Push-ups, Squats',
    wodType: 'AMRAP',
    workoutLines: [
      '20-minute AMRAP:',
      '5 pull-ups',
      '10 push-ups',
      '15 air squats',
    ],
    timeCapMinutes: 20,
    rxStandard: 'As prescribed',
    scaledStandard: 'Ring rows, knee push-ups',
  },
  {
    name: 'Grace',
    category: 'girl',
    description: 'For Time — 30 Clean & Jerks',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '30 clean and jerks',
    ],
    rxStandard: 'M: 135 lb | F: 95 lb',
    scaledStandard: 'M: 95 lb | F: 65 lb',
  },
  {
    name: 'Helen',
    category: 'girl',
    description: '3 RFT — Run, KB Swings, Pull-ups',
    wodType: 'ForTime',
    workoutLines: [
      '3 rounds for time:',
      '400m Run',
      '21 kettlebell swings (53/35 lb)',
      '12 pull-ups',
    ],
    rxStandard: 'M: 53-lb KB | F: 35-lb KB',
    scaledStandard: 'M: 35-lb KB | F: 26-lb KB, banded pull-ups',
  },
  {
    name: 'Diane',
    category: 'girl',
    description: '21-15-9 — Deadlifts & HSPU',
    wodType: 'ForTime',
    workoutLines: [
      '21-15-9 reps for time:',
      'Deadlifts',
      'Handstand push-ups',
    ],
    rxStandard: 'M: 225 lb | F: 155 lb',
    scaledStandard: 'M: 155 lb | F: 105 lb, pike push-ups',
  },
  {
    name: 'Isabel',
    category: 'girl',
    description: 'For Time — 30 Snatches',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '30 snatches',
    ],
    rxStandard: 'M: 135 lb | F: 95 lb',
    scaledStandard: 'M: 95 lb | F: 65 lb',
  },
  {
    name: 'Jackie',
    category: 'girl',
    description: 'For Time — Row, Thrusters, Pull-ups',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '1,000m Row',
      '50 thrusters (45/35 lb)',
      '30 pull-ups',
    ],
    rxStandard: 'M: 45 lb | F: 35 lb',
    scaledStandard: 'As prescribed, banded pull-ups',
  },
  {
    name: 'Karen',
    category: 'girl',
    description: 'For Time — 150 Wall-Ball Shots',
    wodType: 'ForTime',
    workoutLines: [
      'For time:',
      '150 wall-ball shots',
    ],
    rxStandard: 'M: 20 lb to 10 ft | F: 14 lb to 9 ft',
    scaledStandard: 'M: 14 lb to 10 ft | F: 10 lb to 9 ft',
  },
  {
    name: 'Nancy',
    category: 'girl',
    description: '5 RFT — Run & Overhead Squats',
    wodType: 'ForTime',
    workoutLines: [
      '5 rounds for time:',
      '400m Run',
      '15 overhead squats (95/65 lb)',
    ],
    rxStandard: 'M: 95 lb | F: 65 lb',
    scaledStandard: 'M: 65 lb | F: 45 lb',
  },
  {
    name: 'Annie',
    category: 'girl',
    description: '50-40-30-20-10 — Double-Unders & Sit-ups',
    wodType: 'ForTime',
    workoutLines: [
      '50-40-30-20-10 reps for time:',
      'Double-unders',
      'Sit-ups',
    ],
    rxStandard: 'As prescribed',
    scaledStandard: 'Single-unders (3:1 ratio)',
  },
]

// ─── Combined Export ───────────────────────────────────────

export const EVENT_TEMPLATES: EventTemplate[] = [
  ...OPEN_2026,
  ...HERO_WODS,
  ...GIRL_BENCHMARKS,
]

export function getTemplatesByCategory(category: EventCategory): EventTemplate[] {
  if (category === 'custom') return []
  return EVENT_TEMPLATES.filter(t => t.category === category)
}

export function searchTemplates(query: string): EventTemplate[] {
  const q = query.toLowerCase().trim()
  if (!q) return EVENT_TEMPLATES
  return EVENT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.workoutLines.some(l => l.toLowerCase().includes(q))
  )
}

// Re-export the type for convenience
export type { EventCategory } from '../types/eventTypes'
