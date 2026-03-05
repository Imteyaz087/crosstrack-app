import { useState } from 'react'
import { X, Plus, ChevronDown } from 'lucide-react'
import type { FoodItem } from '../../types'

interface CustomFoodCreatorProps {
  t: (key: string) => string
  onSave: (food: FoodItem) => void
  onClose: () => void
  /** Pre-fill from barcode scan or other source */
  prefill?: Partial<FoodItem>
}

const FOOD_CATEGORIES = [
  'Protein', 'Carbs', 'Vegetables', 'Fruits', 'Fats',
  'Dairy', 'Legumes', 'Beverages', 'Snacks', 'Condiments', 'Asian Foods', 'Other',
]

export function CustomFoodCreator({ t, onSave, onClose, prefill }: CustomFoodCreatorProps) {
  const [name, setName] = useState(prefill?.name || '')
  const [nameZh, setNameZh] = useState(prefill?.nameZh || '')
  const [category, setCategory] = useState(prefill?.category || 'Other')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [calories, setCalories] = useState(prefill?.caloriesPer100g ? String(prefill.caloriesPer100g) : '')
  const [protein, setProtein] = useState(prefill?.proteinPer100g ? String(prefill.proteinPer100g) : '')
  const [carbs, setCarbs] = useState(prefill?.carbsPer100g ? String(prefill.carbsPer100g) : '')
  const [fat, setFat] = useState(prefill?.fatPer100g ? String(prefill.fatPer100g) : '')
  const [fiber, setFiber] = useState(prefill?.fiberPer100g ? String(prefill.fiberPer100g) : '')
  const [servingSize, setServingSize] = useState(prefill?.defaultServingG ? String(prefill.defaultServingG) : '100')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Input mode: per100g or perServing
  const [inputMode, setInputMode] = useState<'per100g' | 'perServing'>('per100g')

  const numOrZero = (s: string) => { const n = parseFloat(s); return isNaN(n) ? 0 : n }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('customFood.nameRequired')
    if (!calories || numOrZero(calories) < 0) errs.calories = t('customFood.invalidValue')
    if (numOrZero(protein) < 0) errs.protein = t('customFood.invalidValue')
    if (numOrZero(carbs) < 0) errs.carbs = t('customFood.invalidValue')
    if (numOrZero(fat) < 0) errs.fat = t('customFood.invalidValue')
    if (numOrZero(servingSize) <= 0) errs.servingSize = t('customFood.invalidServing')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    // Convert to per-100g if input was per-serving
    const serving = numOrZero(servingSize)
    const multiplier = inputMode === 'perServing' && serving > 0 ? 100 / serving : 1

    const food: FoodItem = {
      name: name.trim(),
      nameZh: nameZh.trim() || undefined,
      category,
      caloriesPer100g: Math.round(numOrZero(calories) * multiplier),
      proteinPer100g: Math.round(numOrZero(protein) * multiplier * 10) / 10,
      carbsPer100g: Math.round(numOrZero(carbs) * multiplier * 10) / 10,
      fatPer100g: Math.round(numOrZero(fat) * multiplier * 10) / 10,
      fiberPer100g: fiber ? Math.round(numOrZero(fiber) * multiplier * 10) / 10 : undefined,
      defaultServingG: Math.round(serving) || 100,
      isCustom: true,
    }
    onSave(food)
  }

  const filterNumeric = (val: string) => val.replace(/[^\d.]/g, '')

  return (
    <div className="space-y-4 w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ct-1">{t('customFood.title')}</h2>
        <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Food Name */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3">
        <div>
          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1.5">{t('customFood.foodName')}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={t('customFood.foodNamePlaceholder')}
            className={`w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-sm focus:outline-none focus:ring-1 min-h-[44px] ${
              errors.name ? 'focus:ring-red-400/50 border border-red-500/40' : 'focus:ring-cyan-400/40'
            }`} />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1.5">{t('customFood.chineseName')}</label>
          <input type="text" value={nameZh} onChange={e => setNameZh(e.target.value)}
            placeholder={t('customFood.chineseNamePlaceholder')}
            className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px]" />
        </div>

        {/* Category picker */}
        <div>
          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1.5">{t('customFood.category')}</label>
          <button onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-sm text-left flex justify-between items-center min-h-[44px]">
            <span>{category}</span>
            <ChevronDown size={16} className={`text-ct-2 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
          </button>
          {showCategoryPicker && (
            <div className="mt-1 bg-ct-elevated rounded-xl max-h-40 overflow-y-auto border border-slate-600">
              {FOOD_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setCategory(cat); setShowCategoryPicker(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-slate-600/50 last:border-0 min-h-[40px] ${
                    category === cat ? 'text-cyan-400 bg-cyan-400/10' : 'text-ct-2 active:bg-slate-600'
                  }`}>{cat}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nutrition Input */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3">
        {/* Input mode toggle */}
        <div className="flex gap-1 bg-ct-elevated/80 rounded-xl p-1">
          <button onClick={() => setInputMode('per100g')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
              inputMode === 'per100g' ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
            }`}>{t('customFood.per100g')}</button>
          <button onClick={() => setInputMode('perServing')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors min-h-[36px] ${
              inputMode === 'perServing' ? 'bg-cyan-500/20 text-cyan-400' : 'text-ct-2'
            }`}>{t('customFood.perServing')}</button>
        </div>

        <p className="text-[11px] text-ct-2">
          {inputMode === 'per100g' ? t('customFood.enter100gValues') : t('customFood.enterServingValues')}
        </p>

        {/* Serving size (shown when perServing mode) */}
        {inputMode === 'perServing' && (
          <div>
            <label className="text-xs text-ct-2 font-semibold block mb-1">{t('customFood.servingSize')}</label>
            <div className="flex items-center gap-2">
              <input type="text" inputMode="numeric" value={servingSize} onChange={e => setServingSize(filterNumeric(e.target.value))}
                className={`flex-1 bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 min-h-[44px] tabular-nums ${
                  errors.servingSize ? 'focus:ring-red-400/50 border border-red-500/40' : 'focus:ring-cyan-400/40'
                }`} />
              <span className="text-ct-2 text-sm">g</span>
            </div>
          </div>
        )}

        {/* Macro inputs - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <div>
            <label className="text-xs text-ct-2 font-semibold block mb-1">{t('customFood.calories')}</label>
            <input type="text" inputMode="numeric" value={calories} onChange={e => setCalories(filterNumeric(e.target.value))}
              placeholder="0"
              className={`w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 min-h-[44px] tabular-nums ${
                errors.calories ? 'focus:ring-red-400/50 border border-red-500/40' : 'focus:ring-cyan-400/40'
              }`} />
          </div>
          {/* Protein */}
          <div>
            <label className="text-xs text-green-400 font-semibold block mb-1">{t('log.protein')} (g)</label>
            <input type="text" inputMode="decimal" value={protein} onChange={e => setProtein(filterNumeric(e.target.value))}
              placeholder="0"
              className="w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-400/40 min-h-[44px] tabular-nums" />
          </div>
          {/* Carbs */}
          <div>
            <label className="text-xs text-orange-400 font-semibold block mb-1">{t('log.carbs')} (g)</label>
            <input type="text" inputMode="decimal" value={carbs} onChange={e => setCarbs(filterNumeric(e.target.value))}
              placeholder="0"
              className="w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-orange-400/40 min-h-[44px] tabular-nums" />
          </div>
          {/* Fat */}
          <div>
            <label className="text-xs text-pink-400 font-semibold block mb-1">{t('log.fat')} (g)</label>
            <input type="text" inputMode="decimal" value={fat} onChange={e => setFat(filterNumeric(e.target.value))}
              placeholder="0"
              className="w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-pink-400/40 min-h-[44px] tabular-nums" />
          </div>
        </div>

        {/* Fiber (optional) */}
        <div>
          <label className="text-xs text-ct-2 font-semibold block mb-1">{t('customFood.fiber')} ({t('customFood.optional')})</label>
          <input type="text" inputMode="decimal" value={fiber} onChange={e => setFiber(filterNumeric(e.target.value))}
            placeholder="0"
            className="w-full bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px] tabular-nums" />
        </div>

        {/* Default serving (shown in per100g mode) */}
        {inputMode === 'per100g' && (
          <div>
            <label className="text-xs text-ct-2 font-semibold block mb-1">{t('customFood.defaultServing')}</label>
            <div className="flex items-center gap-2">
              <input type="text" inputMode="numeric" value={servingSize} onChange={e => setServingSize(filterNumeric(e.target.value))}
                className="flex-1 bg-ct-elevated rounded-xl py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px] tabular-nums" />
              <span className="text-ct-2 text-sm">g</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview card */}
      {name && calories && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-cyan-500/20">
          <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold mb-2">{t('customFood.preview')}</p>
          <p className="text-sm font-bold text-ct-1">{name}{nameZh ? ` (${nameZh})` : ''}</p>
          <p className="text-xs text-ct-2 mt-0.5">{category}</p>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <div className="text-center bg-ct-elevated/50 rounded-lg py-1.5">
              <p className="text-xs font-bold text-ct-1 tabular-nums">{Math.round(numOrZero(calories))}</p>
              <p className="text-[0.55rem] text-ct-2">cal</p>
            </div>
            <div className="text-center bg-ct-elevated/50 rounded-lg py-1.5">
              <p className="text-xs font-bold text-green-400 tabular-nums">{numOrZero(protein)}g</p>
              <p className="text-[0.55rem] text-ct-2">prot</p>
            </div>
            <div className="text-center bg-ct-elevated/50 rounded-lg py-1.5">
              <p className="text-xs font-bold text-orange-400 tabular-nums">{numOrZero(carbs)}g</p>
              <p className="text-[0.55rem] text-ct-2">carb</p>
            </div>
            <div className="text-center bg-ct-elevated/50 rounded-lg py-1.5">
              <p className="text-xs font-bold text-pink-400 tabular-nums">{numOrZero(fat)}g</p>
              <p className="text-[0.55rem] text-ct-2">fat</p>
            </div>
          </div>
          <p className="text-[0.6rem] text-ct-2 text-center mt-1">
            {inputMode === 'per100g' ? t('scanner.per100g') : `${t('customFood.perServing')} (${servingSize}g)`}
          </p>
        </div>
      )}

      {/* Save */}
      <button onClick={handleSave}
        className="w-full bg-green-500 text-slate-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-sm min-h-[48px] flex items-center justify-center gap-2">
        <Plus size={20} />
        {t('customFood.saveFood')}
      </button>
    </div>
  )
}
