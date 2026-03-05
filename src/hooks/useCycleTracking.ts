import { useState, useEffect, useCallback, useMemo } from 'react'
import { db } from '../db/database'
import type { CycleSettings, CycleLog, CyclePhase, CycleMood, CycleEnergy, FlowLevel } from '../types'

// Phase colors for UI
export const PHASE_COLORS = {
  menstrual: { bg: '#EF4444', text: '#FCA5A5', label: 'Menstrual', emoji: '🔴' },
  follicular: { bg: '#4ADE80', text: '#BBF7D0', label: 'Follicular', emoji: '🟢' },
  ovulation: { bg: '#FFD700', text: '#FEF08A', label: 'Ovulation', emoji: '🟡' },
  luteal: { bg: '#60A5FA', text: '#BFDBFE', label: 'Luteal', emoji: '🔵' },
} as const

// Training recommendations by phase (Dr. Stacy Sims research)
export const PHASE_TRAINING: Record<CyclePhase, {
  title: string
  subtitle: string
  recommended: string[]
  avoid: string[]
  nutrition: string[]
  hydration: string
  sleep: string
  injuryNote?: string
  strengthPotential: 'peak' | 'good' | 'moderate' | 'low'
  recoveryCapacity: 'high' | 'normal' | 'reduced'
}> = {
  menstrual: {
    title: 'Rest & Recovery Phase',
    subtitle: 'Your body is shedding — focus on light movement',
    recommended: ['Yoga', 'Walking', 'Light cardio', 'Mobility work', 'Swimming'],
    avoid: ['Heavy 1RM attempts', 'Max effort WODs', 'High-volume training'],
    nutrition: [
      'Increase iron-rich foods (red meat, spinach, lentils)',
      'Anti-inflammatory focus (berries, omega-3, turmeric)',
      'Extra magnesium (dark chocolate, nuts, seeds)',
    ],
    hydration: 'Increase water intake by 20%',
    sleep: 'Aim for 8+ hours — your body needs extra rest',
    strengthPotential: 'low',
    recoveryCapacity: 'reduced',
  },
  follicular: {
    title: 'Power Phase — Your Strongest Days!',
    subtitle: 'Estrogen rising = more energy, better recovery',
    recommended: ['Heavy lifting', 'Intense WODs', 'PR attempts', 'Sprint intervals', 'Benchmark WODs'],
    avoid: [],
    nutrition: [
      'Normal macros — focus on protein for muscle building',
      'Carb loading works best in this phase',
      'Creatine supplementation most effective now',
    ],
    hydration: 'Normal hydration',
    sleep: 'Standard 7-8 hours is sufficient',
    strengthPotential: 'peak',
    recoveryCapacity: 'high',
  },
  ovulation: {
    title: 'Peak Performance — Watch Your Joints',
    subtitle: 'Highest energy but ACL injury risk elevated',
    recommended: ['Strength + power training', 'High-intensity work', 'Complex movements'],
    avoid: ['Sudden direction changes without warm-up', 'Skipping warm-up'],
    nutrition: [
      'Normal macros',
      'Extra hydration (body temp slightly elevated)',
    ],
    hydration: 'Slightly increase water',
    sleep: 'Standard 7-8 hours',
    injuryNote: 'ACL injury risk is elevated during ovulation. Extra warm-up recommended, especially for knees.',
    strengthPotential: 'peak',
    recoveryCapacity: 'high',
  },
  luteal: {
    title: 'Endurance Phase — Steady State',
    subtitle: 'Progesterone rising = higher body temp, more fatigue',
    recommended: ['Moderate intensity', 'Endurance work', 'Steady-state cardio', 'Higher rep / lighter weight'],
    avoid: ['Extreme high-intensity repeatedly', 'Under-fueling'],
    nutrition: [
      'Increase carbs 10-15% (progesterone burns more glycogen)',
      'Magnesium before bed (helps sleep + cramps)',
      'Increase protein slightly for recovery',
    ],
    hydration: 'Increase water — higher body temperature',
    sleep: 'May need 30-60 min extra sleep',
    strengthPotential: 'moderate',
    recoveryCapacity: 'reduced',
  },
}

// Common symptoms list
export const SYMPTOM_OPTIONS = {
  physical: [
    'Cramps', 'Headache', 'Bloating', 'Breast tenderness',
    'Back pain', 'Fatigue', 'Nausea', 'Acne',
    'Joint pain', 'Muscle soreness', 'Appetite changes',
    'Water retention', 'Dizziness', 'Insomnia',
  ],
  mood: [
    'Happy', 'Calm', 'Energetic', 'Motivated', 'Focused',
    'Anxious', 'Irritable', 'Sad', 'Mood swings', 'Emotional',
    'Low motivation', 'Brain fog', 'Confident', 'Sensitive',
  ],
}

export function useCycleTracking() {
  const [settings, setSettings] = useState<CycleSettings | null>(null)
  const [todayLog, setTodayLog] = useState<CycleLog | null>(null)
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  // Load settings and logs
  const loadCycleData = useCallback(async () => {
    try {
      const allSettings = await db.cycleSettings.toArray()
      const s = allSettings[0] || null
      setSettings(s)

      if (s?.enabled) {
        const logs = await db.cycleLogs.orderBy('date').reverse().toArray()
        setCycleLogs(logs)
        const todayEntry = logs.find(l => l.date === today)
        setTodayLog(todayEntry || null)
      }
    } catch (e) {
      console.error('Failed to load cycle data:', e)
    } finally {
      setIsLoading(false)
    }
  }, [today])

  useEffect(() => { loadCycleData() }, [loadCycleData])

  // Save cycle settings (onboarding or update)
  const saveCycleSettings = useCallback(async (s: Omit<CycleSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const existing = await db.cycleSettings.toArray()
    if (existing.length > 0) {
      await db.cycleSettings.update(existing[0].id!, { ...s, updatedAt: now })
    } else {
      await db.cycleSettings.add({ ...s, createdAt: now, updatedAt: now } as CycleSettings)
    }
    await loadCycleData()
  }, [loadCycleData])

  // Save daily cycle log
  const saveCycleLog = useCallback(async (log: {
    periodActive: boolean
    flowLevel?: FlowLevel
    symptoms: string[]
    mood?: CycleMood
    energy?: CycleEnergy
    sleepQuality?: 'great' | 'good' | 'poor' | 'terrible'
    notes?: string
  }) => {
    if (!settings) return

    const phase = getCurrentPhase()
    const cycleDay = getCycleDay()
    const now = new Date().toISOString()

    const existing = await db.cycleLogs.where('date').equals(today).first()
    const entry: Omit<CycleLog, 'id'> = {
      date: today,
      cycleDay,
      phase,
      periodActive: log.periodActive,
      flowLevel: log.flowLevel,
      symptoms: log.symptoms,
      mood: log.mood,
      energy: log.energy,
      sleepQuality: log.sleepQuality,
      notes: log.notes,
      createdAt: now,
    }

    if (existing) {
      await db.cycleLogs.update(existing.id!, entry)
    } else {
      await db.cycleLogs.add(entry as CycleLog)
    }

    // If user marked period started, update lastPeriodStart in settings
    if (log.periodActive && !todayLog?.periodActive) {
      await db.cycleSettings.update(settings.id!, {
        lastPeriodStart: today,
        updatedAt: now,
      })
    }

    await loadCycleData()
  }, [settings, today, todayLog, loadCycleData])

  // Calculate current cycle day
  const getCycleDay = useCallback((): number => {
    if (!settings?.lastPeriodStart) return 1
    const start = new Date(settings.lastPeriodStart)
    const now = new Date(today)
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const cycleLen = settings.averageCycleLength || 28
    return (diff % cycleLen) + 1
  }, [settings, today])

  // Calculate current phase using variable luteal length (12-16 days)
  // Weighted by user's logged data when available
  const getCurrentPhase = useCallback((): CyclePhase => {
    const day = getCycleDay()
    const periodLen = settings?.averagePeriodLength || 5
    const cycleLen = settings?.averageCycleLength || 28

    // Estimate luteal phase length from logged data (default 14, range 12-16)
    // Count days between last ovulation symptoms and next period
    const recentPeriodStarts = cycleLogs
      .filter(l => l.periodActive)
      .map(l => l.date)
      .sort()
    let lutealLen = 14
    if (recentPeriodStarts.length >= 2) {
      // Use user's actual cycle data to estimate luteal phase
      const gaps: number[] = []
      for (let i = 1; i < Math.min(recentPeriodStarts.length, 6); i++) {
        const diff = Math.floor((new Date(recentPeriodStarts[i]).getTime() - new Date(recentPeriodStarts[i - 1]).getTime()) / (1000 * 60 * 60 * 24))
        if (diff >= 20 && diff <= 40) gaps.push(diff)
      }
      if (gaps.length > 0) {
        const avgCycle = gaps.reduce((a, b) => a + b, 0) / gaps.length
        lutealLen = Math.max(12, Math.min(16, Math.round(avgCycle - periodLen - (avgCycle - periodLen - 14))))
      }
    }
    const ovulationDay = cycleLen - lutealLen

    if (day <= periodLen) return 'menstrual'
    if (day < ovulationDay - 1) return 'follicular'
    if (day <= ovulationDay + 1) return 'ovulation'
    return 'luteal'
  }, [getCycleDay, settings, cycleLogs])

  // Predict next period date
  const getNextPeriodDate = useCallback((): string | null => {
    if (!settings?.lastPeriodStart) return null
    const start = new Date(settings.lastPeriodStart)
    const cycleLen = settings.averageCycleLength || 28
    const nextStart = new Date(start.getTime() + cycleLen * 24 * 60 * 60 * 1000)
    // If next predicted is in the past, calculate next future one
    const now = new Date()
    while (nextStart < now) {
      nextStart.setDate(nextStart.getDate() + cycleLen)
    }
    return nextStart.toISOString().split('T')[0]
  }, [settings])

  // Predict ovulation date using variable luteal phase (12-16 days, default 14)
  const getOvulationDate = useCallback((): string | null => {
    const nextPeriod = getNextPeriodDate()
    if (!nextPeriod) return null
    const lutealLen = Math.max(12, Math.min(16, 14))
    const d = new Date(nextPeriod)
    d.setDate(d.getDate() - lutealLen)
    return d.toISOString().split('T')[0]
  }, [getNextPeriodDate])

  // Get fertile window (5 days before ovulation + ovulation day)
  const getFertileWindow = useCallback((): { start: string; end: string } | null => {
    const ovDay = getOvulationDate()
    if (!ovDay) return null
    const end = new Date(ovDay)
    end.setDate(end.getDate() + 1)
    const start = new Date(ovDay)
    start.setDate(start.getDate() - 5)
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }, [getOvulationDate])

  // Recovery score impact from cycle phase (0-100 contribution)
  const getCycleRecoveryImpact = useCallback((): number => {
    if (!settings?.enabled) return -1 // -1 = not enabled
    const phase = getCurrentPhase()
    switch (phase) {
      case 'follicular': return 90
      case 'ovulation': return 80
      case 'luteal': return 50
      case 'menstrual': return 40
      default: return 60
    }
  }, [settings, getCurrentPhase])

  // Current state
  const currentPhase = useMemo(() => settings?.enabled ? getCurrentPhase() : null, [settings, getCurrentPhase])
  const cycleDay = useMemo(() => settings?.enabled ? getCycleDay() : null, [settings, getCycleDay])
  const nextPeriod = useMemo(() => settings?.enabled ? getNextPeriodDate() : null, [settings, getNextPeriodDate])
  const ovulationDate = useMemo(() => settings?.enabled ? getOvulationDate() : null, [settings, getOvulationDate])
  const fertileWindow = useMemo(() => settings?.enabled ? getFertileWindow() : null, [settings, getFertileWindow])
  const trainingRec = useMemo(() => currentPhase ? PHASE_TRAINING[currentPhase] : null, [currentPhase])
  const phaseColor = useMemo(() => currentPhase ? PHASE_COLORS[currentPhase] : null, [currentPhase])

  // Days until next period
  const daysUntilPeriod = useMemo(() => {
    if (!nextPeriod) return null
    const diff = Math.ceil((new Date(nextPeriod).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [nextPeriod, today])

  // RED-S risk flags — per IOC 2023 consensus: use 6-month (180-day) window
  const redsFlags = useMemo(() => {
    if (!settings?.enabled) return null
    const last180Days = cycleLogs.filter(l => {
      const diff = (new Date(today).getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 180
    })
    // Count distinct period start clusters (not individual period-active days)
    const periodDays = last180Days.filter(l => l.periodActive).map(l => l.date).sort()
    let periodCount = 0
    let lastClusterEnd = ''
    for (const d of periodDays) {
      if (!lastClusterEnd || (new Date(d).getTime() - new Date(lastClusterEnd).getTime()) > 14 * 24 * 60 * 60 * 1000) {
        periodCount++
      }
      lastClusterEnd = d
    }
    // In 6 months, expect ~6 periods. Fewer than 3 = oligomenorrhea / amenorrhea
    const expectedPeriods = Math.round(180 / (settings.averageCycleLength || 28))
    const missedPeriods = last180Days.length >= 30 && periodCount < Math.max(2, expectedPeriods - 2)

    const lowEnergy = last180Days.filter(l => l.energy === 'low' || l.energy === 'exhausted').length
    const lowEnergyFrequent = last180Days.length >= 14 && lowEnergy > last180Days.length * 0.4

    return {
      missedPeriods,
      lowEnergyFrequent,
      periodCount,
      expectedPeriods,
      isAtRisk: missedPeriods || lowEnergyFrequent,
    }
  }, [settings, cycleLogs, today])

  // Get cycle log for a specific date (for calendar)
  const getLogForDate = useCallback((date: string): CycleLog | undefined => {
    return cycleLogs.find(l => l.date === date)
  }, [cycleLogs])

  // Get phase for a specific date (for calendar coloring)
  const getPhaseForDate = useCallback((date: string): CyclePhase | null => {
    if (!settings?.lastPeriodStart) return null
    const start = new Date(settings.lastPeriodStart)
    const target = new Date(date)
    const diff = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const cycleLen = settings.averageCycleLength || 28
    const periodLen = settings.averagePeriodLength || 5
    const lutealLen = Math.max(12, Math.min(16, 14)) // default 14, range 12-16
    const ovDay = cycleLen - lutealLen
    const dayInCycle = ((diff % cycleLen) + cycleLen) % cycleLen + 1

    if (dayInCycle <= periodLen) return 'menstrual'
    if (dayInCycle < ovDay - 1) return 'follicular'
    if (dayInCycle <= ovDay + 1) return 'ovulation'
    return 'luteal'
  }, [settings])

  // Delete all cycle data
  const deleteCycleData = useCallback(async () => {
    await db.cycleLogs.clear()
    await db.cycleSettings.clear()
    setSettings(null)
    setTodayLog(null)
    setCycleLogs([])
  }, [])

  return {
    // State
    settings, todayLog, cycleLogs, isLoading,
    currentPhase, cycleDay, nextPeriod, ovulationDate, fertileWindow,
    daysUntilPeriod, trainingRec, phaseColor, redsFlags,
    // Actions
    loadCycleData, saveCycleSettings, saveCycleLog,
    getLogForDate, getPhaseForDate, getCycleRecoveryImpact,
    deleteCycleData,
  }
}
