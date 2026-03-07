import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, Trophy, Plus, Minus, Dumbbell, BookOpen, Flame, Zap, Target, Pencil, Trash2, Award, Camera } from 'lucide-react'
import type { WodType, RxScaled, Workout } from '../../types'
import { MovementPicker } from './MovementPicker'
import { BenchmarkWodPicker, BenchmarkSuggestions } from './BenchmarkWodPicker'
import type { BenchmarkWod } from './BenchmarkWodPicker'
import type { MovementEntry } from './constants'
import benchmarkData from '../../data/benchmarkWods.json'

interface WorkoutLoggerProps {
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
  strengthCurrentPR?: { value: number; unit: string; prType: string } | null
  onLoadWorkoutForEdit: (w: Workout) => void
  onDeleteWorkout: () => void
  onClassFormatChange: (format: 'full' | 'wod_only' | 'strength_only') => void
  onWorkoutStepChange: (step: number) => void
  onWodTypeChange: (type: WodType) => void
  onWodNameChange: (value: string) => void
  onWodDescriptionChange: (value: string) => void
  onRxScaledChange: (value: RxScaled) => void
  onPrFlagChange: (value: boolean) => void
  onIsBenchmarkChange: (value: boolean) => void
  onWorkoutNotesChange: (value: string) => void
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void
  onStrengthMovementChange: (value: string) => void
  onStrengthSchemeTypeChange: (type: 'programmed' | 'build') => void
  onStrengthIntervalChange: (value: string) => void
  onStrengthSetsChange: (value: string) => void
  onStrengthRepSchemeChange: (value: string) => void
  onStrengthStartWeightChange: (value: string) => void
  onStrengthEndWeightChange: (value: string) => void
  onStrengthPercentChange: (value: string) => void
  onStrengthBuildTargetChange: (value: string) => void
  onScoreMinChange: (value: string) => void
  onScoreSecChange: (value: string) => void
  onScoreRoundsChange: (value: string) => void
  onScoreRepsChange: (value: string) => void
  onTimeCapChange: (value: string) => void
  onAddMovement: (name: string) => void
  onUpdateMovement: (idx: number, field: keyof MovementEntry, value: string) => void
  onRemoveMovement: (idx: number) => void
  onShowMovementPickerChange: (value: boolean) => void
  onMovementSearchChange: (value: string) => void
  onShowBenchmarkPickerChange: (value: boolean) => void
  onSelectBenchmarkWod: (wod: BenchmarkWod) => void
  onSaveWorkout: () => void
  onClose: () => void
  onSwitchToEvents?: () => void
  onScanWod?: () => void
  onShareWod?: () => void
}

// Quick-select benchmark IDs shown by default in the logger.
const QUICK_SELECT_IDS = ['fran', 'grace', 'helen', 'murph', 'dt', 'annie']
const allBenchmarks = benchmarkData.wods as BenchmarkWod[]

const intervalPresets = [
  { label: '90s', value: '90' },
  { label: '2min', value: '120' },
  { label: '3min', value: '180' },
  { label: '4min', value: '240' },
]

const strengthQuickPicks = [
  'Back Squat',
  'Front Squat',
  'Deadlift',
  'Shoulder Press (Strict Press)',
  'Push Press',
  'Push Jerk',
  'Bench Press',
  'Power Clean',
  'Squat Clean',
  'Power Snatch',
  'Squat Snatch',
  'Clean & Jerk',
]

const buildTargets = ['Heavy Single', 'Heavy Triple', 'Heavy 5']

const repSchemePresets = [
  { label: '5 x 5', scheme: '5-5-5-5-5', helper: '5 sets of 5 reps' },
  { label: '5 x 3', scheme: '3-3-3-3-3', helper: '5 sets of 3 reps' },
  { label: '5 x 2', scheme: '2-2-2-2-2', helper: '5 sets of 2 reps' },
  { label: '5 x 1', scheme: '1-1-1-1-1', helper: '5 heavy singles' },
  { label: '3 x 8', scheme: '8-8-8', helper: '3 volume sets' },
  { label: 'Wave 3/2/1', scheme: '3-3-3-2-2-1-1', helper: '7 total sets' },
]

function countRepSchemeSets(value: string): string {
  const reps = value
    .split('-')
    .map(part => part.trim())
    .filter(part => /^\d+$/.test(part))
  return reps.length > 0 ? String(reps.length) : ''
}

function formatWodTypeLabel(wodType: WodType): string {
  return wodType === 'ForTime' ? 'For Time' : wodType
}

function getScoreHelper(wodType: WodType): string {
  switch (wodType) {
    case 'AMRAP':
      return 'Rounds plus extra reps'
    case 'ForTime':
    case 'Chipper':
      return 'Finish time'
    case 'EMOM':
      return 'Completed rounds'
    case 'Tabata':
      return 'Lowest reps'
    default:
      return 'Workout result'
  }
}

function getMovementPreview(movements: MovementEntry[]): string {
  if (movements.length === 0) return 'No movement details added'
  const preview = movements.slice(0, 3).map(m => m.name).join(' · ')
  return movements.length > 3 ? `${preview} +${movements.length - 3} more` : preview
}

function getSaveSummary(
  classFormat: 'full' | 'wod_only' | 'strength_only',
  wodType: WodType,
  wodName: string,
  strengthMovement: string,
  timeCap: string,
  movements: MovementEntry[],
): string {
  const mainLabel = classFormat === 'strength_only'
    ? (strengthMovement || 'Strength session')
    : (wodName.trim() || formatWodTypeLabel(wodType))

  const parts = [mainLabel]
  if (classFormat !== 'strength_only' && timeCap) parts.push(`${timeCap} min cap`)
  if (movements.length > 0) parts.push(`${movements.length} movement${movements.length === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

/** Previous results inline card */
function PrevResultsCard({ results, label }: { results: Workout[]; label?: string }) {
  const { t } = useTranslation()
  if (results.length === 0) return null
  return (
    <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/15">
      <div className="flex items-center gap-1.5 mb-2">
        <Trophy size={12} className="text-amber-400" />
        <p className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold">
          {label || t('workout.previousResults')}
        </p>
      </div>
      {results.map(w => (
        <div key={w.id} className="flex items-center gap-3 py-1.5 border-b border-amber-500/10 last:border-0">
          <span className="text-[11px] text-ct-2 w-20">{w.date}</span>
          <span className="text-[11px] text-ct-1 font-semibold tabular-nums flex-1">{w.scoreDisplay || ' - '}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            w.rxOrScaled === 'RX' ? 'bg-green-500/20 text-green-400' :
            w.rxOrScaled === 'Elite' ? 'bg-purple-500/20 text-purple-400' :
            'bg-orange-500/20 text-orange-400'
          }`}>{w.rxOrScaled}</span>
          {w.prFlag && <span className="text-[9px] text-red-400 font-bold">PR</span>}
        </div>
      ))}
    </div>
  )
}

/** Section header with icon */
function SectionHeader({ icon: Icon, label, color }: { icon: typeof Dumbbell; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-${color}-500/10`}>
        <Icon size={14} className={`text-${color}-400`} />
      </div>
      <p className={`text-[11px] uppercase tracking-widest text-${color}-400 font-bold`}>{label}</p>
    </div>
  )
}

/** Delete button with confirmation */
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div className="flex gap-2">
        <button onClick={() => setConfirming(false)}
          className="flex-1 py-3 rounded-xl text-sm font-bold bg-ct-surface text-ct-2 active:bg-ct-elevated">
          {t('workout.cancel')}
        </button>
        <button onClick={onDelete}
          className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 border border-red-400/30 active:bg-red-500/25 flex items-center justify-center gap-2">
          <Trash2 size={14} /> {t('workout.confirmDelete')}
        </button>
      </div>
    )
  }
  return (
    <button onClick={() => setConfirming(true)}
      className="w-full py-3 rounded-xl text-sm font-bold text-red-400/70 active:bg-red-500/10 flex items-center justify-center gap-2">
      <Trash2 size={14} /> {t('workout.deleteWorkout')}
    </button>
  )
}

export function WorkoutLogger({
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
}: WorkoutLoggerProps) {
  const [showStrengthMovementPicker, setShowStrengthMovementPicker] = useState(false)
  const [strengthMovementSearch, setStrengthMovementSearch] = useState('')
  const [showMovementDetails, setShowMovementDetails] = useState(false)
  const hasStrength = classFormat === 'full' || classFormat === 'strength_only'
  const hasWod = classFormat === 'full' || classFormat === 'wod_only'
  const hasMovementEntries = movements.length > 0
  const movementPanelOpen = showMovementPicker || showMovementDetails
  const movementHeaderActionLabel = movementPanelOpen ? 'Done' : 'Edit'
  const movementPreview = getMovementPreview(movements)
  const saveSummary = getSaveSummary(classFormat, wodType, wodName, strengthMovement, timeCap, movements)
  const scoreHelper = getScoreHelper(wodType)
  const strengthQuickWeightTarget =
    strengthSchemeType === 'build'
      ? 'top'
      : !strengthStartWeight
        ? 'start'
        : !strengthEndWeight
          ? 'end'
          : 'end'

  const handleMovementHeaderAction = () => {
    if (showMovementPicker) {
      onShowMovementPickerChange(false)
      setShowMovementDetails(false)
      return
    }
    if (showMovementDetails) {
      setShowMovementDetails(false)
      return
    }
    setShowMovementDetails(true)
  }

  const handleStrengthQuickWeight = (weight: number) => {
    const nextWeight = String(weight)

    if (strengthSchemeType === 'build') {
      onStrengthEndWeightChange(nextWeight)
      return
    }

    if (!strengthStartWeight) {
      onStrengthStartWeightChange(nextWeight)
      return
    }

    onStrengthEndWeightChange(nextWeight)
  }

  // === STEP 1: Class Format Selection ===
  if (workoutStep === 1) {
    return (
      <div className="space-y-4 w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-ct-1">{t('training.logWorkout')}</h1>
            <p className="text-xs text-ct-2 mt-0.5">{t('workout.howWasClass')}</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 active:bg-ct-elevated" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Hero: Full Class ── */}
        <button onClick={() => { onClassFormatChange('full'); onWorkoutStepChange(2) }}
          className="w-full relative overflow-hidden bg-gradient-to-br from-cyan-500/15 via-ct-surface to-ct-surface border border-cyan-400/30 rounded-2xl p-5 text-left active:scale-[0.97] transition-all duration-200 shadow-lg shadow-cyan-500/5 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/8 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-cyan-400/10 border border-cyan-400/20 flex items-center justify-center transition-transform duration-200 group-active:scale-90">
              <Dumbbell size={28} strokeWidth={1.8} className="text-cyan-400 drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-ct-1 tracking-tight">{t('workout.fullClass')}</p>
              <p className="text-[12px] text-ct-2 mt-0.5">{t('workout.fullClassDesc')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center">
              <ChevronLeft size={16} className="text-cyan-400/70 rotate-180" />
            </div>
          </div>
        </button>

        {/* ── Grid: WOD Only + Strength Only ── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { onClassFormatChange('wod_only'); onWorkoutStepChange(2) }}
            className="relative overflow-hidden bg-gradient-to-br from-green-500/12 to-ct-surface border border-green-400/25 rounded-2xl p-4 flex flex-col items-center justify-center aspect-[4/3] active:scale-[0.93] transition-all duration-200 shadow-lg shadow-green-500/5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-400/8 border border-green-400/15 flex items-center justify-center mb-2.5 transition-transform duration-200 group-active:scale-90">
              <Flame size={26} strokeWidth={1.8} className="text-green-400 drop-shadow-sm" />
            </div>
            <p className="text-sm font-bold text-ct-1 text-center">{t('workout.wodOnly')}</p>
            <p className="text-[11px] text-ct-2 mt-0.5 text-center">{t('workout.wodOnlyDesc')}</p>
          </button>
          <button onClick={() => { onClassFormatChange('strength_only'); onWorkoutStepChange(2) }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-500/12 to-ct-surface border border-purple-400/25 rounded-2xl p-4 flex flex-col items-center justify-center aspect-[4/3] active:scale-[0.93] transition-all duration-200 shadow-lg shadow-purple-500/5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-400/8 border border-purple-400/15 flex items-center justify-center mb-2.5 transition-transform duration-200 group-active:scale-90">
              <Target size={26} strokeWidth={1.8} className="text-purple-400 drop-shadow-sm" />
            </div>
            <p className="text-sm font-bold text-ct-1 text-center">{t('workout.strengthOnly')}</p>
            <p className="text-[11px] text-ct-2 mt-0.5 text-center">{t('workout.strengthOnlyDesc')}</p>
          </button>
        </div>

        {/* ── Events  -  Open, Hero WODs, Girls Benchmarks ── */}
        {onSwitchToEvents && (
          <button onClick={onSwitchToEvents}
            className="w-full relative overflow-hidden bg-gradient-to-r from-violet-500/12 via-indigo-500/8 to-cyan-500/8 border border-violet-400/25 rounded-2xl p-4 text-left active:scale-[0.97] transition-all duration-200 shadow-lg shadow-violet-500/5 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-400/10 border border-violet-400/15 flex items-center justify-center transition-transform duration-200 group-active:scale-90">
                <Award size={24} strokeWidth={1.8} className="text-violet-400 drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ct-1">{t('workout.crossfitEvents')}</p>
                <p className="text-[11px] text-ct-2 mt-0.5">{t('workout.crossfitEventsDesc')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-violet-400/10 flex items-center justify-center">
                <ChevronLeft size={14} className="text-violet-400/70 rotate-180" />
              </div>
            </div>
          </button>
        )}

        {/* Recent workouts  -  tappable to edit */}
        {workouts.length > 0 && (
          <div className="bg-ct-surface rounded-ct-lg border border-ct-border overflow-hidden">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold px-4 pt-3 pb-2">{t('workout.recentWorkouts')}</p>
            {workouts.slice(0, 4).map(w => (
              <button key={w.id} onClick={() => onLoadWorkoutForEdit(w)}
                className="w-full px-4 py-2.5 border-b border-ct-border last:border-0 text-left active:bg-ct-elevated/50 transition-colors">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-ct-1 font-medium">{w.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ct-2">{w.date}</span>
                    <Pencil size={12} className="text-ct-2" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-ct-2">{w.workoutType}</span>
                  <span className="text-[11px] text-ct-2 tabular-nums">{w.scoreDisplay || ' - '}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    w.rxOrScaled === 'RX' ? 'bg-green-500/20 text-green-400' :
                    w.rxOrScaled === 'Elite' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>{w.rxOrScaled}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // === STEP 2: Details Form ===
  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Header  -  clean, modern */}
      <div className="flex items-center gap-2">
        <button onClick={() => onWorkoutStepChange(1)} className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 active:bg-ct-elevated shrink-0" aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-ct-1 truncate">
            {editingWorkoutId ? t('workout.editWorkout') : classFormat === 'full' ? t('workout.fullClass') : classFormat === 'wod_only' ? t('workout.wodOnly') : t('workout.strengthOnly')}
          </h1>
          {editingWorkoutId && <p className="text-[11px] text-amber-400">{t('workout.editingSaved')}</p>}
        </div>
        {/* kg/lbs toggle  -  pill style */}
        <div className="flex bg-ct-surface rounded-xl p-1 gap-1">
          {(['lbs', 'kg'] as const).map(u => (
            <button key={u} onClick={() => onWeightUnitChange(u)}
              className={`min-w-[52px] px-4 py-2 rounded-lg text-[12px] font-bold tracking-wide transition-all ${
                weightUnit === u ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-400/20' : 'text-ct-2'
              }`}>{u}</button>
          ))}
        </div>
        <button onClick={onClose} className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 active:bg-ct-elevated" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* ====== STRENGTH SECTION ====== */}
      {hasStrength && (
        <div className="bg-gradient-to-b from-purple-500/5 to-ct-surface/40 rounded-ct-lg p-4 border border-purple-400/15 space-y-4">
          <SectionHeader icon={Target} label={t('workout.strength')} color="purple" />

          <div className="space-y-2">
            <div className="relative">
              <input type="text" value={strengthMovement} onChange={e => onStrengthMovementChange(e.target.value)}
                placeholder={t('workout.movementPlaceholder')}
                className="w-full bg-ct-elevated/60 rounded-xl py-3.5 pl-4 pr-24 text-ct-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/40 placeholder:text-ct-2 border border-ct-border/30" autoFocus />
              <button
                type="button"
                onClick={() => setShowStrengthMovementPicker(current => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-xs font-semibold text-ct-2 active:bg-purple-500/10"
              >
                {showStrengthMovementPicker ? 'Close' : 'All Lifts'}
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">Quick Picks</p>
              <div className="flex flex-wrap gap-1.5">
                {strengthQuickPicks.map(pick => {
                  const isActive = strengthMovement === pick
                  return (
                    <button
                      key={pick}
                      type="button"
                      onClick={() => onStrengthMovementChange(isActive ? '' : pick)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                          : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                      }`}
                    >
                      {pick}
                    </button>
                  )
                })}
              </div>
            </div>

            {showStrengthMovementPicker && (
              <div className="rounded-xl border border-purple-400/15 bg-ct-elevated/20 p-2">
                <MovementPicker
                  movementSearch={strengthMovementSearch}
                  onMovementSearchChange={setStrengthMovementSearch}
                  onSelectMovement={(name) => {
                    onStrengthMovementChange(name)
                    setShowStrengthMovementPicker(false)
                    setStrengthMovementSearch('')
                  }}
                />
              </div>
            )}
          </div>

          {/* Inline PR display */}
          {strengthCurrentPR && (
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <Trophy size={12} className="text-yellow-400" />
              <span className="text-[11px] text-yellow-400 font-semibold">
                PR: {strengthCurrentPR.value} {strengthCurrentPR.unit}
              </span>
              <span className="text-[11px] text-ct-2">({strengthCurrentPR.prType.toUpperCase()})</span>
            </div>
          )}

          {/* Previous results for strength movement */}
          <PrevResultsCard results={strengthPrevResults} label={t('workout.previousStrength')} />

          {/* Scheme type toggle  -  pill style */}
          <div className="flex bg-ct-elevated/40 rounded-xl p-1">
            <button onClick={() => onStrengthSchemeTypeChange('programmed')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                strengthSchemeType === 'programmed' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-ct-2'
              }`}>{t('workout.programmedSets')}</button>
            <button onClick={() => onStrengthSchemeTypeChange('build')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                strengthSchemeType === 'build' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-ct-2'
              }`}>{t('workout.buildToHeavy')}</button>
          </div>

          {/* Programmed: Interval x Sets + Rep Scheme */}
          {strengthSchemeType === 'programmed' && (
            <div className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">Interval</label>
                  <div className="flex gap-1">
                    {intervalPresets.map(ip => (
                      <button key={ip.value} onClick={() => onStrengthIntervalChange(ip.value)}
                        className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
                          strengthInterval === ip.value ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                        }`}>{ip.label}</button>
                    ))}
                  </div>
                </div>
                <div className="w-16">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.sets')}</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={strengthSets} onChange={e => onStrengthSetsChange(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-ct-elevated/60 rounded-lg py-2.5 text-ct-1 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-purple-400/40 border border-ct-border/30" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.repScheme')}</label>
                <p className="text-xs text-ct-2 mb-2">Tap a preset and TrackVolt fills both sets and reps for you.</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {repSchemePresets.map(preset => {
                    const isActive = strengthRepScheme === preset.scheme
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onStrengthRepSchemeChange(preset.scheme)
                          onStrengthSetsChange(String(preset.scheme.split('-').length))
                        }}
                        className={`rounded-xl px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                        }`}
                      >
                        <p className="text-sm font-bold">{preset.label}</p>
                        <p className="text-xs mt-0.5">{preset.helper}</p>
                      </button>
                    )
                  })}
                </div>
                <input type="text" value={strengthRepScheme} onChange={e => {
                  const value = e.target.value
                  onStrengthRepSchemeChange(value)
                  const countedSets = countRepSchemeSets(value)
                  if (countedSets) onStrengthSetsChange(countedSets)
                }}
                  placeholder="Custom reps (e.g. 3-3-2-2-1-1)"
                  className="w-full bg-ct-elevated/60 rounded-lg py-2.5 px-3 text-ct-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400/40 placeholder:text-ct-2 border border-ct-border/30" />
              </div>
            </div>
          )}

          {/* Build to Heavy  -  multi-rep max */}
          {strengthSchemeType === 'build' && (
            <div className="grid grid-cols-3 gap-1.5">
              {buildTargets.map(tgt => (
                <button key={tgt} onClick={() => onStrengthBuildTargetChange(tgt)}
                  className={`py-3 rounded-xl text-[11px] font-bold transition-all ${
                    strengthBuildTarget === tgt ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30 shadow-sm' : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                  }`}>{tgt}</button>
              ))}
            </div>
          )}

          {/* Weight entry  -  match the strength prescription style */}
          <div className="bg-ct-elevated/30 rounded-xl p-3 space-y-3">
            <div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">Weight</p>
                <p className="text-xs text-ct-2 mt-1">
                  {strengthSchemeType === 'programmed'
                    ? 'First work set -> final work set.'
                    : 'Log the heaviest successful set from class.'}
                </p>
              </div>
            </div>

            {strengthSchemeType === 'build' ? (
              <div>
                <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">Top Weight ({weightUnit})</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={strengthEndWeight}
                  onChange={e => onStrengthEndWeightChange(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full bg-ct-elevated/80 rounded-xl py-3 text-ct-1 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400/30 tabular-nums border border-ct-border/30"
                />
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.start')} ({weightUnit})</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={strengthStartWeight} onChange={e => onStrengthStartWeightChange(e.target.value.replace(/\D/g, ''))}
                    placeholder="0" className={`w-full rounded-xl py-3 text-ct-1 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400/30 tabular-nums border transition-all ${
                      strengthQuickWeightTarget === 'start'
                        ? 'bg-purple-500/10 border-purple-400/35 shadow-[0_0_0_1px_rgba(196,181,253,0.18)]'
                        : 'bg-ct-elevated/80 border-ct-border/30'
                    }`} />
                </div>
                <div className="pb-3">
                  <span className="text-ct-2 text-lg font-bold">{'->'}</span>
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.end')} ({weightUnit})</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={strengthEndWeight} onChange={e => onStrengthEndWeightChange(e.target.value.replace(/\D/g, ''))}
                    placeholder="0" className={`w-full rounded-xl py-3 text-ct-1 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-400/30 tabular-nums border transition-all ${
                      strengthQuickWeightTarget === 'end'
                        ? 'bg-purple-500/10 border-purple-400/35 shadow-[0_0_0_1px_rgba(196,181,253,0.18)]'
                        : 'bg-ct-elevated/80 border-ct-border/30'
                    }`} />
                </div>
              </div>
            )}

            {/* Quick weight buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-ct-2 font-semibold">Quick weights</p>
                <p className="text-[11px] text-purple-300 font-medium">
                  Filling: {strengthQuickWeightTarget === 'start' ? t('workout.start') : strengthQuickWeightTarget === 'end' ? t('workout.end') : 'Top Weight'}
                </p>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
              {(weightUnit === 'kg' ? [40, 50, 60, 70, 80, 90, 100, 110, 120] : [45, 65, 95, 115, 135, 155, 185, 205, 225, 275, 315]).map(w => (
                <button key={w} onClick={() => handleStrengthQuickWeight(w)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                    (strengthEndWeight === String(w) || strengthStartWeight === String(w))
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30'
                      : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                  }`}>{w}</button>
              ))}
            </div>
            </div>
          </div>

          {/* @% of 1RM */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-ct-2 font-medium">@</span>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={strengthPercent} onChange={e => onStrengthPercentChange(e.target.value.replace(/\D/g, ''))}
              placeholder=" - " className="w-16 bg-ct-elevated/60 rounded-lg py-2 text-ct-1 text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-purple-400/40 border border-ct-border/30" />
            <span className="text-xs text-ct-2 font-medium">{t('workout.percentOf1RM')}</span>
          </div>
        </div>
      )}

      {/* ====== WOD SECTION ====== */}
      {hasWod && (
        <div className={`bg-gradient-to-b from-cyan-500/5 to-ct-surface/40 rounded-ct-lg p-4 border border-cyan-400/15 space-y-4 ${hasStrength ? 'mt-7' : ''}`}>
          <div className="flex items-center justify-between">
            <SectionHeader icon={Flame} label="WOD" color="cyan" />
            <div className="flex items-center gap-2 rounded-xl border border-ct-border/20 bg-ct-elevated/25 px-1.5 py-1">
              {/* Scan WOD Button */}
              {onScanWod && (
                <button
                  onClick={onScanWod}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-ct-2 active:bg-violet-500/10 active:text-violet-300 card-press"
                >
                  <Camera size={12} />
                  {t('workout.scan')}
                </button>
              )}
              {/* Benchmark WOD Library Button */}
              <button
                onClick={() => onShowBenchmarkPickerChange(!showBenchmarkPicker)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all card-press ${
                  showBenchmarkPicker
                    ? 'bg-cyan-500/14 text-cyan-300 border border-cyan-400/20'
                    : 'text-ct-2 active:bg-cyan-500/10 active:text-cyan-300 border border-transparent'
                }`}
              >
                <BookOpen size={12} />
                {t('workout.all')}
              </button>
            </div>
          </div>

          {/* Quick Select  -  popular benchmarks */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-ct-2 font-semibold">Popular benchmarks</p>
            <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
            <div className="inline-flex gap-1 rounded-2xl border border-cyan-500/8 bg-cyan-500/[0.025] p-1.5" style={{ minWidth: 'max-content' }}>
              {QUICK_SELECT_IDS.map(id => {
                const wod = allBenchmarks.find(w => w.id === id)
                if (!wod) return null
                const isActive = wodName.toLowerCase() === wod.name.toLowerCase()
                return (
                  <button key={id}
                    onClick={() => onSelectBenchmarkWod(wod)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all min-h-[32px] ${
                      isActive
                        ? 'bg-cyan-500/18 text-cyan-300 border border-cyan-400/25 shadow-sm'
                        : 'bg-ct-elevated/42 text-ct-2 border border-transparent active:scale-95'
                    }`}
                  >
                    {wod.name}
                  </button>
                )
              })}
            </div>
          </div>
          </div>

          {/* Benchmark WOD Picker */}
          {showBenchmarkPicker && (
            <BenchmarkWodPicker
              searchValue={wodName}
              onSelect={onSelectBenchmarkWod}
              onClose={() => onShowBenchmarkPickerChange(false)}
            />
          )}

          {/* WOD type selector  -  cleaner pill grid */}
          <div className="flex flex-wrap gap-1.5">
            {(['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Other'] as WodType[]).map(wt => (
              <button key={wt} onClick={() => onWodTypeChange(wt)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  wodType === wt ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-sm' : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                }`}>{wt === 'ForTime' ? 'For Time' : wt}</button>
            ))}
          </div>

          {/* WOD Name + Inline Benchmark Suggestions */}
          <div className="relative">
            <input type="text" value={wodName} onChange={e => onWodNameChange(e.target.value)}
              placeholder={t('workout.wodNamePlaceholder')}
              className="w-full bg-ct-elevated/60 rounded-xl py-3.5 px-4 text-ct-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400/40 placeholder:text-ct-2 border border-ct-border/30" />
            {/* Inline benchmark suggestions as you type */}
            {wodName.length >= 2 && !showBenchmarkPicker && (
              <BenchmarkSuggestions
                query={wodName}
                onSelect={onSelectBenchmarkWod}
              />
            )}
          </div>

          <textarea value={wodDescription} onChange={e => onWodDescriptionChange(e.target.value)}
            placeholder={t('workout.wodDescPlaceholder')}
            className="w-full bg-ct-elevated/60 rounded-xl py-3 px-4 text-ct-1 text-xs focus:outline-none h-16 resize-none focus:ring-1 focus:ring-cyan-400/40 placeholder:text-ct-2 border border-ct-border/30" />

          {/* Previous Results  -  auto-loaded when WOD name matches */}
          <PrevResultsCard results={prevResults} label={t('workout.previousWod')} />

          {/* Time Cap */}
          <div className="bg-ct-elevated/30 rounded-xl px-3 py-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-ct-2 font-medium whitespace-nowrap">{t('workout.timeCap')}</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={timeCap} onChange={e => onTimeCapChange(e.target.value.replace(/\D/g, ''))}
                placeholder=" - " className="w-14 bg-ct-elevated/80 rounded-lg py-1.5 text-ct-1 text-sm font-bold text-center focus:outline-none border border-ct-border/30" />
              <span className="text-[11px] text-ct-2">{t('workout.min')}</span>
              <div className="flex gap-1 ml-auto">
                {[12, 15, 18, 20].map(tc => (
                  <button key={tc} onClick={() => onTimeCapChange(String(tc))}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      timeCap === String(tc) ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
                    }`}>{tc}</button>
                ))}
              </div>
            </div>
          </div>

          {/* WOD Movements */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('workout.movements')}</p>
              {(hasMovementEntries || movementPanelOpen) && (
                <button
                  onClick={handleMovementHeaderAction}
                  className="text-xs text-cyan-400 font-semibold flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-lg active:bg-cyan-500/10"
                >
                  {movementPanelOpen ? <X size={14} /> : <Pencil size={14} />}
                  {movementHeaderActionLabel}
                </button>
              )}
            </div>

            {hasMovementEntries && !movementPanelOpen && (
              <button
                type="button"
                onClick={() => setShowMovementDetails(true)}
                className="mb-2 w-full rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] px-3 py-2.5 text-left active:bg-cyan-500/[0.08]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-ct-1">{movements.length} movement{movements.length === 1 ? '' : 's'} added</p>
                    <p className="text-[11px] text-ct-2 truncate">{movementPreview}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Edit</span>
                </div>
              </button>
            )}

            {showMovementDetails && (
              <div className="space-y-2">
                {movements.map((m, idx) => (
                  <div key={idx} className="bg-ct-elevated/30 rounded-xl p-3 space-y-2 border border-ct-border/20">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-ct-1">{m.name}</p>
                      <button onClick={() => onRemoveMovement(idx)} className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-ct-2 active:text-red-400 active:bg-red-500/10" aria-label="Remove movement"><X size={16} /></button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] text-ct-2 block mb-0.5 font-medium">{t('workout.weight')} ({weightUnit})</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={m.weight} onChange={e => onUpdateMovement(idx, 'weight', e.target.value.replace(/\D/g, ''))}
                          placeholder="0" className="w-full bg-ct-elevated/80 rounded-lg py-2 px-2 text-ct-1 text-xs text-center focus:outline-none tabular-nums border border-ct-border/30" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] text-ct-2 block mb-0.5 font-medium">{t('workout.repsScheme')}</label>
                        <input type="text" value={m.detail} onChange={e => onUpdateMovement(idx, 'detail', e.target.value)}
                          placeholder="21-15-9" className="w-full bg-ct-elevated/80 rounded-lg py-2 px-2 text-ct-1 text-xs text-center focus:outline-none border border-ct-border/30" />
                      </div>
                    </div>
                  </div>
                ))}

                {!showMovementPicker && (
                  <button
                    type="button"
                    onClick={() => onShowMovementPickerChange(true)}
                    className="w-full rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] px-3 py-2.5 text-sm font-semibold text-cyan-300 active:bg-cyan-500/[0.08]"
                  >
                    Add another movement
                  </button>
                )}
              </div>
            )}

            {showMovementPicker && (
              <MovementPicker
                movementSearch={movementSearch}
                onMovementSearchChange={onMovementSearchChange}
                onSelectMovement={onAddMovement}
              />
            )}

            {!hasMovementEntries && !showMovementPicker && (
              <button
                type="button"
                onClick={() => onShowMovementPickerChange(true)}
                className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-4 text-left active:bg-cyan-500/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ct-1">
                      No <span className="text-cyan-400">WOD</span> movements added yet
                    </p>
                    <p className="text-xs text-ct-2 mt-1 leading-relaxed">
                      Tap here to track weights, rep details, or skill work inside the WOD.
                    </p>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-xl border border-cyan-400/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Plus size={18} />
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Smart Score Entry  -  elevated card */}
          <div className="bg-ct-elevated/30 rounded-xl p-3">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{t('workout.score')}</p>
              <p className="text-[11px] text-ct-2">{scoreHelper}</p>
            </div>

            {/* AMRAP: Rounds + Reps */}
            {wodType === 'AMRAP' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-ct-elevated/20 p-2.5">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium text-center">{t('workout.rounds')}</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onScoreRoundsChange(String(Math.max(0, (parseInt(scoreRounds) || 0) - 1)))}
                      className="w-11 h-11 shrink-0 bg-ct-elevated/80 rounded-lg flex items-center justify-center active:bg-ct-elevated border border-ct-border/30"><Minus size={14} className="text-ct-2" /></button>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={scoreRounds} onChange={e => onScoreRoundsChange(e.target.value.replace(/\D/g, ''))}
                      className="min-w-0 flex-1 bg-ct-elevated/80 rounded-lg py-2 text-ct-1 text-lg font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="0" />
                    <button onClick={() => onScoreRoundsChange(String((parseInt(scoreRounds) || 0) + 1))}
                      className="w-11 h-11 shrink-0 bg-cyan-500/10 rounded-lg flex items-center justify-center active:bg-cyan-500/20 border border-cyan-400/20"><Plus size={14} className="text-cyan-400" /></button>
                  </div>
                </div>
                <div className="rounded-xl bg-ct-elevated/20 p-2.5">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium text-center">{t('workout.plusReps')}</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onScoreRepsChange(String(Math.max(0, (parseInt(scoreReps) || 0) - 1)))}
                      className="w-11 h-11 shrink-0 bg-ct-elevated/80 rounded-lg flex items-center justify-center active:bg-ct-elevated border border-ct-border/30"><Minus size={14} className="text-ct-2" /></button>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" value={scoreReps} onChange={e => onScoreRepsChange(e.target.value.replace(/\D/g, ''))}
                      className="min-w-0 flex-1 bg-ct-elevated/80 rounded-lg py-2 text-ct-1 text-lg font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="0" />
                    <button onClick={() => onScoreRepsChange(String((parseInt(scoreReps) || 0) + 1))}
                      className="w-11 h-11 shrink-0 bg-cyan-500/10 rounded-lg flex items-center justify-center active:bg-cyan-500/20 border border-cyan-400/20"><Plus size={14} className="text-cyan-400" /></button>
                  </div>
                </div>
              </div>
            )}

            {/* ForTime / Chipper: MM:SS */}
            {(wodType === 'ForTime' || wodType === 'Chipper') && (
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.min')}</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={scoreMin} onChange={e => onScoreMinChange(e.target.value.replace(/\D/g, ''))}
                    className="w-18 bg-ct-elevated/80 rounded-xl py-2.5 text-ct-1 text-xl font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="0" style={{ width: '4.5rem' }} />
                </div>
                <span className="text-xl text-ct-2 font-bold mt-5">:</span>
                <div className="text-center">
                  <label className="text-[11px] text-ct-2 block mb-1.5 font-medium">{t('workout.sec')}</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={scoreSec} onChange={e => onScoreSecChange(e.target.value.replace(/\D/g, ''))}
                    className="w-18 bg-ct-elevated/80 rounded-xl py-2.5 text-ct-1 text-xl font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="00" style={{ width: '4.5rem' }} />
                </div>
              </div>
            )}

            {/* EMOM: Rounds */}
            {wodType === 'EMOM' && (
              <div className="flex items-center gap-2 justify-center">
                <button onClick={() => onScoreRoundsChange(String(Math.max(0, (parseInt(scoreRounds) || 0) - 1)))}
                  className="w-11 h-11 shrink-0 bg-ct-elevated/80 rounded-xl flex items-center justify-center active:bg-ct-elevated border border-ct-border/30"><Minus size={14} className="text-ct-2" /></button>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={scoreRounds} onChange={e => onScoreRoundsChange(e.target.value.replace(/\D/g, ''))}
                  className="w-20 bg-ct-elevated/80 rounded-xl py-2.5 text-ct-1 text-xl font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="0" />
                <button onClick={() => onScoreRoundsChange(String((parseInt(scoreRounds) || 0) + 1))}
                  className="w-11 h-11 shrink-0 bg-orange-500/10 rounded-xl flex items-center justify-center active:bg-orange-500/20 border border-orange-400/20"><Plus size={14} className="text-orange-400" /></button>
                <span className="text-xs text-ct-2 font-medium">{t('workout.emomRounds')}</span>
              </div>
            )}

            {/* Tabata: Lowest reps */}
            {wodType === 'Tabata' && (
              <div className="flex items-center gap-2 justify-center">
                <button onClick={() => onScoreRepsChange(String(Math.max(0, (parseInt(scoreReps) || 0) - 1)))}
                  className="w-11 h-11 shrink-0 bg-ct-elevated/80 rounded-xl flex items-center justify-center active:bg-ct-elevated border border-ct-border/30"><Minus size={14} className="text-ct-2" /></button>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={scoreReps} onChange={e => onScoreRepsChange(e.target.value.replace(/\D/g, ''))}
                  className="w-20 bg-ct-elevated/80 rounded-xl py-2.5 text-ct-1 text-xl font-bold text-center focus:outline-none tabular-nums border border-ct-border/30" placeholder="0" />
                <button onClick={() => onScoreRepsChange(String((parseInt(scoreReps) || 0) + 1))}
                  className="w-11 h-11 shrink-0 bg-yellow-500/10 rounded-xl flex items-center justify-center active:bg-yellow-500/20 border border-yellow-400/20"><Plus size={14} className="text-yellow-400" /></button>
                <span className="text-xs text-ct-2 font-medium">{t('workout.lowestReps')}</span>
              </div>
            )}

            {/* Other: Freeform */}
            {wodType === 'Other' && (
              <input type="text" value={scoreRounds} onChange={e => onScoreRoundsChange(e.target.value)}
                placeholder={t('workout.scorePlaceholder')}
                className="w-full bg-ct-elevated/80 rounded-xl py-3 px-4 text-ct-1 text-sm focus:outline-none border border-ct-border/30" />
            )}
          </div>
        </div>
      )}

      {/* Scaled / RX / Elite  -  pill toggle style */}
      <div className="pt-1">
      <div className="flex bg-ct-surface rounded-xl p-1">
        {(['Scaled', 'RX', 'Elite'] as RxScaled[]).map(rx => (
          <button key={rx} onClick={() => onRxScaledChange(rx)}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              rxScaled === rx
                ? rx === 'RX' ? 'bg-green-500/15 text-green-400 shadow-sm'
                  : rx === 'Elite' ? 'bg-purple-500/15 text-purple-400 shadow-sm'
                  : 'bg-orange-500/15 text-orange-400 shadow-sm'
                : 'text-ct-2'
            }`}>{rx}</button>
        ))}
      </div>
      </div>

      {/* PR + Benchmark  -  icon buttons */}
      <div className="flex gap-3 pt-1">
        <button onClick={() => onPrFlagChange(!prFlag)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
            prFlag ? 'bg-red-500/15 text-red-400 border border-red-400/30 shadow-sm' : 'bg-ct-surface text-ct-2 border border-ct-border'
          }`}><Trophy size={16} /> PR!</button>
        <button onClick={() => onIsBenchmarkChange(!isBenchmark)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
            isBenchmark ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30 shadow-sm' : 'bg-ct-surface text-ct-2 border border-ct-border'
          }`}><Zap size={16} /> {t('workout.benchmark')}</button>
      </div>

      {/* Notes */}
      <textarea value={workoutNotes} onChange={e => onWorkoutNotesChange(e.target.value)}
        placeholder={t('workout.notesPlaceholder')}
        className="w-full bg-ct-surface border border-ct-border rounded-xl py-3 px-4 text-ct-1 text-sm focus:outline-none h-16 resize-none placeholder:text-ct-2" />

      {/* Save + Delete buttons */}
      <div className="sticky-save space-y-2">
        <div className="rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/[0.06] to-transparent px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-semibold">Ready to save</p>
          <p className="text-sm font-semibold text-ct-1 mt-1">{saveSummary}</p>
          <p className="text-[11px] text-ct-2 mt-1">Review score, tags, and notes, then save this workout.</p>
        </div>
        <button onClick={onSaveWorkout}
          className="w-full bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl btn-press text-base shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
          {editingWorkoutId ? t('workout.updateWorkout') : t('workout.saveWorkout')}
        </button>
        {editingWorkoutId && (
          <DeleteButton onDelete={onDeleteWorkout} />
        )}
      </div>
    </div>
  )
}
