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
    // Ignore cleanup errors — non-critical
  }
})

// ===== SEED: Food Library (200+ foods) =====
export async function seedFoodLibrary() {
  const count = await db.foodLibrary.count()
  if (count > 0) return
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

    // ===== NEW CARBS =====
    { name: 'White Potato (cooked)', nameZh: '馬鈴薯（熟）', category: 'Carbs', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17.5, fatPer100g: 0.1, fiberPer100g: 2.1, defaultServingG: 200, isCustom: false },
    { name: 'Corn', nameZh: '玉米', category: 'Carbs', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.2, fiberPer100g: 2.3, defaultServingG: 100, isCustom: false },
    { name: 'Bagel', nameZh: '貝果', category: 'Carbs', caloriesPer100g: 245, proteinPer100g: 9, carbsPer100g: 48, fatPer100g: 1.5, fiberPer100g: 2.5, defaultServingG: 85, isCustom: false },
    { name: 'Rice Cakes', nameZh: '米餅', category: 'Carbs', caloriesPer100g: 385, proteinPer100g: 6, carbsPer100g: 86, fatPer100g: 1.5, fiberPer100g: 1.5, defaultServingG: 30, isCustom: false },
    { name: 'Cream of Rice (dry)', nameZh: '米奶粉', category: 'Carbs', caloriesPer100g: 379, proteinPer100g: 6, carbsPer100g: 84, fatPer100g: 0.8, fiberPer100g: 0.5, defaultServingG: 40, isCustom: false },
    { name: 'Granola', nameZh: '格蘭諾拉麥片', category: 'Carbs', caloriesPer100g: 471, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 21, fiberPer100g: 6, defaultServingG: 50, isCustom: false },
    { name: 'Muesli', nameZh: '穀麥片', category: 'Carbs', caloriesPer100g: 363, proteinPer100g: 12, carbsPer100g: 66, fatPer100g: 6, fiberPer100g: 8, defaultServingG: 60, isCustom: false },
    { name: 'Tortilla (corn)', nameZh: '玉米薄餅', category: 'Carbs', caloriesPer100g: 175, proteinPer100g: 4.6, carbsPer100g: 37, fatPer100g: 1, fiberPer100g: 3.6, defaultServingG: 50, isCustom: false },
    { name: 'Naan Bread', nameZh: '烤餅', category: 'Carbs', caloriesPer100g: 262, proteinPer100g: 8, carbsPer100g: 47, fatPer100g: 5, fiberPer100g: 2, defaultServingG: 70, isCustom: false },
    { name: 'Udon Noodles (cooked)', nameZh: '烏冬麵（熟）', category: 'Carbs', caloriesPer100g: 117, proteinPer100g: 4, carbsPer100g: 24, fatPer100g: 0.5, fiberPer100g: 1.2, defaultServingG: 200, isCustom: false },
    { name: 'Ramen Noodles (cooked)', nameZh: '拉麵（熟）', category: 'Carbs', caloriesPer100g: 125, proteinPer100g: 4.3, carbsPer100g: 24, fatPer100g: 1.2, fiberPer100g: 1, defaultServingG: 200, isCustom: false },
    { name: 'Couscous (cooked)', nameZh: '庫斯庫斯', category: 'Carbs', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23.2, fatPer100g: 0.1, fiberPer100g: 1.5, defaultServingG: 150, isCustom: false },
    { name: 'Beet', nameZh: '甜菜', category: 'Carbs', caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.4, defaultServingG: 100, isCustom: false },
    { name: 'Pumpkin', nameZh: '南瓜', category: 'Carbs', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1, fiberPer100g: 0.5, defaultServingG: 150, isCustom: false },
    { name: 'Plantain (cooked)', nameZh: '大蕉（熟）', category: 'Carbs', caloriesPer100g: 122, proteinPer100g: 1.3, carbsPer100g: 29, fatPer100g: 0.4, fiberPer100g: 1.7, defaultServingG: 150, isCustom: false },

    // ===== NEW VEGETABLES =====
    { name: 'Kale', nameZh: '羽衣甘藍', category: 'Vegetables', caloriesPer100g: 49, proteinPer100g: 4.3, carbsPer100g: 9, fatPer100g: 0.9, fiberPer100g: 1.3, defaultServingG: 100, isCustom: false },
    { name: 'Asparagus', nameZh: '蘆筍', category: 'Vegetables', caloriesPer100g: 20, proteinPer100g: 2.2, carbsPer100g: 3.7, fatPer100g: 0.1, fiberPer100g: 2.1, defaultServingG: 150, isCustom: false },
    { name: 'Bell Pepper', nameZh: '甜椒', category: 'Vegetables', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, fiberPer100g: 2.2, defaultServingG: 150, isCustom: false },
    { name: 'Zucchini', nameZh: '小麥瓜', category: 'Vegetables', caloriesPer100g: 21, proteinPer100g: 1.4, carbsPer100g: 3.7, fatPer100g: 0.4, fiberPer100g: 1, defaultServingG: 150, isCustom: false },
    { name: 'Cauliflower', nameZh: '菜花', category: 'Vegetables', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3, fiberPer100g: 2.4, defaultServingG: 150, isCustom: false },
    { name: 'Green Beans', nameZh: '四季豆', category: 'Vegetables', caloriesPer100g: 31, proteinPer100g: 2.1, carbsPer100g: 7, fatPer100g: 0.1, fiberPer100g: 2.7, defaultServingG: 150, isCustom: false },
    { name: 'Cabbage', nameZh: '高麗菜', category: 'Vegetables', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 5.8, fatPer100g: 0.1, fiberPer100g: 2.4, defaultServingG: 150, isCustom: false },
    { name: 'Mushroom', nameZh: '蘑菇', category: 'Vegetables', caloriesPer100g: 22, proteinPer100g: 3.3, carbsPer100g: 3.3, fatPer100g: 0.3, fiberPer100g: 1, defaultServingG: 100, isCustom: false },
    { name: 'Tomato', nameZh: '番茄', category: 'Vegetables', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, defaultServingG: 150, isCustom: false },
    { name: 'Cucumber', nameZh: '黃瓜', category: 'Vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, fiberPer100g: 0.5, defaultServingG: 200, isCustom: false },
    { name: 'Carrot', nameZh: '胡蘿蔔', category: 'Vegetables', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.8, defaultServingG: 100, isCustom: false },
    { name: 'Lettuce', nameZh: '生菜', category: 'Vegetables', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, fiberPer100g: 1.3, defaultServingG: 100, isCustom: false },
    { name: 'Celery', nameZh: '芹菜', category: 'Vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.7, fatPer100g: 0.2, fiberPer100g: 1.6, defaultServingG: 100, isCustom: false },
    { name: 'Bok Choy', nameZh: '小白菜', category: 'Vegetables', caloriesPer100g: 13, proteinPer100g: 1.5, carbsPer100g: 2.2, fatPer100g: 0.2, fiberPer100g: 1.2, defaultServingG: 150, isCustom: false },
    { name: 'Eggplant', nameZh: '茄子', category: 'Vegetables', caloriesPer100g: 25, proteinPer100g: 0.98, carbsPer100g: 5.9, fatPer100g: 0.2, fiberPer100g: 3, defaultServingG: 150, isCustom: false },
    { name: 'Sweet Corn', nameZh: '玉米粒', category: 'Vegetables', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.2, fiberPer100g: 2.3, defaultServingG: 100, isCustom: false },
    { name: 'Onion', nameZh: '洋蔥', category: 'Vegetables', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1, fiberPer100g: 1.7, defaultServingG: 80, isCustom: false },
    { name: 'Garlic', nameZh: '大蒜', category: 'Vegetables', caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5, fiberPer100g: 2.1, defaultServingG: 5, isCustom: false },

    // ===== NEW FRUITS =====
    { name: 'Blueberry', nameZh: '藍莓', category: 'Fruits', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, fiberPer100g: 2.4, defaultServingG: 100, isCustom: false },
    { name: 'Strawberry', nameZh: '草莓', category: 'Fruits', caloriesPer100g: 32, proteinPer100g: 0.8, carbsPer100g: 7.7, fatPer100g: 0.3, fiberPer100g: 2, defaultServingG: 150, isCustom: false },
    { name: 'Mango', nameZh: '芒果', category: 'Fruits', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, fiberPer100g: 1.6, defaultServingG: 150, isCustom: false },
    { name: 'Orange', nameZh: '橙', category: 'Fruits', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 11.8, fatPer100g: 0.1, fiberPer100g: 2.2, defaultServingG: 150, isCustom: false },
    { name: 'Watermelon', nameZh: '西瓜', category: 'Fruits', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, fiberPer100g: 0.4, defaultServingG: 250, isCustom: false },
    { name: 'Grapes', nameZh: '葡萄', category: 'Fruits', caloriesPer100g: 67, proteinPer100g: 0.7, carbsPer100g: 17, fatPer100g: 0.4, fiberPer100g: 0.9, defaultServingG: 100, isCustom: false },
    { name: 'Pineapple', nameZh: '鳳梨', category: 'Fruits', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13.1, fatPer100g: 0.1, fiberPer100g: 1.4, defaultServingG: 150, isCustom: false },
    { name: 'Kiwi', nameZh: '奇異果', category: 'Fruits', caloriesPer100g: 61, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.5, fiberPer100g: 3, defaultServingG: 100, isCustom: false },
    { name: 'Pear', nameZh: '梨', category: 'Fruits', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15.2, fatPer100g: 0.1, fiberPer100g: 2.8, defaultServingG: 150, isCustom: false },
    { name: 'Peach', nameZh: '桃子', category: 'Fruits', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 9.5, fatPer100g: 0.3, fiberPer100g: 1.5, defaultServingG: 150, isCustom: false },
    { name: 'Dried Cranberries', nameZh: '乾蔓越莓', category: 'Fruits', caloriesPer100g: 307, proteinPer100g: 0.4, carbsPer100g: 82, fatPer100g: 0.4, fiberPer100g: 5.2, defaultServingG: 30, isCustom: false },
    { name: 'Dates', nameZh: '棗', category: 'Fruits', caloriesPer100g: 282, proteinPer100g: 2.5, carbsPer100g: 75, fatPer100g: 0.2, fiberPer100g: 6.7, defaultServingG: 40, isCustom: false },
    { name: 'Raisins', nameZh: '葡萄乾', category: 'Fruits', caloriesPer100g: 299, proteinPer100g: 3.1, carbsPer100g: 79, fatPer100g: 0.5, fiberPer100g: 3.7, defaultServingG: 40, isCustom: false },
    { name: 'Grapefruit', nameZh: '葡萄柚', category: 'Fruits', caloriesPer100g: 42, proteinPer100g: 0.8, carbsPer100g: 10.7, fatPer100g: 0.1, fiberPer100g: 1.6, defaultServingG: 200, isCustom: false },
    { name: 'Papaya', nameZh: '木瓜', category: 'Fruits', caloriesPer100g: 43, proteinPer100g: 0.6, carbsPer100g: 10.8, fatPer100g: 0.3, fiberPer100g: 1.7, defaultServingG: 150, isCustom: false },
    { name: 'Dragon Fruit', nameZh: '火龍果', category: 'Fruits', caloriesPer100g: 50, proteinPer100g: 0.9, carbsPer100g: 11.5, fatPer100g: 0.4, fiberPer100g: 1.5, defaultServingG: 150, isCustom: false },
    { name: 'Lychee', nameZh: '荔枝', category: 'Fruits', caloriesPer100g: 66, proteinPer100g: 0.8, carbsPer100g: 16.5, fatPer100g: 0.3, fiberPer100g: 1.3, defaultServingG: 100, isCustom: false },
    { name: 'Guava', nameZh: '番石榴', category: 'Fruits', caloriesPer100g: 68, proteinPer100g: 2.6, carbsPer100g: 14, fatPer100g: 0.9, fiberPer100g: 5.4, defaultServingG: 100, isCustom: false },

    // ===== NEW FATS =====
    { name: 'Coconut Oil', nameZh: '椰子油', category: 'Fats', caloriesPer100g: 892, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 99.1, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'MCT Oil', nameZh: 'MCT油', category: 'Fats', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Chia Seeds', nameZh: '奇亞籽', category: 'Fats', caloriesPer100g: 486, proteinPer100g: 16.5, carbsPer100g: 42.1, fatPer100g: 30.7, fiberPer100g: 27.6, defaultServingG: 20, isCustom: false },
    { name: 'Flaxseeds', nameZh: '亞麻籽', category: 'Fats', caloriesPer100g: 534, proteinPer100g: 18.3, carbsPer100g: 28.9, fatPer100g: 42.2, fiberPer100g: 27.3, defaultServingG: 15, isCustom: false },
    { name: 'Walnuts', nameZh: '核桃', category: 'Fats', caloriesPer100g: 654, proteinPer100g: 9.1, carbsPer100g: 13.7, fatPer100g: 65.2, fiberPer100g: 6.7, defaultServingG: 30, isCustom: false },
    { name: 'Cashews', nameZh: '腰果', category: 'Fats', caloriesPer100g: 553, proteinPer100g: 18.2, carbsPer100g: 30, fatPer100g: 43.4, fiberPer100g: 3.3, defaultServingG: 30, isCustom: false },
    { name: 'Macadamia Nuts', nameZh: '澳洲堅果', category: 'Fats', caloriesPer100g: 718, proteinPer100g: 7.9, carbsPer100g: 13.8, fatPer100g: 75.8, fiberPer100g: 8.6, defaultServingG: 25, isCustom: false },
    { name: 'Pecans', nameZh: '核桃（美式）', category: 'Fats', caloriesPer100g: 691, proteinPer100g: 9.2, carbsPer100g: 13.9, fatPer100g: 71.9, fiberPer100g: 8.7, defaultServingG: 28, isCustom: false },
    { name: 'Sunflower Seeds', nameZh: '向日葵籽', category: 'Fats', caloriesPer100g: 584, proteinPer100g: 20.8, carbsPer100g: 20, fatPer100g: 51.5, fiberPer100g: 8.7, defaultServingG: 30, isCustom: false },
    { name: 'Tahini', nameZh: '芝麻醬', category: 'Fats', caloriesPer100g: 595, proteinPer100g: 17, carbsPer100g: 21, fatPer100g: 54, fiberPer100g: 9.7, defaultServingG: 15, isCustom: false },
    { name: 'Dark Chocolate 85%', nameZh: '黑巧克力85%', category: 'Fats', caloriesPer100g: 598, proteinPer100g: 12, carbsPer100g: 33, fatPer100g: 49, fiberPer100g: 7, defaultServingG: 20, isCustom: false },
    { name: 'Coconut Flakes', nameZh: '椰子片', category: 'Fats', caloriesPer100g: 660, proteinPer100g: 7, carbsPer100g: 24, fatPer100g: 64, fiberPer100g: 9, defaultServingG: 25, isCustom: false },
    { name: 'Hemp Seeds', nameZh: '大麻籽', category: 'Fats', caloriesPer100g: 553, proteinPer100g: 9.2, carbsPer100g: 27.6, fatPer100g: 48.3, fiberPer100g: 1.2, defaultServingG: 20, isCustom: false },

    // ===== NEW DAIRY =====
    { name: 'Cheddar Cheese', nameZh: '切達起司', category: 'Dairy', caloriesPer100g: 402, proteinPer100g: 23, carbsPer100g: 1.3, fatPer100g: 33, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Mozzarella', nameZh: '莫札瑞拉起司', category: 'Dairy', caloriesPer100g: 280, proteinPer100g: 28, carbsPer100g: 3.1, fatPer100g: 17, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Parmesan', nameZh: '帕瑪森起司', category: 'Dairy', caloriesPer100g: 431, proteinPer100g: 38, carbsPer100g: 4.1, fatPer100g: 29, fiberPer100g: 0, defaultServingG: 20, isCustom: false },
    { name: 'Cream Cheese', nameZh: '奶油起司', category: 'Dairy', caloriesPer100g: 342, proteinPer100g: 5.9, carbsPer100g: 4.1, fatPer100g: 34, fiberPer100g: 0, defaultServingG: 25, isCustom: false },
    { name: 'Butter', nameZh: '奶油', category: 'Dairy', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Heavy Cream', nameZh: '鮮奶油', category: 'Dairy', caloriesPer100g: 348, proteinPer100g: 2.2, carbsPer100g: 2.8, fatPer100g: 37, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Whipped Cream', nameZh: '打發鮮奶油', category: 'Dairy', caloriesPer100g: 339, proteinPer100g: 1.5, carbsPer100g: 3.3, fatPer100g: 35, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Sour Cream', nameZh: '酸奶油', category: 'Dairy', caloriesPer100g: 198, proteinPer100g: 3.6, carbsPer100g: 3.9, fatPer100g: 19, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Kefir', nameZh: '克菲爾', category: 'Dairy', caloriesPer100g: 60, proteinPer100g: 3.3, carbsPer100g: 4, fatPer100g: 3.5, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Goat Cheese', nameZh: '山羊起司', category: 'Dairy', caloriesPer100g: 364, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 30, fiberPer100g: 0, defaultServingG: 30, isCustom: false },

    // ===== NEW LEGUMES =====
    { name: 'Black Beans (cooked)', nameZh: '黑豆（熟）', category: 'Legumes', caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5, fiberPer100g: 6.4, defaultServingG: 150, isCustom: false },
    { name: 'Chickpeas (cooked)', nameZh: '鷹嘴豆（熟）', category: 'Legumes', caloriesPer100g: 134, proteinPer100g: 8.9, carbsPer100g: 22.5, fatPer100g: 2.4, fiberPer100g: 6.5, defaultServingG: 150, isCustom: false },
    { name: 'Lentils (cooked)', nameZh: '扁豆（熟）', category: 'Legumes', caloriesPer100g: 116, proteinPer100g: 9.0, carbsPer100g: 20, fatPer100g: 0.4, fiberPer100g: 3.8, defaultServingG: 150, isCustom: false },
    { name: 'Kidney Beans (cooked)', nameZh: '腎豆（熟）', category: 'Legumes', caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 23, fatPer100g: 0.5, fiberPer100g: 6.4, defaultServingG: 150, isCustom: false },
    { name: 'Pinto Beans (cooked)', nameZh: '花豆（熟）', category: 'Legumes', caloriesPer100g: 143, proteinPer100g: 9.0, carbsPer100g: 26.2, fatPer100g: 0.6, fiberPer100g: 7.7, defaultServingG: 150, isCustom: false },
    { name: 'Hummus', nameZh: '鷹嘴豆泥', category: 'Legumes', caloriesPer100g: 166, proteinPer100g: 5.5, carbsPer100g: 14.5, fatPer100g: 9.6, fiberPer100g: 3.9, defaultServingG: 30, isCustom: false },
    { name: 'Split Peas (cooked)', nameZh: '碗豆（熟）', category: 'Legumes', caloriesPer100g: 118, proteinPer100g: 8.2, carbsPer100g: 21, fatPer100g: 0.4, fiberPer100g: 4.3, defaultServingG: 150, isCustom: false },

    // ===== NEW BEVERAGES =====
    { name: 'Orange Juice', nameZh: '柳橙汁', category: 'Beverages', caloriesPer100g: 47, proteinPer100g: 0.7, carbsPer100g: 11.2, fatPer100g: 0.2, fiberPer100g: 0.2, defaultServingG: 250, isCustom: false },
    { name: 'Coconut Water', nameZh: '椰子水', category: 'Beverages', caloriesPer100g: 19, proteinPer100g: 0.7, carbsPer100g: 3.7, fatPer100g: 0.2, fiberPer100g: 1.1, defaultServingG: 250, isCustom: false },
    { name: 'Sports Drink', nameZh: '運動飲料', category: 'Beverages', caloriesPer100g: 50, proteinPer100g: 0, carbsPer100g: 12, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 250, isCustom: false },
    { name: 'Almond Milk', nameZh: '杏仁奶', category: 'Beverages', caloriesPer100g: 13, proteinPer100g: 0.4, carbsPer100g: 0.6, fatPer100g: 1.1, fiberPer100g: 0.2, defaultServingG: 250, isCustom: false },
    { name: 'Oat Milk', nameZh: '燕麥奶', category: 'Beverages', caloriesPer100g: 47, proteinPer100g: 1, carbsPer100g: 7.3, fatPer100g: 1.5, fiberPer100g: 0.4, defaultServingG: 250, isCustom: false },
    { name: 'Soy Milk', nameZh: '豆漿', category: 'Beverages', caloriesPer100g: 33, proteinPer100g: 2.9, carbsPer100g: 1.9, fatPer100g: 1.6, fiberPer100g: 0.6, defaultServingG: 250, isCustom: false },
    { name: 'Black Coffee', nameZh: '黑咖啡', category: 'Beverages', caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 200, isCustom: false },
    { name: 'Green Tea', nameZh: '綠茶', category: 'Beverages', caloriesPer100g: 1, proteinPer100g: 0.2, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 250, isCustom: false },

    // ===== NEW SNACKS =====
    { name: 'Rice Crackers', nameZh: '米餅', category: 'Snacks', caloriesPer100g: 387, proteinPer100g: 6, carbsPer100g: 87, fatPer100g: 1, fiberPer100g: 0.4, defaultServingG: 30, isCustom: false },
    { name: 'Trail Mix', nameZh: '混合堅果乾果', category: 'Snacks', caloriesPer100g: 511, proteinPer100g: 13, carbsPer100g: 50, fatPer100g: 26, fiberPer100g: 5.5, defaultServingG: 40, isCustom: false },
    { name: 'Energy Ball', nameZh: '能量球', category: 'Snacks', caloriesPer100g: 380, proteinPer100g: 8, carbsPer100g: 45, fatPer100g: 18, fiberPer100g: 4, defaultServingG: 30, isCustom: false },
    { name: 'Granola Bar', nameZh: '穀物棒', category: 'Snacks', caloriesPer100g: 399, proteinPer100g: 8, carbsPer100g: 56, fatPer100g: 15, fiberPer100g: 4, defaultServingG: 40, isCustom: false },
    { name: 'Popcorn (air-popped)', nameZh: '爆米花（空氣爆炸）', category: 'Snacks', caloriesPer100g: 387, proteinPer100g: 12.3, carbsPer100g: 77.4, fatPer100g: 3.5, fiberPer100g: 14.5, defaultServingG: 30, isCustom: false },

    // ===== NEW CONDIMENTS =====
    { name: 'Soy Sauce', nameZh: '醬油', category: 'Condiments', caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 0.5, fiberPer100g: 0, defaultServingG: 15, isCustom: false },
    { name: 'Fish Sauce', nameZh: '魚露', category: 'Condiments', caloriesPer100g: 80, proteinPer100g: 14, carbsPer100g: 0.2, fatPer100g: 1, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Ketchup', nameZh: '番茄醬', category: 'Condiments', caloriesPer100g: 99, proteinPer100g: 1.7, carbsPer100g: 24, fatPer100g: 0.3, fiberPer100g: 0.6, defaultServingG: 15, isCustom: false },
    { name: 'Mustard', nameZh: '芥末', category: 'Condiments', caloriesPer100g: 66, proteinPer100g: 3.6, carbsPer100g: 6.4, fatPer100g: 3.3, fiberPer100g: 2.3, defaultServingG: 10, isCustom: false },
    { name: 'Mayonnaise', nameZh: '美乃滋', category: 'Condiments', caloriesPer100g: 680, proteinPer100g: 0.3, carbsPer100g: 0.6, fatPer100g: 75, fiberPer100g: 0, defaultServingG: 15, isCustom: false },
    { name: 'Hot Sauce', nameZh: '辣醬', category: 'Condiments', caloriesPer100g: 68, proteinPer100g: 2, carbsPer100g: 15, fatPer100g: 0.2, fiberPer100g: 1, defaultServingG: 10, isCustom: false },
    { name: 'Salsa', nameZh: '莎莎醬', category: 'Condiments', caloriesPer100g: 36, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 0.1, fiberPer100g: 1.5, defaultServingG: 30, isCustom: false },
    { name: 'Vinegar', nameZh: '醋', category: 'Condiments', caloriesPer100g: 18, proteinPer100g: 0, carbsPer100g: 0.9, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 15, isCustom: false },

    // ===== NEW ASIAN FOODS =====
    { name: 'White Rice Porridge (congee)', nameZh: '白米粥', category: 'Asian Foods', caloriesPer100g: 50, proteinPer100g: 1, carbsPer100g: 11, fatPer100g: 0.1, fiberPer100g: 0.1, defaultServingG: 250, isCustom: false },
    { name: 'Bao (steamed bun)', nameZh: '包子', category: 'Asian Foods', caloriesPer100g: 217, proteinPer100g: 6, carbsPer100g: 42, fatPer100g: 2.5, fiberPer100g: 1, defaultServingG: 70, isCustom: false },
    { name: 'Scallion Pancake', nameZh: '蔥油餅', category: 'Asian Foods', caloriesPer100g: 290, proteinPer100g: 7, carbsPer100g: 35, fatPer100g: 14, fiberPer100g: 1, defaultServingG: 80, isCustom: false },
    { name: 'Siu Mai (pork dim sum)', nameZh: '燒賣', category: 'Asian Foods', caloriesPer100g: 217, proteinPer100g: 11, carbsPer100g: 15, fatPer100g: 12, fiberPer100g: 0.5, defaultServingG: 50, isCustom: false },
    { name: 'Dumpling (steamed)', nameZh: '餃子（蒸）', category: 'Asian Foods', caloriesPer100g: 208, proteinPer100g: 9, carbsPer100g: 28, fatPer100g: 6, fiberPer100g: 0.8, defaultServingG: 100, isCustom: false },
    { name: 'Char Siu Pork (BBQ)', nameZh: '叉燒', category: 'Asian Foods', caloriesPer100g: 268, proteinPer100g: 26, carbsPer100g: 12, fatPer100g: 14, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Taiwanese Beef Noodle Soup', nameZh: '台灣牛肉麵', category: 'Asian Foods', caloriesPer100g: 158, proteinPer100g: 11, carbsPer100g: 16, fatPer100g: 6, fiberPer100g: 1.2, defaultServingG: 400, isCustom: false },
    { name: 'Bubble Tea', nameZh: '珍珠奶茶', category: 'Asian Foods', caloriesPer100g: 62, proteinPer100g: 1.5, carbsPer100g: 14, fatPer100g: 0.8, fiberPer100g: 0.5, defaultServingG: 300, isCustom: false },
    { name: 'Mochi', nameZh: '麻糬', category: 'Asian Foods', caloriesPer100g: 235, proteinPer100g: 3, carbsPer100g: 53, fatPer100g: 0.3, fiberPer100g: 0, defaultServingG: 50, isCustom: false },
    { name: 'Tang Yuan (glutinous ball)', nameZh: '湯圓', category: 'Asian Foods', caloriesPer100g: 246, proteinPer100g: 3, carbsPer100g: 55, fatPer100g: 0.6, fiberPer100g: 0.2, defaultServingG: 50, isCustom: false },
    { name: 'Taro', nameZh: '芋頭', category: 'Asian Foods', caloriesPer100g: 112, proteinPer100g: 1.5, carbsPer100g: 26.5, fatPer100g: 0.1, fiberPer100g: 4.1, defaultServingG: 100, isCustom: false },
    { name: 'Stinky Tofu', nameZh: '臭豆腐', category: 'Asian Foods', caloriesPer100g: 120, proteinPer100g: 13, carbsPer100g: 3, fatPer100g: 5, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Oyster Sauce', nameZh: '蠔油', category: 'Asian Foods', caloriesPer100g: 70, proteinPer100g: 8, carbsPer100g: 12, fatPer100g: 0.5, fiberPer100g: 0, defaultServingG: 15, isCustom: false },
    { name: 'Sesame Oil', nameZh: '麻油', category: 'Asian Foods', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Hoisin Sauce', nameZh: '海鮮醬', category: 'Asian Foods', caloriesPer100g: 128, proteinPer100g: 3, carbsPer100g: 30, fatPer100g: 0.1, fiberPer100g: 0, defaultServingG: 15, isCustom: false },
    { name: 'Kimchi', nameZh: '泡菜', category: 'Asian Foods', caloriesPer100g: 32, proteinPer100g: 1.9, carbsPer100g: 6.2, fatPer100g: 0.1, fiberPer100g: 1.5, defaultServingG: 100, isCustom: false },
    { name: 'Miso Paste', nameZh: '味噌', category: 'Asian Foods', caloriesPer100g: 183, proteinPer100g: 12, carbsPer100g: 14, fatPer100g: 5.4, fiberPer100g: 2, defaultServingG: 10, isCustom: false },

    // ===== ADDITIONAL PROTEINS =====
    { name: 'Cod (cooked)', nameZh: '鱈魚（熟）', category: 'Protein', caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Halibut (cooked)', nameZh: '比目魚（熟）', category: 'Protein', caloriesPer100g: 111, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 2.3, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Tilapia (cooked)', nameZh: '羅非魚（熟）', category: 'Protein', caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7, fiberPer100g: 0, defaultServingG: 150, isCustom: false },
    { name: 'Mackerel (cooked)', nameZh: '鯖魚（熟）', category: 'Protein', caloriesPer100g: 205, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, defaultServingG: 120, isCustom: false },

    // ===== ADDITIONAL CARBS =====
    { name: 'Barley (cooked)', nameZh: '大麥（熟）', category: 'Carbs', caloriesPer100g: 123, proteinPer100g: 2.3, carbsPer100g: 28, fatPer100g: 0.4, fiberPer100g: 3.8, defaultServingG: 150, isCustom: false },
    { name: 'Buckwheat (cooked)', nameZh: '蕎麥（熟）', category: 'Carbs', caloriesPer100g: 155, proteinPer100g: 5.7, carbsPer100g: 33, fatPer100g: 1, fiberPer100g: 4.5, defaultServingG: 150, isCustom: false },
    { name: 'Faro (cooked)', nameZh: '法羅（熟）', category: 'Carbs', caloriesPer100g: 120, proteinPer100g: 3.6, carbsPer100g: 25, fatPer100g: 0.6, fiberPer100g: 3.6, defaultServingG: 150, isCustom: false },
    { name: 'Millet (cooked)', nameZh: '小米（熟）', category: 'Carbs', caloriesPer100g: 119, proteinPer100g: 3.5, carbsPer100g: 23.7, fatPer100g: 1, fiberPer100g: 2.3, defaultServingG: 150, isCustom: false },
    { name: 'Amaranth (cooked)', nameZh: '莧菜（熟）', category: 'Carbs', caloriesPer100g: 102, proteinPer100g: 3.7, carbsPer100g: 18.3, fatPer100g: 2.1, fiberPer100g: 2.1, defaultServingG: 150, isCustom: false },

    // ===== ADDITIONAL VEGETABLES =====
    { name: 'Radish', nameZh: '蘿蔔', category: 'Vegetables', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1, fiberPer100g: 0.6, defaultServingG: 100, isCustom: false },
    { name: 'Turnip', nameZh: '蕪菁', category: 'Vegetables', caloriesPer100g: 28, proteinPer100g: 0.9, carbsPer100g: 6.2, fatPer100g: 0.1, fiberPer100g: 1.5, defaultServingG: 150, isCustom: false },
    { name: 'Brussels Sprouts', nameZh: '孢子甘藍', category: 'Vegetables', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.3, fiberPer100g: 2.4, defaultServingG: 150, isCustom: false },
    { name: 'Artichoke', nameZh: '朝鮮薊', category: 'Vegetables', caloriesPer100g: 47, proteinPer100g: 3.3, carbsPer100g: 10, fatPer100g: 0.1, fiberPer100g: 5.2, defaultServingG: 120, isCustom: false },
    { name: 'Peas (fresh)', nameZh: '豌豆（新鮮）', category: 'Vegetables', caloriesPer100g: 77, proteinPer100g: 5.4, carbsPer100g: 14.5, fatPer100g: 0.4, fiberPer100g: 2.6, defaultServingG: 100, isCustom: false },
    { name: 'Leek', nameZh: '韭蔥', category: 'Vegetables', caloriesPer100g: 31, proteinPer100g: 1.2, carbsPer100g: 7, fatPer100g: 0.2, fiberPer100g: 1.1, defaultServingG: 100, isCustom: false },
    { name: 'Fennel', nameZh: '茴香', category: 'Vegetables', caloriesPer100g: 31, proteinPer100g: 1.2, carbsPer100g: 7.3, fatPer100g: 0.2, fiberPer100g: 3.1, defaultServingG: 100, isCustom: false },

    // ===== ADDITIONAL FRUITS =====
    { name: 'Blackberry', nameZh: '黑莓', category: 'Fruits', caloriesPer100g: 43, proteinPer100g: 1.4, carbsPer100g: 10, fatPer100g: 0.5, fiberPer100g: 5.3, defaultServingG: 100, isCustom: false },
    { name: 'Raspberry', nameZh: '覆盆子', category: 'Fruits', caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 11.9, fatPer100g: 0.7, fiberPer100g: 6.5, defaultServingG: 100, isCustom: false },
    { name: 'Cantaloupe', nameZh: '洋香瓜', category: 'Fruits', caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8.2, fatPer100g: 0.2, fiberPer100g: 0.9, defaultServingG: 200, isCustom: false },
    { name: 'Passion Fruit', nameZh: '百香果', category: 'Fruits', caloriesPer100g: 97, proteinPer100g: 2.2, carbsPer100g: 23.4, fatPer100g: 0.7, fiberPer100g: 10.4, defaultServingG: 50, isCustom: false },
    { name: 'Pomegranate', nameZh: '石榴', category: 'Fruits', caloriesPer100g: 83, proteinPer100g: 1.7, carbsPer100g: 18.7, fatPer100g: 1.2, fiberPer100g: 4, defaultServingG: 100, isCustom: false },
    { name: 'Tangerine', nameZh: '橘子', category: 'Fruits', caloriesPer100g: 47, proteinPer100g: 0.7, carbsPer100g: 12, fatPer100g: 0.3, fiberPer100g: 1.8, defaultServingG: 150, isCustom: false },
    { name: 'Acai Berry', nameZh: '亞莓', category: 'Fruits', caloriesPer100g: 70, proteinPer100g: 1.5, carbsPer100g: 12.5, fatPer100g: 5, fiberPer100g: 2, defaultServingG: 100, isCustom: false },

    // ===== ADDITIONAL FATS =====
    { name: 'Pistachio', nameZh: '開心果', category: 'Fats', caloriesPer100g: 560, proteinPer100g: 20.3, carbsPer100g: 27.2, fatPer100g: 45.3, fiberPer100g: 10.3, defaultServingG: 28, isCustom: false },
    { name: 'Brazil Nuts', nameZh: '巴西堅果', category: 'Fats', caloriesPer100g: 659, proteinPer100g: 14.3, carbsPer100g: 12.3, fatPer100g: 66.4, fiberPer100g: 2.7, defaultServingG: 28, isCustom: false },
    { name: 'Pine Nuts', nameZh: '松子', category: 'Fats', caloriesPer100g: 673, proteinPer100g: 13.7, carbsPer100g: 13.1, fatPer100g: 68.4, fiberPer100g: 3.7, defaultServingG: 25, isCustom: false },
    { name: 'Pumpkin Seeds', nameZh: '南瓜籽', category: 'Fats', caloriesPer100g: 559, proteinPer100g: 26, carbsPer100g: 11.4, fatPer100g: 49, fiberPer100g: 6, defaultServingG: 30, isCustom: false },

    // ===== ADDITIONAL DAIRY =====
    { name: 'Ricotta Cheese', nameZh: '乳清起司', category: 'Dairy', caloriesPer100g: 174, proteinPer100g: 11.3, carbsPer100g: 3, fatPer100g: 13, fiberPer100g: 0, defaultServingG: 40, isCustom: false },
    { name: 'Feta Cheese', nameZh: '羊奶起司', category: 'Dairy', caloriesPer100g: 264, proteinPer100g: 14.2, carbsPer100g: 4.1, fatPer100g: 21, fiberPer100g: 0, defaultServingG: 30, isCustom: false },

    // ===== ADDITIONAL LEGUMES =====
    { name: 'Mung Beans (cooked)', nameZh: '綠豆（熟）', category: 'Legumes', caloriesPer100g: 105, proteinPer100g: 7.0, carbsPer100g: 19, fatPer100g: 0.4, fiberPer100g: 4.2, defaultServingG: 150, isCustom: false },
    { name: 'White Beans (cooked)', nameZh: '白豆（熟）', category: 'Legumes', caloriesPer100g: 124, proteinPer100g: 8.9, carbsPer100g: 22.4, fatPer100g: 0.3, fiberPer100g: 4.2, defaultServingG: 150, isCustom: false },

    // ===== ADDITIONAL BEVERAGES =====
    { name: 'Protein Shake', nameZh: '蛋白質奶昔', category: 'Beverages', caloriesPer100g: 80, proteinPer100g: 12, carbsPer100g: 6, fatPer100g: 1.5, fiberPer100g: 0, defaultServingG: 250, isCustom: false },
    { name: 'Rice Milk', nameZh: '米奶', category: 'Beverages', caloriesPer100g: 47, proteinPer100g: 0.7, carbsPer100g: 9.2, fatPer100g: 1.9, fiberPer100g: 0.7, defaultServingG: 250, isCustom: false },
    { name: 'Coconut Milk (light)', nameZh: '椰奶（清）', category: 'Beverages', caloriesPer100g: 23, proteinPer100g: 0.2, carbsPer100g: 0.9, fatPer100g: 2.1, fiberPer100g: 0, defaultServingG: 100, isCustom: false },
    { name: 'Electrolyte Drink', nameZh: '電解質飲料', category: 'Beverages', caloriesPer100g: 25, proteinPer100g: 0, carbsPer100g: 6, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 250, isCustom: false },

    // ===== ADDITIONAL SNACKS =====
    { name: 'Protein Chips', nameZh: '蛋白質洋芋片', category: 'Snacks', caloriesPer100g: 400, proteinPer100g: 20, carbsPer100g: 40, fatPer100g: 18, fiberPer100g: 5, defaultServingG: 40, isCustom: false },
    { name: 'Beef Protein Bar', nameZh: '牛肉蛋白棒', category: 'Snacks', caloriesPer100g: 350, proteinPer100g: 35, carbsPer100g: 25, fatPer100g: 10, fiberPer100g: 4, defaultServingG: 50, isCustom: false },
    { name: 'Seaweed Snack', nameZh: '海苔零食', category: 'Snacks', caloriesPer100g: 188, proteinPer100g: 4.7, carbsPer100g: 35, fatPer100g: 2.6, fiberPer100g: 5.8, defaultServingG: 20, isCustom: false },
    { name: 'Roasted Chickpeas', nameZh: '烤鷹嘴豆', category: 'Snacks', caloriesPer100g: 416, proteinPer100g: 14, carbsPer100g: 56, fatPer100g: 14, fiberPer100g: 8, defaultServingG: 40, isCustom: false },
    { name: 'Rice Crackers (whole grain)', nameZh: '全穀米餅', category: 'Snacks', caloriesPer100g: 387, proteinPer100g: 8, carbsPer100g: 85, fatPer100g: 2, fiberPer100g: 3, defaultServingG: 30, isCustom: false },

    // ===== ADDITIONAL CONDIMENTS =====
    { name: 'Sriracha Sauce', nameZh: '斯里拉差醬', category: 'Condiments', caloriesPer100g: 101, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 0.8, fiberPer100g: 1.5, defaultServingG: 10, isCustom: false },
    { name: 'BBQ Sauce', nameZh: '燒烤醬', category: 'Condiments', caloriesPer100g: 110, proteinPer100g: 1.5, carbsPer100g: 25, fatPer100g: 0.5, fiberPer100g: 0.5, defaultServingG: 15, isCustom: false },
    { name: 'Teriyaki Sauce', nameZh: '照燒醬', category: 'Condiments', caloriesPer100g: 85, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 0, fiberPer100g: 0, defaultServingG: 15, isCustom: false },
    { name: 'Pesto', nameZh: '香蒜醬', category: 'Condiments', caloriesPer100g: 431, proteinPer100g: 9, carbsPer100g: 10, fatPer100g: 40, fiberPer100g: 2, defaultServingG: 20, isCustom: false },

    // ===== ADDITIONAL ASIAN FOODS =====
    { name: 'Ramen (with broth)', nameZh: '拉麵（含湯）', category: 'Asian Foods', caloriesPer100g: 112, proteinPer100g: 4.5, carbsPer100g: 21, fatPer100g: 1.2, fiberPer100g: 0.8, defaultServingG: 400, isCustom: false },
    { name: 'Pad Thai', nameZh: '泰式炒河粉', category: 'Asian Foods', caloriesPer100g: 156, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 6, fiberPer100g: 0.8, defaultServingG: 250, isCustom: false },
    { name: 'Tom Yum Soup', nameZh: '冬陰功湯', category: 'Asian Foods', caloriesPer100g: 45, proteinPer100g: 2.5, carbsPer100g: 6, fatPer100g: 1.5, fiberPer100g: 0.3, defaultServingG: 300, isCustom: false },
    { name: 'Spring Roll', nameZh: '春卷', category: 'Asian Foods', caloriesPer100g: 203, proteinPer100g: 6, carbsPer100g: 26, fatPer100g: 8.5, fiberPer100g: 0.5, defaultServingG: 50, isCustom: false },
    { name: 'Pho (beef)', nameZh: '牛肉粉（越南湯粉）', category: 'Asian Foods', caloriesPer100g: 76, proteinPer100g: 6, carbsPer100g: 12, fatPer100g: 0.8, fiberPer100g: 0.5, defaultServingG: 300, isCustom: false },
    { name: 'Fried Rice', nameZh: '炒飯', category: 'Asian Foods', caloriesPer100g: 148, proteinPer100g: 5, carbsPer100g: 20, fatPer100g: 5.5, fiberPer100g: 0.3, defaultServingG: 200, isCustom: false },
  ]
  await db.foodLibrary.bulkAdd(foods)
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
