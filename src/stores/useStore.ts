import { create } from 'zustand'
import { db } from '../db/database'
import { today, calcMacros } from '../utils/macros'
import type {
  DailyLog, Workout, MealLog, MealTemplate,
  GroceryItem, UserProfile, FoodItem,
  DailyMacros, MovementPR, BenchmarkWod, TimerPreset,
  MealType, WeeklyPlan
} from '../types'
import type { EventLog } from '../types/eventTypes'

export interface RecentFood {
  food: FoodItem
  lastGrams: number
  lastMealType: MealType
  count: number
}

interface AppStore {
  activeTab: string
  setActiveTab: (tab: string) => void
  isLoading: boolean
  loadError: string | null
  clearLoadError: () => void
  profile: UserProfile | null
  loadProfile: () => Promise<void>
  saveProfile: (p: Partial<UserProfile>) => Promise<void>
  isOnboarded: () => boolean
  todayLog: DailyLog | null
  loadTodayLog: () => Promise<void>
  saveDailyLog: (log: Partial<DailyLog>) => Promise<void>
  todayWorkout: Workout | null
  workouts: Workout[]
  loadTodayWorkout: () => Promise<void>
  loadWorkouts: () => Promise<void>
  saveWorkout: (w: Omit<Workout, 'createdAt' | 'updatedAt'>) => Promise<void>
  deleteWorkout: (id: number) => Promise<void>
  todayMeals: MealLog[]
  todayMacros: DailyMacros
  loadTodayMeals: () => Promise<void>
  saveMealLog: (m: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>
  deleteMealLog: (id: number) => Promise<void>
  addMealFromTemplate: (template: MealTemplate) => Promise<void>
  recentFoods: RecentFood[]
  loadRecentFoods: () => Promise<void>
  foods: FoodItem[]
  loadFoods: () => Promise<void>
  saveCustomFood: (food: FoodItem) => Promise<FoodItem>
  templates: MealTemplate[]
  loadTemplates: () => Promise<void>
  groceryItems: GroceryItem[]
  loadGrocery: () => Promise<void>
  toggleGroceryItem: (id: number) => Promise<void>
  resetGrocery: () => Promise<void>
  movementPRs: MovementPR[]
  loadMovementPRs: () => Promise<void>
  saveMovementPR: (pr: Omit<MovementPR, 'id' | 'createdAt'>) => Promise<void>
  benchmarkWods: BenchmarkWod[]
  loadBenchmarkWods: () => Promise<void>
  timerPresets: TimerPreset[]
  loadTimerPresets: () => Promise<void>
  saveTimerPreset: (preset: Omit<TimerPreset, 'id'> & { id?: number }) => Promise<void>
  deleteTimerPreset: (id: number) => Promise<void>
  weeklyPlans: WeeklyPlan[]
  loadWeeklyPlans: (weekKey: string) => Promise<void>
  saveWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'createdAt'>) => Promise<void>
  deleteWeeklyPlan: (id: number) => Promise<void>
  toggleWeeklyPlanComplete: (id: number) => Promise<void>
  prs: Workout[]
  loadPRs: () => Promise<void>
  allDailyLogs: DailyLog[]
  loadAllDailyLogs: () => Promise<void>
  exportAllData: () => Promise<string>
  importData: (json: string) => Promise<void>
  getAllDataForSync: () => Promise<Record<string, any[]>>
  importFromSync: (data: Record<string, any[]>) => Promise<void>
  // CrossFit Events
  eventLogs: EventLog[]
  loadEventLogs: () => Promise<void>
  saveEventLog: (log: Omit<EventLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }) => Promise<void>
  deleteEventLog: (id: number) => Promise<void>
}

export const useStore = create<AppStore>((set, get) => ({
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isLoading: true,
  loadError: null,
  clearLoadError: () => set({ loadError: null }),

  profile: null,
  loadProfile: async () => {
    try {
      const p = await db.profile.toCollection().first()
      set({ profile: p || null, isLoading: false, loadError: null })
    } catch (e) { import.meta.env.DEV && console.error('loadProfile failed:', e); set({ isLoading: false, loadError: 'Failed to load profile. Please try again.' }) }
  },
  saveProfile: async (p) => {
    try {
      const current = get().profile
      const now = new Date().toISOString()
      if (current?.id) {
        await db.profile.update(current.id, { ...p, updatedAt: now })
        set({ profile: { ...current, ...p, updatedAt: now } as UserProfile })
      } else {
        const np: UserProfile = {
          displayName: '', experienceLevel: 'beginner', goal: 'general_health',
          trainingTime: '06:00', trainingDaysPerWeek: 5, language: 'en',
          units: 'metric', proteinTarget: 150, carbsTarget: 200, fatTarget: 60,
          calorieTarget: 2000, waterTarget: 2500, onboardingComplete: false,
          createdAt: now, updatedAt: now, ...p,
        }
        const id = await db.profile.add(np)
        set({ profile: { ...np, id } })
      }
    } catch (e) { import.meta.env.DEV && console.error('saveProfile failed:', e); throw e }
  },
  isOnboarded: () => !!get().profile?.onboardingComplete,

  todayLog: null,
  loadTodayLog: async () => {
    try {
      const log = await db.dailyLogs.where('date').equals(today()).first()
      set({ todayLog: log || null })
    } catch (e) { import.meta.env.DEV && console.error('loadTodayLog failed:', e) }
  },
  saveDailyLog: async (log) => {
    try {
      const d = today(); const now = new Date().toISOString()
      const existing = await db.dailyLogs.where('date').equals(d).first()
      if (existing?.id) {
        await db.dailyLogs.update(existing.id, { ...log, updatedAt: now })
        set({ todayLog: { ...existing, ...log, updatedAt: now } })
      } else {
        const nl = { date: d, ...log, createdAt: now, updatedAt: now } as DailyLog
        const id = await db.dailyLogs.add(nl)
        set({ todayLog: { ...nl, id } })
      }
    } catch (e) { import.meta.env.DEV && console.error('saveDailyLog failed:', e); throw e }
  },

  todayWorkout: null, workouts: [],
  loadTodayWorkout: async () => {
    try { set({ todayWorkout: (await db.workouts.where('date').equals(today()).first()) || null }) }
    catch (e) { import.meta.env.DEV && console.error('loadTodayWorkout failed:', e) }
  },
  loadWorkouts: async () => {
    try { set({ workouts: await db.workouts.orderBy('date').reverse().toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadWorkouts failed:', e) }
  },
  saveWorkout: async (w) => {
    try {
      const now = new Date().toISOString()
      if (w.id) await db.workouts.update(w.id, { ...w, updatedAt: now })
      else await db.workouts.add({ ...w, createdAt: now, updatedAt: now } as Workout)
      await Promise.allSettled([get().loadTodayWorkout(), get().loadWorkouts(), get().loadPRs()])
    } catch (e) { import.meta.env.DEV && console.error('saveWorkout failed:', e); throw e }
  },
  deleteWorkout: async (id) => {
    try {
      await db.workouts.delete(id)
      await Promise.allSettled([get().loadTodayWorkout(), get().loadWorkouts(), get().loadPRs()])
    } catch (e) { import.meta.env.DEV && console.error('deleteWorkout failed:', e); throw e }
  },

  todayMeals: [], todayMacros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  loadTodayMeals: async () => {
    try {
      const meals = await db.mealLogs.where('date').equals(today()).toArray()
      const m = meals.reduce((a, m) => ({
        calories: a.calories + m.calories, protein: a.protein + m.protein,
        carbs: a.carbs + m.carbs, fat: a.fat + m.fat, fiber: a.fiber + (m.fiber || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
      set({ todayMeals: meals, todayMacros: m })
    } catch (e) { import.meta.env.DEV && console.error('loadTodayMeals failed:', e) }
  },
  saveMealLog: async (m) => {
    try {
      await db.mealLogs.add({ ...m, createdAt: new Date().toISOString() } as MealLog)
      await get().loadTodayMeals()
    } catch (e) { import.meta.env.DEV && console.error('saveMealLog failed:', e); throw e }
  },
  deleteMealLog: async (id) => {
    try { await db.mealLogs.delete(id); await get().loadTodayMeals() }
    catch (e) { import.meta.env.DEV && console.error('deleteMealLog failed:', e); throw e }
  },
  addMealFromTemplate: async (t) => {
    try {
      const foods = await db.foodLibrary.toArray()
      const d = today(); const now = new Date().toISOString()
      for (const item of t.items) {
        const food = foods.find(f => f.id === item.foodId) || foods.find(f => f.name === item.foodName)
        if (!food) continue
        const mc = calcMacros(food, item.grams)
        await db.mealLogs.add({ date: d, mealType: t.mealType, foodId: food.id!, foodName: food.name, grams: item.grams, ...mc, createdAt: now })
      }
      await get().loadTodayMeals()
    } catch (e) { import.meta.env.DEV && console.error('addMealFromTemplate failed:', e); throw e }
  },

  recentFoods: [],
  loadRecentFoods: async () => {
    try {
      const allMeals = await db.mealLogs.orderBy('createdAt').reverse().toArray()
      const allFoods = await db.foodLibrary.toArray()
      const foodMap = new Map<number, { food: FoodItem; lastGrams: number; lastMealType: MealType; count: number }>()
      for (const meal of allMeals) {
        if (foodMap.has(meal.foodId)) {
          foodMap.get(meal.foodId)!.count++
        } else {
          const food = allFoods.find(f => f.id === meal.foodId)
          if (food) {
            foodMap.set(meal.foodId, { food, lastGrams: meal.grams, lastMealType: meal.mealType, count: 1 })
          }
        }
      }
      const recent = Array.from(foodMap.values()).sort((a, b) => b.count - a.count).slice(0, 10)
      set({ recentFoods: recent })
    } catch (e) { import.meta.env.DEV && console.error('loadRecentFoods failed:', e) }
  },

  foods: [],
  loadFoods: async () => {
    try { set({ foods: await db.foodLibrary.toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadFoods failed:', e) }
  },
  saveCustomFood: async (food) => {
    try {
      const id = await db.foodLibrary.add(food)
      const saved = { ...food, id }
      await get().loadFoods()
      return saved
    } catch (e) { import.meta.env.DEV && console.error('saveCustomFood failed:', e); throw e }
  },
  templates: [],
  loadTemplates: async () => {
    try { set({ templates: await db.mealTemplates.toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadTemplates failed:', e) }
  },

  groceryItems: [],
  loadGrocery: async () => {
    try { set({ groceryItems: await db.groceryItems.toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadGrocery failed:', e) }
  },
  toggleGroceryItem: async (id) => {
    try {
      const item = await db.groceryItems.get(id)
      if (item) { await db.groceryItems.update(id, { isChecked: !item.isChecked }); await get().loadGrocery() }
    } catch (e) { import.meta.env.DEV && console.error('toggleGroceryItem failed:', e); throw e }
  },
  resetGrocery: async () => {
    try { await db.groceryItems.toCollection().modify({ isChecked: false }); await get().loadGrocery() }
    catch (e) { import.meta.env.DEV && console.error('resetGrocery failed:', e); throw e }
  },

  movementPRs: [],
  loadMovementPRs: async () => {
    try { set({ movementPRs: await db.movementPRs.orderBy('date').reverse().toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadMovementPRs failed:', e) }
  },
  saveMovementPR: async (pr) => {
    try {
      const existing = await db.movementPRs.where('movementName').equals(pr.movementName).filter(p => p.prType === pr.prType).toArray()
      existing.sort((a, b) => a.value - b.value)
      const best = existing.length > 0 ? existing[existing.length - 1].value : undefined
      await db.movementPRs.add({ ...pr, previousBest: best, createdAt: new Date().toISOString() })
      await get().loadMovementPRs()
    } catch (e) { import.meta.env.DEV && console.error('saveMovementPR failed:', e); throw e }
  },

  benchmarkWods: [],
  loadBenchmarkWods: async () => {
    try { set({ benchmarkWods: await db.benchmarkWods.toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadBenchmarkWods failed:', e) }
  },
  timerPresets: [],
  loadTimerPresets: async () => {
    try { set({ timerPresets: await db.timerPresets.toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadTimerPresets failed:', e) }
  },
  saveTimerPreset: async (preset) => {
    try {
      if (preset.id) {
        await db.timerPresets.update(preset.id, preset)
      } else {
        await db.timerPresets.add(preset as TimerPreset)
      }
      set({ timerPresets: await db.timerPresets.toArray() })
    } catch (e: unknown) {
      import.meta.env.DEV && console.error('saveTimerPreset failed:', e)
    }
  },
  deleteTimerPreset: async (id) => {
    try {
      await db.timerPresets.delete(id)
      set({ timerPresets: await db.timerPresets.toArray() })
    } catch (e: unknown) {
      import.meta.env.DEV && console.error('deleteTimerPreset failed:', e)
    }
  },

  weeklyPlans: [],
  loadWeeklyPlans: async (weekKey) => {
    try {
      const plans = await db.weeklyPlans.where('weekKey').equals(weekKey).toArray()
      set({ weeklyPlans: plans })
    } catch (e) { import.meta.env.DEV && console.error('loadWeeklyPlans failed:', e) }
  },
  saveWeeklyPlan: async (plan) => {
    try {
      await db.weeklyPlans.add({ ...plan, createdAt: new Date().toISOString() })
      get().loadWeeklyPlans(plan.weekKey)
    } catch (e) { import.meta.env.DEV && console.error('saveWeeklyPlan failed:', e); throw e }
  },
  deleteWeeklyPlan: async (id) => {
    try {
      const plan = await db.weeklyPlans.get(id)
      await db.weeklyPlans.delete(id)
      if (plan) get().loadWeeklyPlans(plan.weekKey)
    } catch (e) { import.meta.env.DEV && console.error('deleteWeeklyPlan failed:', e); throw e }
  },
  toggleWeeklyPlanComplete: async (id) => {
    try {
      const plan = await db.weeklyPlans.get(id)
      if (plan) {
        await db.weeklyPlans.update(id, { completed: !plan.completed })
        get().loadWeeklyPlans(plan.weekKey)
      }
    } catch (e) { import.meta.env.DEV && console.error('toggleWeeklyPlanComplete failed:', e); throw e }
  },

  prs: [],
  loadPRs: async () => {
    try { set({ prs: await db.workouts.where('prFlag').equals(1).toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadPRs failed:', e) }
  },
  allDailyLogs: [],
  loadAllDailyLogs: async () => {
    try { set({ allDailyLogs: await db.dailyLogs.orderBy('date').toArray() }) }
    catch (e) { import.meta.env.DEV && console.error('loadAllDailyLogs failed:', e) }
  },

  exportAllData: async () => {
    try {
      return JSON.stringify({
        dailyLogs: await db.dailyLogs.toArray(), workouts: await db.workouts.toArray(),
        mealLogs: await db.mealLogs.toArray(), foodLibrary: await db.foodLibrary.toArray(),
        mealTemplates: await db.mealTemplates.toArray(), groceryItems: await db.groceryItems.toArray(),
        profile: await db.profile.toArray(), movementPRs: await db.movementPRs.toArray(),
        weeklyPlans: await db.weeklyPlans.toArray(),
        exportedAt: new Date().toISOString(), version: '3.0',
      }, null, 2)
    } catch (e) { import.meta.env.DEV && console.error('exportAllData failed:', e); throw e }
  },
  importData: async (json) => {
    try {
      const d = JSON.parse(json)
      // Get valid table names from parsed data
      const validEntries = Object.entries(d).filter(
        ([key, val]) => key in db && Array.isArray(val)
      ) as [string, any[]][]
      if (validEntries.length === 0) throw new Error('No valid data tables found in import file')

      // Use Dexie transaction for atomic import  -  if anything fails, everything rolls back
      const tableNames = validEntries.map(([key]) => key)
      const tables = tableNames.map(name => (db as any)[name]).filter(Boolean)
      await db.transaction('rw', tables, async () => {
        for (const [key, val] of validEntries) {
          const table = (db as any)[key]
          if (table?.clear) { await table.clear(); await table.bulkAdd(val) }
        }
      })
    } catch (e) { import.meta.env.DEV && console.error('importData failed:', e); throw e }
  },
  getAllDataForSync: async () => {
    try {
      return {
        dailyLogs: await db.dailyLogs.toArray(),
        workouts: await db.workouts.toArray(),
        mealLogs: await db.mealLogs.toArray(),
        foodLibrary: await db.foodLibrary.toArray(),
        mealTemplates: await db.mealTemplates.toArray(),
        groceryItems: await db.groceryItems.toArray(),
        profile: await db.profile.toArray(),
        movementPRs: await db.movementPRs.toArray(),
        weeklyPlans: await db.weeklyPlans.toArray(),
      }
    } catch (e) { import.meta.env.DEV && console.error('getAllDataForSync failed:', e); throw e }
  },
  importFromSync: async (data) => {
    try {
      const validEntries = Object.entries(data).filter(
        ([key, val]) => key in db && Array.isArray(val) && val.length > 0
      ) as [string, any[]][]
      if (validEntries.length === 0) return

      // Use Dexie transaction for atomic sync import  -  rolls back on any failure
      const tables = validEntries.map(([key]) => (db as any)[key]).filter(Boolean)
      await db.transaction('rw', tables, async () => {
        for (const [key, val] of validEntries) {
          const table = (db as any)[key]
          if (table?.clear) { await table.clear(); await table.bulkAdd(val) }
        }
      })
    } catch (e) { import.meta.env.DEV && console.error('importFromSync failed:', e); throw e }
  },

  // ═══ CrossFit Events ═══
  eventLogs: [],
  loadEventLogs: async () => {
    try {
      set({ eventLogs: await db.eventLogs.orderBy('date').reverse().toArray() })
    } catch (e) { import.meta.env.DEV && console.error('loadEventLogs failed:', e) }
  },
  saveEventLog: async (log) => {
    try {
      const now = new Date().toISOString()
      if (log.id) {
        await db.eventLogs.update(log.id, { ...log, updatedAt: now })
      } else {
        const { id: _, ...rest } = log
        await db.eventLogs.add({ ...rest, createdAt: now, updatedAt: now } as EventLog)
      }
      await get().loadEventLogs()
    } catch (e) { import.meta.env.DEV && console.error('saveEventLog failed:', e); throw e }
  },
  deleteEventLog: async (id) => {
    try {
      await db.eventLogs.delete(id)
      await get().loadEventLogs()
    } catch (e) { import.meta.env.DEV && console.error('deleteEventLog failed:', e); throw e }
  },
}))
