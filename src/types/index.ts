// ============================================================
// TRACKVOLT Type Definitions — Universal (all ages, genders)
// ============================================================
export type WodType = 'AMRAP' | 'ForTime' | 'EMOM' | 'Tabata' | 'Chipper' | 'Strength' | 'StrengthMetcon' | 'HYROX' | 'Running' | 'Cardio' | 'Other'
export type ScoreUnit = 'reps' | 'time' | 'rounds' | 'load' | 'calories' | 'meters' | 'distance'
export type CardioType = 'run' | 'row' | 'bike' | 'ski' | 'swim' | 'hike' | 'other'
export type DistanceUnit = 'km' | 'mi' | 'm'
export type RxScaled = 'Scaled' | 'RX' | 'Elite'
export type Phase = 'Base' | 'Load' | 'Intensity' | 'Deload' | 'Custom'
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'post_workout' | 'snack'
export type SleepQuality = 1 | 2 | 3 | 4 | 5
export type EnergyLevel = 1 | 2 | 3 | 4 | 5
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite'
export type Goal = 'fat_loss' | 'muscle_gain' | 'performance' | 'recomp' | 'general_health' | 'endurance'
export type TimerMode = 'amrap' | 'emom' | 'fortime' | 'tabata' | 'rest' | 'custom'
export type SorenessLevel = 0 | 1 | 2 | 3 | 4 | 5

// Legacy settings (DB compatibility)
export interface UserSettings {
  id?: number
  displayName: string
  weightKg: number
  goal: string
  trainingTime: string
  language: 'en' | 'zh-TW' | 'zh-CN'
  units: 'metric' | 'imperial'
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  calorieTarget: number
  waterTarget: number
  age?: number
  trainingDaysPerWeek?: number
}

// ============ User Profile (set during onboarding) ============
export interface UserProfile {
  id?: number
  displayName: string
  age?: number
  gender?: Gender
  heightCm?: number
  weightKg?: number
  experienceLevel: ExperienceLevel
  goal: Goal
  trainingTime: string
  trainingDaysPerWeek: number
  language: 'en' | 'zh-TW' | 'zh-CN'
  units: 'metric' | 'imperial'
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  calorieTarget: number
  waterTarget: number
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

// ============ Daily Log ============
export interface DailyLog {
  id?: number
  date: string
  weightKg?: number
  bodyFatPct?: number
  sleepHours?: number
  sleepQuality?: SleepQuality

  // AutoSleep / Apple Watch detailed sleep data
  sleepScore?: number        // 0–100 quality score
  sleepDeepHours?: number    // deep sleep hours
  sleepRemHours?: number     // REM sleep hours
  sleepLightHours?: number   // light sleep hours
  sleepAwakeHours?: number   // awake during night hours
  sleepHRV?: number          // HRV in ms (SDNN)
  sleepAvgHR?: number        // avg HR during sleep (bpm)
  sleepEfficiency?: number   // sleep efficiency 0–100%
  sleepSource?: 'manual' | 'autosleep' | 'health'  // import source

  waterMl?: number
  steps?: number
  energy?: EnergyLevel
  sorenessUpper?: SorenessLevel
  sorenessLower?: SorenessLevel
  sorenessCore?: SorenessLevel
  rpe?: number
  readinessScore?: number
  restingHR?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  armCm?: number
  thighCm?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============ Workouts ============
export interface Workout {
  id?: number
  date: string
  workoutType: WodType
  name: string
  description?: string
  scoreValue?: number
  scoreUnit?: ScoreUnit
  scoreDisplay?: string
  rxOrScaled: RxScaled
  phase?: Phase
  weekNumber?: number
  movements?: string[]
  loads?: Record<string, string>
  isBenchmark: boolean
  prFlag: boolean
  duration?: number
  heartRateAvg?: number
  heartRateMax?: number
  caloriesBurned?: number

  // Cardio/Running fields
  cardioType?: CardioType
  distanceValue?: number
  distanceUnit?: DistanceUnit
  paceDisplay?: string      // e.g. "5:30/km"
  splits?: string[]          // e.g. ["5:20", "5:35", "5:40"]
  elevationGain?: number     // meters

  // HYROX specific
  hyroxStations?: HyroxStation[]

  notes?: string
  createdAt: string
  updatedAt: string
}

// ============ HYROX Station ============
export interface HyroxStation {
  name: string          // e.g. "1km Run", "SkiErg 1000m"
  timeSeconds?: number  // station time
  notes?: string
}

// ============ Movement PRs ============
export interface MovementPR {
  id?: number
  movementName: string
  category: 'barbell' | 'dumbbell' | 'gymnastics' | 'monostructural' | 'other'
  prType: '1rm' | '3rm' | '5rm' | 'max_reps' | 'max_unbroken' | 'fastest'
  value: number
  unit: 'kg' | 'lb' | 'reps' | 'seconds'
  date: string
  notes?: string
  previousBest?: number
  createdAt?: string
}

// ============ Benchmark WODs ============
export interface BenchmarkWod {
  id?: number
  name: string
  category: 'girl' | 'hero' | 'open' | 'custom'
  description: string
  wodType: WodType
  scoreUnit: ScoreUnit
  rxStandard: string
  scaledStandard?: string
}

// ============ Food & Nutrition ============
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
  sugarPer100g?: number
  sodiumPer100g?: number
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
  dayOfWeek: number
  dayName: string
  focus: string
  strength: string
  metcon: string
  scalingOptions?: string
}

export interface TimerPreset {
  id?: number
  name: string
  mode: TimerMode
  totalSeconds: number
  rounds?: number
  workSeconds?: number
  restSeconds?: number
}

export interface DailyMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

// ============ Cycle Tracking (Women's Health) ============
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy'
export type ContraceptionType = 'none' | 'pill' | 'iud_hormonal' | 'iud_copper' | 'implant' | 'patch' | 'ring' | 'injection' | 'condom' | 'natural'
export type CycleMood = 'great' | 'good' | 'okay' | 'low' | 'bad'
export type CycleEnergy = 'high' | 'normal' | 'low' | 'exhausted'
export type PregnancyTrimester = 'first' | 'second' | 'third'

export interface CycleSettings {
  id?: number
  enabled: boolean
  lastPeriodStart: string          // ISO date
  averageCycleLength: number       // 21-35, default 28
  averagePeriodLength: number      // 2-8, default 5
  contraceptionType: ContraceptionType
  contraceptionName?: string
  isPregnant: boolean
  isTryingToConceive: boolean
  dueDate?: string                 // ISO date if pregnant
  createdAt: string
  updatedAt: string
}

export interface CycleEntry {
  id?: number
  date: string
  phase?: string
  intensity?: number
  notes?: string
  createdAt?: string
}

export interface CycleLog {
  id?: number
  date: string           // ISO date
  cycleDay?: number      // 1-35
  phase?: CyclePhase
  periodActive: boolean
  flowLevel?: FlowLevel
  symptoms: string[]     // physical symptoms
  mood?: CycleMood
  energy?: CycleEnergy
  sleepQuality?: 'great' | 'good' | 'poor' | 'terrible'
  notes?: string
  createdAt: string
}

// ============ Weekly Planner ============
export interface WeeklyPlan {
  id?: number
  weekKey: string        // ISO date of Monday, e.g. "2026-02-23"
  dayIndex: number       // 0=Mon, 6=Sun
  name: string
  type: WodType
  description: string
  completed: boolean
  createdAt?: string
}

// ============ Body, Heart Rate, Photo, DB Achievement ============
export interface BodyMeasurement {
  id?: number
  date: string
  metric: string
  value: number
  unit?: string
}

export interface HeartRateLog {
  id?: number
  date: string
  type: 'resting' | 'zone'
  bpm?: number
  zone?: string
}

export interface PhotoLog {
  id?: number
  date: string
  workoutId?: number
  blobRef?: string
}

export interface Achievement {
  id?: number
  type: string
  unlockedAt: string
}

// ============ Nutrition API Cache ============
export interface NutritionCache {
  id?: number
  cacheKey: string           // "usda:{query}" or "barcode:{code}"
  source: 'usda' | 'off'
  data: NutritionResult[] | NutritionResult | null
  expiresAt: number          // Unix timestamp (ms)
  createdAt: string
}

export interface NutritionResult {
  fdcId?: string
  name: string
  brand?: string
  source: 'usda' | 'off' | 'local'
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  sugarPer100g?: number
  sodiumPer100g?: number
  servingSize?: number
  category?: string
  imageUrl?: string
  dataQuality: 'high' | 'medium' | 'low'
}