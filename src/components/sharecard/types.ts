/**
 * ShareCardData  -  Generic interface for share card rendering
 * Works for both EventLog and Workout data sources
 */

import type { WodType, RxScaled } from '../../types'

export interface ShareCardData {
  title: string
  category: string              // Display label: "CROSSFIT OPEN", "WOD", "HERO WOD", etc.
  categoryType: 'open' | 'hero' | 'girl' | 'custom' | 'wod' | 'strength'
  year?: number
  wodType: WodType
  scoreDisplay: string
  rxOrScaled: RxScaled
  prFlag: boolean
  date: string                  // ISO date string
  location?: string
  workoutLines?: string[]       // Formatted movement lines for poster card
  rxStandard?: string
  timeCapSeconds?: number
  description?: string          // Alternative to workoutLines for Workout data
}
