import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyLog, Workout, FoodItem, MealLog, MealTemplate,
  GroceryItem, ProgramDay, UserProfile, MovementPR,
  BenchmarkWod, TimerPreset, WeeklyPlan,
  CycleSettings, CycleLog, NutritionCache
} from '../types'
import type { EventLog } from '../types/eventTypes'

class TrackVoltDB extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  foodLibrary!: EntityTable<FoodItem, 'id'>
  mealLogs!: EntityTable<MealLog, 'id'>
  mealTemplates!: EntityTable<MealTemplate, 'id'>
  groceryItems!: EntityTable<GroceryItem, 'id'>
  programDays!: EntityTable<ProgramDay, 'id'>
  profile!: EntityTable<UserProfile, 'id'>
  movementPRs!: EntityTable<MovementPR, 'id'>
  benchmarkWods!: EntityTable<BenchmarkWod, 'id'>
  timerPresets!: EntityTable<TimerPreset, 'id'>
  weeklyPlans!: EntityTable<WeeklyPlan, 'id'>
  cycleSettings!: EntityTable<CycleSettings, 'id'>
  cycleLogs!: EntityTable<CycleLog, 'id'>
  eventLogs!: EntityTable<EventLog, 'id'>
  nutritionCache!: EntityTable<NutritionCache, 'id'>

  constructor() {
    super('CrossTrackDB')
    this.version(2).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      profile: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
    })
    // v3: Add weeklyPlans table
    this.version(3).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      profile: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      weeklyPlans: '++id, weekKey, dayIndex',
    })
    // v4: Add cycle tracking tables (women's health)
    this.version(4).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      profile: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      weeklyPlans: '++id, weekKey, dayIndex',
      cycleSettings: '++id',
      cycleLogs: '++id, date, phase, periodActive',
    })
    // v5: Add CrossFit Events table
    this.version(5).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      profile: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      weeklyPlans: '++id, weekKey, dayIndex',
      cycleSettings: '++id',
      cycleLogs: '++id, date, phase, periodActive',
      eventLogs: '++id, date, eventCategory, eventYear, eventTitle',
    })
    // v6: Add nutrition API cache table
    this.version(6).stores({
      dailyLogs: '++id, date',
      workouts: '++id, date, workoutType, name, isBenchmark, prFlag',
      foodLibrary: '++id, name, category, isCustom',
      mealLogs: '++id, date, mealType, foodId',
      mealTemplates: '++id, name, mealType',
      groceryItems: '++id, category, weekStartDate, isChecked',
      programDays: '++id, weekNumber, dayOfWeek',
      profile: '++id',
      movementPRs: '++id, movementName, category, date',
      benchmarkWods: '++id, name, category',
      timerPresets: '++id, name, mode',
      weeklyPlans: '++id, weekKey, dayIndex',
      cycleSettings: '++id',
      cycleLogs: '++id, date, phase, periodActive',
      eventLogs: '++id, date, eventCategory, eventYear, eventTitle',
      nutritionCache: '++id, &cacheKey, expiresAt',
    })
  }
}

export const db = new TrackVoltDB()

// Clean up expired nutrition cache entries on app start
db.on('ready', async () => {
  try {
    const now = Date.now()
    await db.nutritionCache.where('expiresAt').below(now).delete()
  } catch {
    // Ignore cleanup errors  -  non-critical
  }
})

// ===== SEED: Food Library (200+ foods) =====
// Bump this version whenever the seed list is updated.
// On app start, if localStorage version differs, non-custom foods are
// cleared and re-seeded so every user gets the latest library.
const FOOD_SEED_VERSION = 2 // v1 = original ~32, v2 = expanded 211

export async function seedFoodLibrary() {
  const currentVersion = Number(localStorage.getItem('tv_food_seed_v') || '0')
  const count = await db.foodLibrary.count()

  if (count > 0 && currentVersion >= FOOD_SEED_VERSION) return

  // Preserve any custom foods the user created
  const customFoods = count > 0
    ? await db.foodLibrary.filter(f => f.isCustom === true).toArray()
    : []

  // Clear stale seed data (keeps schema, removes rows)
  await db.foodLibrary.clear()

  // Re-add custom foods first
  if (customFoods.length > 0) {
    await db.foodLibrary.bulkAdd(customFoods)
  }
  const foods: Omit<FoodItem, 'id'>[] = [
    // ===== EXISTING PROTEINS (Keep exactly as-is) =====
    { name: 'Chicken Breast (cooked)', nameZh: '雞胸肉（熟）', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Lean Beef (cooked)', nameZh: '瘦牛肉（熟）', category: 'Protein', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Salmon (cooked)', nameZh: '鮭魚（熟）', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Eggs (whole)', nameZh: '雞蛋', category: 'Protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, defaultServingG: 50, isCustom: false },
    { name: 'Egg Whites', nameZh: '蛋白', category: 'Protein', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Whey Protein (scoop)', nameZh: '乳清蛋白', category: 'Protein', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 4, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Greek Yogurt', nameZh: '希臘優格', category: 'Protein', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.7, fiberPer100g: 0, defaultServingG: 200, isCustom: false },
    { name: 'Cottage Cheese', nameZh: '茅屋起司', category: 'Protein', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Turkey Breast', nameZh: '火雞胸肉', category: 'Protein', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Tuna (canned)', nameZh: '鮪魚罐頭', category: 'Protein', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Tofu (firm)', nameZh: '板豆腐', category: 'Protein', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, fiberPer100g: 0.3, defaultServingG: 150, isCustom: false },
    // ===== EXISTING CARBS =====
    { name: 'Rolled Oats (dry)', nameZh: '燕麥片', category: 'Carbs', caloriesPer100g: 379, proteinPer100g: 13.2, carbsPer100g: 67.7, fatPer100g: 6.5, fiberPer100g: 10.1, defaultServingG: 50, isCustom: false },
    { name: 'White Rice (cooked)', nameZh: '白飯', category: 'Carbs', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, defaultServingG: 150, isCustom: false },
    { name: 'Brown Rice (cooked)', nameZh: '糙米飯', category: 'Carbs', caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1, fiberPer100g: 1.8, defaultServingG: 150, isCustom: false },
    { name: 'Sweet Potato', nameZh: '地瓜', category: 'Carbs', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 20.7, fatPer100g: 0.1, fiberPer100g: 3.3, defaultServingG: 200, isCustom: false },
    { name: 'Banana', nameZh: '香蕉', category: 'Carbs', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, fiberPer100g: 2.6, defaultServingG: 120, isCustom: false },
    { name: 'Apple', nameZh: '蘋果', category: 'Carbs', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, fiberPer100g: 2.4, defaultServingG: 180, isCustom: false },
    { name: 'Whole Wheat Bread', nameZh: '全麥麵包', category: 'Carbs', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, fiberPer100g: 6, defaultServingG: 30, isCustom: false },
    { name: 'Pasta (cooked)', nameZh: '義大利麵', category: 'Carbs', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, defaultServingG: 200, isCustom: false },
    { name: 'Quinoa (cooked)', nameZh: '藜麥', category: 'Carbs', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9, fiberPer100g: 2.8, defaultServingG: 150, isCustom: false },
    { name: 'Honey', nameZh: '蜂蜜', category: 'Carbs', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82.4, fatPer100g: 0, fiberPer100g: 0.2, defaultServingG: 15, isCustom: false },
    // ===== EXISTING VEGETABLES =====
    { name: 'Broccoli', nameZh: '花椰菜', category: 'Vegetables', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, defaultServingG: 150, isCustom: false },
    { name: 'Spinach', nameZh: '菠菜', category: 'Vegetables', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, defaultServingG: 100, isCustom: false },
    { name: 'Mixed Vegetables', nameZh: '綜合蔬菜', category: 'Vegetables', caloriesPer100g: 65, proteinPer100g: 2.6, carbsPer100g: 13, fatPer100g: 0.3, fiberPer100g: 4.1, defaultServingG: 150, isCustom: false },
    // ===== EXISTING FATS =====
    { name: 'Olive Oil', nameZh: '橄欖油', category: 'Fats', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Almonds', nameZh: '杏仁', category: 'Fats', caloriesPer100g: 579, proteinPer100g: 21.2, carbsPer100g: 21.7, fatPer100g: 49.9, fiberPer100g: 12.2, defaultServingG: 30, isCustom: false },
    { name: 'Avocado', nameZh: '酪梨', category: 'Fats', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, fiberPer100g: 6.7, defaultServingG: 80, isCustom: false },
    { name: 'Peanut Butter', nameZh: '花生醬', category: 'Fats', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, defaultServingG: 20, isCustom: false },
    // ===== EXISTING DAIRY =====
    { name: 'Whole Milk', nameZh: '全脂牛奶', category: 'Dairy', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0, defaultServingG: 250, isCustom: false },
    { name: 'Skim Milk', nameZh: '脫脂牛奶', category: 'Dairy', caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, fiberPer100g: 0, defaultServingG: 250, isCustom: false },

    // ===== NEW PROTEINS =====
    { name: 'Shrimp (cooked)', nameZh: '蝦（熟）', category: 'Protein', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 0.3, fiberPer100g: 0, defaultServingG: 120, isCustom: false },
    { name: 'Pork Tenderloin (cooked)', nameZh: '豬裡脊（熟）', category: 'Protein', caloriesPer100g: 183, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 8, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Lamb (cooked)', nameZh: '羊肉（熟）', category: 'Protein', caloriesPer100g: 294, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 21, fiberPer100g: 0, defaultServingG: 120, isCustom: false },
    { name: 'Sardines (canned)', nameZh: '沙丁魚罐頭', category: 'Protein', caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Tempeh', nameZh: '天貝', category: 'Protein', caloriesPer100g: 195, proteinPer100g: 19, carbsPer100g: 7.6, fatPer100g: 11, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Edamame (cooked)', nameZh: '毛豆（熟）', category: 'Protein', caloriesPer100g: 111, proteinPer100g: 11.8, carbsPer100g: 10, fatPer100g: 5, fiberPer100g: 4.2, defaultServingG: 100, isCustom: false },
    { name: 'Protein Bar', nameZh: '蛋白質棒', category: 'Protein', caloriesPer100g: 380, proteinPer100g: 25, carbsPer100g: 35, fatPer100g: 12, fiberPer100g: 5, defaultServingG: 50, isCustom: false },
    { name: 'Casein Protein', nameZh: '酪蛋白', category: 'Protein', caloriesPer100g: 380, proteinPer100g: 75, carbsPer100g: 12, fatPer100g: 3, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Beef Jerky', nameZh: '牛肉乾', category: 'Protein', caloriesPer100g: 205, proteinPer100g: 33, carbsPer100g: 7, fatPer100g: 5, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Bison (cooked)', nameZh: '野牛（熟）', category: 'Protein', caloriesPer100g: 143, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 2.4, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Duck Breast (cooked)', nameZh: '鴨胸（熟）', category: 'Protein', caloriesPer100g: 337, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 29, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Venison (cooked)', nameZh: '鹿肉（熟）', category: 'Protein', caloriesPer100g: 158, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
  ]
  await db.foodLibrary.bulkAdd(foods)

  // Stamp version so we don't re-seed unnecessarily
  localStorage.setItem('tv_food_seed_v', String(FOOD_SEED_VERSION))
}

// ===== SEED: Benchmark WODs =====
export async function seedBenchmarkWods() {
  const count = await db.benchmarkWods.count()
  if (count > 0) return
  const wods: Omit<BenchmarkWod, 'id'>[] = [
    { name: 'Fran', category: 'girl', description: '21-15-9: Thrusters & Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '95/65 lb thrusters, pull-ups', scaledStandard: '65/45 lb, banded pull-ups' },
    { name: 'Grace', category: 'girl', description: '30 Clean & Jerks for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '135/95 lb', scaledStandard: '95/65 lb' },
    { name: 'Helen', category: 'girl', description: '3 RFT: 400m Run, 21 KB Swings, 12 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '53/35 lb KB', scaledStandard: '35/26 lb KB, banded PU' },
    { name: 'Diane', category: 'girl', description: '21-15-9: Deadlifts & HSPU', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '225/155 lb DL, strict HSPU', scaledStandard: '155/105 lb, pike PU' },
    { name: 'Elizabeth', category: 'girl', description: '21-15-9: Cleans & Ring Dips', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '135/95 lb cleans', scaledStandard: '95/65 lb, banded dips' },
    { name: 'Isabel', category: 'girl', description: '30 Snatches for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '135/95 lb', scaledStandard: '95/65 lb' },
    { name: 'Jackie', category: 'girl', description: '1000m Row, 50 Thrusters, 30 Pull-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '45/35 lb', scaledStandard: '35/25 lb, banded PU' },
    { name: 'Karen', category: 'girl', description: '150 Wall Balls for time', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '20/14 lb to 10/9 ft', scaledStandard: '14/10 lb to 9 ft' },
    { name: 'Cindy', category: 'girl', description: '20min AMRAP: 5 Pull-ups, 10 Push-ups, 15 Squats', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'Pull-ups, push-ups, air squats', scaledStandard: 'Ring rows, knee PU' },
    { name: 'Annie', category: 'girl', description: '50-40-30-20-10: DU & Sit-ups', wodType: 'ForTime', scoreUnit: 'time', rxStandard: 'Double unders', scaledStandard: 'Singles (2:1)' },
    { name: 'Mary', category: 'girl', description: '20min AMRAP: 5 HSPU, 10 Pistols, 15 Pull-ups', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'HSPU, pistols, pull-ups', scaledStandard: 'Pike PU, assisted pistols' },
    { name: 'Nancy', category: 'girl', description: '5 RFT: 400m Run, 15 OHS', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '95/65 lb', scaledStandard: '65/45 lb' },
    { name: 'Murph', category: 'hero', description: '1 mi Run, 100 PU, 200 Push-ups, 300 Squats, 1 mi Run', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '20/14 lb vest', scaledStandard: 'No vest, partition OK' },
    { name: 'DT', category: 'hero', description: '5 RFT: 12 DL, 9 Hang Cleans, 6 Push Jerks', wodType: 'ForTime', scoreUnit: 'time', rxStandard: '155/105 lb', scaledStandard: '115/75 lb' },
    { name: 'Nate', category: 'hero', description: '20min AMRAP: 2 MU, 4 HSPU, 8 KB Swings', wodType: 'AMRAP', scoreUnit: 'rounds', rxStandard: 'Ring MU, HSPU, 70/53 KB', scaledStandard: 'PU+dips, pike PU, 53/35' },
    { name: 'Fight Gone Bad', category: 'girl', description: '3 rds: WB, SDHP, Box Jump, Push Press, Row (1 min each, 1 min rest)', wodType: 'Other', scoreUnit: 'reps', rxStandard: '20/14 WB, 75/55, 20" box', scaledStandard: 'Lighter loads' },
  ]
  await db.benchmarkWods.bulkAdd(wods)
}

// ===== SEED: Timer Presets =====
export async function seedTimerPresets() {
  const count = await db.timerPresets.count()
  if (count > 0) return
  const presets: Omit<TimerPreset, 'id'>[] = [
    { name: 'AMRAP 12', mode: 'amrap', totalSeconds: 720 },
    { name: 'AMRAP 15', mode: 'amrap', totalSeconds: 900 },
    { name: 'AMRAP 20', mode: 'amrap', totalSeconds: 1200 },
    { name: 'EMOM 10', mode: 'emom', totalSeconds: 600, rounds: 10, workSeconds: 60 },
    { name: 'EMOM 12', mode: 'emom', totalSeconds: 720, rounds: 12, workSeconds: 60 },
    { name: 'EMOM 20', mode: 'emom', totalSeconds: 1200, rounds: 20, workSeconds: 60 },
    { name: 'E2MOM 10', mode: 'emom', totalSeconds: 1200, rounds: 10, workSeconds: 120 },
    { name: 'Tabata (8 rds)', mode: 'tabata', totalSeconds: 240, rounds: 8, workSeconds: 20, restSeconds: 10 },
    { name: 'For Time (20 cap)', mode: 'fortime', totalSeconds: 1200 },
    { name: 'For Time (30 cap)', mode: 'fortime', totalSeconds: 1800 },
    { name: 'Rest 60s', mode: 'rest', totalSeconds: 60 },
    { name: 'Rest 90s', mode: 'rest', totalSeconds: 90 },
    { name: 'Rest 2 min', mode: 'rest', totalSeconds: 120 },
    { name: 'Rest 3 min', mode: 'rest', totalSeconds: 180 },
  ]
  await db.timerPresets.bulkAdd(presets)
}

// Initialize seeds only (profile created in onboarding)
export async function initializeDB() {
  await seedFoodLibrary()
  await seedBenchmarkWods()
  await seedTimerPresets()
}
