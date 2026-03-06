import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import type { TimerMode, TimerPreset } from '../types'
import { useTimerEngine } from '../hooks/useTimerEngine'
import { Play, Pause, RotateCcw, X, ChevronLeft, Plus, Minus, Trash2, Edit3, Save, Check } from 'lucide-react'

export function TimerPage({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { timerPresets, loadTimerPresets, saveTimerPreset, deleteTimerPreset } = useStore()

  const [mode, setMode] = useState<TimerMode | null>(null)
  const [configuring, setConfiguring] = useState(false)
  const [showPresetForm, setShowPresetForm] = useState(false)
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null)
  const [presetName, setPresetName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Config state
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

  const engine = useTimerEngine({
    mode: mode || 'amrap', workMin, workSec, restMin, restSec, sets, hasRest,
    emomInterval, tabataWork, tabataRest, tabataRounds,
  })

  useEffect(() => { loadTimerPresets() }, [])

  const goBack = () => {
    engine.reset()
    if (configuring) { setConfiguring(false); setMode(null) }
    else setMode(null)
  }

  function applyDefaults(m: TimerMode) {
    if (m === 'amrap') { setWorkMin(12); setWorkSec(0); setRestMin(1); setRestSec(0); setSets(1); setHasRest(false) }
    if (m === 'emom') { setWorkMin(10); setWorkSec(0); setEmomInterval(1); setSets(1); setHasRest(false) }
    if (m === 'fortime') { setWorkMin(20); setWorkSec(0); setSets(1); setHasRest(false) }
    if (m === 'tabata') { setTabataWork(20); setTabataRest(10); setTabataRounds(8) }
    if (m === 'rest') { setWorkMin(1); setWorkSec(0); setSets(1); setHasRest(false) }
  }

  function selectPreset(preset: TimerPreset) {
    setMode(preset.mode)
    setWorkMin(Math.floor(preset.totalSeconds / 60))
    setWorkSec(preset.totalSeconds % 60)
    setSets(1); setHasRest(false)
    if (preset.mode === 'emom') setEmomInterval(Math.floor((preset.workSeconds || 60) / 60))
    if (preset.mode === 'tabata') { setTabataWork(preset.workSeconds || 20); setTabataRest(preset.restSeconds || 10); setTabataRounds(preset.rounds || 8) }
    if (preset.restSeconds && preset.restSeconds > 0 && preset.mode !== 'tabata') {
      setHasRest(true); setRestMin(Math.floor(preset.restSeconds / 60)); setRestSec(preset.restSeconds % 60)
    }
    if (preset.rounds && preset.rounds > 1 && preset.mode !== 'emom' && preset.mode !== 'tabata') setSets(preset.rounds)
  }

  // Build preset from current config
  function buildPresetFromConfig(): Omit<TimerPreset, 'id' | 'name'> {
    const m = mode || 'amrap'
    if (m === 'tabata') {
      return { mode: m, totalSeconds: (tabataWork + tabataRest) * tabataRounds, rounds: tabataRounds, workSeconds: tabataWork, restSeconds: tabataRest }
    }
    if (m === 'emom') {
      return { mode: m, totalSeconds: workMin * 60 + workSec, workSeconds: emomInterval * 60 }
    }
    const base: Omit<TimerPreset, 'id' | 'name'> = { mode: m, totalSeconds: workMin * 60 + workSec }
    if (sets > 1) base.rounds = sets
    if (hasRest) base.restSeconds = restMin * 60 + restSec
    return base
  }

  async function handleSavePreset() {
    if (!presetName.trim()) return
    const data = buildPresetFromConfig()
    if (editingPreset?.id) {
      await saveTimerPreset({ ...data, id: editingPreset.id, name: presetName.trim() })
    } else {
      await saveTimerPreset({ ...data, name: presetName.trim() })
    }
    setPresetName('')
    setShowPresetForm(false)
    setEditingPreset(null)
  }

  async function handleDeletePreset(id: number) {
    await deleteTimerPreset(id)
    setConfirmDeleteId(null)
  }

  function startEditPreset(preset: TimerPreset) {
    selectPreset(preset)
    setEditingPreset(preset)
    setPresetName(preset.name)
    setShowPresetForm(true)
    setConfiguring(true)
  }

  const Adjuster = ({ value, onChange, min, max, label, unit }: {
    value: number; onChange: (v: number) => void; min: number; max: number; label: string; unit: string
  }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-ct-2 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Decrease ${label}`}
          className="w-9 h-9 rounded-full bg-ct-elevated flex items-center justify-center active:bg-ct-elevated min-w-[44px] min-h-[44px]">
          <Minus size={16} className="text-ct-2" />
        </button>
        <span className="text-2xl font-bold text-ct-1 w-12 text-center font-mono tabular-nums">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${label}`}
          className="w-9 h-9 rounded-full bg-ct-elevated flex items-center justify-center active:bg-ct-elevated min-w-[44px] min-h-[44px]">
          <Plus size={16} className="text-ct-2" />
        </button>
      </div>
      <span className="text-[11px] text-ct-2">{unit}</span>
    </div>
  )

  const modeLabels: Record<string, string> = { amrap: 'AMRAP', emom: 'EMOM', fortime: 'For Time', tabata: 'Tabata', rest: 'Rest Timer' }
  const modeColors: Record<string, string> = { amrap: 'text-cyan-400', emom: 'text-green-400', fortime: 'text-orange-400', tabata: 'text-red-400', rest: 'text-purple-400' }
  const modeBorders: Record<string, string> = { amrap: 'border-cyan-400/40 text-cyan-400', emom: 'border-green-400/40 text-green-400', fortime: 'border-orange-400/40 text-orange-400', tabata: 'border-red-400/40 text-red-400', rest: 'border-purple-400/40 text-purple-400' }
  const modeEmojis: Record<string, string> = { amrap: '\uD83D\uDD25', emom: '\u23F1\uFE0F', fortime: '\uD83C\uDFC3', tabata: '\uD83D\uDCA5', rest: '\uD83D\uDE0C' }
  const doneEmoji = '\uD83C\uDF89'
  const timerEmoji = '\u23F1\uFE0F'

  // ==================== MODE SELECTION ====================
  if (!mode) {
    const modes = [
      { id: 'amrap' as TimerMode, label: t('timer.amrap'), desc: t('timer.amrapDesc') },
      { id: 'emom' as TimerMode, label: t('timer.emom'), desc: t('timer.emomDesc') },
      { id: 'fortime' as TimerMode, label: t('timer.forTime'), desc: t('timer.forTimeDesc') },
      { id: 'tabata' as TimerMode, label: t('timer.tabata'), desc: t('timer.tabataDesc') },
      { id: 'rest' as TimerMode, label: t('timer.restTimer'), desc: t('timer.restTimerDesc') },
    ]
    return (
      <div className="space-y-4 stagger-children">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-ct-1 flex items-center gap-2">
            <span className="text-2xl">{timerEmoji}</span>
            {t('timer.title')}
          </h1>
          <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.close')}><X size={20} /></button>
        </div>
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setConfiguring(true); applyDefaults(m.id) }}
            className={`w-full bg-ct-surface border rounded-ct-lg p-4 text-left active:bg-ct-elevated/50 transition-colors ${modeBorders[m.id]}`}>
            <p className="text-base font-bold flex items-center gap-2">
              <span>{modeEmojis[m.id]}</span> {m.label}
            </p>
            <p className="text-[11px] text-ct-2 mt-0.5">{m.desc}</p>
          </button>
        ))}

        {/* Quick Presets with CRUD */}
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('timer.quickPresets')}</p>
            <button onClick={() => { setShowPresetForm(true); setPresetName(''); setEditingPreset(null); setMode('amrap'); setConfiguring(true); applyDefaults('amrap') }}
              className="flex items-center gap-1 text-xs text-cyan-400 font-semibold px-2 py-1 rounded-lg active:bg-cyan-400/10 min-h-[44px]">
              <Plus size={14} /> {t('timer.addPreset')}
            </button>
          </div>

          {timerPresets.length === 0 ? (
            <p className="text-xs text-ct-2 text-center py-3">{t('timer.noPresets')}</p>
          ) : (
            <div className="space-y-2">
              {timerPresets.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <button onClick={() => { selectPreset(p); setConfiguring(false) }}
                    className="flex-1 bg-ct-elevated/60 border border-ct-border/50 rounded-xl px-3.5 py-2.5 text-left active:bg-ct-elevated/50 min-h-[44px]">
                    <span className="text-sm text-ct-1 font-medium flex items-center gap-1.5">
                      <span className="text-xs">{modeEmojis[p.mode] || timerEmoji}</span>
                      {p.name}
                    </span>
                    <span className="text-[11px] text-ct-2 block mt-0.5">
                      {modeLabels[p.mode]} · {Math.floor(p.totalSeconds / 60)}:{(p.totalSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </button>
                  <button onClick={() => startEditPreset(p)}
                    className="w-11 h-11 rounded-xl bg-ct-elevated/40 flex items-center justify-center text-ct-2 active:text-cyan-400 active:bg-cyan-400/10"
                    aria-label={t('timer.editPreset')}>
                    <Edit3 size={14} />
                  </button>
                  {confirmDeleteId === p.id ? (
                    <button onClick={() => handleDeletePreset(p.id!)}
                      className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 active:bg-red-500/30 animate-pulse"
                      aria-label={t('timer.confirmDelete')}>
                      <Check size={14} />
                    </button>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(p.id!)}
                      className="w-11 h-11 rounded-xl bg-ct-elevated/40 flex items-center justify-center text-ct-2 active:text-red-400 active:bg-red-400/10"
                      aria-label={t('timer.deletePreset')}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==================== CONFIGURATION ====================
  if (configuring && engine.phase === 'idle') {
    const emomTotalRounds = mode === 'emom' ? Math.floor((workMin * 60 + workSec) / (emomInterval * 60)) : 1
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { goBack(); setShowPresetForm(false); setEditingPreset(null) }} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.goBack')}><ChevronLeft size={20} /></button>
          <h1 className={`text-xl font-bold ${modeColors[mode]}`}>
            {modeEmojis[mode]} {modeLabels[mode]}
          </h1>
        </div>

        {/* Mode selector when creating preset */}
        {showPresetForm && (
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-cyan-400/20">
            <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold mb-2">
              {editingPreset ? t('timer.editPreset') : t('timer.newPreset')}
            </p>
            <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)}
              placeholder={t('timer.presetNamePlaceholder')}
              className="w-full bg-ct-elevated rounded-xl py-3 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px] mb-3"
              autoFocus />
            <div className="flex gap-1.5 flex-wrap">
              {(['amrap', 'emom', 'fortime', 'tabata', 'rest'] as TimerMode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); applyDefaults(m) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mode === m ? `${modeBorders[m]} border bg-opacity-20` : 'bg-ct-elevated text-ct-2 border border-transparent'}`}>
                  {modeEmojis[m]} {modeLabels[m]}
                </button>
              ))}
            </div>
          </div>
        )}

        {(mode === 'amrap' || mode === 'fortime' || mode === 'rest') && (
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border space-y-5">
            <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold">{mode === 'rest' ? t('timer.restDuration') : t('timer.workDuration')}</p>
            <div className="flex justify-center gap-6">
              <Adjuster value={workMin} onChange={setWorkMin} min={0} max={60} label="Minutes" unit="min" />
              <Adjuster value={workSec} onChange={setWorkSec} min={0} max={59} label="Seconds" unit="sec" />
            </div>
            {mode !== 'rest' && (
              <>
                <div className="border-t border-ct-border pt-4">
                  <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.sets')}</p>
                  <div className="flex justify-center"><Adjuster value={sets} onChange={setSets} min={1} max={10} label="Number of Sets" unit="sets" /></div>
                </div>
                {sets > 1 && (
                  <div className="border-t border-ct-border pt-4">
                    <button onClick={() => setHasRest(!hasRest)}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-colors min-h-[44px] ${hasRest ? 'bg-amber-500/10 border-amber-400/30 text-amber-400' : 'bg-ct-elevated/40 border-ct-border/50 text-ct-2'}`}>
                      <span className="text-sm font-semibold">{t('timer.restBetween')}</span>
                      <span className="text-xs font-bold">{hasRest ? 'ON' : 'OFF'}</span>
                    </button>
                    {hasRest && (
                      <div className="flex justify-center gap-6 mt-4">
                        <Adjuster value={restMin} onChange={setRestMin} min={0} max={10} label="Rest Min" unit="min" />
                        <Adjuster value={restSec} onChange={setRestSec} min={0} max={59} label="Rest Sec" unit="sec" />
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
            <div className="flex justify-center gap-6"><Adjuster value={workMin} onChange={setWorkMin} min={1} max={60} label="Minutes" unit="min" /></div>
            <div className="border-t border-ct-border pt-4">
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.intervalEvery')}</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setEmomInterval(v)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center min-w-[44px] min-h-[44px] ${emomInterval === v ? 'bg-green-500/20 text-green-400 border border-green-400/40' : 'bg-ct-elevated text-ct-2'}`}>{v} min</button>
                ))}
              </div>
              <p className="text-[11px] text-ct-2 text-center mt-2">{emomTotalRounds} {t('timer.rounds').toLowerCase()} of {emomInterval} min each</p>
            </div>
          </div>
        )}

        {mode === 'tabata' && (
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border space-y-5">
            <div>
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.work')} / {t('timer.rest')} (seconds)</p>
              <div className="flex justify-center gap-8">
                <Adjuster value={tabataWork} onChange={setTabataWork} min={5} max={120} label={t('timer.work')} unit="sec" />
                <Adjuster value={tabataRest} onChange={setTabataRest} min={5} max={60} label={t('timer.rest')} unit="sec" />
              </div>
            </div>
            <div className="border-t border-ct-border pt-4">
              <p className="text-xs text-ct-2 uppercase tracking-wider font-semibold mb-3">{t('timer.rounds')}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[4, 6, 8, 10, 12, 16, 20].map(v => (
                  <button key={v} onClick={() => setTabataRounds(v)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold min-h-[44px] ${tabataRounds === v ? 'bg-red-500/20 text-red-400 border border-red-400/40' : 'bg-ct-elevated text-ct-2'}`}>{v}</button>
                ))}
              </div>
              <p className="text-[11px] text-ct-2 text-center mt-2">
                Total: {Math.floor((tabataWork + tabataRest) * tabataRounds / 60)}:{(((tabataWork + tabataRest) * tabataRounds) % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-ct-2 mb-2">
          {mode === 'tabata' ? `${tabataRounds} rounds: ${tabataWork}s work / ${tabataRest}s rest`
            : mode === 'emom' ? `${emomTotalRounds} rounds every ${emomInterval} min`
            : sets > 1 && hasRest ? `${sets} × ${workMin}:${workSec.toString().padStart(2, '0')} work + ${restMin}:${restSec.toString().padStart(2, '0')} rest`
            : sets > 1 ? `${sets} × ${workMin}:${workSec.toString().padStart(2, '0')}`
            : `${workMin}:${workSec.toString().padStart(2, '0')}`}
        </div>

        {/* Save preset button (when in preset creation/edit mode) */}
        {showPresetForm && (
          <button onClick={handleSavePreset} disabled={!presetName.trim()}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-ct-lg text-base font-bold transition-all min-h-[52px] ${presetName.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-ct-1 active:scale-[0.98]' : 'bg-ct-elevated text-ct-2'}`}>
            <Save size={20} />
            {editingPreset ? t('timer.updatePreset') : t('timer.savePreset')}
          </button>
        )}

        <button onClick={engine.startTimer}
          className="w-full bg-cyan-500 text-slate-900 font-bold py-4 rounded-ct-lg text-lg active:scale-[0.98] transition-transform min-h-[52px]">
          {'\u25B6'} {t('timer.startTimer')}
        </button>
      </div>
    )
  }

  // ==================== ACTIVE / DONE ====================
  const { phase, remaining, isRunning, currentSet, currentRound, countdownVal, emomTotalRounds, progress } = engine
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  const ringColor = phase === 'done' ? '#22c55e' : phase === 'countdown' ? '#a78bfa' : remaining <= 3 ? '#ef4444' : phase === 'rest' ? '#f59e0b' : '#22d3ee'
  const bgTint = phase === 'rest' ? 'bg-amber-950/20' : phase === 'done' ? 'bg-green-950/20' : ''

  return (
    <div className={`flex flex-col items-center justify-center min-h-[70vh] space-y-5 transition-colors ${bgTint}`}>
      <div className="flex items-center gap-3 self-start">
        <button onClick={goBack} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label={t('common.goBack')}><ChevronLeft size={20} /></button>
        <span className={`text-sm font-bold ${modeColors[mode]}`}>{modeEmojis[mode]} {modeLabels[mode]}</span>
      </div>

      <div className="text-center">
        {phase === 'countdown' && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-purple-300 uppercase tracking-widest">
              {countdownVal > 5 ? t('timer.getReady') : ''}
            </p>
            <p className={`font-black animate-pulse ${countdownVal <= 5 ? 'text-8xl text-cyan-400' : 'text-6xl text-purple-400'}`}>
              {countdownVal}
            </p>
            {countdownVal <= 5 && (
              <p className="text-xs text-ct-2 font-semibold">{countdownVal === 1 ? 'GO!' : ''}</p>
            )}
          </div>
        )}
        {phase === 'done' && (
          <div className="space-y-2">
            <p className="text-4xl">{doneEmoji}</p>
            <p className="text-2xl font-black text-green-400">{t('timer.done')}</p>
            <p className="text-sm text-green-300/70">{t('timer.greatEffort')}</p>
          </div>
        )}
        {(phase === 'work' || phase === 'rest') && (
          <>
            {mode === 'tabata' && (
              <p className="text-sm text-ct-2 mb-1">
                {t('timer.rounds')} {currentRound} / {tabataRounds}
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${phase === 'work' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {phase === 'work' ? t('timer.work') : t('timer.rest')}
                </span>
              </p>
            )}
            {mode === 'emom' && <p className="text-sm text-ct-2 mb-1">{t('timer.rounds')} {currentRound} / {emomTotalRounds}</p>}
            {(mode === 'amrap' || mode === 'fortime') && sets > 1 && (
              <p className="text-sm text-ct-2 mb-1">
                Set {currentSet} / {sets}
                {phase === 'rest' && <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">{t('timer.rest')}</span>}
              </p>
            )}
            {(mode === 'amrap' || mode === 'fortime') && sets === 1 && phase === 'work' && (
              <p className="text-xs text-ct-2 mb-1">{modeLabels[mode]}</p>
            )}
          </>
        )}
      </div>

      {phase !== 'countdown' && (
        <div className="relative w-56 h-56">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Timer: ${minutes}:${secs.toString().padStart(2, '0')}`}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(phase === 'done' ? 1 : progress) * 283} 283`} className="transition-all duration-1000 linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-mono font-black tabular-nums ${remaining <= 3 && phase !== 'done' ? 'text-red-400' : 'text-ct-1'}`}>
              {phase === 'done' ? '0:00' : `${minutes}:${secs.toString().padStart(2, '0')}`}
            </span>
            {phase === 'rest' && <span className="text-xs text-amber-400 font-bold mt-1">{t('timer.rest')}</span>}
            {remaining <= 10 && remaining > 0 && phase !== 'done' && (
              <span className="text-[11px] text-red-400/60 font-semibold mt-1">{t('timer.finalCountdown')}</span>
            )}
          </div>
        </div>
      )}

      {/* Round dots */}
      {mode === 'emom' && phase !== 'countdown' && phase !== 'done' && emomTotalRounds <= 20 && (
        <RoundDots total={emomTotalRounds} current={currentRound} color="bg-green-400" />
      )}
      {mode === 'tabata' && phase !== 'countdown' && phase !== 'done' && tabataRounds <= 20 && (
        <RoundDots total={tabataRounds} current={currentRound} color="bg-red-400" />
      )}
      {(mode === 'amrap' || mode === 'fortime') && sets > 1 && phase !== 'countdown' && phase !== 'done' && (
        <RoundDots total={sets} current={currentSet} color="bg-cyan-400" />
      )}

      {phase !== 'countdown' && (
        <div className="flex gap-4 items-center">
          <button onClick={engine.reset} className="w-14 h-14 rounded-full bg-ct-surface border border-ct-border flex items-center justify-center active:bg-ct-elevated min-w-[44px] min-h-[44px]" aria-label={t('timer.reset')}>
            <RotateCcw size={20} className="text-ct-2" />
          </button>
          {phase !== 'done' ? (
            <button onClick={() => engine.setIsRunning(!isRunning)} aria-label={isRunning ? t('timer.pause') : t('timer.resume')}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${isRunning ? 'bg-red-500 shadow-red-500/20' : 'bg-cyan-500 shadow-cyan-500/20'}`}>
              {isRunning ? <Pause size={32} className="text-ct-1" /> : <Play size={32} className="text-slate-900 ml-1" />}
            </button>
          ) : (
            <button onClick={() => { engine.reset(); setConfiguring(true) }} aria-label={t('timer.restart')}
              className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <RotateCcw size={28} className="text-ct-1" />
            </button>
          )}
          <div className="w-14 h-14" />
        </div>
      )}
    </div>
  )
}

function RoundDots({ total, current, color }: { total: number; current: number; color: string }) {
  return (
    <div className="flex gap-1.5 flex-wrap justify-center max-w-[280px]" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i + 1 < current ? color : i + 1 === current ? `${color} animate-pulse` : 'bg-ct-elevated'}`} />
      ))}
    </div>
  )
}
