import { useState } from 'react'
import { Search, X, Clock, ChevronDown, Trash2, ArrowLeft, ScanBarcode, PlusCircle, Loader2, Globe, Star, Copy } from 'lucide-react'
import type { FoodItem, MealType, MealLog, DailyMacros, NutritionResult } from '../../types'

interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

interface RecentFood {
  food: FoodItem
  lastGrams: number
  count: number
}

interface MealLoggerProps {
  t: (key: string, options?: Record<string, unknown>) => string
  mealType: MealType
  selectedFood: FoodItem | null
  grams: string
  foodSearch: string
  showAllFoods: boolean
  foods: FoodItem[]
  recentFoods: RecentFood[]
  macros: Macros | null
  mealsForType: MealLog[]
  mealsForTypeMacros: DailyMacros
  targets: { calories: number; protein: number; carbs: number; fat: number }
  todayMacros: DailyMacros
  goalName: string
  onMealTypeChange: (type: MealType) => void
  onSelectFood: (food: FoodItem, defaultGrams?: number) => void
  onDeselectFood: () => void
  onGramsChange: (value: string) => void
  onFoodSearchChange: (value: string) => void
  onShowAllFoodsChange: (value: boolean) => void
  onSaveMeal: () => void
  onDeleteMeal: (id: number) => void
  onClose: () => void
  savingMeal?: boolean
  onOpenScanner?: () => void
  onOpenCustomFood?: () => void
  gramsRef?: React.RefObject<HTMLInputElement | null>
  searchRef?: React.RefObject<HTMLInputElement | null>
  // API search
  apiResults?: NutritionResult[]
  apiSearching?: boolean
  onSelectApiResult?: (result: NutritionResult) => void
  // Faster meal logging
  onToggleFavorite?: (id: number) => void
  onCloneYesterday?: (mealType?: MealType) => void
}

const mealTypes: MealType[] = ['breakfast', 'post_workout', 'lunch', 'snack', 'dinner']
const quickPortions = [50, 100, 150, 200, 250, 300]

const filteredFoods = (foods: FoodItem[], foodSearch: string) =>
  foods.filter(f =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
    (f.nameZh && f.nameZh.includes(foodSearch))
  )

export function MealLogger({
  t,
  mealType,
  selectedFood,
  grams,
  foodSearch,
  showAllFoods,
  foods,
  recentFoods,
  macros,
  mealsForType,
  mealsForTypeMacros,
  targets,
  todayMacros,
  goalName,
  onMealTypeChange,
  onSelectFood,
  onDeselectFood,
  onGramsChange,
  onFoodSearchChange,
  onShowAllFoodsChange,
  onSaveMeal,
  onDeleteMeal,
  onClose,
  onOpenScanner,
  onOpenCustomFood,
  gramsRef,
  searchRef,
  apiResults = [],
  apiSearching = false,
  onSelectApiResult,
  savingMeal = false,
  onToggleFavorite,
  onCloneYesterday,
}: MealLoggerProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [expandQuickAdd, setExpandQuickAdd] = useState(false)
  const [quickAddCals, setQuickAddCals] = useState('')
  const [quickAddProt, setQuickAddProt] = useState('')
  const [quickAddCarbs, setQuickAddCarbs] = useState('')
  const [quickAddFat, setQuickAddFat] = useState('')
  const searchFiltered = filteredFoods(foods, foodSearch)
  const favorites = foods.filter(f => f.isFavorite)

  // Remaining (can go negative if over target)
  const remainingCal = targets.calories - todayMacros.calories
  const remainingP = targets.protein - todayMacros.protein
  const remainingC = targets.carbs - todayMacros.carbs
  const remainingF = targets.fat - todayMacros.fat
  const isOver = remainingCal <= 0

  return (
    <div className="space-y-3 w-full pb-28">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <button onClick={onClose} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-ct-1 flex-1">{t('log.logMeal')}</h1>
        <div className={`tabular-nums px-2.5 py-1 rounded-lg text-sm font-bold shrink-0 ${isOver ? 'bg-red-500/15 text-red-400' : 'bg-ct-surface text-ct-1'}`}>
          {Math.round(targets.calories)}<span className="text-[0.6rem] text-ct-2 font-medium mx-0.5">/</span><span className={isOver ? 'text-red-400' : 'text-cyan-400'}>{Math.round(remainingCal)}</span>
          <span className="text-[0.6rem] text-ct-2 font-medium ml-1">cal</span>
        </div>
      </div>

      {/* ── Meal type tabs ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {mealTypes.map(mt => (
          <button key={mt} onClick={() => onMealTypeChange(mt)}
            className={`px-4 py-2 rounded-xl text-[0.8125rem] font-semibold whitespace-nowrap min-h-[40px] transition-all ${
              mealType === mt
                ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/25'
                : 'bg-ct-surface text-ct-2 border border-ct-border active:bg-ct-elevated'
            }`}>{t(`meals.${mt}`)}</button>
        ))}
      </div>

      {/* ── Goal & Remaining card ── */}
      <div className="bg-ct-surface rounded-ct-lg border border-ct-border p-3.5">
        {/* Goal row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold">{goalName} {t('log.goal')}</span>
          <span className="text-[11px] text-ct-1 tabular-nums font-bold">{Math.round(targets.calories)} Cal</span>
        </div>
        {/* Remaining - 4-column grid so nothing clips */}
        <div className="grid grid-cols-4 gap-2">
          <div className={`rounded-lg py-2 text-center ${isOver ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>
            <p className={`text-sm font-bold tabular-nums ${isOver ? 'text-red-400' : 'text-cyan-400'}`}>{Math.round(remainingCal)}</p>
            <p className="text-[0.6rem] text-ct-2 uppercase tracking-wider mt-0.5">Cal</p>
          </div>
          <div className="bg-green-500/10 rounded-lg py-2 text-center">
            <p className="text-sm font-bold tabular-nums text-green-400">{Math.round(Math.max(0, remainingP))}g</p>
            <p className="text-[0.6rem] text-ct-2 uppercase tracking-wider mt-0.5">{t('log.protein')}</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg py-2 text-center">
            <p className="text-sm font-bold tabular-nums text-orange-400">{Math.round(Math.max(0, remainingC))}g</p>
            <p className="text-[0.6rem] text-ct-2 uppercase tracking-wider mt-0.5">{t('log.carbs')}</p>
          </div>
          <div className="bg-pink-500/10 rounded-lg py-2 text-center">
            <p className="text-sm font-bold tabular-nums text-pink-400">{Math.round(Math.max(0, remainingF))}g</p>
            <p className="text-[0.6rem] text-ct-2 uppercase tracking-wider mt-0.5">{t('log.fat')}</p>
          </div>
        </div>
        <p className="text-[0.625rem] text-ct-2 text-center mt-2">{t('log.remaining')}</p>
      </div>

      {/* ── Items logged for this meal type ── */}
      {mealsForType.length > 0 && (
        <div className="bg-ct-surface rounded-ct-lg border border-ct-border overflow-hidden">
          <div className="px-4 pt-3 pb-1.5">
            <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">
              {t(`meals.${mealType}`)}  -  {t('log.mealItems', { count: mealsForType.length })}
            </p>
          </div>
          {mealsForType.map(m => (
            <div key={m.id} className="flex items-center px-4 py-2.5 border-b border-ct-border last:border-0">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm text-ct-1 font-medium truncate">{m.foodName}</p>
                <p className="text-[11px] text-ct-2 tabular-nums">
                  {m.grams}g · {Math.round(m.calories)} cal
                </p>
              </div>
              {confirmDeleteId === m.id ? (
                <button onClick={() => { if (m.id) { onDeleteMeal(m.id); setConfirmDeleteId(null) } }}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400 bg-red-500/15 rounded-lg animate-pulse shrink-0" aria-label={`Confirm remove ${m.foodName}`}>
                  <Trash2 size={16} />
                </button>
              ) : (
                <button onClick={() => m.id && setConfirmDeleteId(m.id)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-red-400 shrink-0" aria-label={`Remove ${m.foodName}`}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {/* Meal total  -  grid layout so nothing clips */}
          <div className="grid grid-cols-4 gap-1 px-4 py-2.5 bg-ct-elevated/30">
            <div className="text-center">
              <p className="text-xs font-bold text-cyan-400 tabular-nums">{Math.round(mealsForTypeMacros.calories)}</p>
              <p className="text-[0.6rem] text-ct-2">cal</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-green-400 tabular-nums">{Math.round(mealsForTypeMacros.protein)}g</p>
              <p className="text-[0.6rem] text-ct-2">{t('log.prot')}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-orange-400 tabular-nums">{Math.round(mealsForTypeMacros.carbs)}g</p>
              <p className="text-[0.6rem] text-ct-2">{t('log.carb')}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-pink-400 tabular-nums">{Math.round(mealsForTypeMacros.fat)}g</p>
              <p className="text-[0.6rem] text-ct-2">{t('log.fat')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Barcode & Custom food buttons ── */}
      {(onOpenScanner || onOpenCustomFood) && (
        <div className="flex gap-2">
          {onOpenScanner && (
            <button onClick={onOpenScanner}
              className="flex-1 bg-ct-surface border border-ct-border rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 active:bg-ct-elevated min-h-[44px]">
              <ScanBarcode size={20} className="text-cyan-400" />
              <span className="text-sm font-semibold text-ct-2">{t('scanner.scan')}</span>
            </button>
          )}
          {onOpenCustomFood && (
            <button onClick={onOpenCustomFood}
              className="flex-1 bg-ct-surface border border-ct-border rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 active:bg-ct-elevated min-h-[44px]">
              <PlusCircle size={20} className="text-green-400" />
              <span className="text-sm font-semibold text-ct-2">{t('customFood.create')}</span>
            </button>
          )}
        </div>
      )}

      {/* ── Clone Yesterday button ── */}
      {!foodSearch && !selectedFood && onCloneYesterday && (
        <button onClick={() => onCloneYesterday(mealType)}
          className="w-full bg-ct-surface border border-ct-border rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 active:bg-ct-elevated min-h-[44px]">
          <Copy size={18} className="text-cyan-400" />
          <span className="text-sm font-semibold text-ct-2">{t('log.repeatYesterdayMeal', { mealType: t(`meals.${mealType}`) })}</span>
        </button>
      )}

      {/* ── Search bar ── */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-ct-2" />
        <input ref={searchRef} type="text" value={foodSearch} onChange={e => { onFoodSearchChange(e.target.value); onShowAllFoodsChange(false) }}
          placeholder={t('log.searchFoods')} aria-label={t('log.searchFoods')}
          className="w-full bg-ct-surface border border-ct-border rounded-xl py-3 pl-10 pr-3 text-ct-1 text-sm placeholder:text-ct-2 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 min-h-[44px]" />
      </div>

      {/* ── Search results: Local Library ── */}
      {foodSearch && !selectedFood && (
        <div className="space-y-2">
          {/* Local library results */}
          {searchFiltered.length > 0 && (
            <div className="bg-ct-surface rounded-xl border border-ct-border max-h-48 overflow-y-auto">
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('log.yourLibrary')}</p>
              </div>
              {searchFiltered.slice(0, 8).map(food => (
                <button key={food.id} onClick={() => onSelectFood(food)}
                  className="w-full text-left px-4 py-3 border-b border-ct-border last:border-0 active:bg-ct-elevated/50 min-h-[44px]">
                  <p className="text-sm font-medium text-ct-1">{food.name}</p>
                  <p className="text-[11px] text-ct-2 mt-0.5 tabular-nums">
                    {food.caloriesPer100g} cal · P:{food.proteinPer100g}g · C:{food.carbsPer100g}g · F:{food.fatPer100g}g /100g
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* USDA API results */}
          {(apiResults.length > 0 || apiSearching) && (
            <div className="bg-ct-surface rounded-xl border border-cyan-500/20 max-h-56 overflow-y-auto">
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
                <Globe size={10} className="text-cyan-400" />
                <p className="text-[11px] uppercase tracking-[0.1em] text-cyan-400 font-semibold">{t('log.usdaDatabase')}</p>
                {apiSearching && <Loader2 size={10} className="text-cyan-400 animate-spin ml-auto" />}
              </div>
              {apiResults.map((r, i) => (
                <button key={r.fdcId || i} onClick={() => onSelectApiResult?.(r)}
                  className="w-full text-left px-4 py-3 border-b border-ct-border last:border-0 active:bg-ct-elevated/50 min-h-[44px]">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ct-1 leading-tight">{r.name}</p>
                      {r.brand && <p className="text-[11px] text-ct-2 mt-0.5">{r.brand}</p>}
                      <p className="text-[11px] text-ct-2 mt-0.5 tabular-nums">
                        {r.caloriesPer100g} cal · P:{r.proteinPer100g}g · C:{r.carbsPer100g}g · F:{r.fatPer100g}g /100g
                      </p>
                    </div>
                    {r.dataQuality === 'high' && <span className="text-[9px] px-1 py-0.5 rounded bg-green-500/15 text-green-400 shrink-0 mt-0.5">HD</span>}
                    {r.dataQuality === 'medium' && <span className="text-[9px] px-1 py-0.5 rounded bg-orange-500/15 text-orange-400 shrink-0 mt-0.5">MD</span>}
                  </div>
                </button>
              ))}
              {apiSearching && apiResults.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 size={14} className="text-cyan-400 animate-spin" />
                  <p className="text-xs text-ct-2">{t('log.searchingUsda')}</p>
                </div>
              )}
            </div>
          )}

          {/* No results at all */}
          {searchFiltered.length === 0 && apiResults.length === 0 && !apiSearching && (
            <div className="space-y-2">
              <div className="bg-ct-surface rounded-xl border border-ct-border py-4">
                <p className="text-sm text-ct-2 text-center">{t('log.noFoodsFound')}</p>
                {foodSearch.trim().length < 3 && (
                  <p className="text-xs text-ct-2 text-center mt-1">{t('log.typeToSearchUsda')}</p>
                )}
              </div>
              {/* Quick Add Macros section */}
              {foodSearch.trim().length > 0 && (
                <div className="bg-ct-surface rounded-xl border border-ct-border overflow-hidden">
                  <button onClick={() => setExpandQuickAdd(!expandQuickAdd)}
                    className="w-full flex items-center justify-between px-4 py-3 active:bg-ct-elevated/30 min-h-[44px]">
                    <p className="text-sm font-semibold text-cyan-400">{t('log.quickAddMacros')}</p>
                    <ChevronDown size={14} className={`text-cyan-400 transition-transform ${expandQuickAdd ? 'rotate-180' : ''}`} />
                  </button>
                  {expandQuickAdd && (
                    <div className="px-4 py-3 space-y-3 border-t border-ct-border">
                      <div>
                        <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1">
                          {t('log.calories')}
                        </label>
                        <input type="text" inputMode="numeric" value={quickAddCals} onChange={e => setQuickAddCals(e.target.value.replace(/\D/g, ''))}
                          placeholder={t('log.enterCalories')}
                          className="w-full bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/40 min-h-[44px]" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1">{t('log.protein')}</label>
                          <input type="text" inputMode="numeric" value={quickAddProt} onChange={e => setQuickAddProt(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('log.enterProtein')}
                            className="w-full bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400/40 min-h-[44px]" />
                        </div>
                        <div>
                          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1">{t('log.carbs')}</label>
                          <input type="text" inputMode="numeric" value={quickAddCarbs} onChange={e => setQuickAddCarbs(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('log.enterCarbs')}
                            className="w-full bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400/40 min-h-[44px]" />
                        </div>
                        <div>
                          <label className="text-xs text-ct-2 uppercase tracking-wider font-semibold block mb-1">{t('log.fat')}</label>
                          <input type="text" inputMode="numeric" value={quickAddFat} onChange={e => setQuickAddFat(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('log.enterFat')}
                            className="w-full bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400/40 min-h-[44px]" />
                        </div>
                      </div>
                      <button onClick={() => {
                        const cals = parseInt(quickAddCals) || 0
                        const prot = parseInt(quickAddProt) || 0
                        const carbs = parseInt(quickAddCarbs) || 0
                        const fat = parseInt(quickAddFat) || 0
                        if (cals <= 0 || (prot === 0 && carbs === 0 && fat === 0)) {
                          alert(t('log.enterValidMacros'))
                          return
                        }
                        // Create and save custom food
                        const customFood: FoodItem = {
                          name: `${t('log.quickAddName')} ${new Date().toLocaleTimeString()}`,
                          category: 'custom',
                          caloriesPer100g: cals,
                          proteinPer100g: prot,
                          carbsPer100g: carbs,
                          fatPer100g: fat,
                          defaultServingG: 100,
                          isCustom: true,
                        }
                        onSelectFood(customFood, 100)
                        setExpandQuickAdd(false)
                        setQuickAddCals('')
                        setQuickAddProt('')
                        setQuickAddCarbs('')
                        setQuickAddFat('')
                        onFoodSearchChange('')
                      }}
                        className="w-full bg-cyan-500 text-slate-900 font-bold py-2.5 rounded-lg text-sm transition-transform active:scale-[0.98] min-h-[44px]">
                        {t('log.addToMeal', { meal: t(`meals.${mealType}`) })}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Selected food entry ── */}
      {selectedFood && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-green-500/30">
          <div className="flex justify-between items-start mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <p className="text-base font-bold text-ct-1 truncate">{selectedFood.name}</p>
              <p className="text-[11px] text-ct-2 mt-0.5 tabular-nums">
                {selectedFood.caloriesPer100g} cal · P:{selectedFood.proteinPer100g}g · C:{selectedFood.carbsPer100g}g · F:{selectedFood.fatPer100g}g /100g
              </p>
            </div>
            <button onClick={onDeselectFood} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-red-400 shrink-0" aria-label="Change food">
              <X size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input ref={gramsRef} type="text" inputMode="numeric" pattern="[0-9]*" value={grams} onChange={e => onGramsChange(e.target.value.replace(/\D/g, ''))}
              className="min-w-0 flex-1 bg-ct-elevated rounded-xl py-3 px-3 text-ct-1 text-center text-2xl font-bold focus:outline-none focus:ring-1 focus:ring-green-400/40 tabular-nums min-h-[48px]" />
            <span className="text-ct-2 text-lg font-medium">g</span>
          </div>
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {quickPortions.map(p => (
              <button key={p} onClick={() => onGramsChange(String(p))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 min-h-[36px] ${
                  grams === String(p) ? 'bg-green-500/20 text-green-400 border border-green-400/40' : 'bg-ct-elevated text-ct-2'
                }`}>{p}g</button>
            ))}
          </div>
          {macros && (
            <div className="grid grid-cols-4 gap-1 bg-ct-elevated/50 rounded-xl px-2 py-2.5 mb-3">
              <div className="text-center"><p className="text-sm font-bold text-ct-1 tabular-nums">{macros.calories}</p><p className="text-[0.6rem] text-ct-2">cal</p></div>
              <div className="text-center"><p className="text-sm font-bold text-green-400 tabular-nums">{macros.protein}g</p><p className="text-[0.6rem] text-ct-2">prot</p></div>
              <div className="text-center"><p className="text-sm font-bold text-orange-400 tabular-nums">{macros.carbs}g</p><p className="text-[0.6rem] text-ct-2">carb</p></div>
              <div className="text-center"><p className="text-sm font-bold text-pink-400 tabular-nums">{macros.fat}g</p><p className="text-[0.6rem] text-ct-2">fat</p></div>
            </div>
          )}
          <button onClick={onSaveMeal} disabled={savingMeal}
            className={`w-full font-bold py-3 rounded-xl transition-transform text-sm min-h-[48px] flex items-center justify-center gap-2 ${
              savingMeal ? 'bg-green-500/60 text-slate-900/60 cursor-not-allowed' : 'bg-green-500 text-slate-900 active:scale-[0.98]'
            }`}>
            {savingMeal ? <><Loader2 size={16} className="animate-spin" /> {t('log.saving')}</> : <>{t('log.addToMeal', { meal: t(`meals.${mealType}`) })}</>}
          </button>
        </div>
      )}

      {/* ── Favorites section ── */}
      {!foodSearch && !selectedFood && favorites.length > 0 && (
        <div className="bg-ct-surface rounded-ct-lg border border-amber-500/30 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <p className="text-[11px] uppercase tracking-[0.1em] text-amber-400 font-semibold">{t('log.favorites')}</p>
          </div>
          {favorites.slice(0, 6).map((food) => (
            <button key={food.id} onClick={() => onSelectFood(food, food.defaultServingG)}
              className="w-full text-left px-4 py-3 border-b border-ct-border last:border-0 active:bg-ct-elevated/50 flex items-center justify-between min-h-[44px]">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ct-1 truncate">{food.name}</p>
                <p className="text-[11px] text-ct-2 tabular-nums">{food.defaultServingG}g · {food.caloriesPer100g} cal/100g</p>
              </div>
              <span className="text-xs text-amber-400 font-semibold shrink-0 ml-2">{t('log.add')}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Recent foods ── */}
      {!foodSearch && !selectedFood && recentFoods.length > 0 && (
        <div className="bg-ct-surface rounded-ct-lg border border-ct-border overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
            <Clock size={12} className="text-ct-2" />
            <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('log.recentFoods')}</p>
          </div>
          {recentFoods.slice(0, 6).map(({ food, lastGrams, count }) => (
            <div key={food.id} className="flex items-center border-b border-ct-border last:border-0">
              <button onClick={() => onSelectFood(food, lastGrams)}
                className="flex-1 text-left px-4 py-3 active:bg-ct-elevated/50 flex items-center justify-between min-h-[44px]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ct-1 truncate">{food.name}</p>
                  <p className="text-[11px] text-ct-2">{t('log.lastTimeGrams', { grams: lastGrams })}{count > 1 ? ` ${t('log.lastTimeCount', { count })}` : ''}</p>
                </div>
                <span className="text-xs text-cyan-400 font-semibold shrink-0 ml-2">{t('log.add')}</span>
              </button>
              {onToggleFavorite && (
                <button onClick={() => onToggleFavorite(food.id!)}
                  className="p-3 flex items-center justify-center text-ct-2 active:text-amber-400 min-h-[44px] min-w-[44px]"
                  aria-label={food.isFavorite ? t('log.removeFromFavorites') : t('log.addToFavorites')}>
                  {food.isFavorite ? (
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                  ) : (
                    <Star size={18} className="text-ct-2" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── All foods ── */}
      {!foodSearch && !selectedFood && (
        <div className="bg-ct-surface rounded-ct-lg border border-ct-border overflow-hidden">
          <button onClick={() => onShowAllFoodsChange(!showAllFoods)}
            className="w-full flex items-center justify-between px-4 py-3 active:bg-ct-elevated/30 min-h-[44px]">
            <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('log.allFoods')} ({foods.length})</p>
            <ChevronDown size={14} className={`text-ct-2 transition-transform ${showAllFoods ? 'rotate-180' : ''}`} />
          </button>
          {showAllFoods && (
            <div className="max-h-64 overflow-y-auto">
              {foods.map(food => (
                <div key={food.id} className="flex items-center border-b border-ct-border last:border-0">
                  <button onClick={() => onSelectFood(food)}
                    className="flex-1 text-left px-4 py-3 active:bg-ct-elevated/50 min-h-[44px]">
                    <p className="text-sm font-medium text-ct-1">{food.name}</p>
                    <p className="text-[11px] text-ct-2 tabular-nums">{food.caloriesPer100g} cal · P:{food.proteinPer100g}g /100g</p>
                  </button>
                  {onToggleFavorite && (
                    <button onClick={() => onToggleFavorite(food.id!)}
                      className="p-3 flex items-center justify-center text-ct-2 active:text-amber-400 min-h-[44px] min-w-[44px]"
                      aria-label={food.isFavorite ? t('log.removeFromFavorites') : t('log.addToFavorites')}>
                      {food.isFavorite ? (
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                      ) : (
                        <Star size={16} className="text-ct-2" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
