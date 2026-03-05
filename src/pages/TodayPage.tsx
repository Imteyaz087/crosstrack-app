import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { MacroBar } from '../components/MacroBar'
import { getCurrentWeek } from '../utils/macros'
import { Moon, Droplets, Zap, TrendingUp, Dumbbell, Timer, Calculator, Plus, ShoppingCart } from 'lucide-react'

export function TodayPage() {
  const { t } = useTranslation()
  const {
    settings, todayLog, todayWorkout, todayProgram, workouts, groceryItems,
    todayMeals, todayMacros,
    loadSettings, loadTodayLog, loadTodayWorkout, loadTodayProgram, loadTodayMeals, loadWorkouts, loadGrocery,
    setActiveTab, setMoreSubPage,
  } = useStore()

  useEffect(() => {
    loadSettings()
    loadTodayLog()
    loadTodayWorkout()
    loadTodayProgram()
    loadTodayMeals()
    loadWorkouts()
    loadGrocery()
  }, [])

  const { weekNumber, phase } = getCurrentWeek()
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const sessionsTarget = settings?.proteinTarget ? 6 : 6
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekWorkouts = workouts.filter(w => w.date >= weekStartStr)
  const sessionsDone = weekWorkouts.length
  const groceryCount = groceryItems.filter(i => !i.isChecked).length
  const name = settings?.displayName || 'Athlete'
  const mealsCount = new Set(todayMeals.map(m => m.mealType)).size
  const isLoading = settings === null

  const hour = new Date().getHours()
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🔥' : hour < 21 ? '💪' : '🌙'
  const greetText = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night'

  const phaseColors: Record<string, string> = {
    Base:      '#4ade80',
    Load:      '#fb923c',
    Intensity: '#f87171',
    Deload:    '#60a5fa',
  }

  return (
    <div className="page-enter space-y-3">
      {/* Header */}
      <div className="stagger-1 pt-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {greetEmoji} {greetText}, {name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {dayName}
        </h1>
        <p className="text-xs font-bold mt-1" style={{ color: (phase && phaseColors[phase]) || 'var(--text-secondary)' }}>
          Week {weekNumber} — {t(`phases.${phase}`)}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="stagger-1.5 flex gap-2 overflow-x-auto pb-1 -mx-1">
        <button
          onClick={() => { setActiveTab('more'); setMoreSubPage('timer') }}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
          style={{ background: 'rgba(34,211,238,0.2)', color: '#22d3ee' }}
        >
          <Timer size={16} /> WOD Timer
        </button>
        <button
          onClick={() => { setActiveTab('more'); setMoreSubPage('calc') }}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
          style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}
        >
          <Calculator size={16} /> 1RM Calculator
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
          style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}
        >
          <Plus size={16} /> Quick Log
        </button>
      </div>

      {/* Today's Training */}
      <div
        className="stagger-2 glass-card tap-target cursor-pointer"
        onClick={() => setActiveTab('train')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.todayTraining')}
        </p>
        {isLoading ? (
          <div className="skeleton h-16 w-full" />
        ) : todayProgram ? (
          <>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {todayProgram.focus}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {todayProgram.strength !== '—' && todayProgram.strength}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {todayProgram.metcon}
            </p>
            {todayWorkout && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={todayWorkout.rxOrScaled === 'RX'
                    ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
                    : { background: 'rgba(251,146,60,0.12)', color: '#fb923c' }
                  }
                >
                  {todayWorkout.rxOrScaled}
                </span>
                {todayWorkout.prFlag && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                    PR!
                  </span>
                )}
                {todayWorkout.scoreDisplay && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--volt)' }}>
                    {todayWorkout.scoreDisplay}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
                {t('today.noWorkoutToday')}
              </p>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--volt)' }}>
              Tap to log your WOD
            </p>
          </div>
        )}
      </div>

      {/* This Week */}
      <div className="stagger-2.5 glass-card">
        <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          THIS WEEK
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (sessionsDone / sessionsTarget) * 100)}%`, background: 'var(--volt)' }}
            />
          </div>
          <span className="text-sm font-bold text-white">{sessionsDone}/{sessionsTarget} sessions</span>
        </div>
      </div>

      {/* Macros */}
      <div
        className="stagger-3 glass-card tap-target cursor-pointer"
        onClick={() => setActiveTab('eat')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.macrosToday')}
        </p>
        {isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-6 w-full" />
            <div className="skeleton h-6 w-3/4" />
          </div>
        ) : (
        <>
          <div className="flex gap-3">
            <MacroBar label="Protein" current={todayMacros.protein} target={settings?.proteinTarget || 180} unit="g" color="#4ade80" />
            <MacroBar label="Carbs"   current={todayMacros.carbs}   target={settings?.carbsTarget   || 216} unit="g" color="#fb923c" />
            <MacroBar label="Fat"     current={todayMacros.fat}     target={settings?.fatTarget      ||  58} unit="g" color="#f472b6" />
          </div>
          <div className="mt-3">
            <MacroBar label="Calories" current={todayMacros.calories} target={settings?.calorieTarget || 2100} unit="" color="#C8FF00" />
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {mealsCount} {t('today.mealsLogged')}
          </p>
        </>
        )}
      </div>

      {/* Quick Metrics */}
      <div
        className="stagger-4 glass-card tap-target cursor-pointer"
        onClick={() => setActiveTab('log')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.quickMetrics')}
        </p>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
        <>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: TrendingUp, color: '#C8FF00', value: todayLog?.weightKg,                       metricLabel: t('today.weight'),   emptyCta: 'Log' },
            { icon: Moon,       color: '#818cf8', value: todayLog?.sleepHours,                      metricLabel: t('today.sleep'),    emptyCta: 'Log' },
            { icon: Droplets,   color: '#60a5fa', value: todayLog?.waterMl ? (todayLog.waterMl / 1000).toFixed(1) : null, metricLabel: t('today.water'),    emptyCta: 'Log' },
            { icon: Zap,        color: '#fb923c', value: todayLog?.energy,                          metricLabel: t('today.energy'),   emptyCta: 'Rate' },
          ].map(({ icon: Icon, color, value, metricLabel, emptyCta }) => (
            <div key={metricLabel} className="text-center">
              <div
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'var(--bg-raised)' }}
              >
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <p className="text-lg font-bold" style={{ color: value != null && value !== '' ? 'var(--text-primary)' : undefined }}>
                {value != null && value !== '' ? value : <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{emptyCta}</span>}
              </p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {metricLabel}
              </p>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Bottom links */}
      <div className="stagger-5 space-y-2">
        <button
          onClick={() => setActiveTab('train')}
          className="w-full glass-card tap-target flex items-center justify-between p-3"
        >
          <span className="flex items-center gap-2">
            <Zap size={16} style={{ color: 'var(--volt)' }} />
            <span className="text-sm font-medium text-white">{sessionsTarget - sessionsDone} more sessions to hit your weekly target</span>
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('more'); setMoreSubPage('aiCoach') }}
          className="w-full glass-card tap-target flex items-center justify-between p-3"
        >
          <span className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--volt)' }} />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Training Insights</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Smart training recommendations</p>
            </div>
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('more'); setMoreSubPage('grocery') }}
          className="w-full glass-card tap-target flex items-center justify-between p-3"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart size={16} style={{ color: 'var(--orange)' }} />
            <div className="text-left">
              <p className="text-sm font-medium text-white">{groceryCount} items on grocery list</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tap to view</p>
            </div>
          </span>
        </button>
      </div>
    </div>
  )
}
