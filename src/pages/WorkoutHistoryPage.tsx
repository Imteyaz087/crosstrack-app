import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Search, Filter, Dumbbell, Trophy, Clock, Flame, Loader2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import type { WodType } from '../types'

const WOD_TYPES: WodType[] = ['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Strength', 'StrengthMetcon', 'HYROX', 'Running', 'Cardio', 'Other']

export function WorkoutHistoryPage() {
  const { t } = useTranslation()
  const { workouts, loadWorkouts } = useStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<WodType | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  useEffect(() => { loadWorkouts().finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    let result = [...workouts]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.workoutType.toLowerCase().includes(q) ||
        w.movements?.some(m => m.toLowerCase().includes(q)) ||
        w.notes?.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'all') {
      result = result.filter(w => w.workoutType === typeFilter)
    }
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else result.sort((a, b) => b.date.localeCompare(a.date))
    return result
  }, [workouts, search, typeFilter, sortBy])

  // Stats
  const totalWorkouts = workouts.length
  const totalPRs = workouts.filter(w => w.prFlag).length
  const totalBenchmarks = workouts.filter(w => w.isBenchmark).length
  const uniqueTypes = new Set(workouts.map(w => w.workoutType)).size

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    filtered.forEach(w => {
      const key = w.date.slice(0, 7) // YYYY-MM
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(w)
    })
    return Array.from(map.entries())
  }, [filtered])

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(m) - 1]} ${y}`
  }

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h2 className="text-[1.75rem] font-bold text-ct-1 leading-tight">{t('history.title')}</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <h2 className="text-[1.75rem] font-bold text-ct-1 leading-tight">{t('history.title')}</h2>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Dumbbell, value: totalWorkouts, label: t('history.total'), color: 'text-cyan-400' },
          { icon: Trophy, value: totalPRs, label: t('history.prs'), color: 'text-red-400' },
          { icon: Flame, value: totalBenchmarks, label: t('history.benchmarks'), color: 'text-orange-400' },
          { icon: Clock, value: uniqueTypes, label: t('history.types'), color: 'text-purple-400' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-ct-surface rounded-ct-lg p-2.5 text-center border border-ct-border min-h-[64px]">
            <Icon size={14} className={`mx-auto mb-0.5 ${color}`} />
            <p className="text-lg font-bold text-ct-1 tabular-nums">{value}</p>
            <p className="text-[11px] text-ct-2">{label}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ct-2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('history.searchPlaceholder')}
          className="w-full bg-ct-surface border border-ct-border rounded-xl py-2.5 pl-10 pr-10 text-sm text-ct-1 placeholder-ct-2 focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[44px]"
        />
        <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle filters">
          <Filter size={16} className={showFilters ? 'text-cyan-400' : 'text-ct-2'} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border space-y-2">
          <div>
            <p className="text-[11px] text-ct-2 mb-1">{t('history.workoutType')}</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold min-h-[32px] ${typeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'}`}>
                All
              </button>
              {WOD_TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold min-h-[32px] ${typeFilter === t ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-ct-2 mb-1">Sort By</p>
            <div className="flex gap-1.5">
              {(['date', 'name'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold capitalize min-h-[32px] ${sortBy === s ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-[11px] text-ct-2 tabular-nums">{filtered.length} workout{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Grouped workout list */}
      {grouped.length === 0 ? (
        <EmptyState icon={Dumbbell} title={t('training.noWorkoutsLogged')} />
      ) : (
        grouped.map(([month, wods]) => (
          <div key={month}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-bold mb-2">{formatMonth(month)} ({wods.length})</p>
            <div className="space-y-2">
              {wods.map(w => (
                <div key={w.id} className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ct-1 truncate">{w.name}</p>
                        {w.prFlag && <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">PR</span>}
                        {w.isBenchmark && <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full shrink-0">BM</span>}
                      </div>
                      <p className="text-[11px] text-ct-2 mt-0.5">{w.date} &middot; {w.workoutType}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {w.scoreDisplay && <p className="text-sm font-bold text-cyan-400 tabular-nums">{w.scoreDisplay}</p>}
                      <span className={`text-[11px] font-bold ${
                        w.rxOrScaled === 'RX' ? 'text-green-400' : w.rxOrScaled === 'Elite' ? 'text-purple-400' : 'text-orange-400'
                      }`}>{w.rxOrScaled}</span>
                    </div>
                  </div>
                  {w.movements && w.movements.length > 0 && (
                    <p className="text-[11px] text-ct-2 mt-1.5 truncate">{w.movements.join(', ')}</p>
                  )}
                  {w.notes && <p className="text-[11px] text-ct-2 mt-1 italic truncate">{w.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
