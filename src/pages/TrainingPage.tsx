import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday as isDateToday } from 'date-fns'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'

const CARD  = 'var(--bg-card)'
const BORDER = 'var(--border)'
const VOLT  = 'var(--volt)'
const GLOW  = 'var(--volt-glow)'
const BSTR  = 'var(--border-str)'
const TXT2  = 'var(--text-secondary)'
const TXT3  = 'var(--text-muted)'
const APP   = 'var(--bg-app)'

export function TrainingPage() {
  const { t } = useTranslation()
  const { todayProgram, workouts, prs, loadTodayProgram, loadWorkouts, loadPRs, setActiveTab } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => { loadTodayProgram(); loadWorkouts(); loadPRs() }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)

  const workoutDates = new Set(workouts.map(w => w.date))
  const dayHeaders   = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">{t('training.title')}</h1>

      {/* ── Calendar ──────────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            <ChevronLeft size={18} style={{ color: TXT2 }} />
          </button>
          <span className="text-sm font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            <ChevronRight size={18} style={{ color: TXT2 }} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {dayHeaders.map((d, i) => (
            <div key={i} style={{ color: TXT3 }} className="text-[10px] font-semibold py-1">{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr    = format(day, 'yyyy-MM-dd')
            const isSunday   = getDay(day) === 0
            const hasWorkout = workoutDates.has(dateStr)
            const isToday    = isDateToday(day)
            return (
              <div
                key={dateStr}
                style={isToday ? { background: VOLT, color: APP } : {}}
                className={`py-1.5 rounded-lg text-xs font-medium ${
                  isToday    ? 'font-bold' :
                  hasWorkout ? 'bg-green-500/20 text-green-400' :
                  isSunday   ? 'opacity-30 text-white' :
                  'text-white'
                }`}
              >
                {day.getDate()}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Today's Program ───────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('training.todayProgram')}</p>
        {todayProgram ? (
          <>
            <p className="text-base font-bold text-white">{todayProgram.dayName} — {todayProgram.focus}</p>
            {todayProgram.strength !== '—' && (
              <p style={{ color: TXT2 }} className="text-xs mt-1">
                <span style={{ color: VOLT }} className="font-semibold">{t('training.strength')}:</span> {todayProgram.strength}
              </p>
            )}
            <p style={{ color: TXT2 }} className="text-xs mt-0.5">
              <span className="text-orange-400 font-semibold">{t('training.metcon')}:</span> {todayProgram.metcon}
            </p>
            {todayProgram.scalingOptions && (
              <p style={{ color: TXT3 }} className="text-[10px] mt-1">
                <span style={{ color: TXT2 }}>{t('training.scaling')}:</span> {todayProgram.scalingOptions}
              </p>
            )}
          </>
        ) : (
          <p style={{ color: TXT3 }} className="text-sm">Rest / Recovery day</p>
        )}
        <button
          onClick={() => setActiveTab('log')}
          style={{ background: GLOW, borderColor: BSTR, color: VOLT }}
          className="mt-3 w-full border font-bold py-2.5 rounded-xl text-sm"
        >
          {t('training.logWorkout')}
        </button>
      </div>

      {/* ── PR Board ──────────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('training.prBoard')}</p>
        {prs.length === 0 ? (
          <p style={{ color: TXT3 }} className="text-sm">No PRs yet — keep training!</p>
        ) : (
          prs.map(pr => (
            <div key={pr.id} style={{ borderColor: BORDER }} className="flex items-center py-2.5 border-b last:border-0">
              <Trophy size={14} className="text-red-400 mr-2" />
              <span className="text-sm text-white flex-1">{pr.name}</span>
              <span style={{ color: VOLT }} className="text-sm font-bold">{pr.scoreDisplay}</span>
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">PR</span>
            </div>
          ))
        )}
      </div>

      {/* ── Recent Workouts ───────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">Recent Workouts</p>
        {workouts.slice(0, 5).map(w => (
          <div key={w.id} style={{ borderColor: BORDER }} className="flex items-center py-2 border-b last:border-0">
            <div className="flex-1">
              <p className="text-sm text-white">{w.name}</p>
              <p style={{ color: TXT3 }} className="text-[10px]">{w.date} | {w.workoutType}</p>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              w.rxOrScaled === 'RX' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
            }`}>{w.rxOrScaled}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
