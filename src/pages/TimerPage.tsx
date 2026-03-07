import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import type { TimerMode, TimerPreset } from '../types'
import { useTimerEngine } from '../hooks/useTimerEngine'
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Save,
  Check,
  Flame,
  Clock3,
  Flag,
  Gauge,
  TimerReset,
  type LucideIcon,
} from 'lucide-react'

interface TimerPageProps {
  onClose?: () => void
}

function formatTimerValue(minutes: number, seconds: number): string {
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getSessionSummary(
  mode: TimerMode,
  workMin: number,
  workSec: number,
  restMin: number,
  restSec: number,
  sets: number,
  hasRest: boolean,
  emomInterval: number,
  tabataWork: number,
  tabataRest: number,
  tabataRounds: number,
): string {
  if (mode === 'tabata') return `${tabataRounds} rounds · ${tabataWork}s work + ${tabataRest}s rest`
  if (mode === 'emom') {
    const totalSeconds = workMin * 60 + workSec
    const totalRounds = Math.max(1, Math.floor(totalSeconds / (emomInterval * 60)))
    return `${totalRounds} rounds · every ${emomInterval} min`
  }
  if (sets > 1 && hasRest) return `${sets} x ${formatTimerValue(workMin, workSec)} work + ${formatTimerValue(restMin, restSec)} rest`
  if (sets > 1) return `${sets} x ${formatTimerValue(workMin, workSec)} work`
  if (mode === 'amrap') return `${formatTimerValue(workMin, workSec)} continuous work`
  if (mode === 'fortime') return `${formatTimerValue(workMin, workSec)} time cap`
  if (mode === 'rest') return `${formatTimerValue(workMin, workSec)} recovery`
  return formatTimerValue(workMin, workSec)
}

function Adjuster({
  value,
  onChange,
  min,
  max,
  label,
  unit,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label: string
  unit: string
}) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,34,60,0.78),rgba(15,22,44,0.92))] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ct-2 font-semibold">{label}</p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            aria-label={`Decrease ${label}`}
            className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/6 flex items-center justify-center active:bg-white/[0.1] min-w-[44px] min-h-[44px]"
          >
            <Minus size={16} className="text-ct-2" />
          </button>
          <span className="min-w-[3rem] text-center text-[2.25rem] leading-none font-black text-ct-1 tabular-nums">{value}</span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            aria-label={`Increase ${label}`}
            className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/15 flex items-center justify-center active:bg-cyan-500/20 min-w-[44px] min-h-[44px]"
          >
            <Plus size={16} className="text-cyan-300" />
          </button>
        </div>
        <p className="mt-3 text-[11px] text-ct-2">{unit}</p>
      </div>
    </div>
  )
}

function TimerModeGlyph({
  icon: Icon,
  tone,
  compact = false,
}: {
  icon: LucideIcon
  tone: string
  compact?: boolean
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border ${compact ? 'h-8 w-8' : 'h-12 w-12'} ${tone}`}
      aria-hidden="true"
    >
      <Icon size={compact ? 16 : 22} />
    </span>
  )
}

export function TimerPage({ onClose }: TimerPageProps) {
  const { t } = useTranslation()
  const { timerPresets, loadTimerPresets, saveTimerPreset, deleteTimerPreset } = useStore()

  const [mode, setMode] = useState<TimerMode | null>(null)
  const [configuring, setConfiguring] = useState(false)
  const [showPresetForm, setShowPresetForm] = useState(false)
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null)
  const [presetName, setPresetName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const [workMin, setWorkMin] = useState(12)
  const [workSec, setWorkSec] = useState(0)
  const [restMin, setRestMin] = useState(1)
  const [restSec, setRestSec] = useState(0)
  const [sets, setSets] = useState(3)
  const [hasRest, setHasRest] = useState(true)
  const [emomInterval, setEmomInterval] = useState(1)
  const [tabataWork, setTabataWork] = useState(20)
  const [tabataRest, setTabataRest] = useState(10)
  const [tabataRounds, setTabataRounds] = useState(8)

  const engine = useTimerEngine({
    mode: mode || 'amrap',
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
    loadTimerPresets()
  }, [loadTimerPresets])

  function applyDefaults(nextMode: TimerMode) {
    if (nextMode === 'amrap') {
      setWorkMin(12)
      setWorkSec(0)
      setRestMin(1)
      setRestSec(0)
      setSets(3)
      setHasRest(true)
    }
    if (nextMode === 'emom') {
      setWorkMin(10)
      setWorkSec(0)
      setEmomInterval(1)
      setSets(1)
      setHasRest(false)
    }
    if (nextMode === 'fortime') {
      setWorkMin(20)
      setWorkSec(0)
      setSets(1)
      setHasRest(false)
    }
    if (nextMode === 'tabata') {
      setTabataWork(20)
      setTabataRest(10)
      setTabataRounds(8)
    }
    if (nextMode === 'rest') {
      setWorkMin(1)
      setWorkSec(0)
      setSets(1)
      setHasRest(false)
    }
  }

  function goBack() {
    engine.reset()
    if (configuring) {
      setConfiguring(false)
      setMode(null)
      return
    }
    setMode(null)
  }

  function selectPreset(preset: TimerPreset) {
    setMode(preset.mode)
    setWorkMin(Math.floor(preset.totalSeconds / 60))
    setWorkSec(preset.totalSeconds % 60)
    setSets(1)
    setHasRest(false)

    if (preset.mode === 'emom') {
      setEmomInterval(Math.floor((preset.workSeconds || 60) / 60))
    }

    if (preset.mode === 'tabata') {
      setTabataWork(preset.workSeconds || 20)
      setTabataRest(preset.restSeconds || 10)
      setTabataRounds(preset.rounds || 8)
    }

    if (preset.restSeconds && preset.restSeconds > 0 && preset.mode !== 'tabata') {
      setHasRest(true)
      setRestMin(Math.floor(preset.restSeconds / 60))
      setRestSec(preset.restSeconds % 60)
    }

    if (preset.rounds && preset.rounds > 1 && preset.mode !== 'emom' && preset.mode !== 'tabata') {
      setSets(preset.rounds)
    }
  }

  function buildPresetFromConfig(): Omit<TimerPreset, 'id' | 'name'> {
    const nextMode = mode || 'amrap'

    if (nextMode === 'tabata') {
      return {
        mode: nextMode,
        totalSeconds: (tabataWork + tabataRest) * tabataRounds,
        rounds: tabataRounds,
        workSeconds: tabataWork,
        restSeconds: tabataRest,
      }
    }

    if (nextMode === 'emom') {
      return {
        mode: nextMode,
        totalSeconds: workMin * 60 + workSec,
        workSeconds: emomInterval * 60,
      }
    }

    const preset: Omit<TimerPreset, 'id' | 'name'> = {
      mode: nextMode,
      totalSeconds: workMin * 60 + workSec,
    }

    if (sets > 1) preset.rounds = sets
    if (hasRest) preset.restSeconds = restMin * 60 + restSec

    return preset
  }

  async function handleSavePreset() {
    if (!presetName.trim()) return

    const presetData = buildPresetFromConfig()

    if (editingPreset?.id) {
      await saveTimerPreset({ ...presetData, id: editingPreset.id, name: presetName.trim() })
    } else {
      await saveTimerPreset({ ...presetData, name: presetName.trim() })
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

  const modeLabels: Record<TimerMode, string> = {
    amrap: 'AMRAP',
    emom: 'EMOM',
    fortime: 'For Time',
    tabata: 'Tabata',
    rest: 'Rest Timer',
    custom: 'Custom',
  }
  const modeColors: Record<TimerMode, string> = {
    amrap: 'text-cyan-400',
    emom: 'text-green-400',
    fortime: 'text-orange-400',
    tabata: 'text-red-400',
    rest: 'text-purple-400',
    custom: 'text-slate-200',
  }
  const modeBorders: Record<TimerMode, string> = {
    amrap: 'border-cyan-400/40 text-cyan-400',
    emom: 'border-green-400/40 text-green-400',
    fortime: 'border-orange-400/40 text-orange-400',
    tabata: 'border-red-400/40 text-red-400',
    rest: 'border-purple-400/40 text-purple-400',
    custom: 'border-slate-400/40 text-slate-200',
  }
  const modeIconTone: Record<TimerMode, string> = {
    amrap: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)]',
    emom: 'border-green-400/25 bg-green-400/10 text-green-300 shadow-[0_0_24px_rgba(74,222,128,0.15)]',
    fortime: 'border-orange-400/25 bg-orange-400/10 text-orange-300 shadow-[0_0_24px_rgba(251,146,60,0.15)]',
    tabata: 'border-rose-400/25 bg-rose-400/10 text-rose-300 shadow-[0_0_24px_rgba(251,113,133,0.15)]',
    rest: 'border-violet-400/25 bg-violet-400/10 text-violet-300 shadow-[0_0_24px_rgba(167,139,250,0.15)]',
    custom: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
  }
  const modeIcons: Record<TimerMode, LucideIcon> = {
    amrap: Flame,
    emom: Clock3,
    fortime: Flag,
    tabata: Gauge,
    rest: TimerReset,
    custom: TimerReset,
  }
  const modeDescriptions: Record<TimerMode, string> = {
    amrap: t('timer.amrapDesc'),
    emom: t('timer.emomDesc'),
    fortime: t('timer.forTimeDesc'),
    tabata: t('timer.tabataDesc'),
    rest: t('timer.restTimerDesc'),
    custom: '',
  }

  if (!mode) {
    const modes: Array<{ id: TimerMode; label: string; desc: string }> = [
      { id: 'amrap', label: t('timer.amrap'), desc: t('timer.amrapDesc') },
      { id: 'emom', label: t('timer.emom'), desc: t('timer.emomDesc') },
      { id: 'fortime', label: t('timer.forTime'), desc: t('timer.forTimeDesc') },
      { id: 'tabata', label: t('timer.tabata'), desc: t('timer.tabataDesc') },
      { id: 'rest', label: t('timer.restTimer'), desc: t('timer.restTimerDesc') },
    ]

    return (
      <div className="space-y-4 stagger-children pb-28" data-fullscreen-tool="true">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-ct-1 flex items-center gap-2">
            <TimerModeGlyph icon={TimerReset} tone="border-cyan-400/20 bg-cyan-400/10 text-cyan-300" compact />
            {t('timer.title')}
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {modes.map((timerMode) => (
          <button
            key={timerMode.id}
            onClick={() => {
              setMode(timerMode.id)
              setConfiguring(true)
              applyDefaults(timerMode.id)
            }}
            className={`w-full bg-ct-surface border rounded-ct-lg p-4 text-left active:bg-ct-elevated/50 transition-colors ${modeBorders[timerMode.id]}`}
          >
            <div className="flex items-center gap-3">
              <TimerModeGlyph icon={modeIcons[timerMode.id]} tone={modeIconTone[timerMode.id]} compact />
              <div>
                <p className="text-base font-bold">{timerMode.label}</p>
                <p className="text-[11px] text-ct-2 mt-0.5">{timerMode.desc}</p>
              </div>
            </div>
          </button>
        ))}

        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('timer.quickPresets')}</p>
            <button
              onClick={() => {
                setShowPresetForm(true)
                setPresetName('')
                setEditingPreset(null)
                setMode('amrap')
                setConfiguring(true)
                applyDefaults('amrap')
              }}
              className="flex items-center gap-1 text-xs text-cyan-400 font-semibold px-2 py-1 rounded-lg active:bg-cyan-400/10 min-h-[44px]"
            >
              <Plus size={14} /> {t('timer.addPreset')}
            </button>
          </div>

          {timerPresets.length === 0 ? (
            <p className="text-xs text-ct-2 text-center py-3">{t('timer.noPresets')}</p>
          ) : (
            <div className="space-y-2">
              {timerPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectPreset(preset)
                      setConfiguring(false)
                    }}
                    className="flex-1 bg-ct-elevated/60 border border-ct-border/50 rounded-xl px-3.5 py-2.5 text-left active:bg-ct-elevated/50 min-h-[44px]"
                  >
                    <span className="text-sm text-ct-1 font-medium flex items-center gap-1.5">
                      <TimerModeGlyph icon={modeIcons[preset.mode] || TimerReset} tone={modeIconTone[preset.mode] || modeIconTone.custom} compact />
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-ct-2 block mt-0.5">
                      {modeLabels[preset.mode]} · {Math.floor(preset.totalSeconds / 60)}:{(preset.totalSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </button>

                  <button
                    onClick={() => startEditPreset(preset)}
                    className="w-11 h-11 rounded-xl bg-ct-elevated/40 flex items-center justify-center text-ct-2 active:text-cyan-400 active:bg-cyan-400/10"
                    aria-label={t('timer.editPreset')}
                  >
                    <Edit3 size={14} />
                  </button>

                  {confirmDeleteId === preset.id ? (
                    <button
                      onClick={() => handleDeletePreset(preset.id!)}
                      className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 active:bg-red-500/30 animate-pulse"
                      aria-label={t('timer.confirmDelete')}
                    >
                      <Check size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(preset.id!)}
                      className="w-11 h-11 rounded-xl bg-ct-elevated/40 flex items-center justify-center text-ct-2 active:text-red-400 active:bg-red-400/10"
                      aria-label={t('timer.deletePreset')}
                    >
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

  const sessionSummary = getSessionSummary(
    mode,
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
  )

  if (configuring && engine.phase === 'idle') {
    const emomTotalRounds = mode === 'emom' ? Math.floor((workMin * 60 + workSec) / (emomInterval * 60)) : 1
    const quickStats = mode === 'tabata'
      ? [
          { label: 'Work', value: `${tabataWork}s` },
          { label: 'Rest', value: `${tabataRest}s` },
          { label: 'Rounds', value: String(tabataRounds) },
        ]
      : mode === 'emom'
        ? [
            { label: 'Duration', value: `${workMin}m` },
            { label: 'Interval', value: `${emomInterval}m` },
            { label: 'Rounds', value: String(emomTotalRounds) },
          ]
      : [
            {
              label: mode === 'rest' ? 'Recovery' : 'Work',
              value: formatTimerValue(workMin, workSec),
              hint: mode === 'rest' ? 'single reset block' : 'per effort',
            },
            {
              label: 'Sets',
              value: String(sets),
              hint: sets > 1 ? 'repeat blocks' : 'single effort',
            },
            {
              label: 'Rest',
              value: mode === 'rest' ? 'Built in' : hasRest ? formatTimerValue(restMin, restSec) : 'Off',
              hint: hasRest ? 'between sets' : 'continuous pace',
            },
          ]

    return (
      <div className="relative min-h-[100dvh] pb-56" data-fullscreen-tool="true">
        <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-20 mx-auto h-56 w-80 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="mx-auto max-w-[540px] space-y-5">
          <div className={`relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,44,0.98),rgba(5,11,32,0.98))] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}>
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_65%)]`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.05),transparent_32%,transparent_70%,rgba(34,211,238,0.05))]" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    goBack()
                    setShowPresetForm(false)
                    setEditingPreset(null)
                  }}
                  className="mt-0.5 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 text-ct-2 active:text-ct-1 active:bg-white/10"
                  aria-label={t('common.goBack')}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/70 font-black">Timer Protocol</p>
                  <div className="flex items-center gap-3">
                    <TimerModeGlyph icon={modeIcons[mode]} tone={modeIconTone[mode]} />
                    <div className="min-w-0">
                      <h1 className={`text-[1.8rem] leading-none font-black tracking-tight ${modeColors[mode]}`}>
                        {modeLabels[mode]}
                      </h1>
                      <p className="mt-1 text-sm text-ct-2">{modeDescriptions[mode]}</p>
                    </div>
                  </div>
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/6 text-ct-2 active:bg-white/10"
                  aria-label={t('common.close')}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="relative mt-4 rounded-2xl border border-white/6 bg-[linear-gradient(90deg,rgba(34,211,238,0.12),rgba(15,23,42,0.1))] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-ct-2 font-semibold">Session Summary</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-base font-black text-ct-1">{sessionSummary}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${modeBorders[mode]}`}>
                  {modeLabels[mode]}
                </span>
              </div>
            </div>

            <div className="relative mt-3 grid grid-cols-3 gap-2">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ct-2 font-semibold">{stat.label}</p>
                  <p className="mt-1 text-base font-black text-ct-1">{stat.value}</p>
                  {'hint' in stat && stat.hint ? (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ct-2/80">{stat.hint}</p>
                  ) : (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ct-2/70">ready</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {showPresetForm && (
            <div className="rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(12,20,48,0.96),rgba(8,14,34,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
              <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold mb-2">
                {editingPreset ? t('timer.editPreset') : t('timer.newPreset')}
              </p>
              <input
                type="text"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder={t('timer.presetNamePlaceholder')}
                className="w-full bg-white/[0.04] border border-white/8 rounded-2xl py-3 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px] mb-3"
                autoFocus
              />
              <div className="flex gap-1.5 flex-wrap">
                {(['amrap', 'emom', 'fortime', 'tabata', 'rest'] as TimerMode[]).map((timerMode) => (
                  <button
                    key={timerMode}
                    onClick={() => {
                      setMode(timerMode)
                      applyDefaults(timerMode)
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${mode === timerMode ? `${modeBorders[timerMode]} border bg-opacity-20` : 'bg-white/[0.05] text-ct-2 border border-transparent'}`}
                  >
                    <TimerModeGlyph icon={modeIcons[timerMode]} tone={mode === timerMode ? modeIconTone[timerMode] : 'border-white/8 bg-white/[0.03] text-ct-2'} compact />
                    {modeLabels[timerMode]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(mode === 'amrap' || mode === 'fortime' || mode === 'rest') && (
            <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,44,0.96),rgba(5,11,32,0.96))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
              <p className="text-xs text-ct-2 uppercase tracking-[0.18em] font-semibold">
                {mode === 'rest' ? t('timer.restDuration') : t('timer.workDuration')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Adjuster value={workMin} onChange={setWorkMin} min={0} max={60} label="Minutes" unit="min" />
                <Adjuster value={workSec} onChange={setWorkSec} min={0} max={59} label="Seconds" unit="sec" />
              </div>

              {mode !== 'rest' && (
                <>
                  <div className="mt-6 border-t border-white/8 pt-6">
                    <div className="flex justify-center">
                      <div className="w-full max-w-[300px]">
                        <p className="text-xs text-center text-ct-2 uppercase tracking-[0.18em] font-semibold">{t('timer.sets')}</p>
                        <div className="relative mt-4 flex justify-center">
                          <div className="pointer-events-none absolute inset-x-6 top-5 h-24 rounded-full bg-cyan-500/12 blur-2xl" />
                          <div className="relative w-full rounded-[30px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(255,255,255,0.01))] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                            <Adjuster value={sets} onChange={setSets} min={1} max={10} label="Number of Sets" unit="sets" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {sets > 1 && (
                    <div className="mt-6 border-t border-white/8 pt-6">
                      <div className="mx-auto max-w-[420px]">
                        <button
                          onClick={() => setHasRest(!hasRest)}
                          className={`w-full flex items-center justify-between py-3.5 px-4 rounded-2xl border transition-colors min-h-[52px] ${hasRest ? 'bg-amber-500/10 border-amber-400/30 text-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]' : 'bg-white/[0.03] border-white/8 text-ct-2'}`}
                        >
                          <div className="text-left">
                            <span className="text-sm font-semibold block">{t('timer.restBetween')}</span>
                            <span className="text-[11px] opacity-70">Keep the same rhythm across sets</span>
                          </div>
                          <span className="rounded-full px-3 py-1 text-xs font-black bg-black/20 border border-current/10">
                            {hasRest ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      </div>

                      {hasRest && (
                        <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-2 gap-3">
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
            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,44,0.96),rgba(5,11,32,0.96))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] space-y-5">
              <div>
                <p className="text-xs text-ct-2 uppercase tracking-[0.18em] font-semibold">{t('timer.totalDuration')}</p>
                <div className="mt-4 max-w-[260px] mx-auto">
                  <Adjuster value={workMin} onChange={setWorkMin} min={1} max={60} label="Minutes" unit="min" />
                </div>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="text-xs text-ct-2 uppercase tracking-[0.18em] font-semibold mb-3">{t('timer.intervalEvery')}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setEmomInterval(value)}
                      className={`h-12 rounded-2xl text-sm font-bold flex items-center justify-center min-w-[44px] min-h-[44px] ${emomInterval === value ? 'bg-green-500/20 text-green-400 border border-green-400/40 shadow-[0_0_0_1px_rgba(74,222,128,0.08)]' : 'bg-white/[0.04] border border-white/8 text-ct-2'}`}
                    >
                      {value}m
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ct-2 text-center mt-3">{emomTotalRounds} {t('timer.rounds').toLowerCase()} of {emomInterval} min each</p>
              </div>
            </div>
          )}

          {mode === 'tabata' && (
            <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,44,0.96),rgba(5,11,32,0.96))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] space-y-5">
              <div>
                <p className="text-xs text-ct-2 uppercase tracking-[0.18em] font-semibold mb-3">{t('timer.work')} / {t('timer.rest')} (seconds)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Adjuster value={tabataWork} onChange={setTabataWork} min={5} max={120} label={t('timer.work')} unit="sec" />
                  <Adjuster value={tabataRest} onChange={setTabataRest} min={5} max={60} label={t('timer.rest')} unit="sec" />
                </div>
              </div>
              <div className="border-t border-white/8 pt-5">
                <p className="text-xs text-ct-2 uppercase tracking-[0.18em] font-semibold mb-3">{t('timer.rounds')}</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[4, 6, 8, 10, 12, 16, 20].map((value) => (
                    <button
                      key={value}
                      onClick={() => setTabataRounds(value)}
                      className={`px-3.5 py-2 rounded-2xl text-sm font-bold min-h-[44px] ${tabataRounds === value ? 'bg-red-500/20 text-red-400 border border-red-400/40 shadow-[0_0_0_1px_rgba(248,113,113,0.08)]' : 'bg-white/[0.04] border border-white/8 text-ct-2'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ct-2 text-center mt-3">
                  Total: {Math.floor((tabataWork + tabataRest) * tabataRounds / 60)}:{(((tabataWork + tabataRest) * tabataRounds) % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-20 mt-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-6 -bottom-2 h-10 rounded-full bg-cyan-500/20 blur-2xl" />
          </div>
          <div className="rounded-[30px] border border-cyan-400/16 bg-[linear-gradient(180deg,rgba(7,12,30,0.9),rgba(5,9,24,0.98))] px-4 py-3 shadow-[0_22px_60px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/75 font-semibold">Ready to Run</p>
                <p className="mt-1 text-sm font-semibold text-ct-1">{sessionSummary}</p>
                <p className="mt-0.5 text-[11px] text-ct-2">
                  {mode === 'tabata'
                    ? `${tabataRounds} rounds queued`
                    : mode === 'emom'
                      ? `${emomTotalRounds} intervals queued`
                      : hasRest
                        ? 'Work and rest intervals armed'
                        : 'Single effort, no rest phase'}
                </p>
              </div>
              <TimerModeGlyph icon={modeIcons[mode]} tone={modeIconTone[mode]} compact />
            </div>

            {showPresetForm && (
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold transition-all min-h-[52px] mb-2.5 ${presetName.trim() ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 active:scale-[0.98]' : 'bg-white/[0.06] text-ct-2'}`}
              >
                <Save size={20} />
                {editingPreset ? t('timer.updatePreset') : t('timer.savePreset')}
              </button>
            )}

            <button
              onClick={engine.startTimer}
              className="relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#22d3ee,#10b9dd)] text-slate-900 font-black py-4 text-lg active:scale-[0.98] transition-transform min-h-[58px] shadow-[0_16px_36px_rgba(34,211,238,0.32)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent_45%)]" />
              <Play size={20} className="fill-current" />
              <span className="relative">{t('timer.startTimer')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { phase, remaining, isRunning, currentSet, currentRound, countdownVal, emomTotalRounds, progress } = engine
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  const ringColor = phase === 'done'
    ? '#22c55e'
    : phase === 'countdown'
      ? '#a78bfa'
      : remaining <= 3
        ? '#ef4444'
        : phase === 'rest'
          ? '#f59e0b'
          : '#22d3ee'

  const ringProgress = phase === 'countdown'
    ? Math.max(0, countdownVal) / 10
    : phase === 'done'
      ? 1
      : Math.max(0, Math.min(progress, 1))

  const phaseTheme = phase === 'countdown'
    ? {
        shell: 'bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.20),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,8,22,1))]',
        glow: 'bg-violet-400/20',
        cardBorder: 'border-violet-400/20',
        badge: 'border-violet-400/25 bg-violet-400/10 text-violet-200',
        eyebrow: 'text-violet-300',
        helper: 'text-violet-200',
        timeText: 'text-violet-50',
        track: 'bg-violet-500/18',
      }
    : phase === 'rest'
      ? {
          shell: 'bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,8,22,1))]',
          glow: 'bg-amber-400/18',
          cardBorder: 'border-amber-400/18',
          badge: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
          eyebrow: 'text-amber-300',
          helper: 'text-amber-200',
          timeText: 'text-amber-50',
          track: 'bg-amber-500/16',
        }
      : phase === 'done'
        ? {
            shell: 'bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,8,22,1))]',
            glow: 'bg-green-400/18',
            cardBorder: 'border-green-400/18',
            badge: 'border-green-400/25 bg-green-400/10 text-green-200',
            eyebrow: 'text-green-300',
            helper: 'text-green-200',
            timeText: 'text-green-50',
            track: 'bg-green-500/16',
          }
        : {
            shell: 'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,8,22,1))]',
            glow: remaining <= 10 ? 'bg-red-400/20' : 'bg-cyan-400/18',
            cardBorder: remaining <= 10 ? 'border-red-400/20' : 'border-cyan-400/18',
            badge: remaining <= 10
              ? 'border-red-400/25 bg-red-400/10 text-red-200'
              : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
            eyebrow: remaining <= 10 ? 'text-red-300' : 'text-cyan-300',
            helper: remaining <= 10 ? 'text-red-200' : 'text-cyan-200',
            timeText: remaining <= 10 ? 'text-red-50' : 'text-cyan-50',
            track: remaining <= 10 ? 'bg-red-500/16' : 'bg-cyan-500/16',
          }

  const phaseLabel = phase === 'countdown'
    ? t('timer.getReady')
    : phase === 'rest'
      ? t('timer.rest')
      : phase === 'done'
        ? t('timer.done')
        : t('timer.work')

  const phaseHeadline = phase === 'countdown'
    ? 'Launch in 10 seconds'
    : phase === 'rest'
      ? 'Breathe, reset, attack the next block'
      : phase === 'done'
        ? 'Session complete'
        : remaining <= 10
          ? 'Final seconds. Hold the pace.'
          : 'Move with intent'

  let phaseContext = sessionSummary
  if (mode === 'tabata') phaseContext = `Round ${currentRound} of ${tabataRounds}`
  else if (mode === 'emom') phaseContext = `Minute ${currentRound} of ${emomTotalRounds}`
  else if (sets > 1) phaseContext = `Set ${currentSet} of ${sets}`
  else if (mode === 'rest') phaseContext = 'Recovery block'
  else phaseContext = modeLabels[mode]

  let nextCue = sessionSummary
  if (phase === 'countdown') {
    nextCue = 'Voice and tone cues are armed'
  } else if (phase === 'rest') {
    nextCue = `Next work: ${formatTimerValue(workMin, workSec)}`
  } else if (phase === 'work' && mode === 'tabata') {
    nextCue = currentRound < tabataRounds ? `Next rest: ${tabataRest}s` : 'Final work interval'
  } else if (phase === 'work' && mode === 'emom') {
    nextCue = `Every ${emomInterval} min`
  } else if (phase === 'work' && hasRest && currentSet < sets) {
    nextCue = `Next rest: ${formatTimerValue(restMin, restSec)}`
  } else if (phase === 'work' && currentSet < sets) {
    nextCue = `Next set: ${currentSet + 1} of ${sets}`
  } else if (phase === 'done') {
    nextCue = 'Ready to run it again'
  }

  const timerDisplay = phase === 'countdown'
    ? String(countdownVal)
    : phase === 'done'
      ? '0:00'
      : `${minutes}:${secs.toString().padStart(2, '0')}`

  const timerCaption = phase === 'countdown' ? 'seconds' : 'remaining'
  const helperText = phase === 'countdown'
    ? countdownVal > 5
      ? 'Get set'
      : 'Brace for the start'
    : phase === 'done'
      ? 'Save the effort or run it back'
      : !isRunning
        ? 'Paused'
        : remaining <= 10
          ? t('timer.finalCountdown')
          : 'Locked in'

  return (
    <div className={`relative min-h-[100dvh] pb-24 pt-4 transition-colors ${phaseTheme.shell}`} data-fullscreen-tool="true">
      <div className={`pointer-events-none absolute inset-x-0 top-10 mx-auto h-72 w-72 rounded-full blur-3xl ${phaseTheme.glow}`} />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/[0.05] text-ct-2 active:text-ct-1 active:bg-white/[0.08]"
            aria-label={t('common.goBack')}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <span className={`text-sm font-bold ${modeColors[mode]}`}>{modeLabels[mode]}</span>
            <p className="mt-0.5 text-[11px] text-ct-2">{sessionSummary}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/[0.05] text-ct-2 active:text-ct-1 active:bg-white/[0.08]"
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className={`relative z-10 mt-4 overflow-hidden rounded-[30px] border ${phaseTheme.cardBorder} bg-[linear-gradient(180deg,rgba(8,14,34,0.9),rgba(4,9,24,0.96))] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.4)]`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_70%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${phaseTheme.eyebrow}`}>{phaseLabel}</p>
            <p className="mt-2 text-xl font-black text-ct-1">{phaseHeadline}</p>
            <p className="mt-1 text-sm text-ct-2">{nextCue}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${phaseTheme.badge}`}>
            {phaseLabel}
          </span>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-black/15 px-3.5 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-ct-2 font-semibold">Current Block</p>
            <p className="mt-2 text-base font-bold text-ct-1">{phaseContext}</p>
            <p className="mt-1 text-[11px] text-ct-2">{sessionSummary}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/15 px-3.5 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-ct-2 font-semibold">Status</p>
            <p className="mt-2 text-base font-bold text-ct-1">{isRunning || phase === 'done' ? 'Live' : 'Paused'}</p>
            <p className="mt-1 text-[11px] text-ct-2">{nextCue}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-col items-center">
        <div className="relative flex h-[320px] w-[320px] items-center justify-center">
          <div className={`absolute inset-[1.35rem] rounded-full blur-2xl ${phaseTheme.track}`} />
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Timer: ${timerDisplay}`}
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="#162033" strokeWidth="5.5" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={ringColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray={`${ringProgress * 283} 283`}
              className="transition-all duration-1000 linear"
            />
          </svg>

          <div className="absolute inset-[2.65rem] rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(7,12,28,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl" />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${phaseTheme.badge}`}>
              {phaseLabel}
            </span>
            <span className={`mt-5 font-black leading-none tracking-tight tabular-nums ${phase === 'countdown' ? 'text-[5.25rem]' : 'text-[4.5rem]'} ${phaseTheme.timeText}`}>
              {timerDisplay}
            </span>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-ct-2">{timerCaption}</p>
            <p className={`mt-3 text-sm font-semibold ${phaseTheme.helper}`}>{helperText}</p>
          </div>
        </div>
      </div>

      {mode === 'emom' && phase !== 'countdown' && phase !== 'done' && emomTotalRounds <= 20 && (
        <RoundDots total={emomTotalRounds} current={currentRound} color="bg-green-400" />
      )}
      {mode === 'tabata' && phase !== 'countdown' && phase !== 'done' && tabataRounds <= 20 && (
        <RoundDots total={tabataRounds} current={currentRound} color="bg-red-400" />
      )}
      {(mode === 'amrap' || mode === 'fortime') && sets > 1 && phase !== 'countdown' && phase !== 'done' && (
        <RoundDots total={sets} current={currentSet} color="bg-cyan-400" />
      )}

      <div className="relative z-10 mt-5">
        <div className="mx-auto h-1.5 w-full max-w-[260px] overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(6, ringProgress * 100)}%`, backgroundColor: ringColor }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-ct-2">
          {phase === 'done' ? 'Complete' : `${Math.round(ringProgress * 100)}% of current block`}
        </p>
      </div>

      {phase !== 'countdown' && (
        <div className="relative z-10 mt-5 flex gap-4 items-center">
          <button
            onClick={engine.reset}
            className="w-14 h-14 rounded-full bg-ct-surface border border-ct-border flex items-center justify-center active:bg-ct-elevated min-w-[44px] min-h-[44px]"
            aria-label={t('timer.reset')}
          >
            <RotateCcw size={20} className="text-ct-2" />
          </button>

          {phase !== 'done' ? (
            <button
              onClick={() => engine.setIsRunning(!isRunning)}
              aria-label={isRunning ? t('timer.pause') : t('timer.resume')}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${isRunning ? 'bg-red-500 shadow-red-500/20' : 'bg-cyan-500 shadow-cyan-500/20'}`}
            >
              {isRunning ? <Pause size={32} className="text-ct-1" /> : <Play size={32} className="text-slate-900 ml-1" />}
            </button>
          ) : (
            <button
              onClick={() => {
                engine.reset()
                setConfiguring(true)
              }}
              aria-label={t('timer.restart')}
              className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20"
            >
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
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-colors ${index + 1 < current ? color : index + 1 === current ? `${color} animate-pulse` : 'bg-ct-elevated'}`}
        />
      ))}
    </div>
  )
}

