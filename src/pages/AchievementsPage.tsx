import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { ACHIEVEMENTS, type Achievement } from '../data/achievements'
import { Trophy, Flame, Target, Star, Medal, Zap, Crown, Shield, Award, Heart, Lock, Loader2 } from 'lucide-react'

const ICON_MAP: Record<string, typeof Trophy> = {
  Trophy, Flame, Target, Star, Medal, Zap, Crown, Shield, Award, Heart,
}

const TIER_COLORS = {
  bronze: { bg: 'bg-amber-900/20', border: 'border-amber-700/40', text: 'text-amber-400', icon: 'text-amber-400' },
  silver: { bg: 'bg-ct-elevated/20', border: 'border-ct-border/30', text: 'text-ct-2', icon: 'text-ct-2' },
  gold: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400', icon: 'text-yellow-400' },
}

export function AchievementsPage() {
  const { t } = useTranslation()
  const { workouts, allDailyLogs, movementPRs, loadWorkouts, loadAllDailyLogs, loadMovementPRs } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.allSettled([loadWorkouts(), loadAllDailyLogs(), loadMovementPRs()]).finally(() => setLoading(false)) }, [])

  // Calculate user stats for achievement checking
  const stats = useMemo(() => {
    const workoutCount = workouts.length
    const hyroxCount = workouts.filter(w => w.workoutType === 'HYROX').length
    const benchmarkCount = workouts.filter(w => w.isBenchmark).length
    const prCount = workouts.filter(w => w.prFlag).length + movementPRs.length

    // Streak calculation
    let streakDays = 0
    const logDates = new Set(allDailyLogs.map(l => l.date))
    const workoutDates = new Set(workouts.map(w => w.date))
    const allDates = new Set([...logDates, ...workoutDates])
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      if (allDates.has(ds)) streakDays++
      else break
    }

    // Meal count (approximate from daily logs)
    const mealCount = allDailyLogs.length * 3 // rough estimate, or use actual

    // Weight logged days
    const weightLogged = allDailyLogs.filter(l => l.weightKg).length

    // Cardio distance (km)
    const cardioDistance = workouts
      .filter(w => w.distanceValue)
      .reduce((sum, w) => {
        let km = w.distanceValue || 0
        if (w.distanceUnit === 'mi') km *= 1.60934
        if (w.distanceUnit === 'm') km /= 1000
        return sum + km
      }, 0)

    // Water streak
    let waterStreak = 0
    const sortedLogs = [...allDailyLogs].sort((a, b) => b.date.localeCompare(a.date))
    for (const log of sortedLogs) {
      if (log.waterMl && log.waterMl > 0) waterStreak++
      else break
    }

    return { workoutCount, hyroxCount, benchmarkCount, prCount, streakDays, mealCount, weightLogged, cardioDistance, waterStreak }
  }, [workouts, allDailyLogs, movementPRs])

  const isUnlocked = (a: Achievement): boolean => {
    const v = stats[({
      workout_count: 'workoutCount',
      streak_days: 'streakDays',
      pr_count: 'prCount',
      meal_count: 'mealCount',
      benchmark_count: 'benchmarkCount',
      weight_logged: 'weightLogged',
      cardio_distance: 'cardioDistance',
      hyrox_count: 'hyroxCount',
      water_streak: 'waterStreak',
    } as const)[a.condition.type] as keyof typeof stats]
    return v >= a.condition.value
  }

  const getProgress = (a: Achievement): number => {
    const v = stats[({
      workout_count: 'workoutCount',
      streak_days: 'streakDays',
      pr_count: 'prCount',
      meal_count: 'mealCount',
      benchmark_count: 'benchmarkCount',
      weight_logged: 'weightLogged',
      cardio_distance: 'cardioDistance',
      hyrox_count: 'hyroxCount',
      water_streak: 'waterStreak',
    } as const)[a.condition.type] as keyof typeof stats]
    return Math.min(1, v / a.condition.value)
  }

  const unlocked = ACHIEVEMENTS.filter(isUnlocked)

  const categories = [
    { id: 'training', label: 'Training' },
    { id: 'consistency', label: 'Consistency' },
    { id: 'strength', label: 'Strength' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'milestone', label: 'Milestones' },
  ]

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-[1.75rem] font-bold text-ct-1">{t('achievements.title')}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <h1 className="text-[1.75rem] font-bold text-ct-1">{t('achievements.title')}</h1>

      {/* Summary */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border flex items-center gap-4">
        <div className="w-14 h-14 bg-yellow-500/15 rounded-ct-lg flex items-center justify-center">
          <Trophy size={28} className="text-yellow-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-ct-1">{unlocked.length} <span className="text-sm text-ct-2 font-normal">/ {ACHIEVEMENTS.length}</span></p>
          <p className="text-xs text-ct-2">{t('achievements.unlocked')}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {(['bronze', 'silver', 'gold'] as const).map(tier => {
            const count = unlocked.filter(a => a.tier === tier).length
            return (
              <div key={tier} className="text-center">
                <p className={`text-sm font-bold ${TIER_COLORS[tier].text}`}>{count}</p>
                <p className="text-[11px] text-ct-2 capitalize">{tier}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* By category */}
      {categories.map(cat => {
        const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat.id)
        if (catAchievements.length === 0) return null
        return (
          <div key={cat.id} className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{cat.label}</p>
            <div className="grid grid-cols-1 gap-2">
              {catAchievements.map(a => {
                const achieved = isUnlocked(a)
                const progress = getProgress(a)
                const tier = TIER_COLORS[a.tier]
                const IconComp = achieved ? (ICON_MAP[a.icon] || Trophy) : Lock
                return (
                  <div key={a.id} className={`rounded-xl p-3 border flex items-center gap-3 ${
                    achieved ? `${tier.bg} ${tier.border}` : 'bg-ct-surface/30 border-ct-border/30'
                  }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      achieved ? tier.bg : 'bg-ct-elevated/40'
                    }`}>
                      <IconComp size={20} className={achieved ? tier.icon : 'text-ct-2'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${achieved ? 'text-ct-1' : 'text-ct-2'}`}>{a.name}</p>
                      <p className={`text-[11px] ${achieved ? 'text-ct-2' : 'text-ct-2'}`}>{a.description}</p>
                      {!achieved && (
                        <div className="mt-1.5 h-1 bg-ct-elevated/50 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500/50 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                        </div>
                      )}
                    </div>
                    {achieved && (
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>{a.tier}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
