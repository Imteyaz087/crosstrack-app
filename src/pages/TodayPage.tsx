import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { MacroBar } from '../components/MacroBar'
import { getCurrentWeek } from '../utils/macros'
import { Moon, Droplets, Zap, TrendingUp } from 'lucide-react'

export function TodayPage() {
  const { t } = useTranslation()
  const {
    settings, todayLog, todayWorkout, todayProgram,
    todayMeals, todayMacros,
    loadSettings, loadTodayLog, loadTodayWorkout, loadTodayProgram, loadTodayMeals,
    setActiveTab,
  } = useStore()

  useEffect(() => {
    loadSettings()
    loadTodayLog()
    loadTodayWorkout()
    loadTodayProgram()
    loadTodayMeals()
  }, [])

  const { weekNumber, phase } = getCurrentWeek()
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const name = settings?.displayName || 'Athlete'
  const mealsCount = new Set(todayMeals.map(m => m.mealType)).size

  const phaseColors: Record<string, string> = {
    Base:      '#4ade80',
    Load:      '#fb923c',
    Intensity: '#f87171',
    Deload:    '#60a5fa',
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="pt-1">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t('today.greeting')}, {name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {dayName}
        </h1>
        <p className="text-xs font-bold mt-1" style={{ color: phaseColors[phase] || 'var(--text-secondary)' }}>
          Week {weekNumber} — {t(`phases.${phase}`)}
        </p>
      </div>

      {/* Today's Training */}
      <div
        className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={() => setActiveTab('train')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.todayTraining')}
        </p>
        {todayProgram ? (
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
          <p className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>
            {t('today.noWorkoutToday')} 🧘
          </p>
        )}
      </div>

      {/* Macros */}
      <div
        className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={() => setActiveTab('eat')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.macrosToday')}
        </p>
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
      </div>

      {/* Quick Metrics */}
      <div
        className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={() => setActiveTab('log')}
      >
        <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {t('today.quickMetrics')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: TrendingUp, color: '#C8FF00', value: todayLog?.weightKg,                       label: t('today.weight')      },
            { icon: Moon,       color: '#818cf8', value: todayLog?.sleepHours,                      label: t('today.sleep')       },
            { icon: Droplets,   color: '#60a5fa', value: todayLog?.waterMl ? (todayLog.waterMl / 1000).toFixed(1) : null, label: `${t('today.water')} L` },
            { icon: Zap,        color: '#fb923c', value: todayLog?.energy,                          label: t('today.energy')      },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="text-center">
              <div
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'var(--bg-raised)' }}
              >
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {value || '—'}
              </p>
              <p className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
