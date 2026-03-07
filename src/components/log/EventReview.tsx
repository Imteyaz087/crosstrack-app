/**
 * EventReview  -  Review OCR-scanned event data before saving
 * Shows confidence badges, editable fields, warnings
 */

import { useState } from 'react'
import { CheckCircle, AlertTriangle, AlertCircle, Trash2, Edit3, ChevronDown } from 'lucide-react'
import type { EventScanResult, EventCategory } from '../../types/eventTypes'
import type { WodType } from '../../types'

interface EventReviewProps {
  result: EventScanResult
  sourceImage?: string
  onConfirm: (edited: EventScanResult, keepImage: boolean) => void
  onRetry: () => void
  onCancel: () => void
}

// Confidence badge colors
function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 90) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold">
      <CheckCircle size={10} /> {score}%
    </span>
  )
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">
      <AlertTriangle size={10} /> {score}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[11px] font-bold">
      <AlertCircle size={10} /> {score}%
    </span>
  )
}

const WOD_TYPE_OPTIONS: WodType[] = ['ForTime', 'AMRAP', 'EMOM', 'Chipper', 'Other']
const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'hero', label: 'Hero' },
  { value: 'girl', label: 'Girls' },
  { value: 'custom', label: 'Custom' },
]

export function EventReview({ result, sourceImage, onConfirm, onRetry, onCancel }: EventReviewProps) {
  const [edited, setEdited] = useState<EventScanResult>({ ...result })
  const [keepImage, setKeepImage] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  const conf = edited.confidenceScores || {}

  const update = <K extends keyof EventScanResult>(key: K, val: EventScanResult[K]) => {
    setEdited(prev => ({ ...prev, [key]: val }))
  }

  const hasLowConfidence = Object.values(conf).some(v => v < 70)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Warnings banner */}
      {(edited.warnings?.length > 0 || hasLowConfidence) && (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-ct-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-300">Review Needed</p>
              {edited.warnings?.map((w, i) => (
                <p key={i} className="text-[11px] text-ct-2 mt-0.5">• {w}</p>
              ))}
              {hasLowConfidence && (
                <p className="text-[11px] text-ct-2 mt-0.5">• Some fields have low confidence  -  please verify</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Source image preview (collapsed) */}
      {sourceImage && (
        <details className="group">
          <summary className="flex items-center gap-2 text-xs text-ct-3 cursor-pointer select-none">
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
            View scanned image
          </summary>
          <img src={sourceImage} alt="Scanned" className="w-full rounded-ct-lg mt-2 border border-ct-border" />
        </details>
      )}

      {/* Event Title */}
      <ReviewField
        label="Event Title"
        confidence={conf.eventTitle}
        editing={editingField === 'eventTitle'}
        onEdit={() => setEditingField(editingField === 'eventTitle' ? null : 'eventTitle')}
      >
        {editingField === 'eventTitle' ? (
          <input
            type="text"
            value={edited.eventTitle}
            onChange={e => update('eventTitle', e.target.value)}
            className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
            autoFocus
          />
        ) : (
          <p className="text-sm font-bold text-ct-1">{edited.eventTitle || ' - '}</p>
        )}
      </ReviewField>

      {/* Category + WOD Type row */}
      <div className="grid grid-cols-2 gap-3">
        <ReviewField
          label="Category"
          confidence={conf.eventType}
          editing={editingField === 'eventType'}
          onEdit={() => setEditingField(editingField === 'eventType' ? null : 'eventType')}
        >
          {editingField === 'eventType' ? (
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { update('eventType', opt.value); setEditingField(null) }}
                  className={`px-2.5 py-1.5 rounded-ct-lg text-[11px] font-semibold transition-all min-h-[32px] ${
                    edited.eventType === opt.value
                      ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-ct-surface text-ct-2 border border-ct-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ct-1 capitalize">{edited.eventType || ' - '}</p>
          )}
        </ReviewField>

        <ReviewField
          label="WOD Type"
          confidence={conf.wodType}
          editing={editingField === 'wodType'}
          onEdit={() => setEditingField(editingField === 'wodType' ? null : 'wodType')}
        >
          {editingField === 'wodType' ? (
            <div className="flex flex-wrap gap-1.5">
              {WOD_TYPE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => { update('wodType', t); setEditingField(null) }}
                  className={`px-2.5 py-1.5 rounded-ct-lg text-[11px] font-semibold transition-all min-h-[32px] ${
                    edited.wodType === t
                      ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-ct-surface text-ct-2 border border-ct-border'
                  }`}
                >
                  {t === 'ForTime' ? 'For Time' : t}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ct-1">{edited.wodType === 'ForTime' ? 'For Time' : edited.wodType || ' - '}</p>
          )}
        </ReviewField>
      </div>

      {/* Workout Lines */}
      <ReviewField
        label="Workout"
        confidence={conf.workoutLines}
        editing={editingField === 'workoutLines'}
        onEdit={() => setEditingField(editingField === 'workoutLines' ? null : 'workoutLines')}
      >
        {editingField === 'workoutLines' ? (
          <textarea
            value={edited.workoutLines.join('\n')}
            onChange={e => update('workoutLines', e.target.value.split('\n'))}
            rows={Math.max(4, edited.workoutLines.length + 1)}
            className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 resize-none font-mono"
            autoFocus
          />
        ) : (
          <div className="space-y-0.5">
            {edited.workoutLines.map((line, i) => (
              <p key={i} className="text-sm text-ct-1 font-mono">{line}</p>
            ))}
          </div>
        )}
      </ReviewField>

      {/* Time Cap + Standards row */}
      <div className="grid grid-cols-2 gap-3">
        <ReviewField
          label="Time Cap"
          confidence={conf.timeCapMinutes}
          editing={editingField === 'timeCapMinutes'}
          onEdit={() => setEditingField(editingField === 'timeCapMinutes' ? null : 'timeCapMinutes')}
        >
          {editingField === 'timeCapMinutes' ? (
            <input
              type="number"
              value={edited.timeCapMinutes ?? ''}
              onChange={e => update('timeCapMinutes', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Minutes"
              className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
              autoFocus
            />
          ) : (
            <p className="text-sm text-ct-1">{edited.timeCapMinutes ? `${edited.timeCapMinutes} min` : 'None'}</p>
          )}
        </ReviewField>

        <ReviewField
          label="RX Standard"
          confidence={conf.rxStandard}
          editing={editingField === 'rxStandard'}
          onEdit={() => setEditingField(editingField === 'rxStandard' ? null : 'rxStandard')}
        >
          {editingField === 'rxStandard' ? (
            <input
              type="text"
              value={edited.rxStandard ?? ''}
              onChange={e => update('rxStandard', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
              autoFocus
            />
          ) : (
            <p className="text-sm text-ct-1 truncate">{edited.rxStandard || ' - '}</p>
          )}
        </ReviewField>
      </div>

      {/* Scaled Standard (full width) */}
      {(edited.scaledStandard || editingField === 'scaledStandard') && (
        <ReviewField
          label="Scaled Standard"
          confidence={conf.scaledStandard}
          editing={editingField === 'scaledStandard'}
          onEdit={() => setEditingField(editingField === 'scaledStandard' ? null : 'scaledStandard')}
        >
          {editingField === 'scaledStandard' ? (
            <input
              type="text"
              value={edited.scaledStandard ?? ''}
              onChange={e => update('scaledStandard', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
              autoFocus
            />
          ) : (
            <p className="text-sm text-ct-1">{edited.scaledStandard || ' - '}</p>
          )}
        </ReviewField>
      )}

      {/* Score (if detected) */}
      {edited.score && (
        <ReviewField
          label="Score Detected"
          confidence={conf.score}
          editing={editingField === 'score'}
          onEdit={() => setEditingField(editingField === 'score' ? null : 'score')}
        >
          {editingField === 'score' ? (
            <input
              type="text"
              value={edited.score ?? ''}
              onChange={e => update('score', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
              autoFocus
            />
          ) : (
            <p className="text-sm font-bold text-cyan-400">{edited.score}</p>
          )}
        </ReviewField>
      )}

      {/* Keep source image toggle */}
      {sourceImage && (
        <div className="flex items-center justify-between px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg">
          <div className="flex items-center gap-2">
            <Trash2 size={14} className="text-ct-3" />
            <span className="text-xs text-ct-2">Keep source image</span>
          </div>
          <button
            onClick={() => setKeepImage(!keepImage)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              keepImage ? 'bg-cyan-500' : 'bg-ct-border'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              keepImage ? 'left-5' : 'left-1'
            }`} />
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px] active:scale-[0.97] transition-transform"
        >
          Rescan
        </button>
        <button
          onClick={() => onConfirm(edited, keepImage)}
          className="flex-[2] py-3 bg-cyan-500 rounded-ct-lg text-sm font-bold text-slate-900 btn-press min-h-[44px]"
        >
          Confirm & Continue
        </button>
      </div>

      <button
        onClick={onCancel}
        className="w-full py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]"
      >
        Cancel
      </button>
    </div>
  )
}

// Reusable review field wrapper
function ReviewField({
  label,
  confidence,
  editing,
  onEdit,
  children,
}: {
  label: string
  confidence?: number
  editing: boolean
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`p-3 rounded-ct-lg border transition-colors ${
      editing
        ? 'bg-ct-surface/80 border-cyan-400/30'
        : confidence !== undefined && confidence < 70
          ? 'bg-red-500/5 border-red-400/20'
          : 'bg-ct-surface border-ct-border'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">{label}</span>
          {confidence !== undefined && <ConfidenceBadge score={confidence} />}
        </div>
        <button
          onClick={onEdit}
          className="p-1.5 -mr-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <Edit3 size={12} className={editing ? 'text-cyan-400' : 'text-ct-3'} />
        </button>
      </div>
      {children}
    </div>
  )
}