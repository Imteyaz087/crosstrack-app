import type { FoodItem, Goal, Gender } from '../types'

export function calcMacros(food: FoodItem, grams: number) {
  const factor = grams / 100
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
    fat: Math.round(food.fatPer100g * factor * 10) / 10,
    fiber: Math.round((food.fiberPer100g || 0) * factor * 10) / 10,
  }
}

export function verifyCals(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9)
}

export function calc1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function calcPercentage(oneRepMax: number, pct: number): number {
  return Math.round(oneRepMax * pct / 100)
}

export function getPercentageChart(oneRepMax: number) {
  return [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map(p => ({
    pct: p,
    weight: calcPercentage(oneRepMax, p),
  }))
}

export function calcNutritionTargets(
  weightKg: number, goal: Goal, gender?: Gender,
): { protein: number; carbs: number; fat: number; calories: number; water: number } {
  let pM = 2.0, cM = 3.0, fM = 0.8
  switch (goal) {
    case 'fat_loss': pM = 2.4; cM = 2.0; fM = 0.7; break
    case 'muscle_gain': pM = 2.2; cM = 4.0; fM = 1.0; break
    case 'performance': pM = 2.0; cM = 4.0; fM = 0.9; break
    case 'recomp': pM = 2.2; cM = 2.5; fM = 0.8; break
    case 'endurance': pM = 1.6; cM = 5.0; fM = 0.8; break
    case 'general_health': pM = 1.6; cM = 3.0; fM = 0.8; break
  }
  if (gender === 'female') { cM *= 0.85; fM *= 1.1 }
  const protein = Math.round(weightKg * pM)
  const carbs = Math.round(weightKg * cM)
  const fat = Math.round(weightKg * fM)
  return { protein, carbs, fat, calories: verifyCals(protein, carbs, fat), water: Math.round(weightKg * 35) }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function parseTime(str: string): number {
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  return parseInt(str)
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDayOfWeek(date?: string): number {
  return date ? new Date(date).getDay() : new Date().getDay()
}

export function getCurrentWeek(): { weekNumber: number; phase?: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const weekNumber = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  const phases: Record<number, string> = { 1: 'Base', 2: 'Load', 3: 'Intensity', 4: 'Deload' }
  const phase = phases[(weekNumber % 4) || 4]
  return { weekNumber, phase }
}

export function calcStreak(dateSet: Set<string>): number {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const ds = new Date(d)
    ds.setDate(ds.getDate() - i)
    if (dateSet.has(toLocalDateStr(ds))) streak++
    else break
  }
  return streak
}

export function pct(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}