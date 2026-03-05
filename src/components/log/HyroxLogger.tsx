import { useState } from 'react'
import { ChevronLeft, Timer, Trophy } from 'lucide-react'
import type { HyroxStation, RxScaled } from '../../types'

const HYROX_STATIONS: string[] = [
  '1km Run', '1000m SkiErg', '1km Run', '50m Sled Push',
  '1km Run', '50m Sled Pull', '1km Run', '80m Burpee Broad Jump',
  '1km Run', '1000m Row', '1km Run', '200m Farmers Carry',
  '1km Run', '100m Sandbag Lunges', '1km Run', '75/100 Wall Balls',
]

interface HyroxLoggerProps {
  onSave: (data: {
    totalTimeMin: number
    totalTimeSec: number
    stations: HyroxStation[]
    rxScaled: RxScaled
    prFlag: boolean
    notes: string
  }) => void
  onClose: () => void
}

export function HyroxLogger({ onSave, onClose }: HyroxLoggerProps) {
  const [totalMin, setTotalMin] = useState('')
  const [totalSec, setTotalSec] = useState('')
  const [rxScaled, setRxScaled] = useState<RxScaled>('RX')
  const [prFlag, setPrFlag] = useState(false)
  const [notes, setNotes] = useState('')
  const [stations, setStations] = useState<HyroxStation[]>(
    HYROX_STATIONS.map(name => ({ name, timeSeconds: undefined, notes: undefined }))
  )
  const [showStationTimes, setShowStationTimes] = useState(false)

  const updateStation = (idx: number, field: keyof HyroxStation, value: string | number | undefined) => {
    setStations(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleSave = () => {
    const min = parseInt(totalMin) || 0
    const sec = parseInt(totalSec) || 0
    if (!min && !sec) return
    onSave({
      totalTimeMin: min,
      totalTimeSec: sec,
      stations: stations.filter(s => s.timeSeconds),
      rxScaled,
      prFlag,
      notes,
    })
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-ct-2 p-1" aria-label="Go back"><ChevronLeft size={20} /></button>
        <div>
          <h1 className="text-xl font-bold text-orange-400">HYROX</h1>
          <p className="text-xs text-ct-2">8 runs + 8 functional stations</p>
        </div>
      </div>

      {/* Total Time */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-orange-500/20">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">Total Finish Time</p>
        <div className="flex items-center gap-2 overflow-hidden">
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
            value={totalMin} onChange={e => setTotalMin(e.target.value.replace(/\D/g, ''))}
            placeholder="MM" aria-label="Minutes"
            className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-2 text-ct-1 text-center text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="text-2xl text-ct-2 font-bold shrink-0">:</span>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
            value={totalSec} onChange={e => setTotalSec(e.target.value.replace(/\D/g, ''))}
            placeholder="SS" aria-label="Seconds"
            className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-2 text-ct-1 text-center text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
      </div>

      {/* Division / Level */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">Division</p>
        <div className="flex gap-2">
          {(['RX' as RxScaled, 'Scaled' as RxScaled, 'Elite' as RxScaled]).map(level => (
            <button key={level} onClick={() => setRxScaled(level)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                rxScaled === level
                  ? level === 'Elite' ? 'bg-purple-500/20 text-purple-400 border border-purple-400/40'
                    : level === 'RX' ? 'bg-green-500/20 text-green-400 border border-green-400/40'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-400/40'
                  : 'bg-ct-elevated text-ct-2'
              }`}>{level === 'RX' ? 'Open' : level === 'Elite' ? 'Pro' : 'Doubles'}</button>
          ))}
        </div>
      </div>

      {/* Station Times (collapsible) */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <button onClick={() => setShowStationTimes(!showStationTimes)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-orange-400" />
            <p className="text-sm font-semibold text-ct-1">Station Splits</p>
          </div>
          <span className="text-xs text-ct-2">{showStationTimes ? 'Hide' : 'Optional – tap to add'}</span>
        </button>

        {showStationTimes && (
          <div className="mt-3 space-y-2">
            {stations.map((station, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={`text-xs w-5 text-center font-bold ${idx % 2 === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {idx + 1}
                </span>
                <span className="text-xs text-ct-2 flex-1 truncate">{station.name}</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*"
                  placeholder="sec"
                  value={station.timeSeconds || ''}
                  onChange={e => updateStation(idx, 'timeSeconds', parseInt(e.target.value.replace(/\D/g, '')) || undefined)}
                  className="w-20 bg-ct-elevated rounded-lg py-1.5 px-2 text-ct-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PR Flag + Notes */}
      <div className="flex gap-3">
        <button onClick={() => setPrFlag(!prFlag)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            prFlag ? 'bg-red-500/20 text-red-400 border border-red-400/40' : 'bg-slate-800 text-ct-2 border border-slate-700'
          }`}>
          <Trophy size={14} /> PR
        </button>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
      </div>

      {/* Save – sticky at bottom */}
      <div className="sticky-save">
        <button onClick={handleSave} disabled={!totalMin && !totalSec}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            totalMin || totalSec
              ? 'bg-orange-500 text-slate-900 shadow-lg shadow-orange-500/30 active:scale-[0.98]'
              : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
          }`}>
          Save HYROX Result
        </button>
      </div>
    </div>
  )
}