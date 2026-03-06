import { useEffect, useState, useMemo } from 'react'
import { useStore } from '../stores/useStore'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Ruler, TrendingDown, TrendingUp, Minus, Save, Loader2 } from 'lucide-react'
import { useSaveToast } from '../components/SaveToast'

type MeasurementKey = 'weightKg' | 'bodyFatPct' | 'chestCm' | 'waistCm' | 'hipsCm' | 'armCm' | 'thighCm'

const MEASUREMENTS: { key: MeasurementKey; label: string; unit: string; color: string }[] = [
  { key: 'weightKg', label: 'Weight', unit: 'kg', color: '#22d3ee' },
  { key: 'bodyFatPct', label: 'Body Fat', unit: '%', color: '#f97316' },
  { key: 'chestCm', label: 'Chest', unit: 'cm', color: '#a78bfa' },
  { key: 'waistCm', label: 'Waist', unit: 'cm', color: '#fb923c' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm', color: '#f472b6' },
  { key: 'armCm', label: 'Arm', unit: 'cm', color: '#4ade80' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm', color: '#60a5fa' },
]

export function BodyMeasurementsPage() {
  const { allDailyLogs, todayLog, loadAllDailyLogs, loadTodayLog, saveDailyLog } = useStore()
  const { showToast, toastEl } = useSaveToast()
  const [activeMeasurement, setActiveMeasurement] = useState<MeasurementKey>('weightKg')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.allSettled([loadAllDailyLogs(), loadTodayLog()]).finally(() => setLoading(false)) }, [])

  // Pre-fill form with today's values
  useEffect(() => {
    if (todayLog) {
      const vals: Record<string, string> = {}
      MEASUREMENTS.forEach(m => {
        const v = todayLog[m.key]
        if (v !== undefined && v !== null) vals[m.key] = String(v)
      })
      setFormValues(vals)
    }
  }, [todayLog])

  const activeConfig = MEASUREMENTS.find(m => m.key === activeMeasurement)!

  // Chart data for active measurement
  const chartData = useMemo(() => {
    return allDailyLogs
      .filter(l => l[activeMeasurement] !== undefined && l[activeMeasurement] !== null)
      .map(l => ({
        date: l.date.slice(5), // MM-DD
        value: l[activeMeasurement] as number,
      }))
      .slice(-30) // Last 30 data points
  }, [allDailyLogs, activeMeasurement])

  // Trend calculation
  const trend = useMemo(() => {
    if (chartData.length < 2) return null
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const diff = last - first
    const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : '0.0'
    return { diff: diff.toFixed(1), pct, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' as const }
  }, [chartData])

  // Latest values for each measurement
  const latestValues = useMemo(() => {
    const vals: Record<string, number | null> = {}
    MEASUREMENTS.forEach(m => {
      const logs = allDailyLogs.filter(l => l[m.key] !== undefined && l[m.key] !== null)
      vals[m.key] = logs.length > 0 ? (logs[logs.length - 1][m.key] as number) : null
    })
    return vals
  }, [allDailyLogs])

  const handleSave = async () => {
    const updates: Record<string, number | undefined> = {}
    MEASUREMENTS.forEach(m => {
      const val = formValues[m.key]
      if (val && !isNaN(parseFloat(val))) {
        updates[m.key] = parseFloat(val)
      }
    })
    if (Object.keys(updates).length === 0) {
      showToast('Enter at least one measurement', 'error')
      return
    }
    await saveDailyLog(updates)
    await loadAllDailyLogs()
    showToast('Measurements saved!')
  }

  if (loading) {
    return (
      <div className="space-y-3 stagger-children">
        <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
          <Ruler size={20} className="text-cyan-400" /> Body Measurements
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 stagger-children">
      {toastEl}
      <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
        <Ruler size={20} className="text-cyan-400" /> Body Measurements
      </h2>

      {/* Measurement selector — scrollable chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {MEASUREMENTS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMeasurement(m.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
              activeMeasurement === m.key
                ? 'text-ct-1'
                : 'bg-ct-surface text-ct-2 border border-ct-border'
            }`}
            style={activeMeasurement === m.key ? { backgroundColor: activeConfig.color + '33', color: activeConfig.color } : undefined}
          >
            {m.label}
            {latestValues[m.key] !== null && (
              <span className="ml-1 opacity-70">{latestValues[m.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] uppercase tracking-widest text-ct-2">{activeConfig.label} Trend</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${
              trend.direction === 'down' ? 'text-green-400' : trend.direction === 'up' ? 'text-red-400' : 'text-ct-2'
            }`}>
              {trend.direction === 'up' && <TrendingUp size={12} />}
              {trend.direction === 'down' && <TrendingDown size={12} />}
              {trend.direction === 'flat' && <Minus size={12} />}
              {trend.diff} {activeConfig.unit} ({trend.pct}%)
            </div>
          )}
        </div>

        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: '#64748b' }} width={35} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(value: unknown) => [`${value} ${activeConfig.unit}`, activeConfig.label]}
              />
              <Line type="monotone" dataKey="value" stroke={activeConfig.color} strokeWidth={2.5} dot={{ r: 3, fill: activeConfig.color }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-ct-2 text-center py-8">Log at least 2 entries to see your {activeConfig.label.toLowerCase()} trend</p>
        )}
      </div>

      {/* Quick entry form */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">Log Today's Measurements</p>
        <div className="grid grid-cols-2 gap-2">
          {MEASUREMENTS.map(m => (
            <div key={m.key} className="relative">
              <label className="text-[11px] text-ct-2 block mb-0.5">{m.label} ({m.unit})</label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                value={formValues[m.key] || ''}
                onChange={e => setFormValues(prev => ({ ...prev, [m.key]: e.target.value.replace(/[^\d.]/g, '') }))}
                placeholder="—"
                className="w-full bg-ct-elevated/50 border border-ct-border/50 rounded-xl py-2 px-3 text-sm text-ct-1 placeholder-ct-2 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave}
          className="mt-3 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
          <Save size={16} /> Save Measurements
        </button>
      </div>

      {/* History table */}
      {allDailyLogs.filter(l => l.weightKg || l.chestCm || l.waistCm).length > 0 && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">Recent Entries</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-ct-2 border-b border-ct-border">
                  <th className="text-left py-1.5 pr-2">Date</th>
                  <th className="text-right px-1">Wt</th>
                  <th className="text-right px-1">BF%</th>
                  <th className="text-right px-1">Chest</th>
                  <th className="text-right px-1">Waist</th>
                  <th className="text-right px-1">Hips</th>
                  <th className="text-right px-1">Arm</th>
                  <th className="text-right pl-1">Thigh</th>
                </tr>
              </thead>
              <tbody>
                {[...allDailyLogs]
                  .filter(l => MEASUREMENTS.some(m => l[m.key] !== undefined && l[m.key] !== null))
                  .reverse()
                  .slice(0, 10)
                  .map(l => (
                    <tr key={l.id} className="border-b border-ct-border/30 text-ct-2">
                      <td className="py-1.5 pr-2 text-ct-2">{l.date.slice(5)}</td>
                      <td className="text-right px-1">{l.weightKg ?? '—'}</td>
                      <td className="text-right px-1">{l.bodyFatPct ?? '—'}</td>
                      <td className="text-right px-1">{l.chestCm ?? '—'}</td>
                      <td className="text-right px-1">{l.waistCm ?? '—'}</td>
                      <td className="text-right px-1">{l.hipsCm ?? '—'}</td>
                      <td className="text-right px-1">{l.armCm ?? '—'}</td>
                      <td className="text-right pl-1">{l.thighCm ?? '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
