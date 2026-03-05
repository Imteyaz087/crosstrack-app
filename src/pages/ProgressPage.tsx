import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Trophy, TrendingUp, Flame, Target } from 'lucide-react'

const CARD   = 'var(--bg-card)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const TXT2   = 'var(--text-secondary)'
const TXT3   = 'var(--text-muted)'

export function ProgressPage() {
  const { t } = useTranslation()
  const { allDailyLogs, workouts, prs, loadAllDailyLogs, loadWorkouts, loadPRs } = useStore()

  useEffect(() => { loadAllDailyLogs(); loadWorkouts(); loadPRs() }, [])

  const weightData    = allDailyLogs.filter(l => l.weightKg).map(l => ({ date: l.date.slice(5), weight: l.weightKg }))
  const totalSessions = workouts.length
  const totalPRs      = prs.length
  const daysLogged    = allDailyLogs.length

  // Streak
  let streak = 0
  const sortedDates = [...new Set(allDailyLogs.map(l => l.date))].sort().reverse()
  const today = new Date()
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    if (sortedDates[i] === expected.toISOString().split('T')[0]) streak++
    else break
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">{t('progress.title')}</h1>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Flame,      value: streak,         label: 'Streak',                color: 'text-orange-400' },
          { icon: TrendingUp, value: totalSessions,  label: t('progress.sessions'), color: '' },
          { icon: Trophy,     value: totalPRs,       label: t('progress.prs'),      color: 'text-red-400' },
          { icon: Target,     value: daysLogged,     label: 'Logged',               color: 'text-green-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} style={{ background: CARD, borderColor: BORDER }} className="rounded-xl p-3 text-center border">
            <Icon
              size={16}
              style={!color ? { color: VOLT } : {}}
              className={`mx-auto mb-1 ${color}`}
            />
            <p className="text-xl font-bold text-white">{value}</p>
            <p style={{ color: TXT3 }} className="text-[9px]">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Weight Chart ──────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-3">{t('progress.weightTrend')}</p>
        {weightData.length > 1 ? (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#50505E' }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: '#50505E' }} width={30} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#C8FF00" strokeWidth={2} dot={{ r: 3, fill: '#C8FF00' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: TXT3 }} className="h-32 flex items-center justify-center text-sm">
            Log at least 2 days of weight to see your trend
          </div>
        )}
      </div>

      {/* ── Benchmark WODs ────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('progress.benchmarks')}</p>
        {workouts.filter(w => w.isBenchmark).length === 0 ? (
          <p style={{ color: TXT3 }} className="text-sm">No benchmark WODs logged yet</p>
        ) : (
          workouts.filter(w => w.isBenchmark).slice(0, 8).map(w => (
            <div key={w.id} style={{ borderColor: BORDER }} className="flex items-center py-2 border-b last:border-0">
              <span className="text-sm text-white flex-1">{w.name}</span>
              <span style={{ color: VOLT }} className="text-xs font-bold">{w.scoreDisplay}</span>
              {w.prFlag && <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">PR</span>}
            </div>
          ))
        )}
      </div>

      {/* ── Last 14 Days streak grid ───────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">Last 14 Days</p>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (13 - i))
            const dateStr = d.toISOString().split('T')[0]
            const logged  = allDailyLogs.some(l => l.date === dateStr)
            const isSun   = d.getDay() === 0
            return (
              <div
                key={i}
                style={logged ? { background: VOLT } : { background: isSun ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)' }}
                className="w-6 h-6 rounded-sm"
                title={dateStr}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
