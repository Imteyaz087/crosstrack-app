// ============================================================
// CrossTrack Type Definitions
// ============================================================

export type WodType = 'AMRAP' | 'ForTime' | 'EMOM' | 'Chipper' | 'Strength' | 'StrengthMetcon' | 'Other'
export type ScoreUnit = 'reps' | 'time' | 'rounds' | 'load' | 'calories' | 'meters'
export type RxScaled = 'RX' | 'Scaled'
export type Phase = 'Base' | 'Load' | 'Intensity' | 'Deload'
export type MealType = 'breakfast' | 'post_workout' | 'lunch' | 'snack' | 'dinner'
export type SleepQuality = 1 | 2 | 3 | 4 | 5
export type EnergyLevel = 1 | 2 | 3 | 4 | 5

export interface DailyLog {
  id?: number
  date: string // YYYY-MM-DD
  weightKg?: number
  bodyFatPct?: number
  sleepHours?: number
  sleepQuality?: SleepQuality
  waterMl?: number
  steps?: number
  energy?: EnergyLevel
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Workout {
  id?: number
  date: string
  workoutType: WodType
  name: string
  description?: string
  scoreValue?: number
  scoreUnit?: ScoreUnit
  scoreDisplay?: string // e.g. "4:32" or "15 rounds + 3 reps"
  rxOrScaled: RxScaled
  phase?: Phase
  weekNumber?: number
  movements?: string[] // e.g. ["Back Squat", "Wall Balls"]
  loads?: Record<string, string> // e.g. {"Back Squat": "80kg"}
  isBenchmark: boolean
  prFlag: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FoodItem {
  id?: number
  name: string
  nameZh?: string
  category: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  defaultServingG: number
  isCustom: boolean
}

export interface MealLog {
  id?: number
  date: string
  mealType: MealType
  foodId: number
  foodName: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  createdAt: string
}

export interface MealTemplate {
  id?: number
  name: string
  nameZh?: string
  mealType: MealType
  items: MealTemplateItem[]
}

export interface MealTemplateItem {
  foodId: number
  foodName: string
  grams: number
}

export interface GroceryItem {
  id?: number
  name: string
  nameZh?: string
  category: string
  quantity: string
  unit: string
  isRecurring: boolean
  isChecked: boolean
  weekStartDate: string
}

export interface ProgramDay {
  id?: number
  weekNumber: number
  phase: Phase
  dayOfWeek: number // 0=Sun, 1=Mon...
  dayName: string
  focus: string
  strength: string
  metcon: string
  scalingOptions?: string
}

export interface UserSettings {
  id?: number
  displayName: string
  weightKg: number
  goal: string
  trainingTime: string
  language: 'en' | 'zh-TW'
  units: 'metric' | 'imperial'
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  calorieTarget: number
  waterTarget: number
}

// Computed types
export interface DailyMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface WeekSummary {
  weekNumber: number
  phase: Phase
  sessionsCompleted: number
  avgSleep: number
  avgWeight: number
  avgEnergy: number
  proteinCompliance: number
  prCount: number
}
