import Dexie, { type EntityTable } from 'dexie'
import type {
  DailyLog, Workout, FoodItem, MealLog,
  MealTemplate, GroceryItem, ProgramDay, UserSettings
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
  }
}

export const db = new CrossTrackDB()

// Seed initial food library
export async function seedFoodLibrary() {
  const count = await db.foodLibrary.count()
  if (count > 0) return

  const foods: Omit<FoodItem, 'id'>[] = [
    { name: 'Chicken Breast (cooked)', nameZh: '雞胸肉（熟）', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, defaultServingG: 200, isCustom: false },
    { name: 'Lean Beef (cooked)', nameZh: '瘦牛肉（熟）', category: 'Protein', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, fiberPer100g: 0, defaultServingG: 200, isCustom: false },
    { name: 'Eggs (whole, boiled)', nameZh: '雞蛋（水煮）', category: 'Protein', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, defaultServingG: 50, isCustom: false },
    { name: 'Whey Protein (1 scoop)', nameZh: '乳清蛋白（1勺）', category: 'Protein', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 4, fiberPer100g: 0, defaultServingG: 30, isCustom: false },
    { name: 'Greek Yogurt (plain)', nameZh: '希臘優格（原味）', category: 'Protein', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.7, fiberPer100g: 0, defaultServingG: 200, isCustom: false },
    { name: 'Rolled Oats (dry)', nameZh: '燕麥片（乾）', category: 'Carbs', caloriesPer100g: 379, proteinPer100g: 13.2, carbsPer100g: 67.7, fatPer100g: 6.5, fiberPer100g: 10.1, defaultServingG: 80, isCustom: false },
    { name: 'Cooked Rice (white)', nameZh: '白飯（熟）', category: 'Carbs', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, defaultServingG: 150, isCustom: false },
    { name: 'Sweet Potato (cooked)', nameZh: '地瓜（熟）', category: 'Carbs', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 20.7, fatPer100g: 0.1, fiberPer100g: 3.3, defaultServingG: 200, isCustom: false },
    { name: 'Banana', nameZh: '香蕉', category: 'Carbs', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, fiberPer100g: 2.6, defaultServingG: 120, isCustom: false },
    { name: 'Apple', nameZh: '蘋果', category: 'Carbs', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, fiberPer100g: 2.4, defaultServingG: 180, isCustom: false },
    { name: 'Rice Cake', nameZh: '米餅', category: 'Carbs', caloriesPer100g: 387, proteinPer100g: 7.4, carbsPer100g: 82, fatPer100g: 2.8, fiberPer100g: 1.2, defaultServingG: 9, isCustom: false },
    { name: 'Honey', nameZh: '蜂蜜', category: 'Carbs', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82.4, fatPer100g: 0, fiberPer100g: 0.2, defaultServingG: 15, isCustom: false },
    { name: 'Broccoli', nameZh: '花椰菜', category: 'Vegetables', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, defaultServingG: 150, isCustom: false },
    { name: 'Spinach', nameZh: '菠菜', category: 'Vegetables', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, defaultServingG: 100, isCustom: false },
    { name: 'Mixed Vegetables', nameZh: '綜合蔬菜', category: 'Vegetables', caloriesPer100g: 65, proteinPer100g: 2.6, carbsPer100g: 13, fatPer100g: 0.3, fiberPer100g: 4.1, defaultServingG: 150, isCustom: false },
    { name: 'Olive Oil', nameZh: '橄欖油', category: 'Fats', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, defaultServingG: 10, isCustom: false },
    { name: 'Almonds', nameZh: '杏仁', category: 'Fats', caloriesPer100g: 579, proteinPer100g: 21.2, carbsPer100g: 21.7, fatPer100g: 49.9, fiberPer100g: 12.2, defaultServingG: 30, isCustom: false },
  ]

  await db.foodLibrary.bulkAdd(foods)
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
  await seedMealTemplates()
  await seedProgram()
  await seedGroceryList()
  await seedSettings()
}
