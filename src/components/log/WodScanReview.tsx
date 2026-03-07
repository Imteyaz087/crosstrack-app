/**
 * WodScanReview  -  Review OCR-scanned WOD data before filling form
 * Shows confidence badges, editable fields
 */

import { useState } from 'react'
import { CheckCircle, AlertTriangle, AlertCircle, Edit3 } from 'lucide-react'
import type { WodScanResult } from './WodScanner'
import type { WodType } from '../../types'

interface WodScanReviewProps {
  result: WodScanResult
  onConfirm: (edited: WodScanResult) => void
  onRetry: () => void
  onCancel: () => void
}

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 0.9) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold">
      <CheckCircle size={10} /> {Math.round(score * 100)}%
    </span>
  )
  if (score >= 0.7) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">
      <AlertTriangle size={10} /> {Math.round(score * 100)}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[11px] font-bold">
      <AlertCircle size={10} /> {Math.round(score * 100)}%
    </span>
  )
}

const WOD_TYPES: WodType[] = ['ForTime', 'AMRAP', 'EMOM', 'Tabata', 'Chipper', 'Other']

export function WodScanReview({ result, onConfirm, onRetry, onCancel }: WodScanReviewProps) {
  const [edited, setEdited] = useState<WodScanResult>({ ...result })
  const [editingField, setEditingField] = useState<string | null>(null)

  const conf = edited.confidenceScores || {}
  const hasLowConfidence = Object.values(conf).some(v => v < 0.7)

  const update = <K extends keyof WodScanResult>(key: K, val: WodScanResult[K]) => {
    setEdited(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Warnings */}
      {(edited.warnings?.length > 0 || hasLowConfidence) && (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-ct-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-300">Review needed</p>
              {edited.warnings?.map((w, i) => (
                <p key={i} className="text-[11px] text-ct-2 mt-0.5">• {w}</p>
              ))}
              {hasLowConfidence && (
                <p className="text-[11px] text-ct-2 mt-0.5">• Some fields have low confidence</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WOD Name */}
      <ReviewField label="WOD Name" confidence={conf.wodName}
        editing={editingField === 'wodName'} onEdit={() => setEditingField(editingField === 'wodName' ? null : 'wodName')}>
        {editingField === 'wodName' ? (
          <input type="text" value={edited.wodName ?? ''}
            onChange={e => update('wodName', e.target.value || null)}
            className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[40px]"
            placeholder="WOD name (optional)" autoFocus />
        ) : (
          <p className="text-sm font-bold text-ct-1">{edited.wodName || 'Custom WOD'}</p>
        )}
      </ReviewField>

      {/* WOD Type */}
      <ReviewField label="Type" confidence={conf.wodType}
        editing={editingField === 'wodType'} onEdit={() => setEditingField(editingField === 'wodType' ? null : 'wodType')}>
        {editingField === 'wodType' ? (
          <div className="flex flex-wrap gap-1.5">
            {WOD_TYPES.map(t => (
              <button key={t}
                onClick={() => { update('wodType', t); setEditingField(null) }}
                className={`px-2.5 py-1.5 rounded-ct-lg text-[11px] font-semibold transition-all min-h-[32px] ${
                  edited.wodType === t ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30' : 'bg-ct-surface text-ct-2 border border-ct-border'
                }`}>
                {t === 'ForTime' ? 'For Time' : t}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ct-1">{edited.wodType === 'ForTime' ? 'For Time' : edited.wodType}</p>
        )}
      </ReviewField>

      {/* Description */}
      <ReviewField label="Workout" confidence={conf.description}
        editing={editingField === 'description'} onEdit={() => setEditingField(editingField === 'description' ? null : 'description')}>
        {editingField === 'description' ? (
          <textarea value={edited.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 resize-none"
            autoFocus />
        ) : (
          <p className="text-sm text-ct-1">{edited.description || ' - '}</p>
        )}
      </ReviewField>

      {/* Movements */}
      <ReviewField label="Movements" confidence={conf.movements}
        editing={editingField === 'movements'} onEdit={() => setEditingField(editingField === 'movements' ? null : 'movements')}>
        {editingField === 'movements' ? (
          <textarea value={edited.movements.join('\n')}
            onChange={e => update('movements', e.target.value.split('\n').filter(l => l.trim()))}
            rows={Math.max(3, edited.movements.length + 1)}
            className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 resize-none font-mono"
            autoFocus />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {edited.movements.map((m, i) => (
              <span key={i} className="text-xs text-ct-1 bg-ct-surface px-2 py-1 rounded-lg border border-ct-border">{m}</span>
            ))}
          </div>
        )}
      </ReviewField>

      {/* Time Cap + RX row */}
      <div className="grid grid-cols-2 gap-3">
        <ReviewField label="Time Cap" confidence={conf.timeCapMinutes} compact
          editing={editingField === 'timeCap'} onEdit={() => setEditingField(editingField === 'timeCap' ? null : 'timeCap')}>
          {editingField === 'timeCap' ? (
            <input type="number" value={edited.timeCapMinutes ?? ''}
              onChange={e => update('timeCapMinutes', e.target.value ? Number(e.target.value) : null)}
              placeholder="min" className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[36px]"
              autoFocus />
          ) : (
            <p className="text-sm text-ct-1">{edited.timeCapMinutes ? `${edited.timeCapMinutes} min` : 'None'}</p>
          )}
        </ReviewField>
        <ReviewField label="RX Weights" confidence={conf.rxWeights} compact
          editing={editingField === 'rxWeights'} onEdit={() => setEditingField(editingField === 'rxWeights' ? null : 'rxWeights')}>
          {editingField === 'rxWeights' ? (
            <input type="text" value={edited.rxWeights ?? ''}
              onChange={e => update('rxWeights', e.target.value || null)}
              className="w-full px-3 py-2 bg-ct-surface border border-cyan-400/40 rounded-ct-lg text-sm text-ct-1 min-h-[36px]"
              autoFocus />
          ) : (
            <p className="text-sm text-ct-1 truncate">{edited.rxWeights || ' - '}</p>
          )}
        </ReviewField>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onRetry}
          className="flex-1 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]">
          Rescan
        </button>
        <button onClick={() => onConfirm(edited)}
          className="flex-[2] py-3 bg-cyan-500 rounded-ct-lg text-sm font-bold text-slate-900 btn-press min-h-[44px]">
          Use This WOD
        </button>
      </div>
      <button onClick={onCancel}
        className="w-full py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]">
        Cancel
      </button>
    </div>
  )
}

function ReviewField({ label, confidence, editing, onEdit, compact, children }: {
  label: string; confidence?: number; editing: boolean; onEdit: () => void; compact?: boolean; children: React.ReactNode
}) {
  return (
    <div className={`${compact ? 'p-2.5' : 'p-3'} rounded-ct-lg border transition-colors ${
      editing ? 'bg-ct-surface/80 border-cyan-400/30'
      : confidence !== undefined && confidence < 0.7 ? 'bg-red-500/5 border-red-400/20'
      : 'bg-ct-surface border-ct-border'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">{label}</span>
          {confidence !== undefined && <ConfidenceBadge score={confidence} />}
        </div>
        <button onClick={onEdit} className="p-1 min-w-[24px] min-h-[24px] flex items-center justify-center">
          <Edit3 size={11} className={editing ? 'text-cyan-400' : 'text-ct-3'} />
        </button>
      </div>
      {children}
    </div>
  )
}