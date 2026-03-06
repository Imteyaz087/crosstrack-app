import { useMemo } from 'react'
import type { CyclePhase, EnergyLevel } from '../types'
import { useStore } from '../stores/useStore'
import { PHASE_COLORS, useCycleTracking } from './useCycleTracking'

export type ReadinessStatus = 'green' | 'yellow' | 'red'

export interface ReadinessFactor {
  value: number
  label: string
}

export interface ReadinessCycleFactor extends ReadinessFactor {
  phase: CyclePhase
  phaseLabel: string
  color: string
}

export interface ReadinessFactorsBreakdown {
  sleep: ReadinessFactor
  energy: ReadinessFactor
  training: ReadinessFactor
  cycle?: ReadinessCycleFactor
}

export interface UseReadinessResult {
  isAvailable: boolean
  score: number | null
  status: ReadinessStatus | null
  recommendation: string | null
  factorsBreakdown: ReadinessFactorsBreakdown | null
  shouldTrainHard: boolean
}

function getSleepFactor(sleepHours?: number): ReadinessFactor {
  const value = sleepHours ? Math.min(100, Math.round((sleepHours / 8) * 100)) : 50
  return {
    value,
    label: sleepHours ? `${sleepHours}h sleep` : 'Sleep not logged',
  }
}

function getEnergyFactor(energy?: EnergyLevel): ReadinessFactor {
  const value = energy ? Math.round((energy / 5) * 100) : 50
  return {
    value,
    label: energy ? `Energy ${energy}/5` : 'Energy not logged',
  }
}

function getTrainingFactor(weeklyDone: number, weeklyTarget: number): ReadinessFactor {
  const value = weeklyDone <= weeklyTarget
    ? 80
    : Math.max(30, 100 - (weeklyDone - weeklyTarget) * 15)

  return {
    value,
    label: `${weeklyDone}/${weeklyTarget} sessions this week`,
  }
}

function getCycleFactor(currentPhase: CyclePhase | null): ReadinessCycleFactor | undefined {
  if (!currentPhase) return undefined

  const value = currentPhase === 'follicular'
    ? 90
    : currentPhase === 'ovulation'
      ? 80
      : currentPhase === 'luteal'
        ? 50
        : 40
  const phaseMeta = PHASE_COLORS[currentPhase]

  return {
    value,
    label: `${phaseMeta.label} phase`,
    phase: currentPhase,
    phaseLabel: phaseMeta.label,
    color: phaseMeta.bg,
  }
}

function getReadinessStatus(score: number): ReadinessStatus {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

function getRecommendation(status: ReadinessStatus, currentPhase: CyclePhase | null): string {
  if (status === 'green') {
    if (currentPhase === 'follicular' || currentPhase === 'ovulation') {
      return 'High-readiness day. Push intensity or quality work.'
    }
    return 'Good to train with intent today.'
  }

  if (status === 'yellow') {
    if (currentPhase === 'luteal') {
      return 'Train, but keep volume controlled and fuel well.'
    }
    return 'Solid training day. Keep intensity measured.'
  }

  if (currentPhase === 'menstrual') {
    return 'Keep it light and prioritize recovery or technique.'
  }

  return 'Recovery first today. Favor light work or rest.'
}

export function useReadiness(): UseReadinessResult {
  const todayLog = useStore((state) => state.todayLog)
  const workouts = useStore((state) => state.workouts)
  const profile = useStore((state) => state.profile)
  const cycle = useCycleTracking()

  return useMemo(() => {
    const sleep = todayLog?.sleepHours
    const energy = todayLog?.energy

    if (!sleep && !energy) {
      return {
        isAvailable: false,
        score: null,
        status: null,
        recommendation: null,
        factorsBreakdown: null,
        shouldTrainHard: false,
      }
    }

    const weeklyTarget = profile?.trainingDaysPerWeek || 5
    const now = new Date()
    const weeklyDone = workouts.filter((workout) => {
      const diffDays = (now.getTime() - new Date(workout.date).getTime()) / 86400000
      return diffDays >= 0 && diffDays <= 7
    }).length

    const sleepFactor = getSleepFactor(sleep)
    const energyFactor = getEnergyFactor(energy)
    const trainingFactor = getTrainingFactor(weeklyDone, weeklyTarget)
    const cycleFactor = cycle.settings && cycle.currentPhase
      ? getCycleFactor(cycle.currentPhase)
      : undefined

    const score = cycleFactor
      ? Math.round(
        sleepFactor.value * 0.4
        + energyFactor.value * 0.25
        + cycleFactor.value * 0.2
        + trainingFactor.value * 0.15,
      )
      : Math.round(
        sleepFactor.value * 0.5
        + energyFactor.value * 0.3
        + trainingFactor.value * 0.2,
      )

    const status = getReadinessStatus(score)

    return {
      isAvailable: true,
      score,
      status,
      recommendation: getRecommendation(status, cycle.currentPhase),
      factorsBreakdown: {
        sleep: sleepFactor,
        energy: energyFactor,
        training: trainingFactor,
        ...(cycleFactor ? { cycle: cycleFactor } : {}),
      },
      shouldTrainHard: score >= 70,
    }
  }, [cycle.currentPhase, cycle.settings, profile, todayLog, workouts])
}
