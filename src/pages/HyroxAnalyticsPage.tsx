import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Trophy, TrendingUp, TrendingDown, Zap, Target, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../stores/useStore'
import type { Workout } from '../types'

/* ── Helpers ────────────────────────────── */

const STATION_NAMES = [
  'SkiErg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jump',
  'Rowing', 'Farmers Carry', 'Sandbag Lunges', 'Wall Balls'
] as const

const RUN_LABELS = ['Run 1', 'Run 2', 'Run 3', 'Run 4', 'Run 5', 'Run 6', 'Run 7', 'Run 8'] as const

// Station indices in the 16-segment array (0-indexed)
const STATION_IDX = [1, 3, 5, 7, 9, 11, 13, 15] // even = runs, odd = stations
const RUN_IDX = [0, 2, 4, 6, 8, 10, 12, 14]

const CHART_TOOLTIP = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }
const AXIS_TICK = { fontSize: 10, fill: '#94a3b8' }

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function fmtTimeShort(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s > 0 ? `${m}m${s}s` : `${m}m`
}

function parseStationData(workout: Workout) {
  if (!workout.hyroxStations || workout.hyroxStations.length < 16) return null
  const stations = workout.hyroxStations
  const stationTimes = STATION_IDX.map(i => stations[i]?.timeSeconds ?? 0)
  const runTimes = RUN_IDX.map(i => stations[i]?.timeSeconds ?? 0)
  // Only valid if at least some times are recorded
  if (stationTimes.every(t => t === 0) && runTimes.every(t => t === 0)) return null
  return { stationTimes, runTimes }
}

/* ── Radar / Weakness Chart ─────────────── */

function StationRadarChart({ workouts }: { workouts: Workout[] }) {
  const { t } = useTranslation()

  const data = useMemo(() => {
    // Collect all station times across all workouts
    const stationSums = new Array(8).fill(0)
    const stationCounts = new Array(8).fill(0)

    workouts.forEach(w => {
      const parsed = parseStationData(w)
      if (!parsed) return
      parsed.stationTimes.forEach((time, i) => {
        if (time > 0) {
          stationSums[i] += time
          stationCounts[i]++
        }
      })
    })

    // Convert to "performance score" (inverse of time, normalized 0-100)
    const avgTimes = stationSums.map((sum, i) => stationCounts[i] > 0 ? sum / stationCounts[i] : 0)
    const maxAvg = Math.max(...avgTimes.filter(t => t > 0))

    return STATION_NAMES.map((name, i) => ({
      station: name,
      score: avgTimes[i] > 0 ? Math.round((1 - (avgTimes[i] / (maxAvg * 1.2))) * 100) : 0,
      avgTime: avgTimes[i],
      count: stationCounts[i],
    }))
  }, [workouts])

  const hasData = data.some(d => d.score > 0)
  const weakest = useMemo(() => {
    const withData = data.filter(d => d.score > 0)
    if (withData.length === 0) return null
    return withData.reduce((min, d) => d.score < min.score ? d : min, withData[0])
  }, [data])
  const strongest = useMemo(() => {
    const withData = data.filter(d => d.score > 0)
    if (withData.length === 0) return null
    return withData.reduce((max, d) => d.score > max.score ? d : max, withData[0])
  }, [data])

  if (!hasData) {
    return (
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
          {t('hyroxAnalytics.stationRadar')}
        </p>
        <div className="text-center py-8">
          <Target size={32} className="mx-auto mb-2 text-ct-2 opacity-40" />
          <p className="text-sm text-ct-2">{t('hyroxAnalytics.noStationData')}</p>
          <p className="text-xs text-ct-2 mt-1">{t('hyroxAnalytics.logSplitsHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
      <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
        {t('hyroxAnalytics.stationRadar')}
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="station" tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Performance"
            dataKey="score"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP}
            formatter={(_value: any, _name: any, props: any) => {
              const item = props.payload
              return [`${fmtTime(item.avgTime)} avg (${item.count} ${item.count === 1 ? 'race' : 'races'})`, item.station]
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Weakness / Strength callouts */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {strongest && (
          <div className="bg-emerald-500/10 rounded-lg p-2.5 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={12} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                {t('hyroxAnalytics.strongest')}
              </span>
            </div>
            <p className="text-sm font-bold text-ct-1">{strongest.station}</p>
            <p className="text-xs text-ct-2">{fmtTime(strongest.avgTime)} avg</p>
          </div>
        )}
        {weakest && (
          <div className="bg-orange-500/10 rounded-lg p-2.5 border border-orange-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} className="text-orange-400" />
              <span className="text-[10px] uppercase tracking-wider text-orange-400 font-semibold">
                {t('hyroxAnalytics.weakest')}
              </span>
            </div>
            <p className="text-sm font-bold text-ct-1">{weakest.station}</p>
            <p className="text-xs text-ct-2">{fmtTime(weakest.avgTime)} avg</p>
          </div>
        )}
      </div>

      {/* Avg time per station bar chart */}
      <p className="text-[10px] uppercase tracking-widest text-ct-2 font-semibold mt-4 mb-2">
        {t('hyroxAnalytics.avgStationTimes')}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data.filter(d => d.avgTime > 0)}>
          <XAxis dataKey="station" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={0} angle={-25} textAnchor="end" height={40} />
          <YAxis tick={AXIS_TICK} width={35} tickFormatter={(v: number) => fmtTimeShort(v)} />
          <Tooltip
            contentStyle={CHART_TOOLTIP}
            formatter={(value: any) => [fmtTime(value as number), 'Avg Time']}
          />
          <Bar dataKey="avgTime" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Run Pace Degradation ───────────────── */

function RunPaceDegradation({ workouts }: { workouts: Workout[] }) {
  const { t } = useTranslation()

  const data = useMemo(() => {
    // Average run times across all races for each run position
    const runSums = new Array(8).fill(0)
    const runCounts = new Array(8).fill(0)

    workouts.forEach(w => {
      const parsed = parseStationData(w)
      if (!parsed) return
      parsed.runTimes.forEach((time, i) => {
        if (time > 0) {
          runSums[i] += time
          runCounts[i]++
        }
      })
    })

    return RUN_LABELS.map((label, i) => ({
      run: label,
      avgTime: runCounts[i] > 0 ? Math.round(runSums[i] / runCounts[i]) : 0,
      count: runCounts[i],
    }))
  }, [workouts])

  const hasData = data.some(d => d.avgTime > 0)
  const degradation = useMemo(() => {
    const withData = data.filter(d => d.avgTime > 0)
    if (withData.length < 2) return null
    const first = withData[0].avgTime
    const last = withData[withData.length - 1].avgTime
    const pct = ((last - first) / first) * 100
    return { pct: Math.round(pct), first, last, improving: pct < 0 }
  }, [data])

  if (!hasData) {
    return (
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
          {t('hyroxAnalytics.runPace')}
        </p>
        <div className="text-center py-8">
          <TrendingUp size={32} className="mx-auto mb-2 text-ct-2 opacity-40" />
          <p className="text-sm text-ct-2">{t('hyroxAnalytics.noRunData')}</p>
          <p className="text-xs text-ct-2 mt-1">{t('hyroxAnalytics.logSplitsHint')}</p>
        </div>
      </div>
    )
  }

  const avgOfAll = data.filter(d => d.avgTime > 0).reduce((s, d) => s + d.avgTime, 0) / data.filter(d => d.avgTime > 0).length

  return (
    <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
      <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-1">
        {t('hyroxAnalytics.runPace')}
      </p>
      <p className="text-xs text-ct-2 mb-3">{t('hyroxAnalytics.runPaceDesc')}</p>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data.filter(d => d.avgTime > 0)}>
          <XAxis dataKey="run" tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <YAxis
            tick={AXIS_TICK}
            width={40}
            tickFormatter={(v: number) => fmtTimeShort(v)}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP}
            formatter={(value: any) => [fmtTime(value as number), 'Avg Pace']}
          />
          <ReferenceLine y={avgOfAll} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'avg', position: 'right', fontSize: 10, fill: '#22d3ee' }} />
          <Bar
            dataKey="avgTime"
            radius={[4, 4, 0, 0]}
            fill="#22d3ee"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Degradation callout */}
      {degradation && (
        <div className={`mt-3 p-3 rounded-lg border ${degradation.pct > 10 ? 'bg-red-500/10 border-red-500/20' : degradation.pct < -5 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
          <div className="flex items-center gap-2">
            {degradation.pct > 10 ? (
              <TrendingDown size={16} className="text-red-400" />
            ) : degradation.pct < -5 ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingUp size={16} className="text-cyan-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-ct-1">
                {degradation.pct > 0 ? '+' : ''}{degradation.pct}% {t('hyroxAnalytics.paceDrop')}
              </p>
              <p className="text-xs text-ct-2">
                {t('hyroxAnalytics.run1vs8', { run1: fmtTime(degradation.first), run8: fmtTime(degradation.last) })}
              </p>
            </div>
          </div>
          {degradation.pct > 15 && (
            <p className="text-xs text-ct-2 mt-2">
              {t('hyroxAnalytics.paceTip')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Finish Time Predictor ──────────────── */

function FinishTimePredictor({ workouts }: { workouts: Workout[] }) {
  const { t } = useTranslation()
  const [showBreakdown, setShowBreakdown] = useState(false)

  const prediction = useMemo(() => {
    // Sort by date descending
    const sorted = [...workouts]
      .filter(w => w.scoreValue && w.scoreValue > 0)
      .sort((a, b) => b.date.localeCompare(a.date))

    if (sorted.length === 0) return null

    const latest = sorted[0]
    const latestTime = latest.scoreValue!

    // Weighted average: recent races count more
    let weightedSum = 0
    let weightTotal = 0
    sorted.slice(0, 5).forEach((w, i) => {
      const weight = 5 - i // 5, 4, 3, 2, 1
      weightedSum += (w.scoreValue ?? 0) * weight
      weightTotal += weight
    })
    const weightedAvg = weightedSum / weightTotal

    // Trend: improvement per race
    let trend = 0
    if (sorted.length >= 2) {
      const recent3 = sorted.slice(0, Math.min(3, sorted.length))
      const older3 = sorted.slice(Math.min(3, sorted.length), Math.min(6, sorted.length))
      if (older3.length > 0) {
        const recentAvg = recent3.reduce((s, w) => s + (w.scoreValue ?? 0), 0) / recent3.length
        const olderAvg = older3.reduce((s, w) => s + (w.scoreValue ?? 0), 0) / older3.length
        trend = recentAvg - olderAvg // negative = improving
      }
    }

    // Predicted next race: weighted average + trend
    const predicted = Math.max(weightedAvg + trend, latestTime * 0.85) // don't predict unrealistic improvement

    // Station breakdown prediction (from latest race with splits)
    const latestWithSplits = sorted.find(w => {
      const parsed = parseStationData(w)
      return parsed && (parsed.stationTimes.some(t => t > 0) || parsed.runTimes.some(t => t > 0))
    })

    let stationBreakdown: { name: string; predicted: number; latest: number }[] = []
    if (latestWithSplits) {
      const parsed = parseStationData(latestWithSplits)
      if (parsed) {
        const ratio = predicted / latestTime
        stationBreakdown = [
          ...parsed.runTimes.map((t, i) => ({ name: RUN_LABELS[i], predicted: Math.round(t * ratio), latest: t })),
          ...parsed.stationTimes.map((t, i) => ({ name: STATION_NAMES[i], predicted: Math.round(t * ratio), latest: t })),
        ].filter(s => s.latest > 0)
      }
    }

    // PR info
    const prTime = sorted.reduce((best, w) => Math.min(best, w.scoreValue ?? Infinity), Infinity)

    return {
      predicted: Math.round(predicted),
      latest: latestTime,
      pr: prTime,
      trend,
      totalRaces: sorted.length,
      improving: trend < 0,
      stationBreakdown,
      latestDate: latest.date,
      division: latest.rxOrScaled,
    }
  }, [workouts])

  if (!prediction) {
    return (
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
          {t('hyroxAnalytics.predictor')}
        </p>
        <div className="text-center py-8">
          <Clock size={32} className="mx-auto mb-2 text-ct-2 opacity-40" />
          <p className="text-sm text-ct-2">{t('hyroxAnalytics.noPrediction')}</p>
          <p className="text-xs text-ct-2 mt-1">{t('hyroxAnalytics.logRaceHint')}</p>
        </div>
      </div>
    )
  }

  // Performance timeline chart
  const timelineData = workouts
    .filter(w => w.scoreValue && w.scoreValue > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w, i) => ({
      race: `#${i + 1}`,
      time: w.scoreValue,
      date: w.date,
      pr: w.prFlag,
    }))

  return (
    <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
      <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
        {t('hyroxAnalytics.predictor')}
      </p>

      {/* Big prediction number */}
      <div className="text-center mb-4">
        <p className="text-xs text-ct-2 mb-1">{t('hyroxAnalytics.nextRace')}</p>
        <p className="text-4xl font-bold text-orange-400">{fmtTime(prediction.predicted)}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          {prediction.improving ? (
            <TrendingUp size={14} className="text-emerald-400" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )}
          <span className={`text-xs font-medium ${prediction.improving ? 'text-emerald-400' : 'text-red-400'}`}>
            {prediction.improving ? '' : '+'}{fmtTimeShort(Math.abs(prediction.trend))} {t('hyroxAnalytics.perRace')}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-ct-elevated/40 rounded-lg">
          <p className="text-lg font-bold text-ct-1">{fmtTime(prediction.pr)}</p>
          <p className="text-[10px] text-ct-2">{t('hyroxAnalytics.personalBest')}</p>
        </div>
        <div className="text-center p-2 bg-ct-elevated/40 rounded-lg">
          <p className="text-lg font-bold text-ct-1">{fmtTime(prediction.latest)}</p>
          <p className="text-[10px] text-ct-2">{t('hyroxAnalytics.lastRace')}</p>
        </div>
        <div className="text-center p-2 bg-ct-elevated/40 rounded-lg">
          <p className="text-lg font-bold text-ct-1">{prediction.totalRaces}</p>
          <p className="text-[10px] text-ct-2">{t('hyroxAnalytics.totalRaces')}</p>
        </div>
      </div>

      {/* Performance timeline */}
      {timelineData.length > 1 && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-ct-2 font-semibold mb-2">
            {t('hyroxAnalytics.timeline')}
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timelineData}>
              <XAxis dataKey="race" tick={AXIS_TICK} />
              <YAxis
                tick={AXIS_TICK}
                width={40}
                tickFormatter={(v: number) => fmtTimeShort(v)}
                reversed
                domain={['dataMin - 30', 'dataMax + 30']}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP}
                formatter={(value: any) => [fmtTime(value as number), 'Finish Time']}
                labelFormatter={(label: any, payload: any) => (payload as any)?.[0]?.payload?.date ?? label}
              />
              <ReferenceLine y={prediction.predicted} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'predicted', position: 'right', fontSize: 9, fill: '#f97316' }} />
              <Line type="monotone" dataKey="time" stroke="#22d3ee" dot={{ r: 4, fill: '#22d3ee' }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Station breakdown (collapsible) */}
      {prediction.stationBreakdown.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium"
          >
            {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {t('hyroxAnalytics.stationBreakdown')}
          </button>
          {showBreakdown && (
            <div className="mt-2 space-y-1">
              {prediction.stationBreakdown.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-ct-2 w-28 truncate">{s.name}</span>
                  <div className="flex-1 bg-ct-elevated/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-orange-400/60 rounded-full"
                      style={{ width: `${Math.min((s.predicted / (prediction.predicted * 0.15)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-ct-1 font-mono w-12 text-right">{fmtTime(s.predicted)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ──────────────────────────── */

export function HyroxAnalyticsPage() {
  const { t } = useTranslation()
  const { workouts } = useStore()

  const hyroxWorkouts = useMemo(
    () => workouts.filter((w: Workout) => w.workoutType === 'HYROX'),
    [workouts]
  )

  const stats = useMemo(() => {
    const total = hyroxWorkouts.length
    const prs = hyroxWorkouts.filter((w: Workout) => w.prFlag).length
    const best = hyroxWorkouts.reduce((min: number, w: Workout) => {
      const v = w.scoreValue ?? Infinity
      return v < min ? v : min
    }, Infinity)
    const withSplits = hyroxWorkouts.filter((w: Workout) => {
      const parsed = parseStationData(w)
      return parsed !== null
    }).length
    return { total, prs, best: best === Infinity ? 0 : best, withSplits }
  }, [hyroxWorkouts])

  return (
    <div className="space-y-4 stagger-children">
      <div>
        <h1 className="text-[1.75rem] font-bold text-ct-1">{t('hyroxAnalytics.title')}</h1>
        <p className="text-xs text-ct-2 mt-0.5">{t('hyroxAnalytics.subtitle')}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Trophy, value: stats.total, label: t('hyroxAnalytics.races'), color: 'text-orange-400' },
          { icon: Zap, value: stats.prs, label: t('hyroxAnalytics.prs'), color: 'text-yellow-400' },
          { icon: Clock, value: stats.best > 0 ? fmtTime(stats.best) : '—', label: t('hyroxAnalytics.bestTime'), color: 'text-cyan-400' },
          { icon: Target, value: stats.withSplits, label: t('hyroxAnalytics.withSplits'), color: 'text-emerald-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-ct-surface rounded-ct-lg p-3 text-center border border-ct-border">
            <Icon size={16} className={`mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold text-ct-1">{value}</p>
            <p className="text-[10px] text-ct-2">{label}</p>
          </div>
        ))}
      </div>

      {/* Finish Time Predictor */}
      <FinishTimePredictor workouts={hyroxWorkouts} />

      {/* Station Weakness Radar */}
      <StationRadarChart workouts={hyroxWorkouts} />

      {/* Run Pace Degradation */}
      <RunPaceDegradation workouts={hyroxWorkouts} />
    </div>
  )
}
