import { useMemo } from 'react'
import { useStore } from '../stores/useStore'
import { today, toLocalDateStr } from '../utils/macros'
import { getStreakFreezeStatus } from './useStreakCelebration'

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365] as const
const STREAK_LOOKBACK_DAYS = 365

export interface UseStreakResult {
  currentStreak: number
  bestStreak: number
  weeklyDone: number
  weeklyTarget: number
  weeklyProgressPct: number
  freezeAvailable: boolean
  freezeUsedThisWeek: boolean
  nextMilestone: number | null
  daysToNextMilestone: number | null
  todayCounts: boolean
}

export function calculateCurrentStreak(dateSet: Set<string>, todayCounts: boolean, lookbackDays = STREAK_LOOKBACK_DAYS): number {
  if (!todayCounts) return 0

  let streak = 0

  for (let offset = 0; offset < lookbackDays; offset++) {
    if (offset === 0) {
      streak += 1
      continue
    }

    const day = new Date()
    day.setDate(day.getDate() - offset)

    if (!dateSet.has(toLocalDateStr(day))) {
      break
    }

    streak += 1
  }

  return streak
}

export function calculateBestStreak(dates: string[]): number {
  const uniqueDates = [...new Set(dates)].sort()
  if (uniqueDates.length === 0) return 0

  let best = 1
  let current = 1

  for (let index = 1; index < uniqueDates.length; index++) {
    const previous = new Date(`${uniqueDates[index - 1]}T00:00:00`)
    const next = new Date(`${uniqueDates[index]}T00:00:00`)
    const diffDays = Math.round((next.getTime() - previous.getTime()) / 86400000)

    if (diffDays === 1) {
      current += 1
      best = Math.max(best, current)
      continue
    }

    current = 1
  }

  return best
}

export function useStreak(): UseStreakResult {
  const allDailyLogs = useStore((state) => state.allDailyLogs)
  const todayWorkout = useStore((state) => state.todayWorkout)
  const todayMeals = useStore((state) => state.todayMeals)
  const workouts = useStore((state) => state.workouts)
  const profile = useStore((state) => state.profile)

  return useMemo(() => {
    const loggedDates = allDailyLogs.map((log) => log.date)
    const dateSet = new Set(loggedDates)
    const todayCounts = dateSet.has(today()) || Boolean(todayWorkout) || todayMeals.length > 0
    const currentStreak = calculateCurrentStreak(dateSet, todayCounts)
    const bestStreak = Math.max(calculateBestStreak(loggedDates), currentStreak)

    const weeklyTarget = profile?.trainingDaysPerWeek || 5
    const now = new Date()
    const weeklyDone = workouts.filter((workout) => {
      const diffDays = (now.getTime() - new Date(workout.date).getTime()) / 86400000
      return diffDays >= 0 && diffDays <= 7
    }).length
    const weeklyProgressPct = weeklyTarget > 0
      ? Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100))
      : 0

    const { freezeAvailable, usedThisWeek: freezeUsedThisWeek } = getStreakFreezeStatus()
    const nextMilestone = MILESTONES.find((milestone) => milestone > currentStreak) ?? null

    return {
      currentStreak,
      bestStreak,
      weeklyDone,
      weeklyTarget,
      weeklyProgressPct,
      freezeAvailable,
      freezeUsedThisWeek,
      nextMilestone,
      daysToNextMilestone: nextMilestone ? nextMilestone - currentStreak : null,
      todayCounts,
    }
  }, [allDailyLogs, profile, todayMeals, todayWorkout, workouts])
}
