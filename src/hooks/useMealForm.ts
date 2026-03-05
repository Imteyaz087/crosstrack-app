import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../stores/useStore'
import { calcMacros, today } from '../utils/macros'
import { calcGoalTargets, goalLabel } from '../utils/goalTargets'
import type { FoodItem, MealType, NutritionResult } from '../types'
import { searchFood, resultToFoodItem } from '../services/nutritionApi'

export function useMealForm(
  onToast: (msg: string, type: 'success' | 'error') => void,
) {
  const { foods, recentFoods, todayMeals, todayMacros, profile, saveMealLog, deleteMealLog, loadRecentFoods, saveCustomFood } = useStore()

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('')
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [foodSearch, setFoodSearch] = useState('')
  const [showAllFoods, setShowAllFoods] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const gramsRef = useRef<HTMLInputElement>(null)

  // API search state
  const [apiResults, setApiResults] = useState<NutritionResult[]>([])
  const [apiSearching, setApiSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-detect meal type from time of day
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 10) setMealType('breakfast')
    else if (h < 12) setMealType('post_workout')
    else if (h < 14) setMealType('lunch')
    else if (h < 17) setMealType('snack')
    else setMealType('dinner')
  }, [])

  // Debounced API search when foodSearch changes
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const query = foodSearch.trim()
    if (query.length < 3) {
      setApiResults([])
      setApiSearching(false)
      return
    }

    setApiSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await searchFood(query)
        setApiResults(result.apiResults)
      } catch {
        setApiResults([])
      } finally {
        setApiSearching(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [foodSearch])

  const macros = selectedFood && grams
    ? calcMacros(selectedFood, parseFloat(grams) || 0)
    : null

  // Meals already logged for the currently-selected meal type
  const mealsForType = todayMeals.filter(m => m.mealType === mealType)
  const mealsForTypeMacros = mealsForType.reduce((a, m) => ({
    calories: a.calories + m.calories,
    protein: a.protein + m.protein,
    carbs: a.carbs + m.carbs,
    fat: a.fat + m.fat,
    fiber: a.fiber + (m.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

  // Evidence-based targets from profile goal + body stats
  const targets = calcGoalTargets(profile)
  const goalName = goalLabel(profile?.goal || 'general_health')

  const handleSelectFood = (food: FoodItem, defaultGrams?: number) => {
    setSelectedFood(food)
    setGrams(String(defaultGrams || food.defaultServingG))
    setFoodSearch('')
    setShowAllFoods(false)
    setApiResults([])
    setTimeout(() => gramsRef.current?.focus(), 100)
  }

  // Select an API result: validate, convert to FoodItem, save to library, then select it
  const handleSelectApiResult = useCallback(async (result: NutritionResult) => {
    // Validate nutrition data before saving
    if (!result.name || result.name.trim().length === 0) {
      onToast('Invalid food data – missing name', 'error')
      return
    }
    if (result.caloriesPer100g < 0 || result.proteinPer100g < 0 || result.carbsPer100g < 0 || result.fatPer100g < 0) {
      onToast('Invalid nutrition values', 'error')
      return
    }
    try {
      const food = resultToFoodItem(result)
      // Save to local library so it's available offline next time
      const id = await saveCustomFood(food)
      const savedFood: FoodItem = { ...food, id, defaultServingG: result.servingSize || 100, isCustom: true }
      handleSelectFood(savedFood, result.servingSize || 100)
    } catch {
      onToast('Failed to save food – try again', 'error')
    }
  }, [saveCustomFood, onToast])

  const [savingMeal, setSavingMeal] = useState(false)

  const handleSaveMeal = async () => {
    if (!selectedFood) { onToast('Select a food first', 'error'); return }
    const g = parseFloat(grams)
    if (!g || g <= 0) { onToast('Enter a valid amount in grams', 'error'); return }
    if (g > 5000) { onToast('Amount seems too high – check grams', 'error'); return }
    if (savingMeal) return
    setSavingMeal(true)
    try {
      const m = calcMacros(selectedFood, g)
      await saveMealLog({
        date: today(),
        mealType,
        foodId: selectedFood.id!,
        foodName: selectedFood.name,
        grams: g,
        ...m,
      })
      const savedName = selectedFood.name
      setSelectedFood(null); setGrams(''); setFoodSearch('')
      setApiResults([])
      await loadRecentFoods()
      onToast(`${savedName} added!`, 'success')
    } catch {
      onToast('Failed to save meal – try again', 'error')
    } finally {
      setSavingMeal(false)
    }
  }

  const handleDeleteMeal = async (id: number) => {
    await deleteMealLog(id)
  }

  const resetMeal = () => {
    setSelectedFood(null); setGrams(''); setFoodSearch('')
    setApiResults([])
  }

  return {
    selectedFood, grams, mealType, foodSearch, showAllFoods,
    foods, recentFoods, macros, searchRef, gramsRef,
    mealsForType, mealsForTypeMacros, targets, todayMacros, goalName,
    apiResults, apiSearching, savingMeal,
    setMealType, setGrams, setFoodSearch, setShowAllFoods,
    handleSelectFood, handleSelectApiResult,
    handleSaveMeal, handleDeleteMeal, resetMeal, setSelectedFood,
  }
}