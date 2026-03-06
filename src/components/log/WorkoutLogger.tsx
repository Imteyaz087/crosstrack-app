import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Minus,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react'
import benchmarkData from '../../data/benchmarkWods.json'
import type { RxScaled, WodType, Workout } from '../../types'
import { BenchmarkSuggestions, BenchmarkWodPicker, type BenchmarkWod } from './BenchmarkWodPicker'
import type { MovementEntry } from './constants'
import { MovementPicker } from './MovementPicker'

export interface WorkoutLoggerProps {
  t: (key: string) => string
  classFormat: 'full' | 'wod_only' | 'strength_only'
  workoutStep: number
  wodType: WodType
  wodName: string
  wodDescription: string
  rxScaled: RxScaled
  prFlag: boolean
  isBenchmark: boolean
  workoutNotes: string
  weightUnit: 'kg' | 'lbs'
  strengthMovement: string
  strengthSchemeType: 'programmed' | 'build'
  strengthInterval: string
  strengthSets: string
  strengthRepScheme: string
  strengthStartWeight: string
  strengthEndWeight: string
  strengthPercent: string
  strengthBuildTarget: string
  scoreMin: string
  scoreSec: string
  scoreRounds: string
  scoreReps: string
  timeCap: string
  movements: MovementEntry[]
  showMovementPicker: boolean
  movementSearch: string
  workouts: Workout[]
  prevResults: Workout[]
  strengthPrevResults: Workout[]
  showBenchmarkPicker: boolean
  editingWorkoutId: number | null
  strengthCurrentPR: { value: number | string; unit: string; prType: string } | null
  onLoadWorkoutForEdit: (w: Workout) => void
  onDeleteWorkout: () => void
  onClassFormatChange: (v: 'full' | 'wod_only' | 'strength_only') => void
  onWorkoutStepChange: (v: number) => void
  onWodTypeChange: (v: WodType) => void
  onWodNameChange: (v: string) => void
  onWodDescriptionChange: (v: string) => void
  onRxScaledChange: (v: RxScaled) => void
  onPrFlagChange: (v: boolean) => void
  onIsBenchmarkChange: (v: boolean) => void
  onWorkoutNotesChange: (v: string) => void
  onWeightUnitChange: (v: 'kg' | 'lbs') => void
  onStrengthMovementChange: (v: string) => void
  onStrengthSchemeTypeChange: (v: 'programmed' | 'build') => void
  onStrengthIntervalChange: (v: string) => void
  onStrengthSetsChange: (v: string) => void
  onStrengthRepSchemeChange: (v: string) => void
  onStrengthStartWeightChange: (v: string) => void
  onStrengthEndWeightChange: (v: string) => void
  onStrengthPercentChange: (v: string) => void
  onStrengthBuildTargetChange: (v: string) => void
  onScoreMinChange: (v: string) => void
  onScoreSecChange: (v: string) => void
  onScoreRoundsChange: (v: string) => void
  onScoreRepsChange: (v: string) => void
  onTimeCapChange: (v: string) => void
  onAddMovement: (name: string) => void
  onUpdateMovement: (idx: number, field: keyof MovementEntry, value: string) => void
  onRemoveMovement: (i: number) => void
  onShowMovementPickerChange: (v: boolean) => void
  onMovementSearchChange: (v: string) => void
  onShowBenchmarkPickerChange: (v: boolean) => void
  onSelectBenchmarkWod: (w: BenchmarkWod) => void
  onSaveWorkout: () => void
  onClose: () => void
  onSwitchToEvents: () => void
  onScanWod: () => void
}

const WOD_TYPES: WodType[] = ['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Other']
const CLASS_FORMAT_OPTIONS: Array<{
  value: 'full' | 'wod_only' | 'strength_only'
  label: string
  hint: string
}> = [
  { value: 'full', label: 'Full Class', hint: 'Strength + WOD' },
  { value: 'wod_only', label: 'WOD Only', hint: 'Metcon only' },
  { value: 'strength_only', label: 'Strength Only', hint: 'Lifting only' },
]
const BUILD_TARGETS = ['Heavy Single', 'Heavy 3', 'Heavy 5', '1RM', '3RM', '5RM']
const STRENGTH_INTERVALS = [
  { label: '1:00', value: '60' },
  { label: '1:30', value: '90' },
  { label: '2:00', value: '120' },
  { label: '3:00', value: '180' },
]
const REP_SCHEMES = ['5-5-5-5-5', '5-3-3-1', '6-6-6-6-6', '3-3-2-2-1-1', '10-8-6-4-2']
const QUICK_TIME_CAPS = ['12', '15', '18', '20']
const QUICK_BENCHMARK_NAMES = [
  'Fran',
  'Cindy',
  'Grace',
  'Helen',
  'Murph',
  'DT',
  'Annie',
  'Karen',
  'Diane',
  'Jackie',
  'Fight Gone Bad',
  'Filthy Fifty',
  'Nancy',
  'Angie',
]
const QUICK_END_WEIGHTS = {
  kg: ['40', '50', '60', '70', '80', '90', '100', '110', '120'],
  lbs: ['95', '115', '135', '155', '185', '205', '225', '275', '315'],
} as const
const benchmarkWods = (benchmarkData as { wods: BenchmarkWod[] }).wods
const quickBenchmarkWods = QUICK_BENCHMARK_NAMES
  .map((name) => benchmarkWods.find((wod) => wod.name === name))
  .filter((wod): wod is BenchmarkWod => Boolean(wod))

function formatWodTypeLabel(type: WodType) {
  return type === 'ForTime' ? 'For Time' : type
}

function formatBenchmarkTypeLabel(type: string) {
  const map: Record<string, string> = {
    girl: 'Girls',
    hero: 'Heroes',
    open: 'Open',
    games: 'Games',
    classic: 'Classic',
  }

  return map[type] || type
}

function formatBenchmarkScoreLabel(scoreType: string) {
  const map: Record<string, string> = {
    time: 'For Time',
    'rounds+reps': 'Rounds + Reps',
    reps: 'Max Reps',
    load: 'Max Load',
  }

  return map[scoreType] || scoreType
}

function formatWorkoutType(type: WodType) {
  return type === 'ForTime' ? 'ForTime' : type
}

function formatWorkoutSummary(workout: Workout) {
  const meta = [workout.date, workout.scoreDisplay, workout.rxOrScaled].filter(Boolean)
  return meta.join(' | ')
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function decimalOnly(value: string) {
  const clean = value.replace(/[^\d.]/g, '')
  const [whole, ...rest] = clean.split('.')
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
}

function adjustCounter(value: string, delta: number, minimum = 0) {
  return String(Math.max(minimum, (parseInt(value, 10) || 0) + delta))
}

function SectionEyebrow({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: 'cyan' | 'violet' }) {
  const classes = tone === 'violet'
    ? 'bg-violet-500/10 text-violet-400 border-violet-400/25'
    : 'bg-cyan-500/10 text-cyan-400 border-cyan-400/25'

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${classes}`}>
      <Icon size={14} />
      <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{label}</span>
    </div>
  )
}

function PreviousResultsPanel({
  label,
  results,
  onSelect,
  accent,
}: {
  label: string
  results: Workout[]
  onSelect: (workout: Workout) => void
  accent: 'cyan' | 'violet'
}) {
  if (results.length === 0) return null

  const iconColor = accent === 'violet' ? 'text-violet-400' : 'text-cyan-400'

  return (
    <div className="rounded-xl border border-slate-600/20 bg-slate-700/30 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ct-2">{label}</p>
      <div className="space-y-2">
        {results.map((result) => (
          <button
            key={`${result.id}-${result.date}`}
            onClick={() => onSelect(result)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2 text-left"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ct-1">{result.name}</p>
              <p className="truncate text-xs text-ct-2">{formatWorkoutSummary(result)}</p>
            </div>
            <Pencil size={14} className={`shrink-0 ${iconColor}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

function UnitToggle({
  value,
  onChange,
}: {
  value: 'kg' | 'lbs'
  onChange: (unit: 'kg' | 'lbs') => void
}) {
  return (
    <div className="flex shrink-0 rounded-lg bg-slate-800/80 p-0.5">
      {(['kg', 'lbs'] as const).map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          className={`px-3 py-1.5 text-[11px] font-bold transition-all ${
            value === unit ? 'rounded-md bg-cyan-500/20 text-cyan-400 shadow-sm' : 'text-ct-2'
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  )
}

function ClassFormatToggle({
  value,
  onChange,
}: {
  value: 'full' | 'wod_only' | 'strength_only'
  onChange: (format: 'full' | 'wod_only' | 'strength_only') => void
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-slate-700/40 bg-slate-900/35 p-1">
      {CLASS_FORMAT_OPTIONS.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-2 py-2.5 text-left transition-all ${
              active
                ? 'bg-slate-800/90 shadow-sm ring-1 ring-cyan-400/18'
                : 'bg-transparent text-ct-2'
            }`}
          >
            <p className={`text-[11px] font-bold ${active ? 'text-ct-1' : 'text-ct-2'}`}>{option.label}</p>
            <p className={`mt-0.5 text-[10px] ${active ? 'text-cyan-400' : 'text-ct-2/80'}`}>{option.hint}</p>
          </button>
        )
      })}
    </div>
  )
}

function BenchmarkDetailCard({
  benchmark,
  rxScaled,
  timeCap,
}: {
  benchmark: BenchmarkWod
  rxScaled: RxScaled
  timeCap: string
}) {
  const hasEliteTarget = Boolean(benchmark.eliteBenchmark?.male || benchmark.eliteBenchmark?.female)
  const appliedTimeCap = timeCap || (benchmark.timeCapMinutes ? String(benchmark.timeCapMinutes) : '')
  const selectedDivision = rxScaled === 'Scaled' ? 'Scaled' : 'RX'
  const selectedWeights = rxScaled === 'Scaled' ? benchmark.scaledWeights : benchmark.rxWeights

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/6 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-400">
          {formatBenchmarkTypeLabel(benchmark.type)}
        </span>
        <span className="rounded-full border border-slate-600/30 bg-slate-800/70 px-2 py-1 text-[10px] font-semibold text-ct-2">
          {formatBenchmarkScoreLabel(benchmark.scoreType)}
        </span>
        {appliedTimeCap && (
          <span className="rounded-full border border-slate-600/30 bg-slate-800/70 px-2 py-1 text-[10px] font-semibold text-ct-2">
            Cap {appliedTimeCap} min
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-ct-1">{benchmark.scheme}</p>
      <p className="mt-1 text-xs leading-relaxed text-ct-2">{benchmark.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {benchmark.movements.map((movement) => (
          <span
            key={movement}
            className="rounded-full border border-slate-600/25 bg-slate-900/55 px-2.5 py-1 text-[11px] font-medium text-ct-2"
          >
            {movement}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={`rounded-xl border px-3 py-2.5 ${selectedDivision === 'RX' ? 'border-cyan-400/25 bg-cyan-500/10' : 'border-slate-600/25 bg-slate-900/45'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedDivision === 'RX' ? 'text-cyan-400' : 'text-ct-2'}`}>RX</p>
          <p className="mt-1 text-[11px] text-ct-2">M: {benchmark.rxWeights.male}</p>
          <p className="text-[11px] text-ct-2">F: {benchmark.rxWeights.female}</p>
        </div>
        <div className={`rounded-xl border px-3 py-2.5 ${selectedDivision === 'Scaled' ? 'border-cyan-400/25 bg-cyan-500/10' : 'border-slate-600/25 bg-slate-900/45'}`}>
          <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedDivision === 'Scaled' ? 'text-cyan-400' : 'text-ct-2'}`}>Scaled</p>
          <p className="mt-1 text-[11px] text-ct-2">M: {benchmark.scaledWeights.male}</p>
          <p className="text-[11px] text-ct-2">F: {benchmark.scaledWeights.female}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-600/20 bg-slate-900/40 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ct-2">Selected</span>
        <span className="text-xs font-bold text-ct-1">{selectedDivision}</span>
        <span className="text-xs text-ct-2">M {selectedWeights.male}</span>
        <span className="text-xs text-ct-2">F {selectedWeights.female}</span>
      </div>

      {hasEliteTarget && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-ct-2">
          <span className="font-semibold text-yellow-400">Elite target</span>
          <span>M {benchmark.eliteBenchmark.male}</span>
          <span>F {benchmark.eliteBenchmark.female}</span>
        </div>
      )}
    </div>
  )
}

function CounterField({
  label,
  value,
  onChange,
  accent = 'cyan',
  placeholder = '0',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  accent?: 'cyan' | 'orange' | 'yellow'
  placeholder?: string
}) {
  const plusTone = accent === 'orange'
    ? 'bg-orange-500/10 border-orange-400/20 text-orange-400 active:bg-orange-500/20'
    : accent === 'yellow'
      ? 'bg-yellow-500/10 border-yellow-400/20 text-yellow-400 active:bg-yellow-500/20'
      : 'bg-cyan-500/10 border-cyan-400/20 text-cyan-400 active:bg-cyan-500/20'

  return (
    <div className="flex-1 min-w-0">
      <label className="mb-1.5 block text-center text-[11px] font-medium text-ct-2">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(adjustCounter(value, -1))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-600/30 bg-ct-elevated/80 active:bg-slate-600"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} className="text-ct-2" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(digitsOnly(e.target.value))}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-slate-600/30 bg-ct-elevated/80 py-2 text-center text-lg font-bold tabular-nums text-ct-1 focus:outline-none"
        />
        <button
          onClick={() => onChange(adjustCounter(value, 1))}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${plusTone}`}
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export function WorkoutLogger(props: WorkoutLoggerProps) {
  const {
    t,
    classFormat,
    workoutStep,
    wodType,
    wodName,
    wodDescription,
    rxScaled,
    prFlag,
    isBenchmark,
    workoutNotes,
    weightUnit,
    strengthMovement,
    strengthSchemeType,
    strengthInterval,
    strengthSets,
    strengthRepScheme,
    strengthStartWeight,
    strengthEndWeight,
    strengthPercent,
    strengthBuildTarget,
    scoreMin,
    scoreSec,
    scoreRounds,
    scoreReps,
    timeCap,
    movements,
    showMovementPicker,
    movementSearch,
    workouts,
    prevResults,
    strengthPrevResults,
    showBenchmarkPicker,
    editingWorkoutId,
    strengthCurrentPR,
    onLoadWorkoutForEdit,
    onDeleteWorkout,
    onClassFormatChange,
    onWorkoutStepChange,
    onWodTypeChange,
    onWodNameChange,
    onWodDescriptionChange,
    onRxScaledChange,
    onPrFlagChange,
    onIsBenchmarkChange,
    onWorkoutNotesChange,
    onWeightUnitChange,
    onStrengthMovementChange,
    onStrengthSchemeTypeChange,
    onStrengthIntervalChange,
    onStrengthSetsChange,
    onStrengthRepSchemeChange,
    onStrengthStartWeightChange,
    onStrengthEndWeightChange,
    onStrengthPercentChange,
    onStrengthBuildTargetChange,
    onScoreMinChange,
    onScoreSecChange,
    onScoreRoundsChange,
    onScoreRepsChange,
    onTimeCapChange,
    onAddMovement,
    onUpdateMovement,
    onRemoveMovement,
    onShowMovementPickerChange,
    onMovementSearchChange,
    onShowBenchmarkPickerChange,
    onSelectBenchmarkWod,
    onSaveWorkout,
    onClose,
    onSwitchToEvents,
    onScanWod,
  } = props

  const recentWorkouts = workouts.slice(0, 5)
  const showStrengthSection = classFormat === 'full' || classFormat === 'strength_only'
  const showWodSection = classFormat === 'full' || classFormat === 'wod_only'
  const saveLabel = editingWorkoutId ? 'Update Workout' : `${t('common.save')} Workout`
  const activeTitle = editingWorkoutId
    ? 'Edit Workout'
    : classFormat === 'full'
      ? 'Full Class'
      : classFormat === 'wod_only'
        ? 'WOD Only'
        : 'Strength Only'
  const matchedBenchmark = benchmarkWods.find((wod) => wod.name.toLowerCase() === wodName.trim().toLowerCase()) || null

  const renderScoreInputs = () => {
    if (wodType === 'AMRAP') {
      return (
        <div className="flex gap-2">
          <CounterField label="Rounds" value={scoreRounds} onChange={onScoreRoundsChange} />
          <CounterField label="+ Reps" value={scoreReps} onChange={onScoreRepsChange} />
        </div>
      )
    }

    if (wodType === 'ForTime' || wodType === 'Chipper') {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="text-center">
            <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Min</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={scoreMin}
              onChange={(e) => onScoreMinChange(digitsOnly(e.target.value))}
              className="w-[4.5rem] rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-2.5 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none"
              placeholder="0"
            />
          </div>
          <span className="mt-5 text-xl font-bold text-ct-2">:</span>
          <div className="text-center">
            <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Sec</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={scoreSec}
              onChange={(e) => onScoreSecChange(digitsOnly(e.target.value))}
              className="w-[4.5rem] rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-2.5 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none"
              placeholder="00"
            />
          </div>
        </div>
      )
    }

    if (wodType === 'EMOM') {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onScoreRoundsChange(adjustCounter(scoreRounds, -1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600/30 bg-ct-elevated/80 active:bg-slate-600"
            aria-label="Decrease rounds"
          >
            <Minus size={14} className="text-ct-2" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={scoreRounds}
            onChange={(e) => onScoreRoundsChange(digitsOnly(e.target.value))}
            className="w-20 rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-2.5 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none"
            placeholder="0"
          />
          <button
            onClick={() => onScoreRoundsChange(adjustCounter(scoreRounds, 1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-400 active:bg-orange-500/20"
            aria-label="Increase rounds"
          >
            <Plus size={14} />
          </button>
          <span className="text-xs font-medium text-ct-2">rounds</span>
        </div>
      )
    }

    if (wodType === 'Tabata') {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onScoreRepsChange(adjustCounter(scoreReps, -1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600/30 bg-ct-elevated/80 active:bg-slate-600"
            aria-label="Decrease reps"
          >
            <Minus size={14} className="text-ct-2" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={scoreReps}
            onChange={(e) => onScoreRepsChange(digitsOnly(e.target.value))}
            className="w-20 rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-2.5 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none"
            placeholder="0"
          />
          <button
            onClick={() => onScoreRepsChange(adjustCounter(scoreReps, 1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-500/10 text-yellow-400 active:bg-yellow-500/20"
            aria-label="Increase reps"
          >
            <Plus size={14} />
          </button>
          <span className="text-xs font-medium text-ct-2">lowest reps</span>
        </div>
      )
    }

    return (
      <input
        type="text"
        value={scoreRounds}
        onChange={(e) => onScoreRoundsChange(e.target.value)}
        placeholder="Score (e.g. 15:30, 12 rounds)"
        className="w-full rounded-xl border border-slate-600/30 bg-ct-elevated/80 px-4 py-3 text-sm text-ct-1 focus:outline-none"
      />
    )
  }

  if (workoutStep === 1) {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-bold leading-none text-ct-1">Log CrossFit</h1>
            <p className="mt-1 text-sm text-ct-2">How was today's class?</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-900/70 text-ct-2"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <button
          onClick={() => {
            onClassFormatChange('full')
            onWorkoutStepChange(2)
          }}
          className="flex min-h-[80px] items-center gap-4 rounded-[26px] border border-cyan-400/30 bg-gradient-to-r from-cyan-900/55 via-slate-950/95 to-blue-950/90 px-4 py-4 text-left"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-cyan-500/18 text-cyan-300">
            <Dumbbell size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[1.05rem] font-bold text-ct-1">Full Class</p>
            <p className="mt-1 text-sm text-ct-2">Strength + WOD - most common</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-ct-2" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              onClassFormatChange('wod_only')
              onWorkoutStepChange(2)
            }}
            className="relative min-h-[136px] overflow-hidden rounded-[24px] border border-emerald-400/28 bg-gradient-to-br from-emerald-950/75 via-slate-950 to-cyan-950/75 p-0 text-left"
          >
            <div className="absolute left-0 top-0 flex h-[78px] w-[78px] items-center justify-center rounded-br-[22px] rounded-tl-[24px] bg-emerald-500/16 text-emerald-300">
              <Flame size={26} />
            </div>
            <div className="flex h-full flex-col justify-end px-4 pb-4 pt-16">
              <p className="text-[1.05rem] font-bold leading-tight text-ct-1">WOD Only</p>
              <p className="mt-1 text-sm text-ct-2">Just the metcon</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClassFormatChange('strength_only')
              onWorkoutStepChange(2)
            }}
            className="relative min-h-[136px] overflow-hidden rounded-[24px] border border-violet-400/28 bg-gradient-to-br from-violet-950/65 via-slate-950 to-indigo-950/75 p-0 text-left"
          >
            <div className="absolute left-0 top-0 flex h-[78px] w-[78px] items-center justify-center rounded-br-[22px] rounded-tl-[24px] bg-violet-500/16 text-violet-300">
              <Target size={24} />
            </div>
            <div className="flex h-full flex-col justify-end px-4 pb-4 pt-16">
              <p className="text-[1.05rem] font-bold leading-tight text-ct-1">Strength Only</p>
              <p className="mt-1 text-sm text-ct-2">Just lifting</p>
            </div>
          </button>
        </div>

        <button
          onClick={onSwitchToEvents}
          className="flex items-center gap-4 rounded-[24px] border border-violet-400/26 bg-gradient-to-r from-violet-950/60 via-slate-950 to-blue-950/80 px-4 py-4 text-left"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-violet-500/16 text-violet-300">
            <CalendarDays size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[1.05rem] font-bold text-ct-1">CrossFit Events</p>
            <p className="mt-1 text-sm text-ct-2">Open - Hero WODs - Girls - scan or pick</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-ct-2" />
        </button>

        {recentWorkouts.length > 0 && (
          <div className="overflow-hidden rounded-[26px] border border-ct-border bg-gradient-to-b from-slate-950/85 to-slate-900/75">
            <div className="px-1 pt-2">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-2">
                Recent Workouts - Tap To Edit
              </p>
            </div>
            <div className="divide-y divide-white/6">
              {recentWorkouts.map((workout) => (
                <button
                  key={`${workout.id}-${workout.date}`}
                  onClick={() => onLoadWorkoutForEdit(workout)}
                  className="flex w-full items-start justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[1.05rem] font-bold leading-tight text-ct-1">{workout.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ct-2">
                      <span>{formatWorkoutType(workout.workoutType)}</span>
                      {workout.scoreDisplay && <span>{workout.scoreDisplay}</span>}
                      <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs font-bold text-emerald-300">
                        {workout.rxOrScaled}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-3">
                    <span className="text-sm text-ct-2">{workout.date}</span>
                    <Pencil size={15} className="text-ct-2" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onWorkoutStepChange(1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ct-surface text-ct-2 active:bg-ct-elevated active:text-ct-1"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.7rem] font-bold leading-none text-ct-1">{activeTitle}</h1>
          {editingWorkoutId && (
            <p className="mt-1 text-[11px] text-amber-400">Editing saved workout</p>
          )}
        </div>
        <UnitToggle value={weightUnit} onChange={onWeightUnitChange} />
        <button
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ct-surface text-ct-2 active:bg-slate-700 active:text-ct-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <ClassFormatToggle value={classFormat} onChange={onClassFormatChange} />

      {showStrengthSection && (
        <div className="space-y-4 rounded-ct-lg border border-violet-400/15 bg-gradient-to-b from-violet-500/5 to-slate-800/40 p-4">
          <SectionEyebrow icon={Dumbbell} label="Strength" tone="violet" />

          <div>
            <input
              type="text"
              value={strengthMovement}
              onChange={(e) => onStrengthMovementChange(e.target.value)}
              placeholder="Movement (e.g. Back Squat)"
              className="w-full rounded-xl border border-slate-600/30 bg-ct-elevated/60 px-4 py-3.5 text-sm font-medium text-ct-1 placeholder:text-ct-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
            />
            {strengthCurrentPR && (
              <div className="mt-1.5 flex items-center gap-2 px-1">
                <Trophy size={12} className="text-yellow-400" />
                <span className="text-[11px] font-semibold text-yellow-400">
                  PR: {strengthCurrentPR.value} {strengthCurrentPR.unit}
                </span>
                <span className="text-[11px] text-ct-2">({strengthCurrentPR.prType.toUpperCase()})</span>
              </div>
            )}
          </div>

          <PreviousResultsPanel
            label="Previous Strength"
            results={strengthPrevResults}
            onSelect={onLoadWorkoutForEdit}
            accent="violet"
          />

          <div className="flex rounded-xl bg-slate-700/40 p-1">
            <button
              onClick={() => onStrengthSchemeTypeChange('programmed')}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                strengthSchemeType === 'programmed' ? 'bg-violet-500/20 text-violet-400 shadow-sm' : 'text-ct-2'
              }`}
            >
              Programmed Sets
            </button>
            <button
              onClick={() => onStrengthSchemeTypeChange('build')}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                strengthSchemeType === 'build' ? 'bg-violet-500/20 text-violet-400 shadow-sm' : 'text-ct-2'
              }`}
            >
              Build to Heavy
            </button>
          </div>

          {strengthSchemeType === 'programmed' ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Every</label>
                  <div className="flex gap-1">
                    {STRENGTH_INTERVALS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onStrengthIntervalChange(option.value)}
                        className={`flex-1 rounded-lg px-2 py-2.5 text-[11px] font-bold transition-all ${
                          strengthInterval === option.value
                            ? 'border border-violet-400/30 bg-violet-500/20 text-violet-400'
                            : 'border border-transparent bg-ct-elevated/50 text-ct-2'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-16">
                  <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Sets</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    value={strengthSets}
                    onChange={(e) => onStrengthSetsChange(digitsOnly(e.target.value))}
                    className="w-full rounded-lg border border-slate-600/30 bg-ct-elevated/60 py-2.5 text-center text-sm font-bold text-ct-1 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Rep Scheme</label>
                <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
                  {REP_SCHEMES.map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => onStrengthRepSchemeChange(scheme)}
                      className={`shrink-0 rounded-lg px-2.5 py-2 text-[11px] font-bold transition-all ${
                        strengthRepScheme === scheme
                          ? 'border border-violet-400/30 bg-violet-500/20 text-violet-400'
                          : 'border border-transparent bg-ct-elevated/50 text-ct-2'
                      }`}
                    >
                      {scheme}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={strengthRepScheme}
                  onChange={(e) => onStrengthRepSchemeChange(e.target.value)}
                  placeholder="e.g. 6-6-6-6-6 or 3-3-2-2-1-1"
                  className="w-full rounded-lg border border-slate-600/30 bg-ct-elevated/60 px-3 py-2.5 text-center text-xs text-ct-1 placeholder:text-ct-2 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {BUILD_TARGETS.map((target) => (
                <button
                  key={target}
                  onClick={() => onStrengthBuildTargetChange(target)}
                  className={`rounded-xl py-3 text-[11px] font-bold transition-all ${
                    strengthBuildTarget === target
                      ? 'border border-violet-400/30 bg-violet-500/20 text-violet-400 shadow-sm'
                      : 'border border-transparent bg-ct-elevated/50 text-ct-2'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-slate-700/30 p-3 space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-medium text-ct-2">Start ({weightUnit})</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={strengthStartWeight}
                  onChange={(e) => onStrengthStartWeightChange(decimalOnly(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-3 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </div>
              <div className="pb-3 text-lg font-bold text-ct-2">?</div>
              <div className="flex-1">
                <label className="mb-1.5 block text-[11px] font-medium text-ct-2">End ({weightUnit})</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={strengthEndWeight}
                  onChange={(e) => onStrengthEndWeightChange(decimalOnly(e.target.value))}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-600/30 bg-ct-elevated/80 py-3 text-center text-xl font-bold tabular-nums text-ct-1 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                />
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {QUICK_END_WEIGHTS[weightUnit].map((weight) => (
                <button
                  key={weight}
                  onClick={() => onStrengthEndWeightChange(weight)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                    strengthEndWeight === weight
                      ? 'border border-violet-400/30 bg-violet-500/20 text-violet-400'
                      : 'border border-transparent bg-ct-elevated/50 text-ct-2'
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ct-2">@</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={strengthPercent}
              onChange={(e) => onStrengthPercentChange(digitsOnly(e.target.value))}
              placeholder="—"
              className="w-16 rounded-lg border border-slate-600/30 bg-ct-elevated/60 py-2 text-center text-sm font-bold text-ct-1 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
            />
            <span className="text-xs font-medium text-ct-2">% of 1RM</span>
          </div>
        </div>
      )}

      {showWodSection && (
        <div className="space-y-4 rounded-ct-lg border border-cyan-400/15 bg-gradient-to-b from-cyan-500/5 to-slate-800/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <SectionEyebrow icon={Flame} label="WOD" tone="cyan" />
            <div className="flex items-center gap-2">
              <button
                onClick={onScanWod}
                className="flex items-center gap-1.5 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-[11px] font-bold text-violet-400 transition-transform active:scale-95"
              >
                <Search size={12} />
                Scan
              </button>
              <button
                onClick={() => onShowBenchmarkPickerChange(!showBenchmarkPicker)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-[11px] font-bold text-cyan-400 transition-transform active:scale-95"
              >
                <Plus size={12} />
                All
              </button>
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto px-1 scrollbar-hide">
            <div className="flex gap-1.5 pb-1" style={{ minWidth: 'max-content' }}>
              {quickBenchmarkWods.map((wod) => {
                const selected = wodName.toLowerCase() === wod.name.toLowerCase()
                return (
                  <button
                    key={wod.id}
                    onClick={() => onSelectBenchmarkWod(wod)}
                    className={`min-h-[36px] whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold transition-all ${
                      selected
                        ? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-400 shadow-sm'
                        : 'border border-transparent bg-ct-elevated/50 text-ct-2 active:scale-95'
                    }`}
                  >
                    {wod.name}
                  </button>
                )
              })}
            </div>
          </div>

          {showBenchmarkPicker && (
            <BenchmarkWodPicker
              searchValue={wodName}
              onSelect={onSelectBenchmarkWod}
              onClose={() => onShowBenchmarkPickerChange(false)}
            />
          )}

          {matchedBenchmark && (
            <BenchmarkDetailCard benchmark={matchedBenchmark} rxScaled={rxScaled} timeCap={timeCap} />
          )}

          <div className="flex flex-wrap gap-1.5">
            {WOD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => onWodTypeChange(type)}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  wodType === type
                    ? 'border border-cyan-400/30 bg-cyan-500/20 text-cyan-400 shadow-sm'
                    : 'border border-transparent bg-ct-elevated/50 text-ct-2'
                }`}
              >
                {formatWodTypeLabel(type)}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={wodName}
              onChange={(e) => onWodNameChange(e.target.value)}
              placeholder="WOD Name (e.g. Fran, Nate, or custom)"
              className="w-full rounded-xl border border-slate-600/30 bg-ct-elevated/60 px-4 py-3.5 text-sm font-medium text-ct-1 placeholder:text-ct-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
            {wodName.length >= 2 && !showBenchmarkPicker && (
              <BenchmarkSuggestions query={wodName} onSelect={onSelectBenchmarkWod} />
            )}
          </div>

          <textarea
            value={wodDescription}
            onChange={(e) => onWodDescriptionChange(e.target.value)}
            placeholder="e.g. 21-15-9 Thrusters & Pull-ups"
            className="h-16 w-full resize-none rounded-xl border border-slate-600/30 bg-ct-elevated/60 px-4 py-3 text-xs text-ct-1 placeholder:text-ct-2 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
          />

          <PreviousResultsPanel
            label="Previous WOD Results"
            results={prevResults}
            onSelect={onLoadWorkoutForEdit}
            accent="cyan"
          />

          <div className="space-y-2 rounded-xl bg-slate-700/30 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap text-[11px] font-medium text-ct-2">Time Cap</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={timeCap}
                onChange={(e) => onTimeCapChange(digitsOnly(e.target.value))}
                placeholder="—"
                className="w-14 rounded-lg border border-slate-600/30 bg-ct-elevated/80 py-1.5 text-center text-sm font-bold text-ct-1 focus:outline-none"
              />
              <span className="text-[11px] text-ct-2">min</span>
              <div className="ml-auto flex gap-1">
                {QUICK_TIME_CAPS.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => onTimeCapChange(cap)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                      timeCap === cap ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-700/30 p-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ct-2">Score</p>
            {renderScoreInputs()}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ct-2">Movements</p>
              <button
                onClick={() => onShowMovementPickerChange(!showMovementPicker)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-cyan-400 active:bg-cyan-500/10"
              >
                <Plus size={12} />
                Add
              </button>
            </div>

            {movements.map((movement, index) => (
              <div
                key={`${movement.name}-${index}`}
                className="mb-2 space-y-2 rounded-xl border border-slate-600/20 bg-slate-700/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ct-1">{movement.name}</p>
                  <button
                    onClick={() => onRemoveMovement(index)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ct-2 active:bg-red-500/10 active:text-red-400"
                    aria-label="Remove movement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] font-medium text-ct-2">Weight ({weightUnit})</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.]*"
                      value={movement.weight}
                      onChange={(e) => onUpdateMovement(index, 'weight', decimalOnly(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-600/30 bg-ct-elevated/80 px-2 py-2 text-center text-xs text-ct-1 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] font-medium text-ct-2">Reps / Scheme</label>
                    <input
                      type="text"
                      value={movement.detail}
                      onChange={(e) => onUpdateMovement(index, 'detail', e.target.value)}
                      placeholder="21-15-9"
                      className="w-full rounded-lg border border-slate-600/30 bg-ct-elevated/80 px-2 py-2 text-center text-xs text-ct-1 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {showMovementPicker && (
              <MovementPicker
                movementSearch={movementSearch}
                onMovementSearchChange={onMovementSearchChange}
                onSelectMovement={onAddMovement}
              />
            )}

            {movements.length === 0 && !showMovementPicker && (
              <p className="py-2 text-center text-xs text-ct-2">Tap "Add" to log movements &amp; weights</p>
            )}
          </div>
        </div>
      )}

      <div className="flex rounded-xl bg-slate-800/40 p-1">
        {(['Scaled', 'RX', 'Elite'] as RxScaled[]).map((level) => (
          <button
            key={level}
            onClick={() => onRxScaledChange(level)}
            className={`flex-1 rounded-lg py-3 text-sm font-bold transition-all ${
              rxScaled === level
                ? level === 'RX'
                  ? 'bg-green-500/15 text-green-400 shadow-sm'
                  : level === 'Elite'
                    ? 'bg-purple-500/15 text-purple-400 shadow-sm'
                    : 'bg-orange-500/15 text-orange-400 shadow-sm'
                : 'text-ct-2'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${showWodSection ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <button
          onClick={() => onPrFlagChange(!prFlag)}
          className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
            prFlag
              ? 'border border-red-400/30 bg-red-500/15 text-red-400 shadow-sm'
              : 'border border-slate-700/30 bg-slate-800/40 text-ct-2'
          }`}
        >
          <Trophy size={16} />
          PR!
        </button>
        {showWodSection && (
          <button
            onClick={() => onIsBenchmarkChange(!isBenchmark)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
              isBenchmark
                ? 'border border-cyan-400/30 bg-cyan-500/15 text-cyan-400 shadow-sm'
                : 'border border-slate-700/30 bg-slate-800/40 text-ct-2'
            }`}
          >
            <Target size={16} />
            Benchmark
          </button>
        )}
      </div>

      <textarea
        value={workoutNotes}
        onChange={(e) => onWorkoutNotesChange(e.target.value)}
        placeholder="Notes (optional)..."
        className="h-16 w-full resize-none rounded-xl border border-slate-700/30 bg-slate-800/40 px-4 py-3 text-sm text-ct-1 placeholder:text-ct-2 focus:outline-none"
      />

      <div className="sticky-save space-y-2 pb-4">
        <button
          onClick={onSaveWorkout}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 py-4 text-base font-bold text-slate-900 shadow-lg shadow-cyan-500/25"
        >
          {saveLabel}
        </button>
        {editingWorkoutId && (
          <button
            onClick={onDeleteWorkout}
            className="w-full rounded-xl border border-red-400/20 bg-red-500/10 py-3 text-sm font-bold text-red-300"
          >
            Delete Workout
          </button>
        )}
      </div>
    </div>
  )
}

