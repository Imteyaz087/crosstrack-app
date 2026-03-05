import type { FoodItem } from '../types'

// Calculate macros for a given food at a given weight
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

// Verify calories from macros: P*4 + C*4 + F*9
export function verifyCals(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9)
}

// Format time string "mm:ss" from seconds
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Parse "mm:ss" to seconds
export function parseTime(str: string): number {
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  return parseInt(str)
}

// Get today as YYYY-MM-DD
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

// Get current week number (relative to program start Feb 26 2026)
export function getCurrentWeek(): { weekNumber: number; phase: string } {
  const start = new Date('2026-02-26')
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const weekNum = Math.max(1, Math.min(4, diff + 1))
  const phases = ['Base', 'Load', 'Intensity', 'Deload']
  return { weekNumber: weekNum, phase: phases[weekNum - 1] }
}

// Get day of week (0-6, Sun-Sat)
export function getDayOfWeek(date?: string): number {
  return date ? new Date(date).getDay() : new Date().getDay()
}

// Percentage with cap at 100
export function pct(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}
