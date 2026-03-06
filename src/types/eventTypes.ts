// ============================================================
// TRACKVOLT  -  CrossFit Events Type Definitions
// Separate from Workout: Events = Open, Hero, Girls, Custom
// ============================================================

import type { WodType, RxScaled } from './index'

export type EventCategory = 'open' | 'hero' | 'girl' | 'custom'
export type EventSource = 'template' | 'manual' | 'scanned'

/**
 * EventLog  -  A saved CrossFit Event result.
 * Stored in its own Dexie table (eventLogs), separate from workouts.
 */
export interface EventLog {
  id?: number
  date: string                    // ISO date (YYYY-MM-DD)

  // Event identity
  eventCategory: EventCategory
  eventYear?: number              // e.g. 2026
  eventNumber?: string            // e.g. "26.1", "26.2", or "Murph"
  eventTitle: string              // Display title: "CrossFit Open 26.1"
  eventSource: EventSource

  // Workout definition
  wodType: WodType                // ForTime | AMRAP | EMOM | Chipper | Other
  workoutLines: string[]          // Formatted movement lines
  rxStandard?: string             // "M: 95/65 lb Thrusters"
  scaledStandard?: string

  // Scoring
  timeCapSeconds?: number         // Time cap in seconds
  finished: boolean               // Did the athlete finish before cap?
  finalTimeSeconds?: number       // Completion time (if finished)
  capped: boolean                 // Was the athlete capped?
  repsAtCap?: number              // Total reps when capped
  roundsRepsAtCap?: string        // "5+12" format
  scoreDisplay?: string           // Human-readable: "4:32" or "5+12 reps"

  // Performance
  rxOrScaled: RxScaled            // RX | Scaled | Elite

  // Meta
  location?: string
  notes?: string
  prFlag: boolean
  sourceImage?: string            // Base64 from scan (optional keep)

  createdAt: string
  updatedAt: string
}

/**
 * EventTemplate  -  A predefined event from the library.
 * Not stored in DB  -  static data in eventTemplates.ts.
 */
export interface EventTemplate {
  name: string
  category: EventCategory
  year?: number
  number?: string                 // "26.1"
  description: string             // Short description
  wodType: WodType
  workoutLines: string[]
  timeCapMinutes?: number
  rxStandard: string
  scaledStandard?: string
}

/**
 * OCR scan result from Gemini.
 */
export interface EventScanResult {
  eventTitle: string
  eventType: EventCategory
  wodType: string
  eventYear?: number
  eventNumber?: string
  workoutLines: string[]
  timeCapMinutes?: number
  rxStandard?: string
  scaledStandard?: string
  score?: string                  // If visible on image
  confidenceScores: Record<string, number>
  warnings: string[]
  error?: string
}
