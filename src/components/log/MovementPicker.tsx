import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import movementData from '../../data/movements.json'

interface Movement {
  id: string
  name: string
  category: string
  equipment: string[]
  trackingType: string
  searchTags: string[]
  priority: string
}

const allMovements: Movement[] = movementData.movements as Movement[]

const categoryLabels: Record<string, string> = {
  weightlifting: '🏋️ Weightlifting',
  gymnastics: '🤸 Gymnastics',
  monostructural: '🏃 Mono/Cardio',
  kettlebell: '🔔 Kettlebell',
  dumbbell: '💪 Dumbbell',
  bodyweight: '🧘 Bodyweight',
  'odd-objects': '🪨 Odd Objects',
}

interface MovementPickerProps {
  movementSearch: string
  onMovementSearchChange: (value: string) => void
  onSelectMovement: (name: string) => void
}

export function MovementPicker({
  movementSearch,
  onMovementSearchChange,
  onSelectMovement,
}: MovementPickerProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(allMovements.map(m => m.category))
    return Array.from(cats)
  }, [])

  const filteredMovements = useMemo(() => {
    let result = [...allMovements]

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter)
    }

    // Search filter
    if (movementSearch.trim()) {
      const q = movementSearch.toLowerCase()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.searchTags.some(tag => tag.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q)
      )
    }

    // Sort: high priority first, then alphabetical
    result.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (a.priority !== 'high' && b.priority === 'high') return 1
      return a.name.localeCompare(b.name)
    })

    // Limit display
    return movementSearch ? result.slice(0, 30) : result.slice(0, 25)
  }, [movementSearch, categoryFilter])

  return (
    <div className="bg-ct-elevated/50 rounded-xl border border-slate-600/50 overflow-hidden">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-2.5 text-ct-2" />
        <input
          type="text"
          value={movementSearch}
          onChange={e => onMovementSearchChange(e.target.value)}
          placeholder="Search 180+ movements..."
          aria-label="Search movements"
          className="w-full bg-transparent py-2.5 pl-9 pr-3 text-ct-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400/30 border-b border-slate-600/50"
          autoFocus
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-slate-600/30">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2 py-1 rounded text-[11px] font-bold shrink-0 ${
            categoryFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
          }`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-1 rounded text-[11px] font-bold shrink-0 whitespace-nowrap ${
              categoryFilter === cat ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
            }`}
          >{categoryLabels[cat] || cat}</button>
        ))}
      </div>

      {/* Movement list */}
      <div className="max-h-[24rem] overflow-y-auto">
        {filteredMovements.map(m => (
          <button
            key={m.id}
            onClick={() => onSelectMovement(m.name)}
            className="w-full text-left px-4 py-2.5 text-xs border-b border-slate-700/30 last:border-0 active:bg-slate-600/50 transition-colors flex items-center gap-2"
          >
            <span className="text-ct-1 font-medium">{m.name}</span>
            {m.priority === 'high' && (
              <span className="text-[9px] text-cyan-400/60">★</span>
            )}
          </button>
        ))}
        {filteredMovements.length === 0 && movementSearch && (
          <button
            onClick={() => onSelectMovement(movementSearch)}
            className="w-full text-left px-4 py-2 text-xs text-cyan-400 font-medium active:bg-slate-600/50 transition-colors"
          >+ Add "{movementSearch}"</button>
        )}
      </div>
    </div>
  )
}
