/**
 * WeeklySummary — "Your Week" recap card shown on Mondays
 *
 * Shows: workouts done, PRs hit, avg calories, streak status
 * Dismissible — stores dismissed week in localStorage
 * Appears at the top of TodayPage on Mondays (or first open of the week)
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Dumbbell, Trophy, Flame, TrendingUp } from 'lucide-react'
import type { Workout } from '../types'

interface WeeklySummaryProps {
  workouts: Workout[]
  streak: number
  avgCalories: number
  onDismiss: () => void
}

const DISMISS_KEY = 'trackvolt_weekly_summary_dismissed'

function getWeekId(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${weekNum}`
}

export function shouldShowWeeklySummary(): boolean {
  // Show on Monday, or if it's the first time this week
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    const currentWeek = getWeekId()
    return dismissed !== currentWeek
  } catch {
    return false
  }
}

export function dismissWeeklySummary(): void {
  localStorage.setItem(DISMISS_KEY, getWeekId())
}

export function WeeklySummary({ workouts, streak, avgCalories, onDismiss }: WeeklySummaryProps) {
  const { t } = useTranslation()
  const [fading, setFading] = useState(false)

  const lastWeekWorkouts = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return workouts.filter(w => {
      const d = new Date(w.date)
      return d >= weekAgo && d <= now
    })
  }, [workouts])

  const stats = useMemo(() => {
    const count = lastWeekWorkouts.length
    const prs = lastWeekWorkouts.filter(w => w.prFlag).length
    const types = new Set(lastWeekWorkouts.map(w => w.workoutType))
    return { count, prs, variety: types.size }
  }, [lastWeekWorkouts])

  const handleDismiss = () => {
    setFading(true)
    setTimeout(() => {
      dismissWeeklySummary()
      onDismiss()
    }, 250)
  }

  // Don't show if no data at all
  if (stats.count === 0 && streak === 0) return null

  return (
    <div className={`bg-gradient-to-br from-cyan-500/10 via-slate-800/60 to-violet-500/10 rounded-ct-lg p-4 border border-cyan-500/20 transition-all duration-250 ${
      fading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-spring-in'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan-400" />
          <p className="text-[11px] uppercase tracking-widest text-cyan-400 font-bold">{t('weeklySummary.yourWeek')}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 -mr-1 text-ct-2 active:text-ct-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('weeklySummary.dismissLabel')}
        >
          <X size={14} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Workouts */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-cyan-500/15 rounded-xl flex items-center justify-center mb-1">
            <Dumbbell size={18} className="text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-ct-1 tabular-nums">{stats.count}</p>
          <p className="text-[9px] text-ct-2 uppercase">{t('weeklySummary.workouts')}</p>
        </div>

        {/* PRs */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-yellow-500/15 rounded-xl flex items-center justify-center mb-1">
            <Trophy size={18} className="text-yellow-400" />
          </div>
          <p className="text-lg font-bold text-ct-1 tabular-nums">{stats.prs}</p>
          <p className="text-[9px] text-ct-2 uppercase">{t('weeklySummary.prs')}</p>
        </div>

        {/* Streak */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-orange-500/15 rounded-xl flex items-center justify-center mb-1">
            <Flame size={18} className="text-orange-400" />
          </div>
          <p className="text-lg font-bold text-ct-1 tabular-nums">{streak}</p>
          <p className="text-[9px] text-ct-2 uppercase">{t('weeklySummary.streak')}</p>
        </div>

        {/* Avg Cal */}
        <div className="text-center">
          <div className="w-10 h-10 mx-auto bg-green-500/15 rounded-xl flex items-center justify-center mb-1">
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <p className="text-lg font-bold text-ct-1 tabular-nums">{avgCalories > 0 ? Math.round(avgCalories) : '—'}</p>
          <p className="text-[9px] text-ct-2 uppercase">{t('weeklySummary.avgCal')}</p>
        </div>
      </div>

      {/* Encouragement message */}
      <p className="text-xs text-ct-2 text-center mt-3">
        {stats.count >= 5
          ? t('weeklySummary.encourageGreat')
          : stats.count >= 3
            ? t('weeklySummary.encourageGood')
            : stats.count >= 1
              ? t('weeklySummary.encourageOk')
              : streak > 0
                ? t('weeklySummary.encourageStreak')
                : t('weeklySummary.encourageStart')}
      </p>
    </div>
  )
}
