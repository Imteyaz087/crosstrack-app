import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday as isDateToday } from 'date-fns'
import { Trophy, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { SkeletonCard } from '../components/SkeletonCard'

export function TrainingPage() {
  const { t } = useTranslation()
  const { workouts, prs, movementPRs, loadWorkouts, loadPRs, loadMovementPRs, setActiveTab } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.allSettled([loadWorkouts(), loadPRs(), loadMovementPRs()]).finally(() => setLoading(false)) }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const workoutDates = new Set(workouts.map(w => w.date))
  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-[1.75rem] font-bold text-ct-1">{t('training.title')}</h1>
        <SkeletonCard className="h-[280px]" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <h1 className="text-[1.75rem] font-bold text-ct-1">{t('training.title')}</h1>

      {/* Calendar */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-lg active:bg-ct-elevated/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('training.previousMonth')}
          >
            <ChevronLeft size={20} className="text-ct-2" />
          </button>
          <span className="text-sm font-bold text-ct-1">{format(currentMonth, 'MMMM yyyy')}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-lg active:bg-ct-elevated/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t('training.nextMonth')}
          >
            <ChevronRight size={20} className="text-ct-2" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {dayHeaders.map((d, i) => (
            <div key={i} className="text-[11px] text-ct-2 font-semibold py-1">{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isSunday = getDay(day) === 0
            const hasWorkout = workoutDates.has(dateStr)
            const isToday = isDateToday(day)
            return (
              <button
                key={dateStr}
                aria-label={format(day, 'MMMM d, yyyy')}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-xs transition-colors ${
                  isToday ? 'bg-cyan-500 text-slate-900 font-bold' :
                  hasWorkout ? 'bg-green-500/20 text-green-400 font-medium' :
                  isSunday ? 'bg-ct-elevated/30 text-ct-2' :
                  'text-ct-2'
                }`}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Log Workout Button */}
      <button
        onClick={() => setActiveTab('log')}
        className="w-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 card-press"
      >
        <Dumbbell size={16} /> {t('training.logWorkout')}
      </button>

      {/* Movement PRs  -  gold themed */}
      <div className="bg-gradient-to-br from-yellow-500/5 to-ct-surface/60 rounded-ct-lg p-4 border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={14} className="text-yellow-400" />
          <p className="text-[11px] uppercase tracking-widest text-yellow-400/80 font-semibold">{t('training.movementPRs')}</p>
          <span className="ml-auto text-[11px] text-ct-2">{movementPRs.length} {t('training.total', 'total')}</span>
        </div>
        {movementPRs.length === 0 ? (
          <div className="py-3 text-center">
            <p className="text-sm text-ct-2">{t('training.noPRsYet')}</p>
            <p className="text-[11px] text-ct-2 mt-0.5">{t('training.logMovementPRHint')}</p>
          </div>
        ) : (
          movementPRs.slice(0, 8).map(pr => (
            <div key={pr.id} className="flex items-center py-2.5 border-b border-ct-border/30 last:border-0">
              <Trophy size={14} className="text-yellow-400 mr-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-ct-1">{pr.movementName}</span>
                <span className="text-[11px] text-ct-2 ml-2">{pr.prType}</span>
              </div>
              <span className="text-sm text-cyan-400 font-bold">{pr.value} {pr.unit}</span>
              {pr.previousBest && (
                <span className="ml-2 text-[11px] text-green-400 font-medium">+{Math.round(pr.value - pr.previousBest)}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Workout PR Board */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('training.prBoard')}</p>
        {prs.length === 0 ? (
          <div className="py-3 text-center">
            <p className="text-sm text-ct-2">{t('training.noWorkoutPRs')}</p>
            <p className="text-[11px] text-ct-2 mt-0.5">{t('training.logWorkoutPRHint')}</p>
          </div>
        ) : (
          prs.slice(0, 5).map(pr => (
            <div key={pr.id} className="flex items-center py-2.5 border-b border-ct-border/30 last:border-0">
              <Trophy size={14} className="text-red-400 mr-2 shrink-0" />
              <span className="text-sm text-ct-1 flex-1">{pr.name}</span>
              <span className="text-sm text-cyan-400 font-bold">{pr.scoreDisplay}</span>
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[11px] font-bold">PR</span>
            </div>
          ))
        )}
      </div>

      {/* Recent Workouts */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('training.recentWorkouts')}</p>
        {workouts.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={t('training.noWorkoutsLogged')}
            description={t('training.noWorkoutsDesc')}
            action={{ label: t('training.logFirstWorkout'), onClick: () => setActiveTab('log') }}
          />
        ) : (
          workouts.slice(0, 10).map(w => (
            <div key={w.id} className={`flex items-center py-2.5 border-b border-ct-border/30 last:border-0 ${
              w.prFlag ? 'border-l-2 border-l-yellow-400/60 pl-2' : ''
            }`}>
              {w.prFlag && <Trophy size={14} className="text-yellow-400 mr-1.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ct-1 truncate">{w.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-ct-2">{w.date}</p>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    w.workoutType === 'HYROX' ? 'bg-orange-500/15 text-orange-400' :
                    w.workoutType === 'Running' || w.workoutType === 'Cardio' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-ct-elevated/60 text-ct-2'
                  }`}>{w.workoutType === 'StrengthMetcon' ? 'S+WOD' : w.workoutType}</span>
                </div>
              </div>
              {w.scoreDisplay && <span className="text-[11px] text-cyan-400 font-bold mr-2 shrink-0">{w.scoreDisplay}</span>}
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${
                w.rxOrScaled === 'RX' ? 'bg-green-500/20 text-green-400' :
                w.rxOrScaled === 'Elite' ? 'bg-purple-500/20 text-purple-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>{w.rxOrScaled}</span>
              {w.prFlag && <span className="ml-1 px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-md text-[10px] font-bold shrink-0 flex items-center gap-0.5"><Trophy size={8} />PR</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
