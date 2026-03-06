import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS } from './achievements'

describe('Achievements', () => {
  it('should have exactly 60 achievements', () => {
    expect(ACHIEVEMENTS.length).toBe(60)
  })

  it('should have unique IDs', () => {
    const ids = ACHIEVEMENTS.map(a => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('should have all required fields', () => {
    ACHIEVEMENTS.forEach(a => {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(['training', 'nutrition', 'consistency', 'strength', 'milestone']).toContain(a.category)
      expect(['bronze', 'silver', 'gold']).toContain(a.tier)
      expect(a.condition.value).toBeGreaterThan(0)
    })
  })

  it('should have achievements in each category', () => {
    const categories = ['training', 'nutrition', 'consistency', 'strength', 'milestone']
    categories.forEach(cat => {
      const count = ACHIEVEMENTS.filter(a => a.category === cat).length
      expect(count).toBeGreaterThanOrEqual(8)
    })
  })

  it('should have bronze, silver, and gold tiers', () => {
    expect(ACHIEVEMENTS.filter(a => a.tier === 'bronze').length).toBeGreaterThan(0)
    expect(ACHIEVEMENTS.filter(a => a.tier === 'silver').length).toBeGreaterThan(0)
    expect(ACHIEVEMENTS.filter(a => a.tier === 'gold').length).toBeGreaterThan(0)
  })

  it('should have increasing values within same condition type', () => {
    const byType = new Map<string, number[]>()
    ACHIEVEMENTS.forEach(a => {
      const key = `${a.category}-${a.condition.type}`
      if (!byType.has(key)) byType.set(key, [])
      byType.get(key)!.push(a.condition.value)
    })
    byType.forEach((values) => {
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
      }
    })
  })
})
