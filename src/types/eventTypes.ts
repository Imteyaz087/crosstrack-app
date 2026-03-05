import type { WodType, RxScaled } from './index'

export type EventCategory = 'open' | 'hero' | 'girl' | 'custom'
export type EventSource = 'template' | 'manual' | 'scanned'

export interface EventLog {
  id?: number
  date: string
  eventCategory: EventCategory
  eventYear?: number
  eventNumber?: string
  eventTitle: string
  eventSource: EventSource
  wodType: WodType
  workoutLines: string[]
  rxStandard?: string
  scaledStandard?: string
  timeCapSeconds?: number
  finished: boolean
  finalTimeSeconds?: number
  capped: boolean
  repsAtCap?: number
  roundsRepsAtCap?: string
  scoreDisplay?: string
  rxOrScaled: RxScaled
  location?: string
  notes?: string
  prFlag: boolean
  sourceImage?: string
  createdAt: string
  updatedAt: string
}

export interface EventTemplate {
  name: string
  category: EventCategory
  year?: number
  number?: string
  description: string
  wodType: WodType
  workoutLines: string[]
  timeCapMinutes?: number
  rxStandard: string
  scaledStandard?: string
}

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
  score?: string
  confidenceScores: Record<string, number>
  warnings: string[]
  error?: string
}