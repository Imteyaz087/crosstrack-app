/**
 * EventScoreEntry — Score entry for CrossFit Events
 * Handles: For Time (finished/capped), AMRAP (rounds+reps), EMOM
 */

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, MapPin, StickyNote } from 'lucide-react'
import { E } from '../../utils/emoji'
import type { WodType, RxScaled } from '../../types'
import type { EventTemplate, EventCategory } from '../../types/eventTypes'
import { today } from '../../utils/macros'

interface EventScoreEntryProps {
  template: EventTemplate | null
  // For custom / scanned events:
  customTitle?: string
  customWodType?: WodType
  customLines?: string[]
  customTimeCap?: number
  customCategory?: EventCategory
  customRxStandard?: string
  customScaledStandard?: string
  customYear?: number
  customNumber?: string
  onSave: (data: EventScoreData) => void
  onBack: () => void
}

export interface EventScoreData {
  eventTitle: string
  eventCategory: EventCategory
  eventYear?: number
  eventNumber?: string
  wodType: WodType
  workoutLines: string[]
  timeCapSeconds?: number
  rxStandard?: string
  scaledStandard?: string
  // Score
  finished: boolean
  finalTimeSeconds?: number
  capped: boolean
  repsAtCap?: number
  roundsRepsAtCap?: string
  scoreDisplay?: string
  // Meta
  rxOrScaled: RxScaled
  location: string
  notes: string
  prFlag: boolean
  date: string
}

export function EventScoreEntry({ template, customTitle, customWodType, customLines, customTimeCap, customCategory, customRxStandard, customScaledStandard, customYear, customNumber, onSave, onBack }: EventScoreEntryProps) {
  const title = template?.name || customTitle || ''
  const wodType = template?.wodType || customWodType || 'ForTime'
  const lines = template?.workoutLines || customLines || []
  const timeCapMin = template?.timeCapMinutes || customTimeCap
  const category = template?.category || customCategory || 'custom'
  const rxStd = template?.rxStandard || customRxStandard
  const scaledStd = template?.scaledStandard || customScaledStandard
  const year = template?.year || customYear
  const number = template?.number || customNumber

  const isForTime = wodType === 'ForTime' || wodType === 'Chipper'
  const isAMRAP = wodType === 'AMRAP'

  // Score state
  const [finished, setFinished] = useState(true)
  const [timeMin, setTimeMin] = useState('')
  const [timeSec, setTimeSec] = useState('')
  const [rounds, setRounds] = useState('')
  const [reps, setReps] = useState('')
  const [rxOrScaled, setRxOrScaled] = useState<RxScaled>('RX')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [prFlag, setPrFlag] = useState(false)
  const [date, setDate] = useState(today())

  const handleSave = () => {
    let finalTimeSeconds: number | undefined
    let scoreDisplay = ''
    let capped = false
    let repsAtCap: number | undefined
    let roundsRepsAtCap: string | undefined

    if (isForTime) {
      if (finished) {
        const min = parseInt(timeMin) || 0
        const sec = parseInt(timeSec) || 0
        finalTimeSeconds = min * 60 + sec
        scoreDisplay = `${min}:${sec.toString().padStart(2, '0')}`
      } else {
        capped = true
        const r = parseInt(reps) || 0
        repsAtCap = r
        roundsRepsAtCap = reps ? `${reps} reps` : undefined
        scoreDisplay = `CAP + ${r} reps`
      }
    } else if (isAMRAP) {
      const rd = parseInt(rounds) || 0
      const rp = parseInt(reps) || 0
      roundsRepsAtCap = `${rd}+${rp}`
      scoreDisplay = `${rd}+${rp}`
    } else {
      // EMOM or Other: just store time if entered
      if (timeMin || timeSec) {
        const min = parseInt(timeMin) || 0
        const sec = parseInt(timeSec) || 0
        finalTimeSeconds = min * 60 + sec
        scoreDisplay = `${min}:${sec.toString().padStart(2, '0')}`
        setFinished(true)
      }
    }

    onSave({
      eventTitle: title,
      eventCategory: category,
      eventYear: year,
      eventNumber: number,
      wodType,
      workoutLines: lines,
      timeCapSeconds: timeCapMin ? timeCapMin * 60 : undefined,
      rxStandard: rxStd,
      scaledStandard: scaledStd,
      finished: isForTime ? finished : true,
      finalTimeSeconds,
      capped,
      repsAtCap,
      roundsRepsAtCap,
      scoreDisplay,
      rxOrScaled,
      location,
      notes,
      prFlag,
      date,
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Event header */}
      <div className="bg-ct-surface border border-ct-border rounded-ct-lg p-4">
        <p className="text-[10px] uppercase font-bold text-ct-3 tracking-wider mb-1">{category}</p>
        <h2 className="text-lg font-bold text-ct-1">{title}</h2>
        <p className="text-xs text-cyan-400 font-semibold mt-0.5">
          {wodType === 'ForTime' ? 'For Time' : wodType}
          {timeCapMin ? ` · ${timeCapMin} min cap` : ''}
        </p>

        {/* Workout lines */}
        <div className="mt-3 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-xs text-ct-2">{line}</p>
          ))}
        </div>

        {rxStd && (
          <p className="text-[10px] text-ct-3 mt-2 border-t border-ct-border pt-2">
            RX: {rxStd}
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
        />
      </div>

      {/* Score entry — depends on WOD type */}
      {isForTime && (
        <div className="space-y-3">
          <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Did you finish?</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFinished(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-ct-lg text-sm font-bold transition-all min-h-[44px] ${
                finished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' : 'bg-ct-surface text-ct-2 border border-ct-border'
              }`}
            >
              <CheckCircle2 size={16} /> Yes
            </button>
            <button
              onClick={() => setFinished(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-ct-lg text-sm font-bold transition-all min-h-[44px] ${
                !finished ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30' : 'bg-ct-surface text-ct-2 border border-ct-border'
              }`}
            >
              <AlertTriangle size={16} /> Capped
            </button>
          </div>

          {finished ? (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Final Time</label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={timeMin}
                    onChange={(e) => setTimeMin(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">min</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={timeSec}
                    onChange={(e) => setTimeSec(e.target.value)}
                    placeholder="00"
                    max={59}
                    className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">sec</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Reps at cap</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Total reps completed"
                className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
              />
            </div>
          )}
        </div>
      )}

      {isAMRAP && (
        <div>
          <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Score (Rounds + Reps)</label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 relative">
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">rds</span>
            </div>
            <span className="self-center text-ct-3 font-bold">+</span>
            <div className="flex-1 relative">
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">reps</span>
            </div>
          </div>
        </div>
      )}

      {!isForTime && !isAMRAP && (
        <div>
          <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Time (optional)</label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 relative">
              <input type="number" value={timeMin} onChange={(e) => setTimeMin(e.target.value)} placeholder="0"
                className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">min</span>
            </div>
            <div className="flex-1 relative">
              <input type="number" value={timeSec} onChange={(e) => setTimeSec(e.target.value)} placeholder="00"
                className="w-full px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 min-h-[44px]" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ct-3">sec</span>
            </div>
          </div>
        </div>
      )}

      {/* RX / Scaled */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Performance</label>
        <div className="flex gap-2 mt-1">
          {(['RX', 'Scaled', 'Elite'] as RxScaled[]).map(opt => (
            <button
              key={opt}
              onClick={() => setRxOrScaled(opt)}
              className={`flex-1 py-2.5 rounded-ct-lg text-xs font-bold transition-all min-h-[44px] ${
                rxOrScaled === opt
                  ? opt === 'RX' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                    : opt === 'Elite' ? 'bg-gold/20 text-yellow-400 border border-yellow-400/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'bg-ct-surface text-ct-2 border border-ct-border'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* PR flag */}
      <button
        onClick={() => setPrFlag(!prFlag)}
        className={`w-full flex items-center gap-3 p-3 rounded-ct-lg transition-all min-h-[44px] ${
          prFlag ? 'bg-yellow-500/15 border border-yellow-400/30' : 'bg-ct-surface border border-ct-border'
        }`}
      >
        <span className="text-lg">{prFlag ? E.trophy : E.medal}</span>
        <span className={`text-sm font-semibold ${prFlag ? 'text-yellow-400' : 'text-ct-2'}`}>
          {prFlag ? 'PR! New personal record' : 'Mark as PR?'}
        </span>
      </button>

      {/* Location */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold flex items-center gap-1">
          <MapPin size={12} /> Location (optional)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="CrossFit Box name"
          className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 min-h-[44px]"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold flex items-center gap-1">
          <StickyNote size={12} /> Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel? Strategy notes..."
          rows={3}
          className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-cyan-500 rounded-ct-lg text-sm font-bold text-slate-900 btn-press min-h-[44px]"
        >
          Save Event
        </button>
      </div>
    </div>
  )
}
