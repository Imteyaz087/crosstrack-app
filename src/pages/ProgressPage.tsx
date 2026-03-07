import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts'
import { Trophy, TrendingUp, Flame, Target, ChevronDown, Dumbbell, Footprints, Calendar, Loader2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

type ProgressTab = 'overview' | 'strength' | 'cardio' | 'body'

const CHART_TOOLTIP = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }
const AXIS_TICK = { fontSize: 10, fill: '#94a3b8' }

export function ProgressPage() {
  const { t } = useTranslation()
  const { allDailyLogs, workouts, movementPRs, loadAllDailyLogs, loadWorkouts, loadPRs, loadMovementPRs } = useStore()
  const [tab, setTab] = useState<ProgressTab>('overview')
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365'>('90')
  const [loading, setLoading] = useState(true)

  // === Strength Data - compute early so we can use in lazy state init ===
  const strengthMovements = useMemo(() => {
    const moveSet = new Set<string>()
    workouts.forEach(w => { if (w.loads?.strength_movement) moveSet.add(w.loads.strength_movement) })
    movementPRs.forEach(pr => moveSet.add(pr.movementName))
    return Array.from(moveSet).sort()
  }, [workouts, movementPRs])

  // Initialize selectedLift with first movement from strengthMovements (lazy init pattern)
  const [selectedLift, setSelectedLift] = useState<string>(() => strengthMovements[0] || '')

  useEffect(() => { Promise.allSettled([loadAllDailyLogs(), loadWorkouts(), loadPRs(), loadMovementPRs()]).finally(() => setLoading(false)) }, [])

  // === Date filtering ===
  const cutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - parseInt(timeRange))
    return d.toISOString().split('T')[0]
  }, [timeRange])

  const filteredWorkouts = useMemo(() => workouts.filter(w => w.date >= cutoff), [workouts, cutoff])
  const filteredLogs = useMemo(() => allDailyLogs.filter(l => l.date >= cutoff), [allDailyLogs, cutoff])

  // === Stats ===
  const totalSessions = filteredWorkouts.length
  const totalPRs = filteredWorkouts.filter(w => w.prFlag).length
  const daysLogged = filteredLogs.length

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


  const strengthChartData = useMemo(() => {
    if (!selectedLift) return []
    const data: { date: string; weight: number }[] = []
    workouts.filter(w => w.date >= cutoff).forEach(w => {
      if (w.loads?.strength_movement === selectedLift) {
        const val = parseFloat(w.loads.strength_end || w.loads.strength_start || '0')
        if (val > 0) data.push({ date: w.date, weight: val })
      }
    })
    return data.sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, date: d.date.slice(5) }))
  }, [selectedLift, workouts, cutoff])

  const liftPRs = useMemo(() => {
    return movementPRs.filter(pr => pr.movementName === selectedLift).sort((a, b) => a.date.localeCompare(b.date))
  }, [selectedLift, movementPRs])

  // === Cardio Data ===
  const cardioWorkouts = useMemo(() => {
    return filteredWorkouts
      .filter(w => w.workoutType === 'Running' || w.workoutType === 'Cardio' || w.workoutType === 'HYROX')
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredWorkouts])

  // === Body Data ===
  const weightData = useMemo(() => {
    return filteredLogs.filter(l => l.weightKg).map(l => ({ date: l.date.slice(5), weight: l.weightKg }))
  }, [filteredLogs])

  // === Weekly volume chart ===
  const weeklyVolume = useMemo(() => {
    const weeks: Record<string, number> = {}
    filteredWorkouts.forEach(w => {
      const d = new Date(w.date)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0].slice(5)
      weeks[key] = (weeks[key] || 0) + 1
    })
    return Object.entries(weeks).map(([week, count]) => ({ week, count })).slice(-12)
  }, [filteredWorkouts])

  // === Sub-tab config ===
  const tabs: { id: ProgressTab; label: string; icon: typeof TrendingUp }[] = [
    { id: 'overview', label: t('progress.overview'), icon: Target },
    { id: 'strength', label: t('progress.strength'), icon: Dumbbell },
    { id: 'cardio', label: t('progress.cardio'), icon: Footprints },
    { id: 'body', label: t('progress.body'), icon: TrendingUp },
  ]

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-[1.75rem] font-bold text-ct-1">{t('progress.title')}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <div className="flex justify-between items-center">
        <h1 className="text-[1.75rem] font-bold text-ct-1">{t('progress.title')}</h1>
        {/* Time Range */}
        <div className="flex gap-1 bg-ct-surface rounded-lg p-0.5">
          {([['30', '30d'], ['90', '90d'], ['365', '1y']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTimeRange(val as typeof timeRange)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                timeRange === val ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2 active:text-ct-2'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-ct-surface rounded-ct-lg p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              tab === id ? 'bg-ct-elevated text-ct-1 shadow-sm' : 'text-ct-2 active:text-ct-2'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === 'overview' && (
        <>
          {/* Stats row  -  improved contrast */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Flame, value: streak, label: t('today.streak'), color: 'text-orange-400' },
              { icon: TrendingUp, value: totalSessions, label: t('progress.sessions'), color: 'text-cyan-400' },
              { icon: Trophy, value: totalPRs, label: t('progress.prs'), color: 'text-red-400' },
              { icon: Calendar, value: daysLogged, label: t('progress.logged'), color: 'text-green-400' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="bg-ct-surface rounded-ct-lg p-3 text-center border border-ct-border">
                <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                <p className="text-xl font-bold text-ct-1 stat-value">{value}</p>
                <p className="text-[11px] text-ct-2">{label}</p>
              </div>
            ))}
          </div>

          {/* Weekly Volume */}
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">{t('progress.weeklyVolume')}</p>
            {weeklyVolume.length > 1 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weeklyVolume}>
                  <XAxis dataKey="week" tick={AXIS_TICK} />
                  <YAxis tick={AXIS_TICK} width={20} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title={t('progress.noVolumeData')} description={t('progress.logVolumeDesc')} />
            )}
          </div>

          {/* Streak heatmap */}
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('progress.last14Days')}</p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 14 }).map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (13 - i))
                const dateStr = d.toISOString().split('T')[0]
                const hasWorkout = workouts.some(w => w.date === dateStr)
                const hasLog = allDailyLogs.some(l => l.date === dateStr)
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className={`w-6 h-6 rounded-md transition-colors ${
                      hasWorkout ? 'bg-green-500' : hasLog ? 'bg-green-500/30' : 'bg-ct-elevated/60'
                    }`} title={`${dateStr}${hasWorkout ? '  -  workout' : hasLog ? '  -  logged' : ''}`} />
                    <span className="text-[11px] text-ct-2">{d.getDate()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ===== STRENGTH TAB ===== */}
      {tab === 'strength' && (
        <>
          {strengthMovements.length > 0 ? (
            <>
              <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('progress.selectMovement')}</p>
                <div className="relative">
                  <select value={selectedLift} onChange={e => setSelectedLift(e.target.value)}
                    className="w-full bg-ct-elevated text-ct-1 rounded-xl py-3 px-4 text-sm font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-shadow"
                    aria-label="Select a movement to view progress">
                    {strengthMovements.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ct-2 pointer-events-none" />
                </div>
              </div>

              {/* Strength chart */}
              <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
                  {selectedLift}  -  Weight Over Time
                </p>
                {strengthChartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={strengthChartData}>
                      <XAxis dataKey="date" tick={AXIS_TICK} />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={AXIS_TICK} width={35} />
                      <Tooltip contentStyle={CHART_TOOLTIP} />
                      <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-ct-2">
                      {strengthChartData.length === 1 ? 'Log one more session to see the trend' : `No ${selectedLift} data in this period`}
                    </p>
                    <p className="text-xs text-ct-2 mt-1">Switch to a longer time range or log more sessions</p>
                  </div>
                )}
              </div>

              {/* Movement PR history */}
              {liftPRs.length > 0 && (
                <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
                  <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{selectedLift}  -  PR History</p>
                  {liftPRs.map(pr => (
                    <div key={pr.id} className="flex items-center py-2.5 border-b border-ct-border/30 last:border-0">
                      <Trophy size={14} className="text-yellow-400 mr-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-ct-1">{pr.prType}</span>
                        <span className="text-[11px] text-ct-2 ml-2">{pr.date}</span>
                      </div>
                      <span className="text-sm text-orange-400 font-bold">{pr.value} {pr.unit}</span>
                      {pr.previousBest && (
                        <span className="ml-2 text-[11px] text-green-400 font-medium">+{Math.round(pr.value - pr.previousBest)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title={t('progress.noStrengthData')}
              description={t('progress.noStrengthDesc')}
            />
          )}
        </>
      )}

      {/* ===== CARDIO TAB ===== */}
      {tab === 'cardio' && (
        <>
          {cardioWorkouts.length > 0 ? (
            <div className="space-y-2">
              {cardioWorkouts.map(w => (
                <div key={w.id} className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-ct-1">{w.name}</p>
                      <p className="text-[11px] text-ct-2 mt-0.5">{w.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{w.scoreDisplay}</p>
                      {w.paceDisplay && <p className="text-[11px] text-ct-2">{w.paceDisplay}</p>}
                    </div>
                  </div>
                  {w.prFlag && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[11px] font-bold">PR</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Footprints}
              title={t('progress.noCardioData')}
              description={t('progress.noCardioDesc')}
            />
          )}
        </>
      )}

      {/* ===== BODY TAB ===== */}
      {tab === 'body' && (
        <>
          {/* Weight Chart */}
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">{t('progress.weightTrend')}</p>
            {weightData.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={AXIS_TICK} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={AXIS_TICK} width={30} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Line type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-ct-2">{t('progress.logMoreWeight')}</p>
                <p className="text-xs text-ct-2 mt-1">{t('progress.weightTrendDesc')}</p>
              </div>
            )}
          </div>

          {/* Latest stats */}
          {filteredLogs.length > 0 && (() => {
            const latest = filteredLogs[filteredLogs.length - 1]
            const metrics = [
              latest.weightKg ? { value: `${latest.weightKg} kg`, label: 'Weight' } : null,
              latest.sleepHours ? { value: `${latest.sleepHours} hrs`, label: 'Sleep' } : null,
              latest.waterMl ? { value: `${(latest.waterMl / 1000).toFixed(1)} L`, label: 'Water' } : null,
              latest.restingHR ? { value: `${latest.restingHR} bpm`, label: 'Resting HR' } : null,
            ].filter(Boolean)
            if (metrics.length === 0) return null
            return (
              <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">{t('progress.latestMeasurements')}</p>
                <div className={`grid gap-3 ${metrics.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {metrics.map((m, i) => m && (
                    <div key={i} className="text-center bg-ct-elevated/30 rounded-xl p-3">
                      <p className="text-lg font-bold text-ct-1">{m.value}</p>
                      <p className="text-[11px] text-ct-2 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Benchmark WODs */}
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('progress.benchmarks')}</p>
            {workouts.filter(w => w.isBenchmark).length === 0 ? (
              <p className="text-sm text-ct-2 py-2">{t('progress.noBenchmarks')}</p>
            ) : (
              workouts.filter(w => w.isBenchmark).slice(0, 8).map(w => (
                <div key={w.id} className="flex items-center py-2.5 border-b border-ct-border/30 last:border-0">
                  <span className="text-sm text-ct-1 flex-1">{w.name}</span>
                  <span className="text-xs text-cyan-400 font-bold">{w.scoreDisplay}</span>
                  {w.prFlag && <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[11px] font-bold">PR</span>}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
