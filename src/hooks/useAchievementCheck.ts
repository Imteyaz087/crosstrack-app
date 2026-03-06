import { useCallback } from 'react'
import { useStore } from '../stores/useStore'
import { ACHIEVEMENTS, type Achievement } from '../data/achievements'

const SEEN_KEY = 'trackvolt_seen_achievements'

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveSeenIds(ids: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]))
}

interface Stats {
  workoutCount: number
  streakDays: number
  prCount: number
  mealCount: number
  benchmarkCount: number
  weightLogged: number
  cardioDistance: number
  hyroxCount: number
  waterStreak: number
}

const CONDITION_MAP: Record<string, keyof Stats> = {
  workout_count: 'workoutCount',
  streak_days: 'streakDays',
  pr_count: 'prCount',
  meal_count: 'mealCount',
  benchmark_count: 'benchmarkCount',
  weight_logged: 'weightLogged',
  cardio_distance: 'cardioDistance',
  hyrox_count: 'hyroxCount',
  water_streak: 'waterStreak',
}

function isUnlocked(a: Achievement, stats: Stats): boolean {
  const key = CONDITION_MAP[a.condition.type]
  return key ? stats[key] >= a.condition.value : false
}

/**
 * Returns a function that computes current stats from the store,
 * checks for newly unlocked achievements, and returns them.
 * Call this after any save operation.
 */
export function useAchievementCheck() {
  const { workouts, allDailyLogs, movementPRs } = useStore()

  const checkNewAchievements = useCallback((): Achievement[] => {
    // Compute stats (same logic as AchievementsPage)
    const workoutCount = workouts.length
    const hyroxCount = workouts.filter(w => w.workoutType === 'HYROX').length
    const benchmarkCount = workouts.filter(w => w.isBenchmark).length
    const prCount = workouts.filter(w => w.prFlag).length + movementPRs.length

    let streakDays = 0
    const logDates = new Set(allDailyLogs.map(l => l.date))
    const workoutDates = new Set(workouts.map(w => w.date))
    const allDates = new Set([...logDates, ...workoutDates])
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (allDates.has(ds)) streakDays++
      else break
    }

    const mealCount = allDailyLogs.length * 3 // approximate

    const weightLogged = allDailyLogs.filter(l => l.weightKg).length

    const cardioDistance = workouts
      .filter(w => w.distanceValue)
      .reduce((sum, w) => {
        let km = w.distanceValue || 0
        if (w.distanceUnit === 'mi') km *= 1.60934
        if (w.distanceUnit === 'm') km /= 1000
        return sum + km
      }, 0)

    let waterStreak = 0
    const sortedLogs = [...allDailyLogs].sort((a, b) => b.date.localeCompare(a.date))
    for (const log of sortedLogs) {
      if (log.waterMl && log.waterMl > 0) waterStreak++
      else break
    }

    const stats: Stats = { workoutCount, hyroxCount, benchmarkCount, prCount, streakDays, mealCount, weightLogged, cardioDistance, waterStreak }

    // Find all currently unlocked
    const currentUnlocked = ACHIEVEMENTS.filter(a => isUnlocked(a, stats))
    const seen = getSeenIds()

    // Find new ones
    const newOnes = currentUnlocked.filter(a => !seen.has(a.id))

    // Mark all current as seen
    if (newOnes.length > 0) {
      for (const a of currentUnlocked) seen.add(a.id)
      saveSeenIds(seen)
    }

    return newOnes
  }, [workouts, allDailyLogs, movementPRs])

  return { checkNewAchievements }
}
