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
  moreSubPage: string | null
  setMoreSubPage: (id: string | null) => void
  toast: string | null
  showToast: (msg: string) => void

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

  // Movement PRs
  movementPRs: import('../types').MovementPR[]
  loadMovementPRs: () => Promise<void>

  // Timer presets
  timerPresets: import('../types').TimerPreset[]
  loadTimerPresets: () => Promise<void>

  // History
  allDailyLogs: DailyLog[]
  loadAllDailyLogs: () => Promise<void>

  // Export
  exportAllData: () => Promise<string>
  importData: (json: string) => Promise<void>

  // Profile / onboarding
  profile: (UserSettings & { onboardingComplete?: boolean }) | null
  isLoading: boolean
  loadError: string | null
  loadProfile: () => Promise<void>
  clearLoadError: () => void
  saveProfile: (profile: Omit<import('../types').UserProfile, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }) => Promise<void>

  // Benchmark WODs
  benchmarkWods: import('../types').BenchmarkWod[]
  loadBenchmarkWods: () => Promise<void>

  // Food / nutrition
  recentFoods: FoodItem[]
  loadRecentFoods: () => Promise<void>
  saveCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<number>

  // Movement PRs
  saveMovementPR: (pr: Omit<import('../types').MovementPR, 'id'>) => Promise<void>

  // Weekly plans
  weeklyPlans: import('../types').WeeklyPlan[]
  loadWeeklyPlans: (weekKey: string) => Promise<void>
  saveWeeklyPlan: (plan: Omit<import('../types').WeeklyPlan, 'id'>) => Promise<void>
  deleteWeeklyPlan: (id: number) => Promise<void>
  toggleWeeklyPlanComplete: (id: number) => Promise<void>
}

export const useStore = create<AppStore>((set, get) => ({
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),
  moreSubPage: null,
  setMoreSubPage: (id) => set({ moreSubPage: id }),
  toast: null,
  showToast: (msg) => {
    set({ toast: msg })
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  },

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

  movementPRs: [],
  loadMovementPRs: async () => {
    const prs = await db.movementPRs.orderBy('date').reverse().toArray()
    set({ movementPRs: prs })
  },

  timerPresets: [],
  loadTimerPresets: async () => {
    let presets = await db.timerPresets.toArray()
    if (presets.length === 0) {
      await db.timerPresets.bulkAdd([
        { name: 'AMRAP 12', mode: 'amrap', totalSeconds: 720 },
        { name: 'AMRAP 15', mode: 'amrap', totalSeconds: 900 },
        { name: 'EMOM 10', mode: 'emom', totalSeconds: 600, rounds: 10, workSeconds: 60 },
        { name: 'Tabata (8 rds)', mode: 'tabata', totalSeconds: 240, rounds: 8, workSeconds: 20, restSeconds: 10 },
        { name: 'For Time (20 cap)', mode: 'fortime', totalSeconds: 1200 },
        { name: 'Rest 90s', mode: 'rest', totalSeconds: 90 },
      ])
      presets = await db.timerPresets.toArray()
    }
    set({ timerPresets: presets })
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
      movementPRs: await db.movementPRs.toArray(),
      benchmarkWods: await db.benchmarkWods.toArray(),
      timerPresets: await db.timerPresets.toArray(),
      cycleEntries: await db.cycleEntries.toArray(),
      bodyMeasurements: await db.bodyMeasurements.toArray(),
      heartRateLogs: await db.heartRateLogs.toArray(),
      photoLogs: await db.photoLogs.toArray(),
      achievements: await db.achievements.toArray(),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    }
    return JSON.stringify(data, null, 2)
  },
  profile: null,
  isLoading: true,
  loadError: null,
  loadProfile: async () => {
    try {
      set({ loadError: null })
      await get().loadSettings()
      const s = get().settings
      const done = typeof localStorage !== 'undefined' && localStorage.getItem('trackvolt_onboarding_done') === '1'
      set({ profile: s ? { ...s, onboardingComplete: done } : null, isLoading: false })
    } catch (e) {
      set({ loadError: String(e), isLoading: false })
    }
  },
  clearLoadError: () => set({ loadError: null }),
  saveProfile: async (profile) => {
    const settingsData: UserSettings = {
      displayName: profile.displayName,
      weightKg: profile.weightKg ?? 70,
      goal: String(profile.goal ?? 'general_health'),
      trainingTime: profile.trainingTime,
      language: profile.language,
      units: profile.units,
      proteinTarget: profile.proteinTarget,
      carbsTarget: profile.carbsTarget,
      fatTarget: profile.fatTarget,
      calorieTarget: profile.calorieTarget,
      waterTarget: profile.waterTarget,
    }
    const existing = await db.settings.toCollection().first()
    if (existing?.id) {
      await db.settings.update(existing.id, settingsData)
    } else {
      await db.settings.add(settingsData)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('trackvolt_onboarding_done', '1')
    }
    set({ profile: { ...settingsData, onboardingComplete: true } as UserSettings & { onboardingComplete: boolean }, isLoading: false })
  },

  benchmarkWods: [],
  loadBenchmarkWods: async () => {
    const wods = await db.benchmarkWods.toArray()
    if (wods.length === 0) {
      const { seedBenchmarkWods } = await import('../db/database')
      await seedBenchmarkWods()
      const loaded = await db.benchmarkWods.toArray()
      set({ benchmarkWods: loaded })
    } else {
      set({ benchmarkWods: wods })
    }
  },

  recentFoods: [],
  loadRecentFoods: async () => {
    const meals = await db.mealLogs.orderBy('date').reverse().limit(50).toArray()
    const foodIds = [...new Set(meals.map(m => m.foodId))]
    const foods = await db.foodLibrary.toArray()
    const recent = foodIds.map(id => foods.find(f => f.id === id)).filter(Boolean) as FoodItem[]
    set({ recentFoods: recent })
  },
  saveCustomFood: async (food) => {
    const id = await db.foodLibrary.add({ ...food, isCustom: true } as FoodItem) as number
    get().loadFoods()
    get().loadRecentFoods()
    return id
  },

  saveMovementPR: async (pr) => {
    await db.movementPRs.add({ ...pr, createdAt: new Date().toISOString() } as import('../types').MovementPR)
    get().loadMovementPRs()
  },

  weeklyPlans: [],
  loadWeeklyPlans: async (weekKey) => {
    const plans = await db.weeklyPlans.where('weekKey').equals(weekKey).toArray()
    set({ weeklyPlans: plans })
  },
  saveWeeklyPlan: async (plan) => {
    const withCreated = { ...plan, createdAt: new Date().toISOString() } as import('../types').WeeklyPlan
    await db.weeklyPlans.add(withCreated)
    get().loadWeeklyPlans(plan.weekKey)
  },
  deleteWeeklyPlan: async (id) => {
    await db.weeklyPlans.delete(id)
    set({ weeklyPlans: get().weeklyPlans.filter(p => p.id !== id) })
  },
  toggleWeeklyPlanComplete: async (id) => {
    const p = await db.weeklyPlans.get(id)
    if (p) {
      await db.weeklyPlans.update(id, { completed: !p.completed })
      set({ weeklyPlans: get().weeklyPlans.map(plan => plan.id === id ? { ...plan, completed: !plan.completed } : plan) })
    }
  },

  importData: async (json) => {
    const data = JSON.parse(json)
    if (data.dailyLogs) { await db.dailyLogs.clear(); await db.dailyLogs.bulkAdd(data.dailyLogs) }
    if (data.workouts) { await db.workouts.clear(); await db.workouts.bulkAdd(data.workouts) }
    if (data.mealLogs) { await db.mealLogs.clear(); await db.mealLogs.bulkAdd(data.mealLogs) }
    if (data.foodLibrary) { await db.foodLibrary.clear(); await db.foodLibrary.bulkAdd(data.foodLibrary) }
    if (data.mealTemplates) { await db.mealTemplates.clear(); await db.mealTemplates.bulkAdd(data.mealTemplates) }
    if (data.groceryItems) { await db.groceryItems.clear(); await db.groceryItems.bulkAdd(data.groceryItems) }
    if (data.programDays) { await db.programDays.clear(); await db.programDays.bulkAdd(data.programDays) }
    if (data.settings) { await db.settings.clear(); await db.settings.bulkAdd(data.settings) }
    if (data.movementPRs?.length) { await db.movementPRs.clear(); await db.movementPRs.bulkAdd(data.movementPRs) }
    if (data.benchmarkWods?.length) { await db.benchmarkWods.clear(); await db.benchmarkWods.bulkAdd(data.benchmarkWods) }
    if (data.timerPresets?.length) { await db.timerPresets.clear(); await db.timerPresets.bulkAdd(data.timerPresets) }
    if (data.cycleEntries?.length) { await db.cycleEntries.clear(); await db.cycleEntries.bulkAdd(data.cycleEntries) }
    if (data.bodyMeasurements?.length) { await db.bodyMeasurements.clear(); await db.bodyMeasurements.bulkAdd(data.bodyMeasurements) }
    if (data.heartRateLogs?.length) { await db.heartRateLogs.clear(); await db.heartRateLogs.bulkAdd(data.heartRateLogs) }
    if (data.photoLogs?.length) { await db.photoLogs.clear(); await db.photoLogs.bulkAdd(data.photoLogs) }
    if (data.achievements?.length) { await db.achievements.clear(); await db.achievements.bulkAdd(data.achievements) }
  },
}))
