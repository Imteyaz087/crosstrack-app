// ============================================================
// TRACKVOLT Benchmark WOD Database  -  Girls, Heroes, Open
// ============================================================
import type { BenchmarkWod } from '../types'

export const BENCHMARK_WODS: Omit<BenchmarkWod, 'id'>[] = [
  // ===== GIRL WODs =====
  { name: 'Fran', category: 'girl', description: '21-15-9: Thrusters & Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb, Assisted Pull-ups' },
  { name: 'Grace', category: 'girl', description: '30 Clean & Jerks for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 135lb / F: 95lb', scaledStandard: 'M: 95lb / F: 65lb' },
  { name: 'Helen', category: 'girl', description: '3 RFT: 400m Run, 21 KB Swings, 12 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 53lb KB / F: 35lb KB', scaledStandard: 'M: 35lb / F: 26lb, Assisted Pull-ups' },
  { name: 'Diane', category: 'girl', description: '21-15-9: Deadlifts & HSPU', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 225lb / F: 155lb', scaledStandard: 'M: 155lb / F: 105lb, Scaled HSPU' },
  { name: 'Elizabeth', category: 'girl', description: '21-15-9: Squat Cleans & Ring Dips', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 135lb / F: 95lb', scaledStandard: 'M: 95lb / F: 65lb, Box Dips' },
  { name: 'Annie', category: 'girl', description: '50-40-30-20-10: DU & Sit-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Double Unders', scaledStandard: 'Single Unders (3:1 ratio)' },
  { name: 'Karen', category: 'girl', description: '150 Wall Balls for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 20lb / F: 14lb to 10/9ft', scaledStandard: 'M: 14lb / F: 10lb' },
  { name: 'Jackie', category: 'girl', description: '1000m Row, 50 Thrusters, 30 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 45lb / F: 35lb', scaledStandard: 'M: 35lb / F: 25lb, Assisted Pull-ups' },
  { name: 'Nancy', category: 'girl', description: '5 RFT: 400m Run, 15 OHS', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Isabel', category: 'girl', description: '30 Snatches for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 135lb / F: 95lb', scaledStandard: 'M: 95lb / F: 65lb' },
  { name: 'Cindy', category: 'girl', description: '20min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'Strict standard', scaledStandard: 'Assisted Pull-ups, Knee Push-ups' },
  { name: 'Mary', category: 'girl', description: '20min AMRAP: 5 HSPU, 10 Pistols, 15 Pull-ups', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'Full ROM', scaledStandard: 'Scaled HSPU, Regular Squats' },
  { name: 'Kelly', category: 'girl', description: '5 RFT: 400m Run, 30 Box Jumps, 30 Wall Balls', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 24in/20lb / F: 20in/14lb', scaledStandard: 'M: 20in / F: 16in, Lighter ball' },
  { name: 'Lynne', category: 'girl', description: '5 rounds max reps: Bench Press & Pull-ups', wodType: 'Other', scoreUnit: 'reps', rxStandard: 'M: 185lb / F: 125lb', scaledStandard: 'M: 125lb / F: 85lb' },
  { name: 'Amanda', category: 'girl', description: '9-7-5: Muscle-ups & Squat Snatches', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 135lb / F: 95lb', scaledStandard: 'M: 95lb / F: 65lb, Pull-ups + Dips' },

  // ===== HERO WODs =====
  { name: 'Murph', category: 'hero', description: '1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 mile Run', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 20lb vest / F: 14lb vest', scaledStandard: 'No vest, Assisted Pull-ups' },
  { name: 'DT', category: 'hero', description: '5 RFT: 12 DL, 9 Hang PC, 6 Push Jerks', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 155lb / F: 105lb', scaledStandard: 'M: 115lb / F: 75lb' },
  { name: 'Badger', category: 'hero', description: '3 RFT: 30 Squat Cleans, 30 Pull-ups, 800m Run', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Michael', category: 'hero', description: '3 RFT: 800m Run, 50 Back Ext, 50 Sit-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Bodyweight standard', scaledStandard: 'Reduce reps to 30' },
  { name: 'Nate', category: 'hero', description: '20min AMRAP: 2 Muscle-ups, 4 HSPU, 8 KB Swings', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'M: 70lb KB / F: 53lb KB', scaledStandard: 'Pull-ups + Dips, Scaled HSPU' },
  { name: 'JT', category: 'hero', description: '21-15-9: HSPU, Ring Dips, Push-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Strict standard', scaledStandard: 'Scaled HSPU, Box Dips' },
  { name: 'Filthy Fifty', category: 'hero', description: '50 each: Box Jumps, Jumping PU, KB Swings, Lunges, K2E, Push Press, Back Ext, Wall Balls, Burpees, DU', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 24in/53lb/45lb / F: 20in/35lb/33lb', scaledStandard: 'Reduce weight, Single Unders' },
  { name: 'Lumberjack 20', category: 'hero', description: '20 DL, 400m Run, 20 KB Swings, 400m Run, 20 OHS, 400m Run, 20 Burpees, 400m Run, 20 Pull-ups, 400m Run, 20 Box Jumps, 400m Run, 20 DB Snatches, 400m Run', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 275lb DL / F: 185lb DL', scaledStandard: 'Reduce all weights' },
  { name: 'The Seven', category: 'hero', description: '7 rounds: 7 HSPU, 7 Thrusters, 7 K2E, 7 DL, 7 Burpees, 7 KB Swings, 7 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 135lb/70lb / F: 95lb/53lb', scaledStandard: 'Reduce weights, Scaled HSPU' },
  { name: 'Daniel', category: 'hero', description: '50 Pull-ups, 400m Run, 21 Thrusters, 800m Run, 21 Thrusters, 400m Run, 50 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Ryan', category: 'hero', description: '5 RFT: 7 Muscle-ups, 21 Burpees', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Ring Muscle-ups', scaledStandard: 'Pull-ups + Dips' },
  { name: 'RJ', category: 'hero', description: '5 RFT: 800m Run, 5 Rope Climbs, 50 Push-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '15ft Rope Climb', scaledStandard: 'Reduce rope height, Knee Push-ups' },
  { name: 'Griff', category: 'hero', description: '2 RFT: 800m Run, 400m Backward Run', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Full distance', scaledStandard: 'Reduce distance' },
  { name: 'Jag 28', category: 'hero', description: '28min AMRAP: 800m Run, 28 KB Swings, 28 Strict Pull-ups, 28 KB Cleans, 28 Strict HSPU', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'M: 70lb / F: 53lb', scaledStandard: 'M: 53lb / F: 35lb' },
  { name: 'Klepto', category: 'hero', description: '4 RFT: 27 Box Jumps, 20 Burpees, 11 Squat Cleans', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 24in/145lb / F: 20in/100lb', scaledStandard: 'M: 20in/95lb / F: 16in/65lb' },

  // ===== OPEN WODs =====
  { name: 'Open 12.1', category: 'open', description: '7min AMRAP: Burpees', wodType: 'AMRAP', scoreUnit: 'reps', rxStandard: 'Standard Burpees', scaledStandard: 'Step-back Burpees' },
  { name: 'Open 14.5', category: 'open', description: '21-18-15-12-9-6-3: Thrusters & Burpees', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Open 16.5', category: 'open', description: '21-18-15-12-9-6-3: Thrusters & Bar-facing Burpees', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Open 17.5', category: 'open', description: '10 RFT: 9 Thrusters, 35 DU', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb, Single Unders' },
  { name: 'Open 18.5', category: 'open', description: '7min AMRAP: 3 Thrusters, 3 C2B Pull-ups, 6-6, 9-9... (ascending)', wodType: 'AMRAP', scoreUnit: 'reps', rxStandard: 'M: 100lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb, Pull-ups' },
  { name: 'Open 19.5', category: 'open', description: '33-27-21-15-9: Thrusters & C2B Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb, Pull-ups' },
  { name: 'Open 20.1', category: 'open', description: '10 RFT: 8 Ground-to-OH, 10 Bar-facing Burpees', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 95lb / F: 65lb', scaledStandard: 'M: 65lb / F: 45lb' },
  { name: 'Open 21.1', category: 'open', description: '1 Wall Walk, 10 DB Snatches, 3 WW, 10 DB Snatches, 6-10, 9-10 (ascending WW)', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'M: 50lb / F: 35lb', scaledStandard: 'M: 35lb / F: 20lb, Inch Worms' },
  { name: 'Open 22.1', category: 'open', description: '15min AMRAP: 3 Wall Walks, 12 DB Snatches, 15 Box Jumps (ascending)', wodType: 'AMRAP', scoreUnit: 'reps', rxStandard: 'M: 50lb/24in / F: 35lb/20in', scaledStandard: 'M: 35lb / F: 20lb, Shorter box' },
  { name: 'Open 23.1', category: 'open', description: '14min AMRAP: 60 Cal Row, 50 TTB, 40 Wall Balls, 30 Cleans, 20 Muscle-ups', wodType: 'AMRAP', scoreUnit: 'reps', rxStandard: 'M: 20lb/135lb / F: 14lb/95lb', scaledStandard: 'Hanging Knee Raises, Pull-ups + Dips' },
]
