import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { today } from '../utils/macros'
import type { MovementPR } from '../types'
import { Plus, Trophy, X, Loader2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

const CATEGORIES = ['barbell', 'dumbbell', 'gymnastics', 'monostructural', 'other'] as const
const PR_TYPES = ['1rm', '3rm', '5rm', 'max_reps', 'max_unbroken', 'fastest'] as const
const UNITS = ['kg', 'lb', 'reps', 'seconds'] as const

export function MovementPRPage() {
  const { t } = useTranslation()
  const { movementPRs, loadMovementPRs, saveMovementPR } = useStore()
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const [movementName, setMovementName] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('barbell')
  const [prType, setPrType] = useState<typeof PR_TYPES[number]>('1rm')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState<typeof UNITS[number]>('kg')

  useEffect(() => { loadMovementPRs().finally(() => setLoading(false)) }, [])

  const handleSave = async () => {
    if (!movementName || !value) return
    await saveMovementPR({
      movementName,
      category,
      prType,
      value: parseFloat(value),
      unit,
      date: today(),
    })
    setMovementName(''); setValue(''); setShowAdd(false)
  }

  // Group PRs by movement
  const grouped = movementPRs.reduce((acc, pr) => {
    const key = pr.movementName
    if (!acc[key]) acc[key] = []
    acc[key].push(pr)
    return acc
  }, {} as Record<string, MovementPR[]>)

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('movementPR.title')}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <div className="flex justify-between items-center">
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('movementPR.title')}</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg active:bg-ct-surface text-cyan-400" aria-label={showAdd ? 'Close form' : 'Add new PR'}>
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Add PR form */}
      {showAdd && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-cyan-400/30 space-y-3">
          <input value={movementName} onChange={e => setMovementName(e.target.value)}
            placeholder={t('movementPR.placeholder')}
            className="w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[44px]" autoFocus />

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize min-h-[36px] ${category === c ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-ct-elevated text-ct-2 border border-ct-border'}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select value={prType} onChange={e => setPrType(e.target.value as any)}
              className="bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm flex-1 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-cyan-400">
              {PR_TYPES.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </select>
            <select value={unit} onChange={e => setUnit(e.target.value as any)}
              className="bg-ct-elevated rounded-xl py-2.5 px-3.5 text-ct-1 text-[15px] font-semibold w-24 min-h-[44px] focus:outline-none focus:ring-1 focus:ring-cyan-400">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <input type="text" inputMode="decimal" pattern="[0-9.]*" value={value} onChange={e => setValue(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="Value" className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-center text-lg font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[44px] tabular-nums" />
            <span className="text-ct-2 text-sm">{unit}</span>
          </div>

          <button onClick={handleSave}
            disabled={!movementName.trim() || !value}
            className={`w-full font-bold py-3 rounded-xl min-h-[48px] ${
              movementName.trim() && value
                ? 'bg-cyan-500 text-slate-900 active:scale-[0.98]'
                : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
            }`}>
            {t('movementPR.savePR')}
          </button>
        </div>
      )}

      {/* PR List grouped by movement */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={Trophy} title={t('movementPR.noPRsYet')} description={t('movementPR.noPRsDesc')} />
      ) : (
        Object.entries(grouped).map(([name, prs]) => (
          <div key={name} className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[0.9375rem] font-bold text-ct-1 mb-2">{name}</p>
            {prs.map(pr => (
              <div key={pr.id} className="flex items-center py-2 border-b border-ct-border/30 last:border-0">
                <span className="text-xs text-ct-2 w-20">{pr.prType.replace('_', ' ')}</span>
                <span className="text-sm text-cyan-400 font-bold flex-1 tabular-nums">{pr.value} {pr.unit}</span>
                {pr.previousBest !== undefined && pr.previousBest > 0 && (
                  <span className="text-xs text-green-400">+{Math.round((pr.value - pr.previousBest) * 10) / 10}</span>
                )}
                <span className="text-[11px] text-ct-2 ml-2 tabular-nums">{pr.date}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
