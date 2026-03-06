import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Dumbbell, Moon, Droplets, Flame, RefreshCw, Zap, Heart, Sparkles, Loader2 } from 'lucide-react'
import { hasApiKey, generateText, buildInsightsPrompt } from '../services/gemini'
import { calcStreak } from '../utils/macros'

const MS_PER_DAY = 86_400_000
const DAYS_IN_WEEK = 7
const DAYS_IN_MONTH = 30
const VOLUME_SPIKE_THRESHOLD = 1.5
const VOLUME_DROP_THRESHOLD = 0.5
const MIN_LAST_WEEK_FOR_DROP = 3
const LOW_SLEEP_HOURS = 6
const GOOD_SLEEP_HOURS = 8
const LOW_ENERGY_THRESHOLD = 2
const HIGH_SORENESS_THRESHOLD = 4
const HYDRATION_LOW_PCT = 50
const PROTEIN_GAP_CAL_PCT = 40
const PROTEIN_GAP_RATIO = 0.3
const STREAK_HIGHLIGHT_MIN = 7
const DEFAULT_WATER_TARGET = 3000
const DEFAULT_CAL_TARGET = 2000
const DEFAULT_PROT_TARGET = 150
const DEFAULT_CARBS_TARGET = 200
const DEFAULT_FAT_TARGET = 60
const DEFAULT_WATER_AI = 2500
const DEFAULT_TRAINING_DAYS = 5

interface Insight {
  type: 'good' | 'warning' | 'tip'
  icon: typeof Brain
  title: string
  message: string
}

export function AICoachPage() {
  const { t } = useTranslation()
  const { profile, workouts, allDailyLogs, todayLog, movementPRs, todayMacros,
    loadWorkouts, loadAllDailyLogs, loadTodayLog, loadMovementPRs, loadTodayMeals } = useStore()
  const [refreshKey, setRefreshKey] = useState(0)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => { Promise.allSettled([loadWorkouts(), loadAllDailyLogs(), loadTodayLog(), loadMovementPRs(), loadTodayMeals()]) }, [])

  const insights = useMemo(() => {
    const result: Insight[] = []
    const now = new Date()

    const last7 = workouts.filter(w => (now.getTime() - new Date(w.date).getTime()) / MS_PER_DAY <= DAYS_IN_WEEK)
    const last14 = workouts.filter(w => (now.getTime() - new Date(w.date).getTime()) / MS_PER_DAY <= DAYS_IN_WEEK * 2)
    const thisWeek = last7.length
    const lastWeek = last14.length - thisWeek
    const targetDays = profile?.trainingDaysPerWeek || DEFAULT_TRAINING_DAYS

    if (thisWeek === 0) {
      result.push({ type: 'warning', icon: Dumbbell, title: t('insights.noWorkouts'), message: t('insights.noWorkoutsMsg', { target: targetDays }) })
    } else if (thisWeek >= targetDays) {
      result.push({ type: 'good', icon: CheckCircle, title: t('insights.weeklyTargetHit'), message: t('insights.weeklyTargetHitMsg', { done: thisWeek, target: targetDays }) })
    } else {
      const remaining = targetDays - thisWeek
      const daysLeft = DAYS_IN_WEEK - now.getDay()
      result.push({ type: 'tip', icon: Dumbbell, title: t('insights.moreToGo', { count: remaining }), message: t('insights.moreToGoMsg', { done: thisWeek, target: targetDays, daysLeft }) })
    }

    if (lastWeek > 0 && thisWeek > 0) {
      const acr = thisWeek / lastWeek
      if (acr > VOLUME_SPIKE_THRESHOLD) result.push({ type: 'warning', icon: AlertTriangle, title: t('insights.trainingSpike'), message: t('insights.trainingSpikeMsg', { pct: Math.round(acr * 100) }) })
      else if (acr < VOLUME_DROP_THRESHOLD && lastWeek >= MIN_LAST_WEEK_FOR_DROP) result.push({ type: 'warning', icon: TrendingUp, title: t('insights.volumeDrop'), message: t('insights.volumeDropMsg', { last: lastWeek, this: thisWeek }) })
    }

    if (todayLog?.sleepHours) {
      if (todayLog.sleepHours < LOW_SLEEP_HOURS) result.push({ type: 'warning', icon: Moon, title: t('insights.lowSleep'), message: t('insights.lowSleepMsg', { hours: todayLog.sleepHours }) })
      else if (todayLog.sleepHours >= GOOD_SLEEP_HOURS) result.push({ type: 'good', icon: Moon, title: t('insights.greatSleep'), message: t('insights.greatSleepMsg', { hours: todayLog.sleepHours }) })
    }

    if (todayLog?.energy && todayLog.energy <= LOW_ENERGY_THRESHOLD) result.push({ type: 'warning', icon: Zap, title: t('insights.lowEnergy'), message: t('insights.lowEnergyMsg') })
    if (todayLog?.sorenessUpper && todayLog.sorenessUpper >= HIGH_SORENESS_THRESHOLD) result.push({ type: 'tip', icon: Heart, title: t('insights.upperSore'), message: t('insights.upperSoreMsg') })
    if (todayLog?.sorenessLower && todayLog.sorenessLower >= HIGH_SORENESS_THRESHOLD) result.push({ type: 'tip', icon: Heart, title: t('insights.lowerSore'), message: t('insights.lowerSoreMsg') })

    const waterPct = todayLog?.waterMl ? Math.round((todayLog.waterMl / (profile?.waterTarget || DEFAULT_WATER_TARGET)) * 100) : 0
    if (todayLog?.waterMl && waterPct < HYDRATION_LOW_PCT) result.push({ type: 'warning', icon: Droplets, title: t('insights.stayHydrated'), message: t('insights.stayHydratedMsg', { pct: waterPct }) })
    else if (waterPct >= 100) result.push({ type: 'good', icon: Droplets, title: t('insights.hydrationOnPoint'), message: t('insights.hydrationOnPointMsg') })

    const calTarget = profile?.calorieTarget || DEFAULT_CAL_TARGET
    const protTarget = profile?.proteinTarget || DEFAULT_PROT_TARGET
    const calPct = Math.round((todayMacros.calories / calTarget) * 100)
    if (todayMacros.calories > 0 && todayMacros.protein < protTarget * PROTEIN_GAP_RATIO && calPct > PROTEIN_GAP_CAL_PCT) {
      result.push({ type: 'warning', icon: Flame, title: t('insights.proteinGap'), message: t('insights.proteinGapMsg', { protein: Math.round(todayMacros.protein), calPct }) })
    }

    const logDates = new Set([...allDailyLogs.map(l => l.date), ...workouts.map(w => w.date)])
    const streak = calcStreak(logDates)
    if (streak >= STREAK_HIGHLIGHT_MIN) result.push({ type: 'good', icon: Flame, title: t('insights.streakTitle', { count: streak }), message: t('insights.streakMsg', { count: streak }) })

    if (result.length === 0) result.push({ type: 'tip', icon: Brain, title: t('insights.startLogging'), message: t('insights.startLoggingMsg') })

    return result
  }, [workouts, allDailyLogs, todayLog, movementPRs, todayMacros, profile, refreshKey])

  const handleAskAI = async () => {
    if (!hasApiKey()) { setAiError(t('insights.noApiKey')); return }
    setAiLoading(true); setAiError(null); setAiResponse(null)

    try {
      const now = new Date()
      const last7 = workouts.filter(w => (now.getTime() - new Date(w.date).getTime()) / MS_PER_DAY <= DAYS_IN_WEEK)
      const recentPRs = movementPRs.filter(pr => (now.getTime() - new Date(pr.date).getTime()) / MS_PER_DAY <= DAYS_IN_MONTH)
      const logDates = new Set([...allDailyLogs.map(l => l.date), ...workouts.map(w => w.date)])
      const streak = calcStreak(logDates)

      const prompt = buildInsightsPrompt({
        profile: {
          name: profile?.displayName || 'Athlete',
          goal: profile?.goal || 'general_health',
          experience: profile?.experienceLevel || 'intermediate',
          trainingDays: profile?.trainingDaysPerWeek || DEFAULT_TRAINING_DAYS,
        },
        recentWorkouts: last7.map(w => ({ date: w.date, name: w.name, type: w.workoutType, score: w.scoreDisplay })),
        todayMetrics: {
          sleep: todayLog?.sleepHours,
          water: todayLog?.waterMl,
          energy: todayLog?.energy,
          weight: todayLog?.weightKg,
        },
        macros: todayMacros,
        targets: {
          calories: profile?.calorieTarget || DEFAULT_CAL_TARGET,
          protein: profile?.proteinTarget || DEFAULT_PROT_TARGET,
          carbs: profile?.carbsTarget || DEFAULT_CARBS_TARGET,
          fat: profile?.fatTarget || DEFAULT_FAT_TARGET,
          water: profile?.waterTarget || DEFAULT_WATER_AI,
        },
        streak,
        prsThisMonth: recentPRs.length,
      })

      const response = await generateText(prompt)
      setAiResponse(response)
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Failed to get AI response')
    } finally {
      setAiLoading(false)
    }
  }

  const typeColors = {
    good: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400', title: 'text-green-400' },
    warning: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-400', title: 'text-orange-400' },
    tip: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: 'text-cyan-400', title: 'text-cyan-400' },
  }

  const goods = insights.filter(i => i.type === 'good')
  const warnings = insights.filter(i => i.type === 'warning')
  const tips = insights.filter(i => i.type === 'tip')

  return (
    <div className="space-y-4 stagger-children">
      <div className="flex justify-between items-center">
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('insights.title')}</h1>
        <button onClick={() => setRefreshKey(k => k + 1)}
          className="bg-ct-elevated/50 text-ct-2 p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* AI Coach button */}
      <button onClick={handleAskAI} disabled={aiLoading}
        className={`w-full rounded-xl p-3.5 border flex items-center gap-3 transition-colors ${
          aiLoading ? 'cursor-not-allowed opacity-60' :
          hasApiKey()
            ? 'bg-violet-500/10 border-violet-500/30 active:bg-violet-500/20'
            : 'bg-ct-surface border-ct-border'
        }`}>
        {aiLoading ? (
          <Loader2 size={20} className="text-violet-400 animate-spin" />
        ) : (
          <Sparkles size={20} className={hasApiKey() ? 'text-violet-400' : 'text-ct-2'} />
        )}
        <div className="text-left flex-1">
          <p className={`text-sm font-semibold ${hasApiKey() ? 'text-violet-300' : 'text-ct-2'}`}>
            {aiLoading ? t('insights.analyzing') : t('insights.askAI')}
          </p>
          <p className="text-[11px] text-ct-2">
            {hasApiKey() ? t('insights.aiPowered') : t('insights.addKey')}
          </p>
        </div>
      </button>

      {/* AI Response */}
      {aiResponse && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-violet-400" />
            <p className="text-xs font-bold text-violet-400">{t('insights.aiAnalysis')}</p>
          </div>
          <div className="text-sm text-ct-2 leading-relaxed whitespace-pre-line">{aiResponse}</div>
        </div>
      )}
      {aiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-xs text-red-400">{aiError}</p>
        </div>
      )}

      {/* Summary bar */}
      <div className="flex gap-2">
        <div className="flex-1 bg-green-500/10 rounded-xl p-2.5 text-center border border-green-500/20 min-h-[56px]">
          <p className="text-lg font-bold text-green-400 tabular-nums">{goods.length}</p>
          <p className="text-[11px] text-green-400/70">{t('insights.onTrack')}</p>
        </div>
        <div className="flex-1 bg-orange-500/10 rounded-xl p-2.5 text-center border border-orange-500/20 min-h-[56px]">
          <p className="text-lg font-bold text-orange-400 tabular-nums">{warnings.length}</p>
          <p className="text-[11px] text-orange-400/70">{t('insights.attention')}</p>
        </div>
        <div className="flex-1 bg-cyan-500/10 rounded-xl p-2.5 text-center border border-cyan-500/20 min-h-[56px]">
          <p className="text-lg font-bold text-cyan-400 tabular-nums">{tips.length}</p>
          <p className="text-[11px] text-cyan-400/70">{t('insights.tips')}</p>
        </div>
      </div>

      {/* Insights list */}
      <div className="space-y-2">
        {insights.map((insight, idx) => {
          const colors = typeColors[insight.type]
          const Icon = insight.icon
          return (
            <div key={idx} className={`${colors.bg} border ${colors.border} rounded-ct-lg p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                  <Icon size={16} className={colors.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${colors.title}`}>{insight.title}</p>
                  <p className="text-xs text-ct-2 mt-0.5 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="bg-ct-surface/40 rounded-xl p-3 border border-ct-border/30">
        <p className="text-[11px] text-ct-2 text-center">
          {t('insights.footer')}
        </p>
      </div>
    </div>
  )
}
