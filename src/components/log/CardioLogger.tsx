import { useState } from 'react'
import { ChevronLeft, Plus, Trash2, Trophy, Footprints } from 'lucide-react'
import { E } from '../../utils/emoji'
import type { CardioType, DistanceUnit } from '../../types'

interface CardioLoggerProps {
  onSave: (data: {
    cardioType: CardioType
    distanceValue: number
    distanceUnit: DistanceUnit
    durationMin: number
    durationSec: number
    paceDisplay: string
    splits: string[]
    elevationGain?: number
    prFlag: boolean
    notes: string
  }) => void
  onClose: () => void
}

const CARDIO_TYPES: { id: CardioType; label: string; emoji: string }[] = [
  { id: 'run', label: 'Run', emoji: E.runner },
  { id: 'row', label: 'Row', emoji: E.rower },
  { id: 'bike', label: 'Bike', emoji: E.cyclist },
  { id: 'ski', label: 'SkiErg', emoji: E.skier },
  { id: 'swim', label: 'Swim', emoji: E.swimmer },
  { id: 'hike', label: 'Hike', emoji: E.boot },
]

const QUICK_DISTANCES: Record<string, number[]> = {
  run: [1, 3, 5, 10, 21.1, 42.2],
  row: [0.5, 1, 2, 5],
  bike: [5, 10, 20, 40],
  ski: [1, 2, 5],
  swim: [0.4, 0.75, 1, 1.5],
  hike: [3, 5, 10, 15],
  other: [1, 5, 10],
}

export function CardioLogger({ onSave, onClose }: CardioLoggerProps) {
  const [cardioType, setCardioType] = useState<CardioType>('run')
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [durationMin, setDurationMin] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [elevation, setElevation] = useState('')
  const [prFlag, setPrFlag] = useState(false)
  const [notes, setNotes] = useState('')
  const [splits, setSplits] = useState<string[]>([])
  const [showSplits, setShowSplits] = useState(false)

  // Auto-calculate pace
  const calcPace = (): string => {
    const d = parseFloat(distance)
    const min = parseInt(durationMin) || 0
    const sec = parseInt(durationSec) || 0
    const totalSec = min * 60 + sec
    if (!d || !totalSec) return ''
    const pacePerUnit = totalSec / d
    const pMin = Math.floor(pacePerUnit / 60)
    const pSec = Math.round(pacePerUnit % 60)
    return `${pMin}:${String(pSec).padStart(2, '0')}/${distanceUnit}`
  }

  const pace = calcPace()

  const addSplit = () => setSplits(prev => [...prev, ''])
  const removeSplit = (idx: number) => setSplits(prev => prev.filter((_, i) => i !== idx))
  const updateSplit = (idx: number, val: string) => setSplits(prev => prev.map((s, i) => i === idx ? val : s))

  const handleSave = () => {
    const d = parseFloat(distance)
    const min = parseInt(durationMin) || 0
    const sec = parseInt(durationSec) || 0
    if (!d || (!min && !sec)) return
    onSave({
      cardioType,
      distanceValue: d,
      distanceUnit,
      durationMin: min,
      durationSec: sec,
      paceDisplay: pace,
      splits: splits.filter(s => s.trim()),
      elevationGain: parseInt(elevation) || undefined,
      prFlag,
      notes,
    })
  }

  const quickDists = QUICK_DISTANCES[cardioType] || QUICK_DISTANCES.other

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-ct-2 p-1" aria-label="Go back"><ChevronLeft size={20} /></button>
        <div>
          <h1 className="text-xl font-bold text-emerald-400">Run / Cardio</h1>
          <p className="text-xs text-ct-2">Distance, time, pace, splits</p>
        </div>
      </div>

      {/* Cardio Type Picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CARDIO_TYPES.map(ct => (
          <button key={ct.id} onClick={() => setCardioType(ct.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              cardioType === ct.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                : 'bg-ct-surface text-ct-2 border border-ct-border'
            }`}>
            <span className="mr-1">{ct.emoji}</span> {ct.label}
          </button>
        ))}
      </div>

      {/* Distance */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border overflow-hidden">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">Distance</p>
        <div className="flex items-center gap-2 mb-3 overflow-hidden">
          <input type="text" inputMode="decimal" pattern="[0-9.]*" value={distance} onChange={e => setDistance(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0.00" aria-label="Distance"
            className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-2 text-ct-1 text-2xl font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <div className="flex gap-1">
            {(['km', 'mi', 'm'] as DistanceUnit[]).map(u => (
              <button key={u} onClick={() => setDistanceUnit(u)}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  distanceUnit === u ? 'bg-emerald-500/20 text-emerald-400' : 'bg-ct-elevated text-ct-2'
                }`}>{u}</button>
            ))}
          </div>
        </div>
        {/* Quick distance buttons */}
        <div className="flex gap-2 flex-wrap">
          {quickDists.map(d => (
            <button key={d} onClick={() => setDistance(String(d))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                distance === String(d) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-ct-elevated/60 text-ct-2'
              }`}>{d}{distanceUnit}</button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border overflow-hidden">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">Time</p>
        <div className="flex items-center gap-2 overflow-hidden">
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={durationMin} onChange={e => setDurationMin(e.target.value.replace(/\D/g, ''))}
            placeholder="MM" aria-label="Minutes"
            className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-2 text-ct-1 text-center text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400" />
          <span className="text-2xl text-ct-2 font-bold shrink-0">:</span>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={durationSec} onChange={e => setDurationSec(e.target.value.replace(/\D/g, ''))}
            placeholder="SS" aria-label="Seconds"
            className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-2 text-ct-1 text-center text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400" />
        </div>
        {/* Auto-calculated pace */}
        {pace && (
          <div className="mt-3 bg-emerald-500/10 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2">
            <Footprints size={14} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">Pace: {pace}</span>
          </div>
        )}
      </div>

      {/* Elevation (for run/hike) */}
      {(cardioType === 'run' || cardioType === 'hike' || cardioType === 'bike') && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border overflow-hidden">
          <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">Elevation Gain (optional)</p>
          <div className="flex items-center gap-2 overflow-hidden">
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={elevation} onChange={e => setElevation(e.target.value.replace(/\D/g, ''))}
              placeholder="0" aria-label="Elevation gain"
              className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-2.5 px-2 text-ct-1 text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            <span className="text-sm text-ct-2 shrink-0">m</span>
          </div>
        </div>
      )}

      {/* Splits (collapsible) */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <button onClick={() => setShowSplits(!showSplits)}
          className="w-full flex items-center justify-between">
          <p className="text-sm font-semibold text-ct-1">Splits</p>
          <span className="text-xs text-ct-2">{showSplits ? 'Hide' : 'Optional — tap to add'}</span>
        </button>
        {showSplits && (
          <div className="mt-3 space-y-2">
            {splits.map((split, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-ct-2 w-5 text-center">{idx + 1}</span>
                <input value={split} onChange={e => updateSplit(idx, e.target.value)}
                  placeholder="e.g. 5:30" className="flex-1 bg-ct-elevated rounded-lg py-1.5 px-2 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <button onClick={() => removeSplit(idx)} className="text-ct-2 p-1" aria-label="Remove split"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={addSplit}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-emerald-400 font-medium">
              <Plus size={14} /> Add Split
            </button>
          </div>
        )}
      </div>

      {/* PR Flag + Notes */}
      <div className="flex gap-3">
        <button onClick={() => setPrFlag(!prFlag)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            prFlag ? 'bg-red-500/20 text-red-400 border border-red-400/40' : 'bg-ct-surface text-ct-2 border border-ct-border'
          }`}>
          <Trophy size={14} /> PR
        </button>
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="flex-1 bg-ct-surface border border-ct-border rounded-xl py-2.5 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
      </div>

      {/* Save — sticky at bottom */}
      <div className="sticky-save">
        <button onClick={handleSave}
          disabled={!distance || (!durationMin && !durationSec)}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            distance && (durationMin || durationSec)
              ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/30 active:scale-[0.98]'
              : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
          }`}>
          Save {CARDIO_TYPES.find(c => c.id === cardioType)?.label || 'Cardio'}
        </button>
      </div>
    </div>
  )
}
