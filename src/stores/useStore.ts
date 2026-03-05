import { create } from 'zustand'
import { db } from '../db/database'
import { today, getDayOfWeek, getCurrentWeek, calcMacros } from '../utils/macros'
import type {
  DailyLog, Workout, MealLog, MealTemplate,
  GroceryItem, ProgramDay, UserSettings, FoodItem,
  DailyMacros
} from '../types'

interface AppStore {
  // UI state
  activeTab: string
  setActiveTab: (tab: string) => void

  // Settings
  settings: UserSettings | null
  loadSettings: () => Promise<void>
  updateSettings: (s: Partial<UserSettings>) => Promise<void>

  // Daily log
  todayLog: DailyLog | null
  loadTodayLog: () => Promise<void>
  saveDailyLog: (log: Partial<DailyLog>) => Promise<void>

  // Workouts
  todayWorkout: Workout | null
  workouts: Workout[]
  loadTodayWorkout: () => Promise<void>
  loadWorkouts: () => Promise<void>
  saveWorkout: (w: Omit<Workout, 'createdAt' | 'updatedAt'>) => Promise<void>

  // Meals
  todayMeals: MealLog[]
  todayMacros: DailyMacros
  loadTodayMeals: () => Promise<void>
  saveMealLog: (m: Omit<MealLog, 'id' | 'createdAt'>) => Promise<void>
  deleteMealLog: (id: number) => Promise<void>
  addMealFromTemplate: (template: MealTemplate) => Promise<void>

  // Food library
  foods: FoodItem[]
  loadFoods: () => Promise<void>

  // Templates
  templates: MealTemplate[]
  loadTemplates: () => Promise<void>

  // Program
  todayProgram: ProgramDay | null
  loadTodayProgram: () => Promise<void>

  // Grocery
  groceryItems: GroceryItem[]
  loadGrocery: () => Promise<void>
  toggleGroceryItem: (id: number) => Promise<void>
  resetGrocery: () => Promise<void>

  // PRs
  prs: Workout[]
  loadPRs: () => Promise<void>

  // History
  allDailyLogs: DailyLog[]
  loadAllDailyLogs: () => Promise<void>

  // Export
  exportAllData: () => Promise<string>
  importData: (json: string) => Promise<void>
}

export const useStore = create<AppStore>((set, get) => ({
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),

  settings: null,
  loadSettings: async () => {
    const s = await db.settings.toCollection().first()
    if (s) set({ settings: s })
  },
  updateSettings: async (s) => {
    const current = get().settings
    if (!current?.id) return
    await db.settings.update(current.id, s)
    set({ settings: { ...current, ...s } as UserSettings })
  },

  todayLog: null,
  loadTodayLog: async () => {
    const d = today()
    const log = await db.dailyLogs.where('date').equals(d).first()
    set({ todayLog: log || null })
  },
  saveDailyLog: async (log) => {
    const d = today()
    const now = new Date().toISOString()
    const existing = await db.dailyLogs.where('date').equals(d).first()
    if (existing?.id) {
      await db.dailyLogs.update(existing.id, { ...log, updatedAt: now })
      set({ todayLog: { ...existing, ...log, updatedAt: now } })
    } else {
      const newLog: DailyLog = {
        date: d, ...log, createdAt: now, updatedAt: now,
      } as DailyLog
      const id = await db.dailyLogs.add(newLog)
      set({ todayLog: { ...newLog, id } })
    }
  },

  todayWorkout: null,
  workouts: [],
  loadTodayWorkout: async () => {
    const d = today()
    const w = await db.workouts.where('date').equals(d).first()
    set({ todayWorkout: w || null })
  },
  loadWorkouts: async () => {
    const w = await db.workouts.orderBy('date').reverse().toArray()
    set({ workouts: w })
  },
  saveWorkout: async (w) => {
    const now = new Date().toISOString()
    if (w.id) {
      await db.workouts.update(w.id, { ...w, updatedAt: now })
    } else {
      await db.workouts.add({ ...w, createdAt: now, updatedAt: now } as Workout)
    }
    get().loadTodayWorkout()
    get().loadWorkouts()
    get().loadPRs()
  },

  todayMeals: [],
  todayMacros: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  loadTodayMeals: async () => {
    const d = today()
    const meals = await db.mealLogs.where('date').equals(d).toArray()
    const macros = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
        fiber: acc.fiber + (m.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    )
    set({ todayMeals: meals, todayMacros: macros })
  },
  saveMealLog: async (m) => {
    await db.mealLogs.add({ ...m, createdAt: new Date().toISOString() } as MealLog)
    get().loadTodayMeals()
  },
  deleteMealLog: async (id) => {
    await db.mealLogs.delete(id)
    get().loadTodayMeals()
  },
  addMealFromTemplate: async (template) => {
    const foods = await db.foodLibrary.toArray()
    const d = today()
    const now = new Date().toISOString()
    for (const item of template.items) {
      const food = foods.find(f => f.id === item.foodId) || foods.find(f => f.name === item.foodName)
      if (!food) continue
      const macros = calcMacros(food, item.grams)
      await db.mealLogs.add({
        date: d,
        mealType: template.mealType,
        foodId: food.id!,
        foodName: food.name,
        grams: item.grams,
        ...macros,
        createdAt: now,
      })
    }
    get().loadTodayMeals()
  },

  foods: [],
  loadFoods: async () => {
    const f = await db.foodLibrary.toArray()
    set({ foods: f })
  },

  templates: [],
  loadTemplates: async () => {
    const t = await db.mealTemplates.toArray()
    set({ templates: t })
  },

  todayProgram: null,
  loadTodayProgram: async () => {
    const dow = getDayOfWeek()
    const { weekNumber } = getCurrentWeek()
    const prog = await db.programDays
      .where('weekNumber').equals(weekNumber)
      .filter(p => p.dayOfWeek === dow)
      .first()
    set({ todayProgram: prog || null })
  },

  groceryItems: [],
  loadGrocery: async () => {
    const items = await db.groceryItems.toArray()
    set({ groceryItems: items })
  },
  toggleGroceryItem: async (id) => {
    const item = await db.groceryItems.get(id)
    if (item) {
      await db.groceryItems.update(id, { isChecked: !item.isChecked })
      get().loadGrocery()
    }
  },
  resetGrocery: async () => {
    await db.groceryItems.toCollection().modify({ isChecked: false })
    get().loadGrocery()
  },

  prs: [],
  loadPRs: async () => {
    const prWorkouts = await db.workouts.where('prFlag').equals(1).toArray()
    set({ prs: prWorkouts })
  },

  allDailyLogs: [],
  loadAllDailyLogs: async () => {
    const logs = await db.dailyLogs.orderBy('date').toArray()
    set({ allDailyLogs: logs })
  },

  exportAllData: async () => {
    const data = {
      dailyLogs: await db.dailyLogs.toArray(),
      workouts: await db.workouts.toArray(),
      mealLogs: await db.mealLogs.toArray(),
      foodLibrary: await db.foodLibrary.toArray(),
      mealTemplates: await db.mealTemplates.toArray(),
      groceryItems: await db.groceryItems.toArray(),
      programDays: await db.programDays.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    return JSON.stringify(data, null, 2)
  },
  importData: async (json) => {
    const data = JSON.parse(json)
    if (data.dailyLogs) { await db.dailyLogs.clear(); await db.dailyLogs.bulkAdd(data.dailyLogs) }
    if (data.workouts) { await db.workouts.clear(); await db.workouts.bulkAdd(data.workouts) }
    if (data.mealLogs) { await db.mealLogs.clear(); await db.mealLogs.bulkAdd(data.mealLogs) }
    if (data.foodLibrary) { await db.foodLibrary.clear(); await db.foodLibrary.bulkAdd(data.foodLibrary) }
    if (data.mealTemplates) { await db.mealTemplates.clear(); await db.mealTemplates.bulkAdd(data.mealTemplates) }
    if (data.groceryItems) { await db.groceryItems.clear(); await db.groceryItems.bulkAdd(data.groceryItems) }
    if (data.settings) { await db.settings.clear(); await db.settings.bulkAdd(data.settings) }
  },
}))
