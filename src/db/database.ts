import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyLog, Workout, FoodItem, MealLog,
  MealTemplate, GroceryItem, ProgramDay, UserSettings,
  MovementPR, BenchmarkWod, TimerPreset, CycleEntry,
  BodyMeasurement, HeartRateLog, PhotoLog, Achievement, NutritionCache, WeeklyPlan
} from '../types'

class CrossTrackDB extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  foodLibrary!: EntityTable<FoodItem, 'id'>
  mealLogs!: EntityTable<MealLog, 'id'>
  mealTemplates!: EntityTable<MealTemplate, 'id'>
  groceryItems!: EntityTable<GroceryItem, 'id'>
  programDays!: EntityTable<ProgramDay, 'id'>
  settings!: EntityTable<UserSettings, 'id'>
  movementPRs!: EntityTable<MovementPR, 'id'>
  benchmarkWods!: EntityTable<BenchmarkWod, 'id'>
  timerPresets!: EntityTable<TimerPreset, 'id'>
  cycleEntries!: EntityTable<CycleEntry, 'id'>
  bodyMeasurements!: EntityTable<BodyMeasurement, 'id'>
  heartRateLogs!: EntityTable<HeartRateLog, 'id'>
  photoLogs!: EntityTable<PhotoLog, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  nutritionCache!: EntityTable<NutritionCache, 'id'>
  weeklyPlans!: EntityTable<WeeklyPlan, 'id'>

  constructor() {
    super('CrossTrackDB')
    this.version(1).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      settings: '++id'
    })
    this.version(6).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      settings: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      cycleEntries: '++id, date',
      bodyMeasurements: '++id, date, metric',
      heartRateLogs: '++id, date',
      photoLogs: '++id, date, workoutId',
      achievements: '++id, type, unlockedAt'
    })
    this.version(7).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      settings: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      cycleEntries: '++id, date',
      bodyMeasurements: '++id, date, metric',
      heartRateLogs: '++id, date',
      photoLogs: '++id, date, workoutId',
      achievements: '++id, type, unlockedAt',
      nutritionCache: '++id, cacheKey, expiresAt',
      weeklyPlans: '++id, weekKey, dayIndex'
    })
  }
}

export const db = new CrossTrackDB()

import { defaultFoodLibrary } from '../data/foodLibrary'
import { benchmarkWodsSeed } from '../data/benchmarkWods'

// Seed initial food library from production data
export async function seedFoodLibrary() {
  const count = await db.foodLibrary.count()
  if (count > 0) return
  await db.foodLibrary.bulkAdd(defaultFoodLibrary)
}

// Seed benchmark WODs catalog from production data
export async function seedBenchmarkWods() {
  const count = await db.benchmarkWods.count()
  if (count > 0) return
  const records: Omit<BenchmarkWod, 'id'>[] = benchmarkWodsSeed
    .filter((w: { category: string }) => w.category !== 'custom')
    .map((w: { name: string; category: string; description: string; wodType: string; scoreUnit: string; rxStandard: string; scaledStandard?: string }) => ({
    name: w.name,
    category: w.category as 'girl' | 'hero' | 'open',
    description: w.description,
    wodType: w.wodType as import('../types').WodType,
    scoreUnit: w.scoreUnit as import('../types').ScoreUnit,
    rxStandard: w.rxStandard,
    scaledStandard: w.scaledStandard,
  }))
  await db.benchmarkWods.bulkAdd(records)
}

// Seed meal templates from existing plan
export async function seedMealTemplates() {
  const count = await db.mealTemplates.count()
  if (count > 0) return

  const foods = await db.foodLibrary.toArray()
  const findFood = (name: string) => foods.find(f => f.name.toLowerCase().includes(name.toLowerCase()))

  const templates: Omit<MealTemplate, 'id'>[] = [
    {
      name: 'My Breakfast', nameZh: '我的早餐',
      mealType: 'breakfast',
      items: [
        { foodId: findFood('yogurt')?.id || 0, foodName: 'Greek Yogurt (plain)', grams: 200 },
        { foodId: findFood('oats')?.id || 0, foodName: 'Rolled Oats (dry)', grams: 80 },
        { foodId: findFood('whey')?.id || 0, foodName: 'Whey Protein (1 scoop)', grams: 60 },
        { foodId: findFood('banana')?.id || 0, foodName: 'Banana', grams: 120 },
      ]
    },
    {
      name: 'Post-WOD Shake', nameZh: '訓練後奶昔',
      mealType: 'post_workout',
      items: [
        { foodId: findFood('whey')?.id || 0, foodName: 'Whey Protein (1 scoop)', grams: 30 },
        { foodId: findFood('rice cake')?.id || 0, foodName: 'Rice Cake', grams: 18 },
        { foodId: findFood('honey')?.id || 0, foodName: 'Honey', grams: 15 },
      ]
    },
    {
      name: 'Chicken + Rice Lunch', nameZh: '雞肉飯午餐',
      mealType: 'lunch',
      items: [
        { foodId: findFood('chicken')?.id || 0, foodName: 'Chicken Breast (cooked)', grams: 200 },
        { foodId: findFood('rice')?.id || 0, foodName: 'Cooked Rice (white)', grams: 150 },
        { foodId: findFood('broccoli')?.id || 0, foodName: 'Broccoli', grams: 150 },
        { foodId: findFood('olive')?.id || 0, foodName: 'Olive Oil', grams: 10 },
      ]
    },
    {
      name: 'Afternoon Snack', nameZh: '下午點心',
      mealType: 'snack',
      items: [
        { foodId: findFood('almonds')?.id || 0, foodName: 'Almonds', grams: 30 },
        { foodId: findFood('apple')?.id || 0, foodName: 'Apple', grams: 180 },
      ]
    },
    {
      name: 'Chicken Dinner', nameZh: '雞肉晚餐',
      mealType: 'dinner',
      items: [
        { foodId: findFood('chicken')?.id || 0, foodName: 'Chicken Breast (cooked)', grams: 200 },
        { foodId: findFood('sweet potato')?.id || 0, foodName: 'Sweet Potato (cooked)', grams: 200 },
        { foodId: findFood('mixed')?.id || 0, foodName: 'Mixed Vegetables', grams: 150 },
      ]
    },
    {
      name: 'Beef Dinner', nameZh: '牛肉晚餐',
      mealType: 'dinner',
      items: [
        { foodId: findFood('beef')?.id || 0, foodName: 'Lean Beef (cooked)', grams: 200 },
        { foodId: findFood('rice')?.id || 0, foodName: 'Cooked Rice (white)', grams: 150 },
        { foodId: findFood('spinach')?.id || 0, foodName: 'Spinach', grams: 100 },
      ]
    },
  ]

  await db.mealTemplates.bulkAdd(templates)
}

// Seed training program from ICS
export async function seedProgram() {
  const count = await db.programDays.count()
  if (count > 0) return

  const program: Omit<ProgramDay, 'id'>[] = []
  const phases: Array<{ phase: 'Base' | 'Load' | 'Intensity' | 'Deload', week: number }> = [
    { phase: 'Base', week: 1 }, { phase: 'Load', week: 2 },
    { phase: 'Intensity', week: 3 }, { phase: 'Deload', week: 4 }
  ]

  for (const { phase, week } of phases) {
    program.push(
      { weekNumber: week, phase, dayOfWeek: 1, dayName: 'Monday', focus: 'Strength + Metcon', strength: 'Back Squat 5x5', metcon: '12min AMRAP: Wall Balls, Box Jumps, KB Swings', scalingOptions: 'Light KB, Step-ups, Lower wall ball target' },
      { weekNumber: week, phase, dayOfWeek: 2, dayName: 'Tuesday', focus: 'Gymnastics + HIIT', strength: 'Pull-ups + HSPU Practice', metcon: '4 Rounds: 400m Run, 15 T2B, 15 Push-ups', scalingOptions: 'Ring rows, Knee raises, Knee push-ups' },
      { weekNumber: week, phase, dayOfWeek: 3, dayName: 'Wednesday', focus: 'Olympic Lifting + WOD', strength: 'Clean & Jerk 5x3', metcon: '21-15-9 Thrusters + Burpees', scalingOptions: 'DB thrusters, Burpee step-outs' },
      { weekNumber: week, phase, dayOfWeek: 4, dayName: 'Thursday', focus: 'Engine Builder', strength: '—', metcon: '30min: 500m Row, 400m Run, 30 DU, 15 Cal Bike (repeat)', scalingOptions: 'Singles instead of DU, lower cals' },
      { weekNumber: week, phase, dayOfWeek: 5, dayName: 'Friday', focus: 'Heavy Day + Hero WOD', strength: 'Deadlift 5x3', metcon: 'Murph Variant: 800m Run, 50 Pull-ups, 100 Push-ups, 150 Squats, 800m Run', scalingOptions: 'Half volume, band pull-ups, knee push-ups' },
      { weekNumber: week, phase, dayOfWeek: 6, dayName: 'Saturday', focus: 'Partner/Team WOD', strength: '—', metcon: 'Team chipper: 100 Cal Row, 80 Wall Balls, 60 Burpees, 40 C2B, 20 Squat Cleans', scalingOptions: 'Split work evenly, scale movements' },
      { weekNumber: week, phase, dayOfWeek: 0, dayName: 'Sunday', focus: 'REST + Meal Prep', strength: 'Yoga/Mobility', metcon: 'Light walk or swim', scalingOptions: '' },
    )
  }

  await db.programDays.bulkAdd(program)
}

// Seed grocery list
export async function seedGroceryList() {
  const count = await db.groceryItems.count()
  if (count > 0) return

  const items: Omit<GroceryItem, 'id'>[] = [
    { name: 'Chicken breast', nameZh: '雞胸肉', category: 'Protein', quantity: '2.5', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Lean beef', nameZh: '瘦牛肉', category: 'Protein', quantity: '1', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Greek yogurt', nameZh: '希臘優格', category: 'Protein', quantity: '1.4', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Whey protein', nameZh: '乳清蛋白', category: 'Protein', quantity: '', unit: 'check', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Eggs', nameZh: '雞蛋', category: 'Protein', quantity: '12', unit: 'pack', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Rolled oats', nameZh: '燕麥片', category: 'Carbs', quantity: '560', unit: 'g', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Rice', nameZh: '白米', category: 'Carbs', quantity: '1', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Sweet potatoes', nameZh: '地瓜', category: 'Carbs', quantity: '1.5', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Bananas', nameZh: '香蕉', category: 'Carbs', quantity: '7', unit: 'pcs', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Apples', nameZh: '蘋果', category: 'Carbs', quantity: '7', unit: 'pcs', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Rice cakes', nameZh: '米餅', category: 'Carbs', quantity: '1', unit: 'pack', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Honey', nameZh: '蜂蜜', category: 'Carbs', quantity: '', unit: 'check', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Broccoli', nameZh: '花椰菜', category: 'Vegetables', quantity: '1', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Spinach', nameZh: '菠菜', category: 'Vegetables', quantity: '500', unit: 'g', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Mixed vegetables', nameZh: '綜合蔬菜', category: 'Vegetables', quantity: '1', unit: 'kg', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Olive oil', nameZh: '橄欖油', category: 'Fats', quantity: '', unit: 'check', isRecurring: true, isChecked: false, weekStartDate: '' },
    { name: 'Almonds', nameZh: '杏仁', category: 'Fats', quantity: '200', unit: 'g', isRecurring: true, isChecked: false, weekStartDate: '' },
  ]

  await db.groceryItems.bulkAdd(items)
}

// Seed default settings
export async function seedSettings() {
  const count = await db.settings.count()
  if (count > 0) return

  await db.settings.add({
    displayName: 'Aron',
    weightKg: 72,
    goal: 'Recomp (Fat Loss + Muscle + Performance)',
    trainingTime: '06:00',
    language: 'en',
    units: 'metric',
    proteinTarget: 180,
    carbsTarget: 216,
    fatTarget: 58,
    calorieTarget: 2100,
    waterTarget: 3000,
  })
}

// Initialize all seeds
export async function initializeDB() {
  await seedFoodLibrary()
  await seedBenchmarkWods()
  await seedMealTemplates()
  await seedProgram()
  await seedGroceryList()
  await seedSettings()
}
