import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Minus, Pause, Pencil, Play, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'

import { useTimerEngine } from '../hooks/useTimerEngine'
import { useStore } from '../stores/useStore'
import type { TimerMode, TimerPreset } from '../types'

type ActiveTimerMode = Exclude<TimerMode, 'custom'>

interface TimerPageProps {
  onClose?: () => void
}

interface StepperProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

interface ProgressDotsProps {
  total: number
  current: number
  colorClass: string
}

const MODE_META: Record<ActiveTimerMode, { label: string; icon: string; textClass: string; borderClass: string }> = {
  amrap: { label: 'AMRAP', icon: '??', textClass: 'text-cyan-400', borderClass: 'border-cyan-400/40 text-cyan-400' },
  emom: { label: 'EMOM', icon: '??', textClass: 'text-green-400', borderClass: 'border-green-400/40 text-green-400' },
  fortime: { label: 'For Time', icon: '??', textClass: 'text-orange-400', borderClass: 'border-orange-400/40 text-orange-400' },
  tabata: { label: 'Tabata', icon: '??', textClass: 'text-red-400', borderClass: 'border-red-400/40 text-red-400' },
  rest: { label: 'Rest Timer', icon: '??', textClass: 'text-purple-400', borderClass: 'border-purple-400/40 text-purple-400' },
}

const MODE_ORDER: ActiveTimerMode[] = ['amrap', 'emom', 'fortime', 'tabata', 'rest']

function normalizeMode(mode: TimerMode | null | undefined): ActiveTimerMode {
  if (!mode || mode === 'custom') return 'amrap'
  return mode
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function Stepper({ label, unit, value, min, max, onChange }: StepperProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-ct-2 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease ${label}`} className="w-9 h-9 rounded-full bg-ct-elevated flex items-center justify-center active:bg-slate-600 min-w-[44px] min-h-[44px]">
          <Minus size={16} className="text-ct-2" />
        </button>
        <span className="text-2xl font-bold text-ct-1 w-12 text-center font-mono tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${label}`} className="w-9 h-9 rounded-full bg-ct-elevated flex items-center justify-center active:bg-slate-600 min-w-[44px] min-h-[44px]">
          <Plus size={16} className="text-ct-2" />
        </button>
      </div>
      <span className="text-[11px] text-ct-2">{unit}</span>
    </div>
  )
}

function ProgressDots({ total, current, colorClass }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap justify-center max-w-[280px]" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, index) => (
        <div key={index} className={`w-3 h-3 rounded-full transition-colors ${index + 1 < current ? colorClass : index + 1 === current ? `${colorClass} animate-pulse` : 'bg-slate-700'}`} />
      ))}
    </div>
  )
}

export function TimerPage({ onClose }: TimerPageProps) {
  const { t } = useTranslation()
  const { timerPresets, loadTimerPresets, saveTimerPreset, deleteTimerPreset } = useStore()
  const [mode, setMode] = useState<ActiveTimerMode | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [showPresetForm, setShowPresetForm] = useState(false)
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null)
  const [presetName, setPresetName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [workMin, setWorkMin] = useState(12)
  const [workSec, setWorkSec] = useState(0)
  const [restMin, setRestMin] = useState(1)
  const [restSec, setRestSec] = useState(0)
  const [sets, setSets] = useState(1)
  const [hasRest, setHasRest] = useState(false)
  const [emomInterval, setEmomInterval] = useState(1)
  const [tabataWork, setTabataWork] = useState(20)
  const [tabataRest, setTabataRest] = useState(10)
  const [tabataRounds, setTabataRounds] = useState(8)

  const timer = useTimerEngine({
    mode: mode ?? 'amrap',
    workMin,
    workSec,
    restMin,
    restSec,
    sets,
    hasRest,
    emomInterval,
    tabataWork,
    tabataRest,
    tabataRounds,
  })

  useEffect(() => {
    void loadTimerPresets()
  }, [loadTimerPresets])

  const applyDefaults = (nextMode: ActiveTimerMode) => {
    if (nextMode === 'amrap') {
      setWorkMin(12); setWorkSec(0); setRestMin(1); setRestSec(0); setSets(1); setHasRest(false)
    }
    if (nextMode === 'emom') {
      setWorkMin(10); setWorkSec(0); setEmomInterval(1); setSets(1); setHasRest(false)
    }
    if (nextMode === 'fortime') {
      setWorkMin(20); setWorkSec(0); setSets(1); setHasRest(false)
    }
    if (nextMode === 'tabata') {
      setTabataWork(20); setTabataRest(10); setTabataRounds(8)
    }
    if (nextMode === 'rest') {
      setWorkMin(1); setWorkSec(0); setSets(1); setHasRest(false)
    }
  }

  const resetToLauncher = () => {
    timer.reset()
    setMode(null)
    setShowConfig(false)
    setShowPresetForm(false)
    setEditingPreset(null)
    setPresetName('')
    setPendingDeleteId(null)
  }

  const applyPreset = (preset: TimerPreset) => {
    const nextMode = normalizeMode(preset.mode)
    setMode(nextMode)
    setWorkMin(Math.floor(preset.totalSeconds / 60))
    setWorkSec(preset.totalSeconds % 60)
    setSets(1)
    setHasRest(false)
    if (nextMode === 'emom') setEmomInterval(Math.floor((preset.workSeconds || 60) / 60))
    if (nextMode === 'tabata') {
      setTabataWork(preset.workSeconds || 20)
      setTabataRest(preset.restSeconds || 10)
      setTabataRounds(preset.rounds || 8)
    }
    if (preset.restSeconds && preset.restSeconds > 0 && nextMode !== 'tabata') {
      setHasRest(true)
      setRestMin(Math.floor(preset.restSeconds / 60))
      setRestSec(preset.restSeconds % 60)
    }
    if (preset.rounds && preset.rounds > 1 && nextMode !== 'emom' && nextMode !== 'tabata') {
      setSets(preset.rounds)
    }
  }

  const buildPresetPayload = (): Omit<TimerPreset, 'id' | 'name'> => {
    const activeMode = normalizeMode(mode)
    if (activeMode === 'tabata') {
      return { mode: activeMode, totalSeconds: (tabataWork + tabataRest) * tabataRounds, rounds: tabataRounds, workSeconds: tabataWork, restSeconds: tabataRest }
    }
    if (activeMode === 'emom') {
      return { mode: activeMode, totalSeconds: workMin * 60 + workSec, workSeconds: emomInterval * 60 }
    }
    const payload: Omit<TimerPreset, 'id' | 'name'> = { mode: activeMode, totalSeconds: workMin * 60 + workSec }
    if (sets > 1) payload.rounds = sets
    if (hasRest) payload.restSeconds = restMin * 60 + restSec
    return payload
  }

  const savePreset = async () => {
    if (!presetName.trim()) return
    const payload = buildPresetPayload()
    if (editingPreset?.id) {
      await saveTimerPreset({ ...payload, id: editingPreset.id, name: presetName.trim() })
    } else {
      await saveTimerPreset({ ...payload, name: presetName.trim() })
    }
    setShowPresetForm(false)
    setEditingPreset(null)
    setPresetName('')
  }

  const emomRounds = mode === 'emom' ? Math.floor((workMin * 60 + workSec) / (emomInterval * 60)) : 1

  if (!mode) {
    const launcherModes = [
      { id: 'amrap' as const, label: t('timer.amrap'), desc: t('timer.amrapDesc') },
      { id: 'emom' as const, label: t('timer.emom'), desc: t('timer.emomDesc') },
      { id: 'fortime' as const, label: t('timer.forTime'), desc: t('timer.forTimeDesc') },
      { id: 'tabata' as const, label: t('timer.tabata'), desc: t('timer.tabataDesc') },
      { id: 'rest' as const, label: t('timer.restTimer'), desc: t('timer.restTimerDesc') },
    ]

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-ct-1 flex items-center gap-2"><span className="text-2xl">??</span>{t('timer.title')}</h1>
          {onClose && (
            <button type="button" onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.close')}>
              <X size={20} />
            </button>
          )}
        </div>

        {launcherModes.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setMode(item.id); setShowConfig(true); setShowPresetForm(false); setEditingPreset(null); setPendingDeleteId(null); applyDefaults(item.id) }}
            className={`w-full bg-ct-surface border rounded-ct-lg p-4 text-left active:bg-ct-elevated/50 transition-colors ${MODE_META[item.id].borderClass}`}
          >
            <p className="text-base font-bold flex items-center gap-2"><span>{MODE_META[item.id].icon}</span>{item.label}</p>
            <p className="text-[11px] text-ct-2 mt-0.5">{item.desc}</p>
          </button>
        ))}

        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('timer.quickPresets')}</p>
            <button
              type="button"
              onClick={() => { setMode('amrap'); applyDefaults('amrap'); setShowConfig(true); setShowPresetForm(true); setEditingPreset(null); setPresetName(''); setPendingDeleteId(null) }}
              className="flex items-center gap-1 text-xs text-cyan-400 font-semibold px-2 py-1 rounded-lg active:bg-cyan-400/10 min-h-[44px]"
            >
              <Plus size={14} />{t('timer.addPreset')}
            </button>
          </div>

          {timerPresets.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-3">{t('timer.noPresets')}</p>
          ) : (
            <div className="space-y-2">
              {timerPresets.map(preset => {
                const presetMode = normalizeMode(preset.mode)
                return (
                  <div key={preset.id ?? preset.name} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { applyPreset(preset); setShowConfig(false); setShowPresetForm(false) }}
                      className="flex-1 bg-ct-elevated/60 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-left active:bg-slate-600/50 min-h-[44px]"
                    >
                      <span className="text-sm text-ct-1 font-medium flex items-center gap-1.5"><span className="text-xs">{MODE_META[presetMode].icon}</span>{preset.name}</span>
                      <span className="text-[11px] text-ct-2 block mt-0.5">{MODE_META[presetMode].label} · {formatDuration(preset.totalSeconds)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { applyPreset(preset); setEditingPreset(preset); setPresetName(preset.name); setShowPresetForm(true); setShowConfig(true) }}
                      className="w-11 h-11 rounded-xl bg-slate-700/40 flex items-center justify-center text-ct-2 active:text-cyan-400 active:bg-cyan-400/10"
                      aria-label={t('timer.editPreset')}
                    >
                      <Pencil size={14} />
                    </button>
                    {pendingDeleteId === preset.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          const presetId = preset.id
                          if (!presetId) return
                          void (async () => {
                            await deleteTimerPreset(presetId)
                            setPendingDeleteId(null)
                          })()
                        }}
                        className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 active:bg-red-500/30 animate-pulse"
                        aria-label={t('timer.confirmDelete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <button type="button" onClick={() => setPendingDeleteId(preset.id ?? null)} className="w-11 h-11 rounded-xl bg-slate-700/40 flex items-center justify-center text-ct-2 active:text-red-400 active:bg-red-400/10" aria-label={t('timer.deletePreset')}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showConfig && timer.phase === 'idle') {
    const summary =
      mode === 'tabata'
        ? `${tabataRounds} rounds: ${tabataWork}s work / ${tabataRest}s rest`
        : mode === 'emom'
          ? `${emomRounds} ${t('timer.rounds').toLowerCase()} every ${emomInterval} min`
          : sets > 1 && hasRest
            ? `${sets} × ${formatDuration(workMin * 60 + workSec)} work + ${formatDuration(restMin * 60 + restSec)} rest`
            : sets > 1
              ? `${sets} × ${formatDuration(workMin * 60 + workSec)}`
              : formatDuration(workMin * 60 + workSec)

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={resetToLauncher} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.goBack')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl font-bold ${MODE_META[mode].textClass}`}>{MODE_META[mode].icon} {MODE_META[mode].label}</h1>
        </div>

        {showPresetForm && (
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-cyan-400/20">
            <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold mb-2">{t(editingPreset ? 'timer.editPreset' : 'timer.newPreset')}</p>
            <input type="text" value={presetName} onChange={event => setPresetName(event.target.value)} placeholder={t('timer.presetNamePlaceholder')} className="w-full bg-ct-elevated rounded-xl py-3 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px] mb-3" autoFocus />
            <div className="flex gap-1.5 flex-wrap">
              {MODE_ORDER.map(item => (
                <button key={item} type="button" onClick={() => { setMode(item); applyDefaults(item) }} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mode === item ? `${MODE_META[item].borderClass} border bg-opacity-20` : 'bg-ct-elevated text-ct-2 border border-transparent'}`}>
                  {MODE_META[item].icon} {MODE_META[item].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(mode === 'amrap' || mode === 'fortime' || mode === 'rest') && (
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border space-y-5">
            <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold">{t(mode === 'rest' ? 'timer.restDuration' : 'timer.workDuration')}</p>
            <div className="flex justify-center gap-6">
              <Stepper label="Minutes" unit="min" value={workMin} min={0} max={60} onChange={setWorkMin} />
              <Stepper label="Seconds" unit="sec" value={workSec} min={0} max={59} onChange={setWorkSec} />
            </div>

            {mode !== 'rest' && (
              <>
                <div className="border-t border-ct-border pt-4">
                  <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.sets')}</p>
                  <div className="flex justify-center">
                    <Stepper label="Number of Sets" unit="sets" value={sets} min={1} max={10} onChange={setSets} />
                  </div>
                </div>

                {sets > 1 && (
                  <div className="border-t border-ct-border pt-4">
                    <button type="button" onClick={() => setHasRest(!hasRest)} className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-colors min-h-[44px] ${hasRest ? 'bg-amber-500/10 border-amber-400/30 text-amber-400' : 'bg-slate-700/40 border-slate-600/50 text-ct-2'}`}>
                      <span className="text-sm font-semibold">{t('timer.restBetween')}</span>
                      <span className="text-xs font-bold">{hasRest ? 'ON' : 'OFF'}</span>
                    </button>
                    {hasRest && (
                      <div className="flex justify-center gap-6 mt-4">
                        <Stepper label="Rest Min" unit="min" value={restMin} min={0} max={10} onChange={setRestMin} />
                        <Stepper label="Rest Sec" unit="sec" value={restSec} min={0} max={59} onChange={setRestSec} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'emom' && (
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border space-y-5">
            <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold">{t('timer.totalDuration')}</p>
            <div className="flex justify-center"><Stepper label="Minutes" unit="min" value={workMin} min={1} max={60} onChange={setWorkMin} /></div>
            <div className="border-t border-ct-border pt-4">
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.intervalEvery')}</p>
              <div className="flex gap-2 justify-center">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" onClick={() => setEmomInterval(value)} className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center min-w-[44px] min-h-[44px] ${emomInterval === value ? 'bg-green-500/20 text-green-400 border border-green-400/40' : 'bg-ct-elevated text-ct-2'}`}>{value} min</button>)}</div>
              <p className="text-[11px] text-ct-2 text-center mt-2">{emomRounds} {t('timer.rounds').toLowerCase()} of {emomInterval} min each</p>
            </div>
          </div>
        )}

        {mode === 'tabata' && (
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border space-y-5">
            <div>
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.work')} / {t('timer.rest')} (seconds)</p>
              <div className="flex justify-center gap-8">
                <Stepper label={t('timer.work')} unit="sec" value={tabataWork} min={5} max={120} onChange={setTabataWork} />
                <Stepper label={t('timer.rest')} unit="sec" value={tabataRest} min={5} max={60} onChange={setTabataRest} />
              </div>
            </div>
            <div className="border-t border-ct-border pt-4">
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.rounds')}</p>
              <div className="flex gap-2 justify-center flex-wrap">{[4, 6, 8, 10, 12, 16, 20].map(value => <button key={value} type="button" onClick={() => setTabataRounds(value)} className={`px-3.5 py-2 rounded-xl text-sm font-bold min-h-[44px] ${tabataRounds === value ? 'bg-red-500/20 text-red-400 border border-red-400/40' : 'bg-ct-elevated text-ct-2'}`}>{value}</button>)}</div>
              <p className="text-[11px] text-ct-2 text-center mt-2">Total: {formatDuration((tabataWork + tabataRest) * tabataRounds)}</p>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-ct-2">{summary}</div>
        {showPresetForm && (
          <button type="button" onClick={() => void savePreset()} disabled={!presetName.trim()} className={`w-full flex items-center justify-center gap-2 py-4 rounded-ct-lg text-base font-bold transition-all min-h-[52px] ${presetName.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-ct-1 active:scale-[0.98]' : 'bg-ct-elevated text-ct-2'}`}>
            <Save size={18} />{t(editingPreset ? 'timer.updatePreset' : 'timer.savePreset')}
          </button>
        )}
        <button type="button" onClick={timer.startTimer} className="w-full bg-cyan-500 text-slate-900 font-bold py-4 rounded-ct-lg text-lg active:scale-[0.98] transition-transform min-h-[52px]">? {t('timer.startTimer')}</button>
      </div>
    )
  }

  const minutes = Math.floor(timer.remaining / 60)
  const seconds = timer.remaining % 60
  const progressStroke = timer.phase === 'done' ? '#22c55e' : timer.phase === 'countdown' ? '#a78bfa' : timer.remaining <= 3 ? '#ef4444' : timer.phase === 'rest' ? '#f59e0b' : '#22d3ee'
  const backgroundClass = timer.phase === 'rest' ? 'bg-amber-950/20' : timer.phase === 'done' ? 'bg-green-950/20' : ''

  return (
    <div className={`flex flex-col items-center justify-center min-h-[70vh] space-y-5 transition-colors ${backgroundClass}`}>
      <div className="flex items-center gap-3 self-start">
        <button type="button" onClick={resetToLauncher} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.goBack')}>
          <ArrowLeft size={20} />
        </button>
        <span className={`text-sm font-bold ${MODE_META[mode].textClass}`}>{MODE_META[mode].icon} {MODE_META[mode].label}</span>
      </div>

      <div className="text-center">
        {timer.phase === 'countdown' && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-purple-300 uppercase tracking-widest">{timer.countdownVal > 5 ? t('timer.getReady') : ''}</p>
            <p className={`font-black animate-pulse ${timer.countdownVal <= 5 ? 'text-8xl text-cyan-400' : 'text-6xl text-purple-400'}`}>{timer.countdownVal}</p>
            {timer.countdownVal <= 5 && <p className="text-xs text-ct-2 font-semibold">{timer.countdownVal === 1 ? 'GO!' : ''}</p>}
          </div>
        )}

        {timer.phase === 'done' && (
          <div className="space-y-2">
            <p className="text-4xl">??</p>
            <p className="text-2xl font-black text-green-400">{t('timer.done')}</p>
            <p className="text-sm text-green-300/70">{t('timer.greatEffort')}</p>
          </div>
        )}

        {(timer.phase === 'work' || timer.phase === 'rest') && (
          <>
            {mode === 'tabata' && <p className="text-sm text-ct-2 mb-1">{t('timer.rounds')} {timer.currentRound} / {tabataRounds}<span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${timer.phase === 'work' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{t(timer.phase === 'work' ? 'timer.work' : 'timer.rest')}</span></p>}
            {mode === 'emom' && <p className="text-sm text-ct-2 mb-1">{t('timer.rounds')} {timer.currentRound} / {timer.emomTotalRounds}</p>}
            {(mode === 'amrap' || mode === 'fortime') && sets > 1 && <p className="text-sm text-ct-2 mb-1">Set {timer.currentSet} / {sets}{timer.phase === 'rest' && <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">{t('timer.rest')}</span>}</p>}
            {(mode === 'amrap' || mode === 'fortime') && sets === 1 && timer.phase === 'work' && <p className="text-xs text-ct-2 mb-1">{MODE_META[mode].label}</p>}
          </>
        )}
      </div>

      {timer.phase !== 'countdown' && (
        <div className="relative w-56 h-56">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Timer: ${minutes}:${seconds.toString().padStart(2, '0')}`}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={progressStroke} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(timer.phase === 'done' ? 1 : timer.progress) * 283} 283`} className="transition-all duration-1000 linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-mono font-black tabular-nums ${timer.remaining <= 3 && timer.phase !== 'done' ? 'text-red-400' : 'text-ct-1'}`}>{timer.phase === 'done' ? '0:00' : `${minutes}:${seconds.toString().padStart(2, '0')}`}</span>
            {timer.phase === 'rest' && <span className="text-xs text-amber-400 font-bold mt-1">{t('timer.rest')}</span>}
            {timer.remaining <= 10 && timer.remaining > 0 && timer.phase !== 'done' && <span className="text-[11px] text-red-400/60 font-semibold mt-1">{t('timer.finalCountdown')}</span>}
          </div>
        </div>
      )}

      {mode === 'emom' && timer.phase !== 'countdown' && timer.phase !== 'done' && timer.emomTotalRounds <= 20 && <ProgressDots total={timer.emomTotalRounds} current={timer.currentRound} colorClass="bg-green-400" />}
      {mode === 'tabata' && timer.phase !== 'countdown' && timer.phase !== 'done' && tabataRounds <= 20 && <ProgressDots total={tabataRounds} current={timer.currentRound} colorClass="bg-red-400" />}
      {(mode === 'amrap' || mode === 'fortime') && sets > 1 && timer.phase !== 'countdown' && timer.phase !== 'done' && <ProgressDots total={sets} current={timer.currentSet} colorClass="bg-cyan-400" />}

      {timer.phase !== 'countdown' && (
        <div className="flex gap-4 items-center">
          <button type="button" onClick={timer.reset} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center active:bg-ct-elevated min-w-[44px] min-h-[44px]" aria-label={t('timer.reset')}>
            <RotateCcw size={20} className="text-ct-2" />
          </button>
          {timer.phase !== 'done' ? (
            <button type="button" onClick={() => timer.setIsRunning(!timer.isRunning)} aria-label={t(timer.isRunning ? 'timer.pause' : 'timer.resume')} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${timer.isRunning ? 'bg-red-500 shadow-red-500/20' : 'bg-cyan-500 shadow-cyan-500/20'}`}>
              {timer.isRunning ? <Pause size={32} className="text-ct-1" /> : <Play size={32} className="text-slate-900 ml-1" />}
            </button>
          ) : (
            <button type="button" onClick={() => { timer.reset(); setShowConfig(true) }} aria-label={t('timer.restart')} className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <RotateCcw size={28} className="text-ct-1" />
            </button>
          )}
          <div className="w-14 h-14" />
        </div>
      )}
    </div>
  )
}
