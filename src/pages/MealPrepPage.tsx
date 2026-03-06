import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { useSaveToast } from '../components/SaveToast'
import { Plus, Trash2, ChefHat, Check } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { E } from '../utils/emoji'
import type { MealType, FoodItem, MealTemplate, MealTemplateItem } from '../types'

const MEAL_TYPES: { id: MealType; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: E.sunrise },
  { id: 'morning_snack', label: 'AM Snack', emoji: E.apple },
  { id: 'lunch', label: 'Lunch', emoji: E.sun },
  { id: 'afternoon_snack', label: 'PM Snack', emoji: E.cup_straw },
  { id: 'dinner', label: 'Dinner', emoji: E.moon },
  { id: 'post_workout', label: 'Post-WOD', emoji: E.muscle },
]

export function MealPrepPage() {
  const { t } = useTranslation()
  const { foods, templates, loadFoods, loadTemplates, profile, addMealFromTemplate } = useStore()
  const { showToast, toastEl } = useSaveToast()
  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [templateName, setTemplateName] = useState('')
  const [templateMealType, setTemplateMealType] = useState<MealType>('breakfast')
  const [items, setItems] = useState<(MealTemplateItem & { _calories?: number; _protein?: number })[]>([])
  const [foodSearch, setFoodSearch] = useState('')
  const [showFoodPicker, setShowFoodPicker] = useState(false)

  useEffect(() => { Promise.allSettled([loadFoods(), loadTemplates()]) }, [])

  const filteredFoods = useMemo(() => {
    if (!foodSearch.trim()) return foods.slice(0, 20)
    const q = foodSearch.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q) || f.nameZh?.includes(q)).slice(0, 20)
  }, [foods, foodSearch])

  const templateMacros = useMemo(() => {
    return items.reduce((acc, item) => {
      const food = foods.find(f => f.id === item.foodId)
      if (!food) return acc
      const mult = item.grams / 100
      return {
        calories: acc.calories + food.caloriesPer100g * mult,
        protein: acc.protein + food.proteinPer100g * mult,
        carbs: acc.carbs + food.carbsPer100g * mult,
        fat: acc.fat + food.fatPer100g * mult,
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }, [items, foods])

  const addFoodToTemplate = (food: FoodItem) => {
    setItems([...items, { foodId: food.id!, foodName: food.name, grams: food.defaultServingG }])
    setShowFoodPicker(false)
    setFoodSearch('')
  }

  const updateGrams = (idx: number, grams: number) => {
    const next = [...items]
    next[idx] = { ...next[idx], grams }
    setItems(next)
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) { showToast('Enter a name', 'error'); return }
    if (items.length === 0) { showToast('Add at least one food', 'error'); return }

    const { db } = await import('../db/database')
    await db.mealTemplates.add({
      name: templateName,
      mealType: templateMealType,
      items: items.map(i => ({ foodId: i.foodId, foodName: i.foodName, grams: i.grams })),
    } as MealTemplate)

    showToast(`Saved "${templateName}"!`, 'success')
    setMode('list')
    setTemplateName('')
    setItems([])
    loadTemplates()
  }

  const logTemplate = async (t: MealTemplate) => {
    await addMealFromTemplate(t)
    showToast(`Logged ${t.name}!`, 'success')
  }

  // Create mode
  if (mode === 'create') {
    return (
      <div className="space-y-3">
        {toastEl}
        <button onClick={() => setMode('list')} className="text-cyan-400 text-sm px-2 py-1 -ml-2 rounded-lg active:bg-ct-surface min-h-[44px] flex items-center" aria-label="Back to templates">&larr; Back</button>
        <h2 className="text-lg font-bold text-ct-1">{t('mealPrep.title')}</h2>

        {/* Name */}
        <input
          type="text"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          placeholder={t('mealPrep.namePlaceholder')}
          className="w-full bg-ct-surface border border-ct-border text-ct-1 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />

        {/* Meal type */}
        <div className="flex gap-1.5 flex-wrap">
          {MEAL_TYPES.map(mt => (
            <button key={mt.id} onClick={() => setTemplateMealType(mt.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                templateMealType === mt.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'
              }`}>{mt.label}</button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item, idx) => {
            const food = foods.find(f => f.id === item.foodId)
            const mult = item.grams / 100
            return (
              <div key={idx} className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ct-1 truncate">{item.foodName}</p>
                  <p className="text-[11px] text-ct-2">
                    {food ? `${Math.round(food.caloriesPer100g * mult)} cal | ${Math.round(food.proteinPer100g * mult)}p` : ''}
                  </p>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={item.grams}
                  onChange={e => updateGrams(idx, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-16 bg-ct-elevated text-ct-1 text-center rounded-xl py-1.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <span className="text-[11px] text-ct-2">g</span>
                <button onClick={() => removeItem(idx)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-400/60 hover:text-red-400 active:bg-red-500/10 rounded-lg" aria-label={`Remove ${item.foodName}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Add food */}
        {showFoodPicker ? (
          <div className="bg-ct-surface rounded-ct-lg border border-ct-border p-3 space-y-2">
            <input
              type="text"
              value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              placeholder="Search foods..." aria-label="Search foods"
              autoFocus
              className="w-full bg-ct-elevated text-ct-1 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredFoods.map(f => (
                <button key={f.id} onClick={() => addFoodToTemplate(f)}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-ct-2 hover:bg-ct-elevated/50 flex justify-between">
                  <span className="truncate">{f.name}</span>
                  <span className="text-[11px] text-ct-2 shrink-0 ml-2">{f.caloriesPer100g}cal/100g</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowFoodPicker(false); setFoodSearch('') }} className="text-xs text-ct-2 px-2 py-1 rounded-lg active:bg-ct-elevated/50 min-h-[44px] flex items-center">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowFoodPicker(true)}
            className="w-full bg-ct-surface/40 border border-dashed border-ct-border/50 text-ct-2 rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5">
            <Plus size={14} /> Add Food
          </button>
        )}

        {/* Macro summary */}
        {items.length > 0 && (
          <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
            <p className="text-[11px] text-ct-2 uppercase tracking-widest mb-1">Template Totals</p>
            <div className="flex gap-3 text-center">
              <div className="flex-1"><p className="text-sm font-bold text-ct-1">{Math.round(templateMacros.calories)}</p><p className="text-[11px] text-ct-2">cal</p></div>
              <div className="flex-1"><p className="text-sm font-bold text-green-400">{Math.round(templateMacros.protein)}g</p><p className="text-[11px] text-ct-2">protein</p></div>
              <div className="flex-1"><p className="text-sm font-bold text-orange-400">{Math.round(templateMacros.carbs)}g</p><p className="text-[11px] text-ct-2">carbs</p></div>
              <div className="flex-1"><p className="text-sm font-bold text-pink-400">{Math.round(templateMacros.fat)}g</p><p className="text-[11px] text-ct-2">fat</p></div>
            </div>
          </div>
        )}

        <button onClick={saveTemplate}
          disabled={!templateName.trim() || items.length === 0}
          className={`w-full font-bold py-3.5 rounded-xl text-sm ${
            templateName.trim() && items.length > 0
              ? 'bg-cyan-500 text-slate-900 active:scale-[0.98]'
              : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
          }`}>
          {t('movementPR.savePR')}
        </button>
      </div>
    )
  }

  // List mode
  return (
    <div className="space-y-3 stagger-children">
      {toastEl}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-ct-1">{t('more.mealPrep')}</h1>
        <button onClick={() => setMode('create')}
          className="bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
          <Plus size={12} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState icon={ChefHat} title="No meal templates yet" description="Create templates to quickly log your go-to meals" />
      ) : (
        <div className="space-y-2">
          {templates.map(t => {
            const macros = t.items.reduce((acc, item) => {
              const food = foods.find(f => f.id === item.foodId)
              if (!food) return acc
              const mult = item.grams / 100
              return {
                calories: acc.calories + food.caloriesPer100g * mult,
                protein: acc.protein + food.proteinPer100g * mult,
              }
            }, { calories: 0, protein: 0 })

            return (
              <div key={t.id} className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-ct-1">{t.name}</p>
                    <p className="text-[11px] text-ct-2">{t.items.length} items — {Math.round(macros.calories)} cal — {Math.round(macros.protein)}g protein</p>
                  </div>
                  <span className="text-[9px] text-ct-2 bg-ct-elevated/50 px-1.5 py-0.5 rounded capitalize">{t.mealType.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logTemplate(t)}
                    className="flex-1 bg-green-500/10 text-green-400 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1">
                    <Check size={12} /> Log Today
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick suggestions based on targets */}
      {profile && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">Daily Targets</p>
          <div className="flex gap-3 text-center">
            <div className="flex-1"><p className="text-sm font-bold text-ct-1">{profile.calorieTarget}</p><p className="text-[11px] text-ct-2">cal</p></div>
            <div className="flex-1"><p className="text-sm font-bold text-green-400">{profile.proteinTarget}g</p><p className="text-[11px] text-ct-2">protein</p></div>
            <div className="flex-1"><p className="text-sm font-bold text-orange-400">{profile.carbsTarget}g</p><p className="text-[11px] text-ct-2">carbs</p></div>
            <div className="flex-1"><p className="text-sm font-bold text-pink-400">{profile.fatTarget}g</p><p className="text-[11px] text-ct-2">fat</p></div>
          </div>
          <p className="text-[11px] text-ct-2 mt-2">Aim for ~{Math.round(profile.proteinTarget / 4)}g protein per meal across 4 meals</p>
        </div>
      )}
    </div>
  )
}
