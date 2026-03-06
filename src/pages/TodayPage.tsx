import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { MacroBar } from '../components/MacroBar'
import {
  Dumbbell, Moon, Droplets, Zap, TrendingUp, Timer, Calculator,
  Activity, Flame, ShoppingCart, ChevronRight, Plus, Sun, CloudMoon, Sparkles,
  Trophy, Clock, Shield, Brain
} from 'lucide-react'
import { TimerPage } from './TimerPage'
import { CalcPage } from './CalcPage'
import { useCycleTracking, PHASE_COLORS } from '../hooks/useCycleTracking'
import { CycleTrainingCard } from '../components/CycleTrainingCard'
import { useCountUp } from '../hooks/useCountUp'
import { useStreakCelebration } from '../hooks/useStreakCelebration'
import { SaveCelebration } from '../components/SaveCelebration'
import { WeeklySummary, shouldShowWeeklySummary } from '../components/WeeklySummary'
import { ReviewPrompt, shouldShowReview } from '../components/ReviewPrompt'
import { SleepDetailCard } from '../components/SleepDetailCard'

type Overlay = null | 'timer' | 'calc'

function getGreetingKey(): { key: string; icon: typeof Sun } {
  const h = new Date().getHours()
  if (h < 12) return { key: 'today.greeting', icon: Sun }
  if (h < 17) return { key: 'today.greetingAfternoon', icon: Sun }
  return { key: 'today.greetingEvening', icon: CloudMoon }
}

export function TodayPage() {
  const { t, i18n } = useTranslation()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const {
    profile, todayLog, todayWorkout, todayMeals, todayMacros,
    groceryItems, allDailyLogs, workouts, movementPRs,
    loadProfile, loadTodayLog, loadTodayWorkout, loadTodayMeals,
    loadGrocery, loadAllDailyLogs, loadWorkouts, loadMovementPRs,
    setActiveTab,
  } = useStore()

  const cycle = useCycleTracking()

  useEffect(() => {
    Promise.allSettled([
      loadProfile(),
      loadTodayLog(),
      loadTodayWorkout(),
      loadTodayMeals(),
      loadGrocery(),
      loadAllDailyLogs(),
      loadWorkouts(),
      loadMovementPRs(),
    ])
  }, [])

  const name = profile?.displayName || 'Athlete'
  const greeting = getGreetingKey()
  const GreetingIcon = greeting.icon
  const mealsCount = new Set(todayMeals.map(m => m.mealType)).size

  // Calculate streak
  const streak = (() => {
    if (!allDailyLogs || allDailyLogs.length === 0) return 0
    const dates = new Set(allDailyLogs.map(l => l.date))
    let count = 0
    const d = new Date()
    const todayStr = d.toISOString().split('T')[0]
    if (dates.has(todayStr) || todayWorkout || todayMeals.length > 0) count++
    else return 0
    for (let i = 1; i < 365; i++) {
      d.setDate(d.getDate() - 1)
      const ds = d.toISOString().split('T')[0]
      if (dates.has(ds)) count++
      else break
    }
    return count
  })()

  // Water progress
  const waterTarget = profile?.waterTarget || 3000
  const waterCurrent = todayLog?.waterMl || 0
  const waterPct = Math.min(100, Math.round((waterCurrent / waterTarget) * 100))

  // Calories progress
  const calTarget = profile?.calorieTarget || 2000
  const calCurrent = todayMacros.calories

  // Grocery unchecked count
  const groceryUnchecked = groceryItems.filter(g => !g.isChecked).length

  // Weekly training stats
  const weeklyStats = useMemo(() => {
    if (!workouts || workouts.length === 0) return null
    const now = new Date()
    const last7 = workouts.filter(w => (now.getTime() - new Date(w.date).getTime()) / 86400000 <= 7)
    const target = profile?.trainingDaysPerWeek || 5
    return { done: last7.length, target, prs: last7.filter(w => w.prFlag).length }
  }, [workouts, profile])

  // Latest PR — most recent movement PR for gold card
  const latestPR = useMemo(() => {
    if (!movementPRs || movementPRs.length === 0) return null
    const sorted = [...movementPRs].sort((a, b) => b.date.localeCompare(a.date))
    return sorted[0]
  }, [movementPRs])

  // Workout suggestion based on history
  const suggestion = useMemo(() => {
    if (todayWorkout || !workouts || workouts.length === 0) return null
    const now = new Date()
    const dayOfWeek = now.getDay()
    const last7 = workouts.filter(w => (now.getTime() - new Date(w.date).getTime()) / 86400000 <= 7)
    const types = last7.map(w => w.workoutType)
    const hasStrength = types.includes('Strength') || types.includes('StrengthMetcon')
    const hasCardio = types.includes('Running') || types.includes('Cardio') || types.includes('HYROX')
    const hasMetcon = types.includes('AMRAP') || types.includes('ForTime') || types.includes('EMOM')

    if (dayOfWeek === 0) return { text: t('today.suggestRecovery'), type: 'rest' }
    if (!hasStrength && last7.length >= 2) return { text: t('today.suggestStrength'), type: 'strength' }
    if (!hasCardio && last7.length >= 3) return { text: t('today.suggestCardio'), type: 'cardio' }
    if (!hasMetcon && last7.length >= 2) return { text: t('today.suggestMetcon'), type: 'metcon' }
    if (last7.length < (profile?.trainingDaysPerWeek || 5)) {
      return { text: t('today.suggestTarget', { count: (profile?.trainingDaysPerWeek || 5) - last7.length }), type: 'target' }
    }
    return null
  }, [todayWorkout, workouts, profile])

  // Auto Recovery Score — computed from sleep, energy, cycle phase, training load
  const recoveryScore = useMemo(() => {
    const sleep = todayLog?.sleepHours
    const energy = todayLog?.energy
    const hasCycle = cycle.settings && cycle.currentPhase

    if (!sleep && !energy) return null

    if (hasCycle) {
      // With cycle: Sleep 40% + Energy 25% + Cycle Phase 20% + Training Load 15%
      const sleepScore = sleep ? Math.min(100, (sleep / 8) * 100) : 50
      const energyScore = energy ? (energy / 5) * 100 : 50
      const cycleImpact = cycle.currentPhase === 'follicular' ? 90 : cycle.currentPhase === 'ovulation' ? 80 : cycle.currentPhase === 'luteal' ? 50 : 40
      const weekSessions = weeklyStats?.done || 0
      const weekTarget = weeklyStats?.target || 5
      const loadScore = weekSessions <= weekTarget ? 80 : Math.max(30, 100 - (weekSessions - weekTarget) * 15)

      return Math.round(sleepScore * 0.4 + energyScore * 0.25 + cycleImpact * 0.2 + loadScore * 0.15)
    } else {
      // Without cycle: Sleep 50% + Energy 30% + Training 20%
      const sleepScore = sleep ? Math.min(100, (sleep / 8) * 100) : 50
      const energyScore = energy ? (energy / 5) * 100 : 50
      const weekSessions = weeklyStats?.done || 0
      const weekTarget = weeklyStats?.target || 5
      const loadScore = weekSessions <= weekTarget ? 80 : Math.max(30, 100 - (weekSessions - weekTarget) * 15)

      return Math.round(sleepScore * 0.5 + energyScore * 0.3 + loadScore * 0.2)
    }
  }, [todayLog, cycle.settings, cycle.currentPhase, weeklyStats])

  // Animated numbers — count up from 0 on mount
  const animatedStreak = useCountUp(streak, 400)
  const animatedRecovery = useCountUp(recoveryScore || 0, 800)
  const animatedCalories = useCountUp(Math.round(calCurrent), 700)
  const animatedWaterPct = useCountUp(waterPct, 500)

  // Retention: streak milestone celebrations
  const { pendingMilestone, dismiss: dismissMilestone } = useStreakCelebration(streak)

  // Retention: weekly summary + review prompt
  const [showWeeklySummary, setShowWeeklySummary] = useState(() => shouldShowWeeklySummary())
  const [showReview, setShowReview] = useState(() => {
    const totalWorkouts = workouts?.length || 0
    const hasPR = (movementPRs?.length || 0) > 0
    return shouldShowReview(totalWorkouts, hasPR, streak)
  })

  // Average daily calories over last 7 days (for weekly summary)
  const avgCalories = useMemo(() => {
    if (!allDailyLogs || allDailyLogs.length === 0) return 0
    const now = new Date()
    const last7 = allDailyLogs.filter(l => {
      const diff = (now.getTime() - new Date(l.date).getTime()) / 86400000
      return diff <= 7 && diff >= 0
    })
    if (last7.length === 0) return 0
    // Sum calories from todayMeals would be more accurate, but we approximate
    return calTarget * 0.8 // placeholder — real implementation would sum meal calories per day
  }, [allDailyLogs, calTarget])

  // Overlays — rendered AFTER all hooks to maintain consistent hook count
  if (overlay === 'timer') return <TimerPage onClose={() => setOverlay(null)} />
  if (overlay === 'calc') return <CalcPage onClose={() => setOverlay(null)} />

  return (
    <div className="space-y-4 pb-20 stagger-children">
      {/* Streak milestone celebration overlay */}
      {pendingMilestone && (
        <SaveCelebration
          type="streak"
          message={pendingMilestone.title}
          subMessage={pendingMilestone.subtitle}
          onDone={dismissMilestone}
          duration={2500}
        />
      )}

      {/* Weekly Summary — shown at start of week */}
      {showWeeklySummary && (
        <WeeklySummary
          workouts={workouts || []}
          streak={streak}
          avgCalories={avgCalories}
          onDismiss={() => setShowWeeklySummary(false)}
        />
      )}

      {/* Header — greeting + streak with ambient gradient backdrop */}
      <div className="flex justify-between items-start ambient-header">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <GreetingIcon size={16} className="text-yellow-400" />
            <p className="text-[0.8125rem] text-ct-2">{t(greeting.key)}, {name}</p>
          </div>
          <h1 className="text-[1.75rem] font-bold leading-tight text-ct-1 tracking-tight">
            {new Date().toLocaleDateString(i18n.language === 'zh-TW' ? 'zh-TW' : i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full min-h-[44px]">
            <Flame size={14} className="text-orange-400 animate-flame" />
            <span className="text-xs font-bold text-orange-400 tabular-nums">{animatedStreak}d</span>
          </div>
        )}
      </div>

      {/* Quick Tools — 48px min touch targets */}
      <div className="flex gap-2">
        {[
          { onClick: () => setOverlay('timer'), icon: Timer, label: t('more.wodTimer'), bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
          { onClick: () => setOverlay('calc'), icon: Calculator, label: t('more.oneRMCalc'), bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
          { onClick: () => setActiveTab('log'), icon: Plus, label: t('log.title'), bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
        ].map(({ onClick, icon: BtnIcon, label, bg, border, text }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex-1 min-h-[48px] ${bg} border ${border} rounded-xl flex items-center justify-center gap-1.5 card-press`}
          >
            <BtnIcon size={16} className={text} />
            <span className={`text-xs font-semibold ${text}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* #6 ENHANCED TODAY'S WORKOUT — hero card */}
      <button
        className="w-full text-left glass-card rounded-ct-lg p-4 card-press"
        onClick={() => setActiveTab(todayWorkout ? 'train' : 'log')}
        aria-label={todayWorkout ? `Today's workout: ${todayWorkout.name}` : 'Log a workout'}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('today.todayTraining')}</p>
          <ChevronRight size={14} className="text-ct-2" />
        </div>
        {todayWorkout ? (
          <>
            <p className="text-[1.25rem] font-semibold text-ct-1">{todayWorkout.name}</p>
            <p className="text-[0.8125rem] text-ct-2 mt-0.5">{todayWorkout.workoutType}
              {todayWorkout.scoreDisplay && <span className="tabular-nums"> — {todayWorkout.scoreDisplay}</span>}
            </p>

            {/* Enhanced details: movements, duration, description */}
            {todayWorkout.description && (
              <p className="text-[11px] text-ct-2 mt-1.5 line-clamp-2">
                {todayWorkout.description.replace(/^WOD: /i, '').replace(/\nWOD: /gi, '\n')}
              </p>
            )}

            {/* Movements chips */}
            {todayWorkout.movements && todayWorkout.movements.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {todayWorkout.movements.slice(0, 5).map((m, i) => (
                  <span key={i} className="text-[11px] bg-ct-elevated/60 text-ct-2 px-2 py-0.5 rounded-full">{m}</span>
                ))}
                {todayWorkout.movements.length > 5 && (
                  <span className="text-[11px] text-ct-2">+{todayWorkout.movements.length - 5}</span>
                )}
              </div>
            )}

            {/* Duration + loads summary */}
            <div className="flex items-center gap-3 mt-2">
              {todayWorkout.duration && (
                <span className="flex items-center gap-1 text-[11px] text-ct-2">
                  <Clock size={10} /> {todayWorkout.duration}{t('today.min')}
                </span>
              )}
              {todayWorkout.loads && todayWorkout.loads['strength_end'] && (
                <span className="text-[11px] text-purple-400 font-medium">
                  {t('today.top')} {todayWorkout.loads['strength_end']}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                todayWorkout.rxOrScaled === 'RX' ? 'bg-green-500/20 text-green-400' :
                todayWorkout.rxOrScaled === 'Elite' ? 'bg-purple-500/20 text-purple-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>{todayWorkout.rxOrScaled}</span>
              {todayWorkout.prFlag && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 animate-pulse">PR!</span>
              )}
              {todayWorkout.isBenchmark && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-400">{t('today.benchmark')}</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <div className="w-11 h-11 bg-ct-elevated/50 rounded-xl flex items-center justify-center">
              <Dumbbell size={20} className="text-ct-2" />
            </div>
            <div>
              <p className="text-sm text-ct-2">{t('today.noWorkoutYet')}</p>
              <p className="text-xs text-cyan-400/80">{t('today.tapToLog')}</p>
            </div>
          </div>
        )}
      </button>

      {/* Weekly Training Progress — mini bar */}
      {weeklyStats && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('today.thisWeek')}</p>
            <span className="text-xs text-ct-2 tabular-nums">{weeklyStats.done} / {weeklyStats.target} {t('today.sessions')}</span>
          </div>
          <div className="h-1.5 bg-ct-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-bar-fill bar-glow"
              style={{ background: 'linear-gradient(90deg, #22d3ee, #a855f7)', width: `${Math.min(100, (weeklyStats.done / weeklyStats.target) * 100)}%` }}
            />
          </div>
          {weeklyStats.prs > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <Trophy size={10} className="text-red-400" />
              <span className="text-[11px] text-red-400 font-medium">{weeklyStats.prs} {t('common.pr')}{weeklyStats.prs !== 1 ? 's' : ''} {t('today.thisWeek').toLowerCase()}!</span>
            </div>
          )}
        </div>
      )}

      {/* LATEST PR — gold highlight card */}
      {latestPR && (
        <button
          className="w-full text-left bg-gradient-to-r from-yellow-500/10 to-amber-500/5 rounded-ct-lg p-3 border border-yellow-500/25 card-press"
          onClick={() => setActiveTab('train')}
          aria-label={`Latest PR: ${latestPR.movementName}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-yellow-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-yellow-400/70 font-semibold">{t('today.latestPR')}</p>
              <p className="text-sm font-bold text-ct-1 truncate">{latestPR.movementName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-yellow-400">{latestPR.value} {latestPR.unit}</p>
              <p className="text-[11px] text-ct-2">{latestPR.prType.toUpperCase()}</p>
            </div>
            {latestPR.previousBest && latestPR.previousBest > 0 && (
              <div className="text-right shrink-0 ml-1">
                <p className="text-xs font-bold text-green-400">+{Math.round(latestPR.value - latestPR.previousBest)}</p>
              </div>
            )}
          </div>
        </button>
      )}

      {/* CYCLE PHASE + TRAINING SYNC — only if cycle tracking enabled */}
      {cycle.settings && cycle.currentPhase && (
        <CycleTrainingCard
          phase={cycle.currentPhase}
          cycleDay={cycle.cycleDay}
          daysUntilPeriod={cycle.daysUntilPeriod}
          trainingRec={cycle.trainingRec}
          onClick={() => setActiveTab('log')}
        />
      )}

      {/* AUTO RECOVERY SCORE — computed from sleep + energy + cycle + training */}
      {recoveryScore !== null && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              recoveryScore >= 70 ? 'bg-green-500/15' : recoveryScore >= 40 ? 'bg-yellow-500/15' : 'bg-red-500/15'
            }`}>
              <Activity size={20} className={
                recoveryScore >= 70 ? 'text-green-400' : recoveryScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              } />
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('today.recoveryScore')}</p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-bold ${
                  recoveryScore >= 70 ? 'text-green-400' : recoveryScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>{animatedRecovery}</p>
                <p className="text-xs text-ct-2">/ 100</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold ${
                recoveryScore >= 70 ? 'text-green-400' : recoveryScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>{recoveryScore >= 70 ? t('today.readyToTrain') : recoveryScore >= 40 ? t('today.moderateLoad') : t('today.takeItEasy')}</p>
              {cycle.settings && cycle.currentPhase && (
                <p className="text-[11px] text-ct-2 mt-0.5 flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: PHASE_COLORS[cycle.currentPhase].bg }} />
                  {PHASE_COLORS[cycle.currentPhase].label} {t('today.factoredIn')}
                </p>
              )}
            </div>
          </div>
          {/* Recovery bar */}
          <div className="h-1.5 bg-ct-elevated rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full animate-bar-fill bar-glow ${
                recoveryScore >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                recoveryScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              style={{ width: `${recoveryScore}%` }}
            />
          </div>
        </div>
      )}

      {/* RED-S WARNING — if detected */}
      {cycle.redsFlags && cycle.redsFlags.isAtRisk && (
        <div className="bg-red-500/10 rounded-ct-lg p-3 border border-red-500/20 flex items-start gap-3">
          <Shield size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-400">{t('today.redsRisk')}</p>
            <p className="text-[11px] text-red-300/80 mt-0.5">{t('today.redsDesc')}</p>
          </div>
        </div>
      )}

      {/* NUTRITION — compact macro overview */}
      <button
        className="w-full text-left bg-ct-surface rounded-ct-lg p-4 border border-ct-border surface-highlight card-press"
        onClick={() => setActiveTab('eat')}
        aria-label={`Nutrition: ${Math.round(calCurrent)} of ${calTarget} calories`}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('today.macrosToday')}</p>
          <span className="text-xs text-ct-2 tabular-nums">{animatedCalories} / {calTarget} cal</span>
        </div>
        <div className="flex gap-2.5">
          <MacroBar label={t('log.protein')} current={todayMacros.protein} target={profile?.proteinTarget || 150} unit="g" color="#4ade80" />
          <MacroBar label={t('log.carbs')} current={todayMacros.carbs} target={profile?.carbsTarget || 200} unit="g" color="#fb923c" />
          <MacroBar label={t('log.fat')} current={todayMacros.fat} target={profile?.fatTarget || 60} unit="g" color="#f472b6" />
        </div>
        <p className="text-[11px] text-ct-2 mt-2">{mealsCount} {t('today.mealsLogged')} — {t('today.tapToLogMeal')}</p>
      </button>

      {/* BODY METRICS — 4-column grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: TrendingUp, value: todayLog?.weightKg, label: 'kg', color: 'text-cyan-400' },
          { icon: Moon, value: todayLog?.sleepHours, label: 'hrs', color: 'text-indigo-400' },
          { icon: Droplets, value: waterCurrent ? (waterCurrent / 1000).toFixed(1) : null, label: `${animatedWaterPct}%`, color: 'text-blue-400' },
          { icon: Zap, value: todayLog?.energy, label: '/5', color: 'text-yellow-400' },
        ].map(({ icon: MetricIcon, value, label, color }, i) => (
          <button
            key={i}
            onClick={() => setActiveTab('log')}
            className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border surface-highlight text-center card-press min-h-[64px]"
            aria-label={`${[t('today.weight'), t('today.sleep'), t('today.water'), t('today.energy')][i]}: ${value || '—'}`}
          >
            <MetricIcon size={16} className={`mx-auto mb-1 ${color}`} />
            <p className="text-sm font-bold text-ct-1">{value || '—'}</p>
            <p className="text-[11px] text-ct-2">{label}</p>
          </button>
        ))}
      </div>

      {/* AutoSleep detailed card — shown when imported sleep data exists */}
      {todayLog && (todayLog.sleepDeepHours || todayLog.sleepScore || todayLog.sleepHRV) && (
        <SleepDetailCard log={todayLog} />
      )}

      {/* Manual Recovery data — only show if logged AND no auto recovery score showing */}
      {!recoveryScore && todayLog && (todayLog.readinessScore || todayLog.rpe) && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border flex items-center gap-3">
          <Activity size={16} className="text-green-400 shrink-0" />
          <div className="flex-1 flex gap-4 text-xs">
            {todayLog.readinessScore !== undefined && (
              <span className="text-ct-2">{t('today.readiness')} <span className="font-bold text-ct-1">{todayLog.readinessScore}/10</span></span>
            )}
            {todayLog.rpe !== undefined && (
              <span className="text-ct-2">{t('today.rpe')} <span className="font-bold text-ct-1">{todayLog.rpe}/10</span></span>
            )}
            {todayLog.restingHR !== undefined && (
              <span className="text-ct-2">{t('today.hr')} <span className="font-bold text-ct-1">{todayLog.restingHR}</span></span>
            )}
          </div>
        </div>
      )}

      {/* WORKOUT SUGGESTION — only if no workout today */}
      {suggestion && (
        <button
          className="w-full text-left bg-violet-500/10 rounded-ct-lg p-3 border border-violet-500/20 flex items-center gap-3 card-press"
          onClick={() => setActiveTab('log')}
        >
          <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-violet-300">{suggestion.text}</p>
          </div>
          <ChevronRight size={14} className="text-violet-500/50 shrink-0" />
        </button>
      )}

      {/* AI COACH — quick access to training insights */}
      <button
        className="w-full text-left bg-violet-500/10 rounded-ct-lg p-3 border border-violet-500/20 flex items-center gap-3 card-press"
        onClick={() => setActiveTab('more')}
      >
        <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center shrink-0">
          <Brain size={16} className="text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-violet-300">{t('more.trainingInsights')}</p>
          <p className="text-[11px] text-ct-2">{t('more.trainingInsightsDesc')}</p>
        </div>
        <ChevronRight size={14} className="text-violet-500/50 shrink-0" />
      </button>

      {/* Review Prompt — shown at peak happiness moments */}
      {showReview && (
        <ReviewPrompt onDismiss={() => setShowReview(false)} />
      )}

      {/* GROCERY PREVIEW — only if items exist */}
      {groceryUnchecked > 0 && (
        <button
          className="w-full text-left bg-ct-surface rounded-ct-lg p-3 border border-ct-border flex items-center gap-3 card-press"
          onClick={() => setActiveTab('more')}
        >
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
            <ShoppingCart size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ct-1">{t(groceryUnchecked === 1 ? 'today.itemsOnGrocery' : 'today.itemsOnGrocery_plural', { count: groceryUnchecked })}</p>
            <p className="text-[11px] text-ct-2 truncate">
              {groceryItems.filter(g => !g.isChecked).slice(0, 3).map(g => g.name).join(', ')}
              {groceryUnchecked > 3 && ` ${t('today.more', { count: groceryUnchecked - 3 })}`}
            </p>
          </div>
          <ChevronRight size={14} className="text-ct-2 shrink-0" />
        </button>
      )}

    </div>
  )
}
