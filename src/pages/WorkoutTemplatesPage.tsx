import { useEffect, useState } from 'react'
import { useStore } from '../stores/useStore'
import { BENCHMARK_WODS } from '../data/benchmarkWods'
import { useSaveToast } from '../components/SaveToast'
import { Search, Play, Loader2 } from 'lucide-react'
import type { BenchmarkWod } from '../types'

type WodCategory = 'all' | 'girl' | 'hero' | 'open'

export function WorkoutTemplatesPage() {
  const { saveWorkout, loadBenchmarkWods } = useStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<WodCategory>('all')
  const [selectedWod, setSelectedWod] = useState<Omit<BenchmarkWod, 'id'> | null>(null)
  const [score, setScore] = useState('')
  const [rxScaled, setRxScaled] = useState<'RX' | 'Scaled'>('RX')
  const [saving, setSaving] = useState(false)
  const { showToast, toastEl } = useSaveToast()

  useEffect(() => { loadBenchmarkWods() }, [])

  const allWods = BENCHMARK_WODS

  const filtered = allWods.filter(w => {
    if (category !== 'all' && w.category !== category) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleLog = async () => {
    if (!selectedWod) return
    if (!score.trim()) { showToast('Enter a score', 'error'); return }
    if (saving) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const scoreNum = selectedWod.scoreUnit === 'time' ? parseTimeToSeconds(score) : parseFloat(score)
      await saveWorkout({
        date: now.split('T')[0],
        workoutType: selectedWod.wodType,
        name: selectedWod.name,
        description: selectedWod.description,
        scoreValue: scoreNum,
        scoreUnit: selectedWod.scoreUnit,
        scoreDisplay: score,
        rxOrScaled: rxScaled,
        isBenchmark: true,
        prFlag: false,
        notes: `${selectedWod.rxStandard}`,
      })
      showToast(`Logged ${selectedWod.name}!`, 'success')
      setSelectedWod(null)
      setScore('')
    } catch {
      showToast('Failed to save – try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  const categories: { id: WodCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'girl', label: 'Girls' },
    { id: 'hero', label: 'Heroes' },
    { id: 'open', label: 'Open' },
  ]

  const CATEGORY_COLORS = {
    girl: 'bg-pink-500/15 text-pink-400',
    hero: 'bg-red-500/15 text-red-400',
    open: 'bg-blue-500/15 text-blue-400',
    custom: 'bg-slate-500/15 text-ct-2',
  }

  // Log modal
  if (selectedWod) {
    return (
      <div className="space-y-4">
        {toastEl}
        <button onClick={() => setSelectedWod(null)} className="text-cyan-400 text-sm">&larr; Back</button>

        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase mb-1.5 ${CATEGORY_COLORS[selectedWod.category]}`}>{selectedWod.category}</span>
              <h2 className="text-xl font-bold text-ct-1">{selectedWod.name}</h2>
            </div>
            <span className="text-[11px] text-ct-2 bg-ct-elevated/50 px-2 py-0.5 rounded">{selectedWod.wodType}</span>
          </div>
          <p className="text-sm text-ct-2 mb-2">{selectedWod.description}</p>
          <p className="text-[11px] text-cyan-400 mb-1">RX: {selectedWod.rxStandard}</p>
          {selectedWod.scaledStandard && <p className="text-[11px] text-orange-400">Scaled: {selectedWod.scaledStandard}</p>}
        </div>

        {/* RX / Scaled */}
        <div className="flex gap-2">
          {(['RX', 'Scaled'] as const).map(opt => (
            <button key={opt} onClick={() => setRxScaled(opt)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                rxScaled === opt
                  ? opt === 'RX' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-ct-surface text-ct-2 border border-slate-700/30'
              }`}>{opt}</button>
          ))}
        </div>

        {/* Score input */}
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <p className="text-[11px] text-ct-2 uppercase tracking-widest mb-2">
            Your Score ({selectedWod.scoreUnit === 'time' ? 'MM:SS' : selectedWod.scoreUnit})
          </p>
          <input
            type="text" value={score} onChange={e => setScore(e.target.value)}
            placeholder={selectedWod.scoreUnit === 'time' ? '12:30' : '150'}
            className="w-full bg-ct-elevated text-ct-1 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        <button onClick={handleLog} disabled={saving}
          className={`w-full font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 ${
            saving ? 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed' : 'bg-cyan-500 text-slate-900 active:scale-[0.98]'
          }`}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Saving...' : `Log ${selectedWod.name}`}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {toastEl}
      <h1 className="text-xl font-bold text-ct-1">Benchmark WODs</h1>
      <p className="text-xs text-ct-2">{allWods.length} workouts – Girls, Heroes, Open</p>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ct-2" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search WODs..."
          className="w-full bg-ct-surface border border-ct-border text-ct-1 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5">
        {categories.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              category === c.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'
            }`}>{c.label}</button>
        ))}
      </div>

      {/* WOD list */}
      <div className="space-y-2">
        {filtered.map(w => (
          <button key={w.name} onClick={() => setSelectedWod(w)}
            className="w-full bg-ct-surface rounded-ct-lg p-3 border border-ct-border flex items-center gap-3 active:bg-ct-elevated/50 transition-colors text-left"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              w.category === 'girl' ? 'bg-pink-500/10' : w.category === 'hero' ? 'bg-red-500/10' : 'bg-blue-500/10'
            }`}>
              <Play size={14} className={
                w.category === 'girl' ? 'text-pink-400' : w.category === 'hero' ? 'text-red-400' : 'text-blue-400'
              } />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ct-1">{w.name}</p>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${CATEGORY_COLORS[w.category]}`}>{w.category}</span>
              </div>
              <p className="text-[11px] text-ct-2 truncate">{w.description}</p>
            </div>
            <span className="text-[11px] text-ct-2 bg-ct-elevated/50 px-1.5 py-0.5 rounded shrink-0">{w.wodType}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-ct-2">No WODs found</p>
        </div>
      )}
    </div>
  )
}

function parseTimeToSeconds(str: string): number {
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  return parseFloat(str)
}