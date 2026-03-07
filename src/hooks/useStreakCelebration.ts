/**
 * useStreakCelebration  -  Detects streak milestones and triggers celebrations
 *
 * Milestones: 3, 7, 14, 30, 60, 90, 180, 365 days
 * Each milestone is celebrated only ONCE (tracked in localStorage)
 * Also manages streak freeze: 1 free pass per week
 */

import { useState, useCallback } from 'react'
import { E } from '../utils/emoji'

const MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365] as const
const STORAGE_KEY = 'trackvolt_streak_celebrations'
const FREEZE_KEY = 'trackvolt_streak_freeze'

const MILESTONE_MESSAGES: Record<number, { title: string; subtitle: string }> = {
  3:   { title: '3-Day Streak!',   subtitle: `You're building a habit ${E.muscle}` },
  7:   { title: '1 Week Strong!',  subtitle: 'Consistency is everything' },
  14:  { title: '2 Weeks!',        subtitle: "You're in the rhythm now" },
  30:  { title: '30 Days!',        subtitle: `One month of dedication ${E.trophy}` },
  60:  { title: '60 Days!',        subtitle: "You're unstoppable" },
  90:  { title: '90 Days!',        subtitle: 'Quarter of a year. Legend.' },
  180: { title: 'Half a Year!',    subtitle: '180 days. Truly dedicated.' },
  365: { title: '365 Days!',       subtitle: 'One full year. Incredible.' },
}

function getCelebratedMilestones(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markCelebrated(milestone: number): void {
  const celebrated = getCelebratedMilestones()
  celebrated.add(milestone)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...celebrated]))
}

export function useStreakCelebration(currentStreak: number) {
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null)

  // Compute pending milestone derived from currentStreak
  // No need for setState in effect - compute directly based on input
  const pendingMilestone = (() => {
    if (currentStreak <= 0 || dismissedMilestone !== null) return null

    const celebrated = getCelebratedMilestones()

    // Find the highest uncelebrated milestone that the current streak has reached
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      const m = MILESTONES[i]
      if (currentStreak >= m && !celebrated.has(m)) {
        const msg = MILESTONE_MESSAGES[m]
        return { days: m, ...msg }
      }
    }
    return null
  })()

  const dismiss = useCallback(() => {
    if (pendingMilestone) {
      markCelebrated(pendingMilestone.days)
      setDismissedMilestone(pendingMilestone.days)
    }
  }, [pendingMilestone])

  return { pendingMilestone, dismiss }
}

/**
 * Streak freeze logic
 * - 1 free freeze per calendar week (Mon-Sun)
 * - Automatically applied when streak would break
 * - Returns whether the freeze was used this week
 */
export function getStreakFreezeStatus(): { usedThisWeek: boolean; freezeAvailable: boolean } {
  try {
    const raw = localStorage.getItem(FREEZE_KEY)
    if (!raw) return { usedThisWeek: false, freezeAvailable: true }

    const data = JSON.parse(raw) as { weekId: string; used: boolean }
    const currentWeekId = getWeekId()

    if (data.weekId === currentWeekId) {
      return { usedThisWeek: data.used, freezeAvailable: !data.used }
    }
    // New week  -  freeze resets
    return { usedThisWeek: false, freezeAvailable: true }
  } catch {
    return { usedThisWeek: false, freezeAvailable: true }
  }
}

export function useStreakFreeze(): boolean {
  const currentWeekId = getWeekId()
  const status = getStreakFreezeStatus()

  if (!status.freezeAvailable) return false

  localStorage.setItem(FREEZE_KEY, JSON.stringify({ weekId: currentWeekId, used: true }))
  return true
}

function getWeekId(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${weekNum}`
}
