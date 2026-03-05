import { describe, it, expect } from 'vitest'
import { calcMacros, verifyCals, calc1RM, calcPercentage, calcNutritionTargets, formatTime, parseTime, pct } from './macros'

describe('calcMacros', () => {
  const chicken = {
    id: 1,
    name: 'Chicken Breast',
    category: 'protein' as const,
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
    fiberPer100g: 0,
    isCustom: false,
    defaultServingG: 150,
  }

  it('should calculate macros for 100g', () => {
    const m = calcMacros(chicken, 100)
    expect(m.calories).toBe(165)
    expect(m.protein).toBe(31)
    expect(m.fat).toBe(3.6)
  })

  it('should scale macros for 200g', () => {
    const m = calcMacros(chicken, 200)
    expect(m.calories).toBe(330)
    expect(m.protein).toBe(62)
  })

  it('should scale macros for 50g', () => {
    const m = calcMacros(chicken, 50)
    expect(m.calories).toBe(83) // 165 * 0.5 rounded
    expect(m.protein).toBe(15.5)
  })

  it('should handle 0g', () => {
    const m = calcMacros(chicken, 0)
    expect(m.calories).toBe(0)
    expect(m.protein).toBe(0)
  })
})

describe('verifyCals', () => {
  it('should calculate calories from macros', () => {
    expect(verifyCals(150, 200, 60)).toBe(150 * 4 + 200 * 4 + 60 * 9)
  })

  it('should return 0 for all zeros', () => {
    expect(verifyCals(0, 0, 0)).toBe(0)
  })
})

describe('calc1RM (Epley)', () => {
  it('should return weight for 1 rep', () => {
    expect(calc1RM(100, 1)).toBe(100)
  })

  it('should return 0 for 0 reps', () => {
    expect(calc1RM(100, 0)).toBe(0)
  })

  it('should calculate 1RM for multiple reps', () => {
    // Epley: 100 * (1 + 5/30) = 100 * 1.1667 ≈ 117
    expect(calc1RM(100, 5)).toBe(117)
  })

  it('should handle heavy weight with low reps', () => {
    // 200 * (1 + 3/30) = 200 * 1.1 = 220
    expect(calc1RM(200, 3)).toBe(220)
  })
})

describe('calcPercentage', () => {
  it('should calculate percentage of 1RM', () => {
    expect(calcPercentage(100, 80)).toBe(80)
    expect(calcPercentage(200, 90)).toBe(180)
  })

  it('should round result', () => {
    expect(calcPercentage(135, 85)).toBe(115) // 114.75 rounds to 115
  })
})

describe('calcNutritionTargets', () => {
  it('should calculate targets for 70kg performance goal', () => {
    const t = calcNutritionTargets(70, 'performance')
    expect(t.protein).toBe(140) // 70 * 2.0
    expect(t.carbs).toBe(280)   // 70 * 4.0
    expect(t.fat).toBe(63)      // 70 * 0.9
    expect(t.water).toBe(2450)  // 70 * 35
    expect(t.calories).toBe(verifyCals(140, 280, 63))
  })

  it('should adjust for female', () => {
    const male = calcNutritionTargets(70, 'performance')
    const female = calcNutritionTargets(70, 'performance', 'female')
    expect(female.carbs).toBeLessThan(male.carbs) // female gets 0.85x carbs
    expect(female.fat).toBeGreaterThan(male.fat) // female gets 1.1x fat
  })

  it('should give high protein for fat loss', () => {
    const t = calcNutritionTargets(70, 'fat_loss')
    expect(t.protein).toBe(168) // 70 * 2.4
  })
})

describe('formatTime', () => {
  it('should format seconds to m:ss', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(90)).toBe('1:30')
    expect(formatTime(605)).toBe('10:05')
  })
})

describe('parseTime', () => {
  it('should parse m:ss format', () => {
    expect(parseTime('1:30')).toBe(90)
    expect(parseTime('10:05')).toBe(605)
  })

  it('should parse plain number', () => {
    expect(parseTime('90')).toBe(90)
  })
})

describe('pct', () => {
  it('should calculate percentage', () => {
    expect(pct(50, 100)).toBe(50)
    expect(pct(100, 100)).toBe(100)
  })

  it('should cap at 100', () => {
    expect(pct(150, 100)).toBe(100)
  })

  it('should handle zero target', () => {
    expect(pct(50, 0)).toBe(0)
  })
})
