import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { calcMacros, today } from '../utils/macros'
import type { FoodItem, MealType, WodType, RxScaled } from '../types'
import { Dumbbell, UtensilsCrossed, Scale, Moon, Droplets, Zap, Search, X, Timer, Activity, RefreshCcw } from 'lucide-react'

type LogMode = null | 'workout' | 'meal' | 'weight' | 'sleep' | 'water' | 'energy' | 'recovery'

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

export function LogPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<LogMode>(null)
  const { foods, templates, loadFoods, loadTemplates, saveDailyLog, saveMealLog, saveWorkout, addMealFromTemplate, loadTodayLog } = useStore()

  useEffect(() => { loadFoods(); loadTemplates(); loadTodayLog() }, [])

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [foodSearch, setFoodSearch] = useState('')

  const [wodType, setWodType] = useState<WodType>('AMRAP')
  const [wodName, setWodName] = useState('')
  const [scoreDisplay, setScoreDisplay] = useState('')
  const [rxScaled, setRxScaled] = useState<RxScaled>('RX')
  const [prFlag, setPrFlag] = useState(false)
  const [isBenchmark, setIsBenchmark] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState('')
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
  }

  const handleSaveWorkout = async () => {
    if (!wodName) return
    await saveWorkout({ date: today(), workoutType: wodType, name: wodName, scoreDisplay, rxOrScaled: rxScaled, prFlag, isBenchmark, notes: workoutNotes } as any)
    setMode(null); setWodName(''); setScoreDisplay('')
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
  }

  const mealTypes: MealType[] = ['breakfast', 'post_workout', 'lunch', 'snack', 'dinner']

  // ── Home screen ────────────────────────────────────────────────────────────
  const handleCardClick = (id: string) => {
    setMetricValue('')
    if (id === 'crossfit')  { setWodType('AMRAP');    setMode('workout'); return }
    if (id === 'hyrox')     { setWodType('ForTime');  setMode('workout'); return }
    if (id === 'run')       { setWodType('Other');    setMode('workout'); return }
    setMode(id as LogMode)
  }

  const categories = [
    {
      title: t('log.training'),
      items: [
        { id: 'crossfit', icon: Dumbbell,  label: t('log.crossfit'),  color: '#C8FF00', border: 'rgba(200,255,0,0.25)' },
        { id: 'hyrox',    icon: Timer,     label: t('log.hyrox'),     color: '#fb923c', border: 'rgba(251,146,60,0.25)' },
        { id: 'run',      icon: Activity,  label: t('log.runCardio'), color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
      ],
    },
    {
      title: t('log.bodyNutrition'),
      items: [
        { id: 'meal',   icon: UtensilsCrossed, label: t('log.meal'),      color: '#34d399', border: 'rgba(52,211,153,0.25)' },
        { id: 'weight', icon: Scale,           label: t('log.weightLog'), color: '#c084fc', border: 'rgba(192,132,252,0.25)' },
        { id: 'water',  icon: Droplets,        label: t('log.waterLog'),  color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
      ],
    },
    {
      title: t('log.wellnessRecovery'),
      items: [
        { id: 'sleep',    icon: Moon,       label: t('log.sleepLog'),  color: '#818cf8', border: 'rgba(129,140,248,0.25)' },
        { id: 'energy',   icon: Zap,        label: t('log.energyLog'), color: '#facc15', border: 'rgba(250,204,21,0.25)' },
        { id: 'recovery', icon: RefreshCcw, label: t('log.recovery'),  color: '#2dd4bf', border: 'rgba(45,212,191,0.25)' },
      ],
    },
  ]

  if (!mode) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-white">{t('log.whatLogging')}</h1>

        {categories.map(cat => (
          <div key={cat.title}>
            <p style={{ color: TXT3 }} className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">{cat.title}</p>
            <div className="grid grid-cols-3 gap-3">
              {cat.items.map(({ id, icon: Icon, label, color, border }) => (
                <button
                  key={id}
                  onClick={() => handleCardClick(id)}
                  style={{ background: CARD, borderColor: border, color }}
                  className="border rounded-2xl min-h-[100px] flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform"
                >
                  <Icon size={28} strokeWidth={1.8} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
          <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-3">{t('log.quickTemplates')}</p>
          {templates.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => addMealFromTemplate(tmpl)}
              style={{ borderColor: BORDER }}
              className="w-full flex items-center justify-between py-3 px-2 border-b last:border-0 active:opacity-70 transition-opacity"
            >
              <div className="text-left">
                <p className="text-sm text-white font-medium">{tmpl.name}</p>
                <p style={{ color: TXT3 }} className="text-[10px]">{t(`meals.${tmpl.mealType}`)}</p>
              </div>
              <span style={{ color: TXT2 }} className="text-xs">Tap to add</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Meal logging ───────────────────────────────────────────────────────────
  if (mode === 'meal') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t('log.logMeal')}</h1>
          <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {mealTypes.map(mt => (
            <button
              key={mt}
              onClick={() => setMealType(mt)}
              style={mealType === mt
                ? { background: GLOW, color: VOLT, borderColor: BSTR }
                : { background: RAISED, color: TXT2, borderColor: BORDER }
              }
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors"
            >
              {t(`meals.${mt}`)}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} style={{ color: TXT3 }} className="absolute left-3 top-3" />
          <input
            type="text"
            value={foodSearch}
            onChange={e => setFoodSearch(e.target.value)}
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
                type="number"
                value={grams}
                onChange={e => setGrams(e.target.value)}
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

  // ── Workout logging ────────────────────────────────────────────────────────
  if (mode === 'workout') {
    const wodTypes: WodType[] = ['AMRAP', 'ForTime', 'EMOM', 'Chipper', 'Strength', 'StrengthMetcon', 'Other']
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t('training.logWorkout')}</h1>
          <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
        </div>

        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-3">
          <input
            type="text" value={wodName} onChange={e => setWodName(e.target.value)}
            placeholder="WOD Name"
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--volt)]"
          />

          <div className="flex flex-wrap gap-1.5">
            {wodTypes.map(wt => (
              <button key={wt} onClick={() => setWodType(wt)}
                style={wodType === wt
                  ? { background: GLOW, color: VOLT, borderColor: BSTR }
                  : { background: RAISED, color: TXT2, borderColor: BORDER }
                }
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
              >{wt}</button>
            ))}
          </div>

          <input
            type="text" value={scoreDisplay} onChange={e => setScoreDisplay(e.target.value)}
            placeholder="Score (e.g. 15:30, 12 rounds, 100kg)"
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-sm focus:outline-none"
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

          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={prFlag} onChange={e => setPrFlag(e.target.checked)} className="accent-red-500" /> PR
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={isBenchmark} onChange={e => setIsBenchmark(e.target.checked)} style={{ accentColor: VOLT }} /> Benchmark
            </label>
          </div>

          <textarea value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
            placeholder="Notes..."
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-sm focus:outline-none h-16 resize-none"
          />

          <button onClick={handleSaveWorkout} style={{ background: VOLT, color: APP }} className="w-full font-bold py-3 rounded-xl">
            {t('common.save')}
          </button>
        </div>
      </div>
    )
  }

  // ── Metric logging ─────────────────────────────────────────────────────────
  const metricLabels: Record<string, { label: string; placeholder: string; unit: string }> = {
    weight:   { label: t('log.weightLog'),  placeholder: '72.1', unit: 'kg' },
    sleep:    { label: t('log.sleepLog'),   placeholder: '7.5',  unit: 'hrs' },
    water:    { label: t('log.waterLog'),   placeholder: '2500', unit: 'ml' },
    energy:   { label: t('log.energyLog'),  placeholder: '4',    unit: '/ 5' },
    recovery: { label: t('log.recovery'),   placeholder: '4',    unit: '/ 5' },
  }
  const meta = metricLabels[mode] || metricLabels.weight

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{meta.label}</h1>
        <button onClick={() => setMode(null)} style={{ color: TXT2 }}><X size={20} /></button>
      </div>
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-6 border text-center">
        <div className="flex items-center justify-center gap-3">
          <input
            type="number"
            value={metricValue}
            onChange={e => setMetricValue(e.target.value)}
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
