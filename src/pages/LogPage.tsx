import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { calcMacros, today } from '../utils/macros'
import { benchmarkWodsSeed } from '../data/benchmarkWods'
import type { FoodItem, MealType, WodType, RxScaled } from '../types'
import { Dumbbell, UtensilsCrossed, Scale, Moon, Droplets, Zap, Search, X, Timer, Activity, Heart, Trophy, ChevronLeft } from 'lucide-react'

type LogMode = null | 'workout' | 'meal' | 'weight' | 'sleep' | 'water' | 'energy' | 'recovery' | 'cycle'
type WorkoutStep = 'type' | 'full-class' | 'wod-only' | 'strength-only' | 'events'
type StrengthMode = 'programmed' | 'heavy'
type HeavyType = 'single' | 'triple' | 'five'

const CARD  = 'var(--bg-card)'
const RAISED = 'var(--bg-raised)'
const INPUT  = 'var(--bg-input)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const GLOW   = 'var(--volt-glow)'
const BSTR   = 'var(--border-str)'
const TXT2   = 'var(--text-secondary)'
const TXT3   = 'var(--text-muted)'
const APP    = 'var(--bg-app)'

const QUICK_WEIGHTS = [95, 115, 135, 155, 185, 205, 225, 275, 315]
const REP_SCHEMES = ['6-6-6-6-6', '5-5-5-5-5', '3-3-3-2-2-1-1', '3-3-3-3-3', '2-2-2-2-2', '12-12-12-12']
const INTERVALS = ['Every 90s', 'Every 2min', 'Every 3min', 'Every 4min']
const QUICK_WODS = ['Fran', 'Cindy', 'Grace', 'Helen', 'Murph', 'DT', 'Annie', 'Karen', 'Diane', 'Jackie', 'Fight Gone Bad']
const WOD_TYPES: WodType[] = ['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Strength', 'StrengthMetcon', 'HYROX', 'Running', 'Cardio', 'Other']

const EVENTS = [
  { name: 'CrossFit Open 26.1', category: 'open', description: 'For Time — Wall-Ball Shots & Box Jump-Overs chipper', wodType: 'ForTime' as WodType, timeCap: '12 min' },
  { name: 'CrossFit Open 26.2', category: 'open', description: 'To be announced', wodType: 'Other' as WodType },
  { name: 'CrossFit Open 26.3', category: 'open', description: 'To be announced', wodType: 'Other' as WodType },
]

function PillButton({ active, onClick, children, className = '' }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      style={active
        ? { background: GLOW, color: VOLT, borderColor: BSTR }
        : { background: RAISED, color: TXT2, borderColor: BORDER }
      }
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export function LogPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<LogMode>(null)
  const { foods, templates, loadFoods, loadTemplates, saveDailyLog, saveMealLog, saveWorkout, addMealFromTemplate, loadTodayLog, showToast } = useStore()

  useEffect(() => { loadFoods(); loadTemplates(); loadTodayLog() }, [])

  // Meal state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [foodSearch, setFoodSearch] = useState('')

  // Workout state
  const [workoutStep, setWorkoutStep] = useState<WorkoutStep>('type')
  const [wodType, setWodType] = useState<WodType>('AMRAP')
  const [wodName, setWodName] = useState('')
  const [wodDesc, setWodDesc] = useState('')
  const [scoreDisplay, setScoreDisplay] = useState('')
  const [rxScaled, setRxScaled] = useState<RxScaled>('RX')
  const [prFlag, setPrFlag] = useState(false)
  const [isBenchmark, setIsBenchmark] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState('')

  // Strength state
  const [strengthMode, setStrengthMode] = useState<StrengthMode>('programmed')
  const [movementName, setMovementName] = useState('')
  const [interval, setInterval] = useState('Every 2min')
  const [setsCount, setSetsCount] = useState('5')
  const [repScheme, setRepScheme] = useState('5-5-5-5-5')
  const [customReps, setCustomReps] = useState('')
  const [heavyType, setHeavyType] = useState<HeavyType>('single')
  const [startWeight, setStartWeight] = useState('')
  const [endWeight, setEndWeight] = useState('')
  const [useKg, setUseKg] = useState(false)

  // Events state
  const [eventSearch, setEventSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null)

  // Show all benchmarks state
  const [showAllBenchmarks, setShowAllBenchmarks] = useState(false)

  // Metric state
  const [metricValue, setMetricValue] = useState('')

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
    (f.nameZh && f.nameZh.includes(foodSearch))
  )
  const macros = selectedFood && grams ? calcMacros(selectedFood, parseFloat(grams) || 0) : null

  const handleSaveMeal = async () => {
    if (!selectedFood || !grams) return
    const g = parseFloat(grams)
    const m = calcMacros(selectedFood, g)
    await saveMealLog({ date: today(), mealType, foodId: selectedFood.id!, foodName: selectedFood.name, grams: g, ...m })
    setSelectedFood(null); setGrams(''); setFoodSearch('')
    showToast('Meal logged!')
  }

  const resetWorkoutState = () => {
    setWorkoutStep('type')
    setWodType('AMRAP'); setWodName(''); setWodDesc(''); setScoreDisplay('')
    setRxScaled('RX'); setPrFlag(false); setIsBenchmark(false); setWorkoutNotes('')
    setMovementName(''); setStartWeight(''); setEndWeight('')
    setStrengthMode('programmed'); setRepScheme('5-5-5-5-5'); setCustomReps('')
    setHeavyType('single'); setSelectedEvent(null); setEventSearch(''); setEventFilter('all')
    setShowAllBenchmarks(false)
  }

  const handleSaveWorkout = async (opts?: { strengthOnly?: boolean; fullClass?: boolean }) => {
    const parts: string[] = []
    if (opts?.strengthOnly || opts?.fullClass) {
      if (movementName) parts.push(movementName)
    }
    if (!opts?.strengthOnly) {
      if (wodName) parts.push(wodName)
    }
    const name = parts.join(' + ') || wodName || movementName || 'Workout'

    let desc = ''
    if (opts?.strengthOnly || opts?.fullClass) {
      const mode = strengthMode === 'programmed'
        ? `${interval}, ${setsCount} sets @ ${repScheme || customReps}`
        : `Build to Heavy ${heavyType === 'single' ? 'Single (1RM)' : heavyType === 'triple' ? 'Triple (3RM)' : 'Five (5RM)'}`
      desc += `Strength: ${movementName} — ${mode}`
      if (startWeight || endWeight) desc += ` | ${startWeight}→${endWeight} ${useKg ? 'kg' : 'lbs'}`
    }
    if (!opts?.strengthOnly && wodDesc) {
      desc += (desc ? '\n' : '') + `WOD: ${wodDesc}`
    }

    const type: WodType = opts?.strengthOnly ? 'Strength' : opts?.fullClass ? 'StrengthMetcon' : wodType

    await saveWorkout({
      date: today(),
      workoutType: type,
      name,
      description: desc || undefined,
      scoreDisplay: scoreDisplay || undefined,
      rxOrScaled: rxScaled,
      prFlag,
      isBenchmark,
      notes: workoutNotes || undefined,
      movements: movementName ? [movementName] : undefined,
      loads: startWeight || endWeight ? { [movementName || 'main']: `${startWeight}-${endWeight} ${useKg ? 'kg' : 'lbs'}` } : undefined,
    } as any)
    setMode(null)
    resetWorkoutState()
    showToast('Workout logged!')
  }

  const handleSaveEvent = async () => {
    if (!selectedEvent) return
    await saveWorkout({
      date: today(),
      workoutType: selectedEvent.wodType,
      name: selectedEvent.name,
      description: selectedEvent.description,
      scoreDisplay: scoreDisplay || undefined,
      rxOrScaled: rxScaled,
      prFlag,
      isBenchmark: true,
      notes: workoutNotes || undefined,
    } as any)
    setMode(null)
    resetWorkoutState()
    showToast('Event logged!')
  }

  const handleSaveMetric = async (type: string) => {
    const val = parseFloat(metricValue)
    if (isNaN(val)) return
    const update: Record<string, any> = {}
    if (type === 'weight') update.weightKg = val
    if (type === 'sleep')  update.sleepHours = val
    if (type === 'water')  update.waterMl = val
    if (type === 'energy') update.energy = Math.min(5, Math.max(1, Math.round(val)))
    if (type === 'recovery') update.notes = `Recovery: ${Math.min(5, Math.max(1, Math.round(val)))}/5`
    await saveDailyLog(update)
    setMetricValue(''); setMode(null); loadTodayLog()
    showToast('Saved!')
  }

  const selectQuickWod = (name: string) => {
    const wod = benchmarkWodsSeed.find(w => w.name === name)
    if (wod) {
      setWodName(wod.name)
      setWodDesc(wod.description)
      setWodType(wod.wodType as WodType)
      setIsBenchmark(true)
    }
  }

  const mealTypes: MealType[] = ['breakfast', 'post_workout', 'lunch', 'snack', 'dinner']

  const handleCardClick = (id: string) => {
    setMetricValue('')
    if (id === 'crossfit')  { resetWorkoutState(); setMode('workout'); return }
    if (id === 'hyrox')     { resetWorkoutState(); setWodType('ForTime'); setMode('workout'); setWorkoutStep('wod-only'); return }
    if (id === 'run')       { resetWorkoutState(); setWodType('Running'); setMode('workout'); setWorkoutStep('wod-only'); return }
    if (id === 'cycle')     { setMode('cycle'); return }
    setMode(id as LogMode)
  }

  const categories = [
    {
      title: t('logMode.training'),
      iconColor: 'var(--volt)',
      items: [
        { id: 'crossfit', icon: Dumbbell,  label: t('log.workout'),       border: 'rgba(200,255,0,0.25)' },
        { id: 'hyrox',    icon: Timer,     label: t('logMode.hyrox'),     border: 'rgba(251,146,60,0.25)' },
        { id: 'run',      icon: Activity,  label: t('logMode.runCardio'), border: 'rgba(74,222,128,0.25)' },
      ],
    },
    {
      title: t('logMode.bodyNutrition'),
      iconColor: 'var(--orange)',
      items: [
        { id: 'meal',   icon: UtensilsCrossed, label: t('log.meal'),      border: 'rgba(52,211,153,0.25)' },
        { id: 'weight', icon: Scale,           label: t('log.weightLog'), border: 'rgba(192,132,252,0.25)' },
        { id: 'water',  icon: Droplets,        label: t('log.waterLog'),  border: 'rgba(96,165,250,0.25)' },
      ],
    },
    {
      title: t('logMode.wellness'),
      iconColor: 'var(--indigo)',
      items: [
        { id: 'sleep',    icon: Moon,       label: t('log.sleepLog'),      border: 'rgba(129,140,248,0.25)' },
        { id: 'energy',   icon: Zap,        label: t('log.energyLog'),     border: 'rgba(250,204,21,0.25)' },
        { id: 'cycle',    icon: Heart,      label: t('logMode.cycleLog'),  border: 'rgba(239,68,68,0.25)' },
      ],
    },
  ]

  // ── STRENGTH SECTION (shared between Full Class & Strength Only) ──────────
  const StrengthSection = () => (
    <div className="space-y-3">
      <p style={{ color: TXT3, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Strength</p>

      <input
        type="text" value={movementName} onChange={e => setMovementName(e.target.value)}
        placeholder="Movement name (e.g. Back Squat)"
        style={{ background: INPUT, color: 'white', borderColor: BORDER }}
        className="w-full border rounded-xl py-2.5 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-str)]"
      />

      {/* Programmed Sets / Build to Heavy toggle */}
      <div className="flex gap-2">
        <PillButton active={strengthMode === 'programmed'} onClick={() => setStrengthMode('programmed')}>
          Programmed Sets
        </PillButton>
        <PillButton active={strengthMode === 'heavy'} onClick={() => setStrengthMode('heavy')}>
          Build to Heavy
        </PillButton>
      </div>

      {strengthMode === 'programmed' ? (
        <div className="space-y-3">
          {/* Interval picker */}
          <div className="flex gap-1.5 overflow-x-auto">
            {INTERVALS.map(iv => (
              <PillButton key={iv} active={interval === iv} onClick={() => setInterval(iv)}>{iv}</PillButton>
            ))}
          </div>

          {/* Sets count */}
          <div className="flex items-center gap-2">
            <span style={{ color: TXT2 }} className="text-xs">Sets:</span>
            <input
              type="number" value={setsCount} onChange={e => setSetsCount(e.target.value)}
              style={{ background: RAISED, color: 'white' }}
              className="w-16 rounded-lg py-1.5 px-2 text-center text-sm focus:outline-none"
            />
          </div>

          {/* Rep scheme presets */}
          <div className="flex flex-wrap gap-1.5">
            {REP_SCHEMES.map(rs => (
              <PillButton key={rs} active={repScheme === rs} onClick={() => { setRepScheme(rs); setCustomReps('') }}>
                {rs}
              </PillButton>
            ))}
          </div>

          {/* Custom rep scheme */}
          <input
            type="text" value={customReps}
            onChange={e => { setCustomReps(e.target.value); setRepScheme('') }}
            placeholder="Custom rep scheme"
            style={{ background: INPUT, color: 'white', borderColor: BORDER }}
            className="w-full border rounded-xl py-2 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            {([['single', 'Heavy Single', '1RM'], ['triple', 'Heavy 3', '3RM'], ['five', 'Heavy 5', '5RM']] as const).map(([type, label, rm]) => (
              <button
                key={type}
                onClick={() => setHeavyType(type)}
                style={heavyType === type
                  ? { background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' }
                  : { background: RAISED, borderColor: BORDER }
                }
                className="flex-1 py-2.5 rounded-xl border text-center"
              >
                <p className={`text-sm font-medium ${heavyType === type ? 'text-red-400' : 'text-white'}`}>{label}</p>
                <p className={`text-[10px] ${heavyType === type ? 'text-red-400/70' : ''}`} style={{ color: heavyType === type ? undefined : TXT3 }}>{rm}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weight inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label style={{ color: TXT3 }} className="text-[10px] mb-1 block">Start</label>
          <input
            type="number" value={startWeight} onChange={e => setStartWeight(e.target.value)}
            placeholder="lbs"
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-center text-sm focus:outline-none"
          />
        </div>
        <span style={{ color: TXT3 }} className="mt-4">→</span>
        <div className="flex-1">
          <label style={{ color: TXT3 }} className="text-[10px] mb-1 block">End</label>
          <input
            type="number" value={endWeight} onChange={e => setEndWeight(e.target.value)}
            placeholder="lbs"
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-center text-sm focus:outline-none"
          />
        </div>
        <button
          onClick={() => setUseKg(!useKg)}
          className="mt-4 px-2 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: RAISED, color: VOLT, borderColor: BORDER }}
        >
          {useKg ? 'kg' : 'lbs'}
        </button>
      </div>

      {/* Quick weight picks */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_WEIGHTS.map(w => (
          <button
            key={w}
            onClick={() => { if (!startWeight) setStartWeight(String(w)); else setEndWeight(String(w)) }}
            style={{ background: RAISED, color: TXT2, borderColor: BORDER }}
            className="px-2.5 py-1 rounded-full text-xs font-medium border active:scale-95 transition-transform"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  )

  // ── WOD SECTION (shared between Full Class & WOD Only) ────────────────────
  const WodSection = () => (
    <div className="space-y-3">
      <p style={{ color: TXT3, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>WOD</p>

      {/* Quick WOD picks */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {QUICK_WODS.map(name => (
          <button
            key={name}
            onClick={() => selectQuickWod(name)}
            style={wodName === name
              ? { background: GLOW, color: VOLT, borderColor: BSTR }
              : { background: RAISED, color: TXT2, borderColor: BORDER }
            }
            className="px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0"
          >
            {name}
          </button>
        ))}
        <button
          onClick={() => setShowAllBenchmarks(!showAllBenchmarks)}
          style={{ background: RAISED, color: 'var(--cyan, #22d3ee)', borderColor: BORDER }}
          className="px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0"
        >
          All
        </button>
      </div>

      {/* All benchmarks list */}
      {showAllBenchmarks && (
        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl border max-h-48 overflow-y-auto">
          {benchmarkWodsSeed.map(wod => (
            <button
              key={wod.name}
              onClick={() => { selectQuickWod(wod.name); setShowAllBenchmarks(false) }}
              style={{ borderColor: BORDER }}
              className="w-full text-left px-3 py-2.5 border-b last:border-0 active:opacity-70"
            >
              <p className="text-sm text-white font-medium">{wod.name}</p>
              <p style={{ color: TXT3 }} className="text-[10px]">{wod.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* WOD Type */}
      <div className="flex flex-wrap gap-1.5">
        {WOD_TYPES.map(wt => (
          <PillButton key={wt} active={wodType === wt} onClick={() => setWodType(wt)}>{wt}</PillButton>
        ))}
      </div>

      {/* WOD Name */}
      <input
        type="text" value={wodName} onChange={e => setWodName(e.target.value)}
        placeholder="WOD Name"
        style={{ background: INPUT, color: 'white', borderColor: BORDER }}
        className="w-full border rounded-xl py-2.5 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
      />

      {/* WOD Description */}
      <textarea
        value={wodDesc} onChange={e => setWodDesc(e.target.value)}
        placeholder="WOD Description"
        style={{ background: INPUT, color: 'white', borderColor: BORDER }}
        className="w-full border rounded-xl py-2.5 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none h-16 resize-none"
      />

      {/* Score */}
      <input
        type="text" value={scoreDisplay} onChange={e => setScoreDisplay(e.target.value)}
        placeholder="Score (e.g. 15:30, 12 rounds)"
        style={{ background: INPUT, color: 'white', borderColor: BORDER }}
        className="w-full border rounded-xl py-2.5 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
      />

      {/* RX / Scaled */}
      <div className="flex gap-2">
        <button onClick={() => setRxScaled('RX')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${rxScaled === 'RX' ? 'bg-green-500/20 text-green-400 border border-green-400/40' : ''}`}
          style={rxScaled !== 'RX' ? { background: RAISED, color: TXT2 } : {}}
        >RX</button>
        <button onClick={() => setRxScaled('Scaled')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${rxScaled === 'Scaled' ? 'bg-orange-500/20 text-orange-400 border border-orange-400/40' : ''}`}
          style={rxScaled !== 'Scaled' ? { background: RAISED, color: TXT2 } : {}}
        >Scaled</button>
      </div>

      {/* PR + Benchmark checkboxes */}
      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={prFlag} onChange={e => setPrFlag(e.target.checked)} className="accent-red-500" /> Mark as PR
        </label>
      </div>
    </div>
  )


  // ══════════════════════════════════════════════════════════════════════════
  // HOME SCREEN — category cards
  // ══════════════════════════════════════════════════════════════════════════
  if (!mode) {
    return (
      <div className="page-enter space-y-6">
        <div className="text-center pb-1">
          <h1 className="text-xl font-bold text-white tracking-tight">{t('log.whatLogging')}</h1>
        </div>

        {categories.map((cat, catIdx) => (
          <section key={cat.title} className="space-y-3">
            <p
              style={{ color: TXT3, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              className="text-center"
            >
              {cat.title}
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {cat.items.map(({ id, icon: Icon, label }, itemIdx) => {
                const staggerNum = catIdx * 3 + itemIdx + 1
                return (
                <button
                  key={id}
                  onClick={() => handleCardClick(id)}
                  className={`stagger-${staggerNum} glass-card tap-target flex flex-col items-center justify-center gap-2 min-h-[88px] aspect-square`}
                >
                  <Icon size={32} strokeWidth={1.6} className="w-8 h-8" style={{ color: cat.iconColor }} />
                  <span className="text-xs font-medium" style={{ color: TXT2 }}>{label}</span>
                </button>
                )
              })}
            </div>
          </section>
        ))}

        {/* Quick Templates */}
        {templates.length > 0 && (
          <div className="glass-card">
            <p style={{ color: TXT3, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="mb-3">{t('log.quickTemplates')}</p>
            {templates.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={async () => {
                  await addMealFromTemplate(tmpl)
                  showToast('Meal added!')
                }}
                style={{ borderColor: BORDER }}
                className="tap-target w-full flex items-center justify-between py-3 px-3 border-b last:border-0"
              >
                <div className="text-left">
                  <p className="text-sm text-white font-medium">{tmpl.name}</p>
                  <p style={{ color: TXT3 }} className="text-[11px]">{t(`meals.${tmpl.mealType}`)}</p>
                </div>
                <span style={{ color: TXT2 }} className="text-xs">Tap to add</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }


  // ══════════════════════════════════════════════════════════════════════════
  // WORKOUT MODE — Multi-step CrossFit logging
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === 'workout') {

    // Step 1: Choose workout type
    if (workoutStep === 'type') {
      return (
        <div className="page-enter space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Log CrossFit — How was today&apos;s class?</h1>
            <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
          </div>

          <div className="space-y-2.5">
            {([
              { step: 'full-class' as WorkoutStep, icon: Dumbbell, title: 'Full Class', desc: 'Strength + WOD — most common', color: 'var(--volt)' },
              { step: 'wod-only' as WorkoutStep, icon: Timer, title: 'WOD Only', desc: 'Just the metcon', color: 'var(--cyan, #22d3ee)' },
              { step: 'strength-only' as WorkoutStep, icon: Dumbbell, title: 'Strength Only', desc: 'Just lifting', color: 'var(--orange, #f97316)' },
              { step: 'events' as WorkoutStep, icon: Trophy, title: 'CrossFit Events', desc: 'Open · Hero WODs · Girls — scan or pick', color: 'var(--pink, #ec4899)' },
            ]).map(({ step, icon: Icon, title, desc, color }) => (
              <button
                key={step}
                onClick={() => setWorkoutStep(step)}
                style={{ background: CARD, borderColor: BORDER }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p style={{ color: TXT3 }} className="text-xs">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }

    // Step 2a: Full Class (Strength + WOD)
    if (workoutStep === 'full-class') {
      return (
        <div className="page-enter space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setWorkoutStep('type')} style={{ color: TXT2 }}><ChevronLeft size={20} /></button>
            <h1 className="text-lg font-bold text-white flex-1">Full Class</h1>
            <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
          </div>

          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-4">
            <StrengthSection />
            <div style={{ borderColor: BORDER }} className="border-t pt-4">
              <WodSection />
            </div>

            <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
              placeholder="Notes..."
              style={{ background: INPUT, color: 'white', borderColor: BORDER }}
              className="w-full border rounded-xl py-2 px-3 text-sm focus:outline-none h-16 resize-none"
            />

            <button
              onClick={() => handleSaveWorkout({ fullClass: true })}
              className="w-full font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, var(--violet, #8b5cf6), var(--blue, #3b82f6))`, color: 'white' }}
            >
              Save Full Class
            </button>
          </div>
        </div>
      )
    }

    // Step 2b: WOD Only
    if (workoutStep === 'wod-only') {
      return (
        <div className="page-enter space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setWorkoutStep('type')} style={{ color: TXT2 }}><ChevronLeft size={20} /></button>
            <h1 className="text-lg font-bold text-white flex-1">WOD Only</h1>
            <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
          </div>

          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-4">
            <WodSection />

            <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
              placeholder="Notes..."
              style={{ background: INPUT, color: 'white', borderColor: BORDER }}
              className="w-full border rounded-xl py-2 px-3 text-sm focus:outline-none h-16 resize-none"
            />

            <button
              onClick={() => handleSaveWorkout()}
              className="w-full font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, var(--violet, #8b5cf6), var(--blue, #3b82f6))`, color: 'white' }}
            >
              Save WOD
            </button>
          </div>
        </div>
      )
    }

    // Step 2c: Strength Only
    if (workoutStep === 'strength-only') {
      return (
        <div className="page-enter space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setWorkoutStep('type')} style={{ color: TXT2 }}><ChevronLeft size={20} /></button>
            <h1 className="text-lg font-bold text-white flex-1">Strength Only</h1>
            <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
          </div>

          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-4">
            <StrengthSection />

            <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
              placeholder="Notes..."
              style={{ background: INPUT, color: 'white', borderColor: BORDER }}
              className="w-full border rounded-xl py-2 px-3 text-sm focus:outline-none h-16 resize-none"
            />

            <button
              onClick={() => handleSaveWorkout({ strengthOnly: true })}
              className="w-full font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, var(--violet, #8b5cf6), var(--blue, #3b82f6))`, color: 'white' }}
            >
              Save Strength
            </button>
          </div>
        </div>
      )
    }

    // Step 2d: CrossFit Events
    if (workoutStep === 'events') {
      const allEvents = [
        ...EVENTS,
        ...benchmarkWodsSeed.map(w => ({
          name: w.name,
          category: w.category === 'girl' ? 'girls' : w.category === 'hero' ? 'hero' : 'other',
          description: w.description,
          wodType: w.wodType as WodType,
        }))
      ]
      const filtered = allEvents.filter(e => {
        if (eventFilter !== 'all' && e.category !== eventFilter && !(eventFilter === 'girls' && e.category === 'girl')) return false
        if (eventSearch && !e.name.toLowerCase().includes(eventSearch.toLowerCase())) return false
        return true
      })

      if (selectedEvent) {
        return (
          <div className="page-enter space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedEvent(null)} style={{ color: TXT2 }}><ChevronLeft size={20} /></button>
              <h1 className="text-lg font-bold text-white flex-1">{selectedEvent.name}</h1>
              <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
            </div>

            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-3">
              <p className="text-sm text-white">{selectedEvent.description}</p>
              {'timeCap' in selectedEvent && selectedEvent.timeCap && (
                <p style={{ color: TXT3 }} className="text-xs">Time Cap: {selectedEvent.timeCap}</p>
              )}

              <input
                type="text" value={scoreDisplay} onChange={e => setScoreDisplay(e.target.value)}
                placeholder="Score (e.g. 15:30, 12 rounds)"
                style={{ background: INPUT, color: 'white', borderColor: BORDER }}
                className="w-full border rounded-xl py-2.5 px-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
              />

              <div className="flex gap-2">
                <button onClick={() => setRxScaled('RX')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${rxScaled === 'RX' ? 'bg-green-500/20 text-green-400 border border-green-400/40' : ''}`}
                  style={rxScaled !== 'RX' ? { background: RAISED, color: TXT2 } : {}}
                >RX</button>
                <button onClick={() => setRxScaled('Scaled')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold ${rxScaled === 'Scaled' ? 'bg-orange-500/20 text-orange-400 border border-orange-400/40' : ''}`}
                  style={rxScaled !== 'Scaled' ? { background: RAISED, color: TXT2 } : {}}
                >Scaled</button>
              </div>

              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={prFlag} onChange={e => setPrFlag(e.target.checked)} className="accent-red-500" /> Mark as PR
              </label>

              <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
                placeholder="Notes..."
                style={{ background: INPUT, color: 'white', borderColor: BORDER }}
                className="w-full border rounded-xl py-2 px-3 text-sm focus:outline-none h-16 resize-none"
              />

              <button
                onClick={handleSaveEvent}
                className="w-full font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, var(--violet, #8b5cf6), var(--blue, #3b82f6))`, color: 'white' }}
              >
                Log Event
              </button>
            </div>
          </div>
        )
      }

      return (
        <div className="page-enter space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setWorkoutStep('type')} style={{ color: TXT2 }}><ChevronLeft size={20} /></button>
            <h1 className="text-lg font-bold text-white flex-1">CrossFit Events</h1>
            <button onClick={() => { setMode(null); resetWorkoutState() }} style={{ color: TXT2 }}><X size={20} /></button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} style={{ color: TXT3 }} className="absolute left-3 top-3" />
            <input
              type="text" value={eventSearch} onChange={e => setEventSearch(e.target.value)}
              placeholder="Search events..."
              style={{ background: INPUT, color: 'white', borderColor: BORDER }}
              className="w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {['all', 'open', 'hero', 'girls'].map(f => (
              <PillButton key={f} active={eventFilter === f} onClick={() => setEventFilter(f)}>
                {f === 'all' ? 'All' : f === 'open' ? 'Open' : f === 'hero' ? 'Hero' : 'Girls'}
              </PillButton>
            ))}
          </div>

          {/* Events list */}
          <div className="space-y-2">
            {filtered.map((event, i) => (
              <button
                key={`${event.name}-${i}`}
                onClick={() => setSelectedEvent(event as any)}
                style={{ background: CARD, borderColor: BORDER }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: event.category === 'open' ? 'rgba(59,130,246,0.15)' : event.category === 'hero' ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.15)' }}>
                  <Trophy size={18} style={{ color: event.category === 'open' ? '#3b82f6' : event.category === 'hero' ? '#ef4444' : '#a855f7' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.name}</p>
                  <p style={{ color: TXT3 }} className="text-[10px] truncate">{event.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    }
  }


  // ══════════════════════════════════════════════════════════════════════════
  // MEAL LOGGING
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === 'meal') {
    return (
      <div className="page-enter space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t('log.logMeal')}</h1>
          <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {mealTypes.map(mt => (
            <PillButton key={mt} active={mealType === mt} onClick={() => setMealType(mt)}>
              {t(`meals.${mt}`)}
            </PillButton>
          ))}
        </div>

        <div className="relative">
          <Search size={16} style={{ color: TXT3 }} className="absolute left-3 top-3" />
          <input
            type="text" value={foodSearch} onChange={e => setFoodSearch(e.target.value)}
            placeholder={t('log.selectFood')}
            style={{ background: INPUT, borderColor: BORDER, color: 'var(--text-primary)' }}
            className="w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-str)]"
          />
        </div>

        {foodSearch && (
          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl border max-h-48 overflow-y-auto">
            {filteredFoods.map(food => (
              <button
                key={food.id}
                onClick={() => { setSelectedFood(food); setGrams(String(food.defaultServingG)); setFoodSearch('') }}
                style={{ borderColor: BORDER }}
                className="w-full text-left px-3 py-2.5 border-b last:border-0 active:opacity-70"
              >
                <p className="text-sm text-white">{food.name}</p>
                <p style={{ color: TXT3 }} className="text-[10px]">{food.caloriesPer100g} cal | P:{food.proteinPer100g}g | C:{food.carbsPer100g}g | F:{food.fatPer100g}g per 100g</p>
              </button>
            ))}
          </div>
        )}

        {selectedFood && (
          <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
            <p className="text-sm font-medium text-white mb-2">{selectedFood.name}</p>
            <div className="flex gap-2 items-center mb-3">
              <input
                type="number" value={grams} onChange={e => setGrams(e.target.value)}
                style={{ background: RAISED, color: 'white' }}
                className="flex-1 rounded-lg py-2 px-3 text-center text-lg font-bold focus:outline-none focus:ring-1 focus:ring-[var(--volt)]"
              />
              <span style={{ color: TXT2 }} className="text-sm">g</span>
            </div>
            {macros && (
              <div style={{ color: TXT2 }} className="flex justify-between text-xs mb-3">
                <span>{macros.calories} cal</span>
                <span>P: {macros.protein}g</span>
                <span>C: {macros.carbs}g</span>
                <span>F: {macros.fat}g</span>
              </div>
            )}
            <button
              onClick={handleSaveMeal}
              style={{ background: VOLT, color: APP }}
              className="w-full font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
            >
              {t('log.addTo')} {t(`meals.${mealType}`)}
            </button>
          </div>
        )}
      </div>
    )
  }


  // ══════════════════════════════════════════════════════════════════════════
  // CYCLE LOGGING
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === 'cycle') {
    return (
      <div className="page-enter space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t('logMode.cycleLog')}</h1>
          <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
        </div>
        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-6 border text-center">
          <Heart size={40} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
          <p className="text-sm text-white mb-2">Sync your training with your cycle for better performance.</p>
          <p style={{ color: '#22c55e' }} className="text-xs">100% private — data never leaves your device</p>
          <p style={{ color: TXT3 }} className="text-xs mt-4">Coming soon</p>
        </div>
      </div>
    )
  }


  // ══════════════════════════════════════════════════════════════════════════
  // METRIC LOGGING (weight, sleep, water, energy, recovery)
  // ══════════════════════════════════════════════════════════════════════════
  const metricLabels: Record<string, { label: string; placeholder: string; unit: string }> = {
    weight:   { label: t('log.weightLog'),  placeholder: '72.1', unit: 'kg' },
    sleep:    { label: t('log.sleepLog'),   placeholder: '7.5',  unit: 'hrs' },
    water:    { label: t('log.waterLog'),   placeholder: '2500', unit: 'ml' },
    energy:   { label: t('log.energyLog'),  placeholder: '4',    unit: '/ 5' },
    recovery: { label: 'Recovery',          placeholder: '4',    unit: '/ 5' },
  }
  const meta = metricLabels[mode] || metricLabels.weight

  return (
    <div className="page-enter space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{meta.label}</h1>
        <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
      </div>
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-6 border text-center">
        <div className="flex items-center justify-center gap-3">
          <input
            type="number" value={metricValue} onChange={e => setMetricValue(e.target.value)}
            placeholder={meta.placeholder}
            style={{ background: RAISED, color: 'white' }}
            className="w-32 rounded-xl py-3 px-4 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[var(--volt)]"
            autoFocus
          />
          <span style={{ color: TXT2 }} className="text-lg">{meta.unit}</span>
        </div>
        <button
          onClick={() => handleSaveMetric(mode)}
          style={{ background: VOLT, color: APP }}
          className="mt-4 w-full font-bold py-3 rounded-xl"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  )
}
