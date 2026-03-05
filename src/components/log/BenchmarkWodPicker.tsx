import { useState, useMemo } from 'react'
import { Search, Star, Shield, Trophy, Zap, X } from 'lucide-react'
import benchmarkData from '../../data/benchmarkWods.json'

export interface BenchmarkWod {
  id: string
  name: string
  type: string
  description: string
  movements: string[]
  rxWeights: { male: string; female: string }
  scaledWeights: { male: string; female: string }
  scheme: string
  scoreType: string
  timeCapMinutes: number | null
  eliteBenchmark: { male: string; female: string }
  goodBenchmark: { male: string; female: string }
  averageBenchmark: { male: string; female: string }
}

const wods: BenchmarkWod[] = benchmarkData.wods as BenchmarkWod[]

const typeConfig: Record<string, { label: string; icon: typeof Star; color: string }> = {
  girl: { label: 'Girls', icon: Star, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  hero: { label: 'Heroes', icon: Shield, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  open: { label: 'Open', icon: Trophy, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  games: { label: 'Games', icon: Zap, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  classic: { label: 'Classic', icon: Star, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
}

interface BenchmarkWodPickerProps {
  searchValue: string
  onSelect: (wod: BenchmarkWod) => void
  onClose: () => void
}

export function BenchmarkWodPicker({ searchValue, onSelect, onClose }: BenchmarkWodPickerProps) {
  const [filter, setFilter] = useState<string>('all')
  const [localSearch, setLocalSearch] = useState(searchValue)

  const filtered = useMemo(() => {
    let result = wods
    if (filter !== 'all') result = result.filter(w => w.type === filter)
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase()
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.movements.some(m => m.toLowerCase().includes(q))
      )
    }
    return result
  }, [filter, localSearch])

  return (
    <div className="bg-slate-800/95 rounded-ct-lg border border-cyan-400/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-ct-border">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Benchmark WODs</p>
        <button onClick={onClose} className="p-1 text-ct-2 active:text-ct-1" aria-label="Close"><X size={16} /></button>
      </div>

      {/* Search */}
      <div className="relative px-3 pt-2">
        <Search size={14} className="absolute left-6 top-5 text-ct-2" />
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          placeholder="Search Fran, Murph, 20.1..."
          className="w-full bg-ct-elevated rounded-xl py-2.5 pl-9 pr-3 text-ct-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
          autoFocus
        />
      </div>

      {/* Type filters */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto">
        <button onClick={() => setFilter('all')} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
          filter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-ct-elevated text-ct-2'
        }`}
        >All ({wods.length})</button>
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const count = wods.filter(w => w.type === key).length
          if (count === 0) return null
          return (
            <button key={key} onClick={() => setFilter(key)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
              filter === key ? `${cfg.color} border` : 'bg-ct-elevated text-ct-2'
            }`}
            >{cfg.label} ({count})</button>
          )
        })}
      </div>

      {/* WOD list */}
      <div className="max-h-64 overflow-y-auto px-1">
        {filtered.length === 0 && (
          <p className="text-xs text-ct-2 text-center py-6">No matching WODs found</p>
        )}
        {filtered.map(wod => {
          const cfg = typeConfig[wod.type] || typeConfig.classic
          const TypeIcon = cfg.icon
          return (
            <button
              key={wod.id}
              onClick={() => onSelect(wod)}
              className="w-full text-left px-3 py-2.5 border-b border-slate-700/30 last:border-0 active:bg-ct-elevated/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                  <TypeIcon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-ct-1">{wod.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-ct-2 mt-0.5 line-clamp-1">{wod.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-ct-2">
                      RX: {wod.rxWeights.male}
                    </span>
                    <span className="text-[11px] text-ct-2">
                      {wod.scoreType === 'time' ? '⏱️ For Time' : wod.scoreType === 'rounds+reps' ? '🔄 AMRAP' : `📊 ${wod.scoreType}`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Quick inline suggestions when typing in WOD name field */
export function BenchmarkSuggestions({ query, onSelect }: { query: string; onSelect: (wod: BenchmarkWod) => void }) {
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return wods.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.movements.some(m => m.toLowerCase().includes(q))
    ).slice(0, 5)
  }, [query])

  if (suggestions.length === 0) return null

  return (
    <div className="bg-ct-elevated/80 rounded-xl border border-cyan-400/20 overflow-hidden mt-1">
      {suggestions.map(wod => {
        const cfg = typeConfig[wod.type] || typeConfig.classic
        return (
          <button
            key={wod.id}
            onClick={() => onSelect(wod)}
            className="w-full text-left px-3 py-2 border-b border-slate-700/30 last:border-0 active:bg-slate-600/50 flex items-center gap-2"
          >
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>
              {cfg.label.slice(0, 1)}
            </span>
            <span className="text-xs text-ct-1 font-medium">{wod.name}</span>
            <span className="text-[11px] text-ct-2 truncate flex-1">{wod.scheme}</span>
          </button>
        )
      })}
    </div>
  )
}