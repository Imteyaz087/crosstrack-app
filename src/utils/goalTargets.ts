/**
 * Evidence-based macro target calculator
 * Sources: ISSN position stand on diets & body composition (2017),
 * Helms et al. protein recommendations, ACSM guidelines,
 * Mifflin-St Jeor BMR equation (most validated for adults)
 */

import type { Goal, Gender } from '../types'

export interface ProfileInput {
  weightKg?: number
  heightCm?: number
  age?: number
  gender?: Gender
  goal?: Goal | string
  trainingDaysPerWeek?: number
}

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * Mifflin-St Jeor BMR (kcal/day)
 * Male: 10 × kg + 6.25 × cm − 5 × age + 5
 * Female: 10 × kg + 6.25 × cm − 5 × age − 161
 */
function calcBMR(weight: number, height: number, age: number, gender: Gender): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'female' ? base - 161 : base + 5
}

/**
 * Activity multiplier based on training frequency
 * Adapted from revised Harris-Benedict activity factors
 */
function activityMultiplier(daysPerWeek: number): number {
  if (daysPerWeek <= 1) return 1.2
  if (daysPerWeek <= 2) return 1.375
  if (daysPerWeek <= 3) return 1.55
  if (daysPerWeek <= 5) return 1.725
  return 1.9
}

/**
 * Calorie adjustment by goal
 * - fat_loss: −20 % deficit (evidence-based moderate deficit)
 * - muscle_gain: +10 % surplus (lean bulk)
 * - performance: +5 % slight surplus
 * - recomp: maintenance
 * - general_health: maintenance
 * - endurance: +10 % (fuel training volume)
 */
function goalCalorieMultiplier(goal: Goal | string): number {
  switch (goal) {
    case 'fat_loss': return 0.80
    case 'muscle_gain': return 1.10
    case 'performance': return 1.05
    case 'recomp': return 1.00
    case 'general_health': return 1.00
    case 'endurance': return 1.10
    default: return 1.00
  }
}

/**
 * Protein target in g per kg body weight
 * Based on ISSN position stand & meta-analyses:
 * - fat_loss: 2.2 g/kg (preserve lean mass in deficit)
 * - muscle_gain: 2.0 g/kg (support hypertrophy)
 * - performance: 1.8 g/kg (recovery & power)
 * - recomp: 2.2 g/kg (high protein drives recomp)
 * - general_health: 1.6 g/kg
 * - endurance: 1.4 g/kg (ACSM guideline)
 */
function proteinPerKg(goal: Goal | string): number {
  switch (goal) {
    case 'fat_loss': return 2.2
    case 'muscle_gain': return 2.0
    case 'performance': return 1.8
    case 'recomp': return 2.2
    case 'general_health': return 1.6
    case 'endurance': return 1.4
    default: return 1.8
  }
}

/**
 * Fat percentage of total calories
 * - fat_loss: 30 % (satiety, hormonal health)
 * - endurance: 22 % (prioritize carbs)
 * - others: 25 %
 */
function fatCaloriePct(goal: Goal | string): number {
  switch (goal) {
    case 'fat_loss': return 0.30
    case 'endurance': return 0.22
    default: return 0.25
  }
}

/**
 * Calculate evidence-based daily macro targets from user profile.
 * Falls back to sensible defaults if profile data is incomplete.
 */
export function calcGoalTargets(profile: ProfileInput | null | undefined): MacroTargets {
  // Sensible fallback if profile is missing or incomplete
  const weight = profile?.weightKg || 70
  const height = profile?.heightCm || 170
  const age = profile?.age || 30
  const gender = profile?.gender || 'male'
  const goal = profile?.goal || 'general_health'
  const days = profile?.trainingDaysPerWeek || 3

  // 1. BMR → TDEE → goal-adjusted calories
  const bmr = calcBMR(weight, height, age, gender)
  const tdee = bmr * activityMultiplier(days)
  const calories = Math.round(tdee * goalCalorieMultiplier(goal))

  // 2. Protein (g) — based on body weight
  const protein = Math.round(weight * proteinPerKg(goal))

  // 3. Fat (g) — percentage of total calories (9 kcal/g)
  const fat = Math.round((calories * fatCaloriePct(goal)) / 9)

  // 4. Carbs (g) — remaining calories (4 kcal/g)
  const proteinCal = protein * 4
  const fatCal = fat * 9
  const carbs = Math.round(Math.max(0, calories - proteinCal - fatCal) / 4)

  return { calories, protein, carbs, fat }
}

/**
 * Friendly label for a Goal type
 */
export function goalLabel(goal: Goal | string): string {
  switch (goal) {
    case 'fat_loss': return 'Fat Loss'
    case 'muscle_gain': return 'Muscle Gain'
    case 'performance': return 'Performance'
    case 'recomp': return 'Body Recomp'
    case 'general_health': return 'General Health'
    case 'endurance': return 'Endurance'
    default: return 'Health'
  }
}
