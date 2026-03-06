import { useCallback } from 'react'
import { useStore } from '../stores/useStore'
import { today } from '../utils/macros'
import type { MovementPR } from '../types'
import type { PRInfo } from '../components/PRToast'

// Movements that are tracked by reps (gymnastics / bodyweight)
const GYMNASTICS_MOVEMENTS = new Set([
  'pull-up', 'pull-ups', 'chest-to-bar', 'chest to bar pull-ups', 'c2b',
  'muscle-up', 'muscle-ups', 'bar muscle-up', 'bar muscle-ups', 'ring muscle-up', 'ring muscle-ups',
  'handstand push-up', 'handstand push-ups', 'hspu', 'strict hspu',
  'toes-to-bar', 'toes to bar', 't2b',
  'double-under', 'double-unders', 'double unders', 'du',
  'pistol', 'pistols', 'pistol squat', 'pistol squats',
  'rope climb', 'rope climbs',
  'ring dip', 'ring dips', 'strict ring dip',
  'kipping pull-up', 'butterfly pull-up',
  'wall walk', 'wall walks',
  'burpee', 'burpees', 'bar-facing burpee',
  'box jump', 'box jumps',
])

function isGymnasticsMovement(name: string): boolean {
  return GYMNASTICS_MOVEMENTS.has(name.toLowerCase().trim())
}

/** Map rep scheme strings like "3-3-3" or "5-5-5" to RM type */
function repSchemeToRMType(scheme: string, buildTarget: string): '1rm' | '3rm' | '5rm' | null {
  if (buildTarget === '1RM' || buildTarget === 'Heavy Single') return '1rm'
  if (buildTarget === '3RM' || buildTarget === 'Heavy 3') return '3rm'
  if (buildTarget === '5RM' || buildTarget === 'Heavy 5') return '5rm'

  // Parse from rep scheme string
  if (!scheme) return null
  const reps = scheme.split('-').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
  if (reps.length === 0) return null

  // Use the lowest rep count in the scheme to determine RM type
  const minRep = Math.min(...reps)
  if (minRep === 1) return '1rm'
  if (minRep <= 3) return '3rm'
  if (minRep <= 5) return '5rm'
  return null
}

/** Get category for a movement name */
function getMovementCategory(name: string): MovementPR['category'] {
  const lower = name.toLowerCase().trim()
  if (isGymnasticsMovement(lower)) return 'gymnastics'

  // Dumbbell movements
  if (lower.includes('dumbbell') || lower.includes('db ') || lower.startsWith('db')) return 'dumbbell'

  // Monostructural / cardio
  if (['run', 'row', 'bike', 'skierg', 'swim', 'assault bike', 'echo bike', 'c2 bike'].some(m => lower.includes(m))) return 'monostructural'

  // Default = barbell
  return 'barbell'
}

/** Format a date string to short display */
function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function usePRDetection() {
  const { movementPRs, saveMovementPR, loadMovementPRs } = useStore()

  /**
   * Detect all PRs from a saved workout. Returns array of detected PRs for celebration.
   * Also auto-saves new MovementPR records to the database.
   */
  const detectPRs = useCallback(async (workout: {
    name: string
    workoutType: string
    scoreDisplay?: string
    scoreValue?: number
    scoreUnit?: string
    isBenchmark: boolean
    rxOrScaled: string
    loads?: Record<string, string>
    movements?: string[]
    // Strength-specific
    strengthMovement?: string
    strengthEndWeight?: string
    strengthBuildTarget?: string
    strengthRepScheme?: string
    weightUnit?: string
    // Cardio-specific
    cardioType?: string
    distanceValue?: number
    distanceUnit?: string
    paceDisplay?: string
  }): Promise<PRInfo[]> => {
    const detectedPRs: PRInfo[] = []

    // ──────────────────────────────────────
    // 1. LIFT PRs (Strength / Full Class)
    // ──────────────────────────────────────
    if (workout.strengthMovement && workout.strengthEndWeight) {
      const moveName = workout.strengthMovement.trim()
      const weight = parseFloat(workout.strengthEndWeight)
      const unit = (workout.weightUnit || 'kg') as 'kg' | 'lb'

      if (moveName && weight > 0) {
        // Determine RM type
        const rmType = repSchemeToRMType(
          workout.strengthRepScheme || '',
          workout.strengthBuildTarget || ''
        ) || '1rm'

        // Check against existing PRs
        const existing = movementPRs.filter(
          pr => pr.movementName.toLowerCase() === moveName.toLowerCase() && pr.prType === rmType
        )
        const currentBest = existing.length > 0
          ? Math.max(...existing.map(pr => pr.value))
          : 0

        if (weight > currentBest) {
          // NEW PR!
          const category = getMovementCategory(moveName)
          await saveMovementPR({
            movementName: moveName,
            category,
            prType: rmType,
            value: weight,
            unit,
            date: today(),
            notes: `Auto-detected from ${workout.workoutType === 'Strength' ? 'Strength Only' : workout.workoutType === 'StrengthMetcon' ? 'Full Class' : workout.name}`,
          })

          const improvement = currentBest > 0 ? weight - currentBest : 0
          const previousRecord = existing.length > 0
            ? existing.sort((a, b) => b.date.localeCompare(a.date))[0]
            : null

          detectedPRs.push({
            movementName: moveName,
            prType: rmType.toUpperCase(),
            newValue: `${weight} ${unit}`,
            improvement: improvement > 0 ? `+${improvement} ${unit}` : undefined,
            previousDate: previousRecord ? formatDateShort(previousRecord.date) : undefined,
          })
        }
      }
    }

    // ──────────────────────────────────────
    // 2. BENCHMARK WOD PRs
    // ──────────────────────────────────────
    if (workout.isBenchmark && workout.name && workout.scoreValue && workout.scoreValue > 0) {
      const wodName = workout.name.trim()
      const scoreUnit = workout.scoreUnit || 'reps'
      const division = workout.rxOrScaled || 'RX'

      // Check existing benchmark results from workouts  -  FILTER BY RX/SCALED DIVISION
      const allWorkouts = useStore.getState().workouts
      const previousBests = allWorkouts.filter(
        w => w.name.toLowerCase() === wodName.toLowerCase()
          && w.isBenchmark
          && w.scoreValue
          && w.scoreValue > 0
          && (w.rxOrScaled || 'RX') === division
      )

      if (previousBests.length > 0) {
        let isBetterThanAll = false
        let bestPrevValue = 0
        let bestPrevDate = ''

        if (scoreUnit === 'time') {
          // Lower is better for ForTime
          bestPrevValue = Math.min(...previousBests.map(w => w.scoreValue!))
          bestPrevDate = previousBests.find(w => w.scoreValue === bestPrevValue)?.date || ''
          isBetterThanAll = workout.scoreValue < bestPrevValue
        } else {
          // Higher is better for AMRAP, reps, rounds
          bestPrevValue = Math.max(...previousBests.map(w => w.scoreValue!))
          bestPrevDate = previousBests.find(w => w.scoreValue === bestPrevValue)?.date || ''
          isBetterThanAll = workout.scoreValue > bestPrevValue
        }

        if (isBetterThanAll) {
          // Save as benchmark PR in movementPRs
          const prType = scoreUnit === 'time' ? 'fastest' : 'max_reps'
          await saveMovementPR({
            movementName: wodName,
            category: 'other',
            prType: prType as MovementPR['prType'],
            value: workout.scoreValue,
            unit: scoreUnit === 'time' ? 'seconds' : 'reps',
            date: today(),
            notes: `Benchmark WOD PR (${division})  -  ${workout.scoreDisplay || ''}`,
          })

          // Format improvement
          let improvementStr: string | undefined
          if (scoreUnit === 'time' && bestPrevValue > 0) {
            const diff = bestPrevValue - workout.scoreValue
            if (diff > 0) {
              const mins = Math.floor(diff / 60)
              const secs = Math.round(diff % 60)
              improvementStr = mins > 0 ? `-${mins}:${String(secs).padStart(2, '0')}` : `-${secs}s`
            }
          } else if (bestPrevValue > 0) {
            const diff = workout.scoreValue - bestPrevValue
            if (diff > 0) improvementStr = `+${diff}`
          }

          detectedPRs.push({
            movementName: wodName,
            prType: 'Benchmark',
            newValue: workout.scoreDisplay || `${workout.scoreValue}`,
            improvement: improvementStr,
            previousDate: bestPrevDate ? formatDateShort(bestPrevDate) : undefined,
          })
        }
      }
    }

    // ──────────────────────────────────────
    // 3. GYMNASTICS PRs (max reps from movements)
    // ──────────────────────────────────────
    if (workout.movements && workout.loads) {
      for (const movName of workout.movements) {
        if (!isGymnasticsMovement(movName)) continue

        // Check if we have reps data for this movement
        const detailKey = `${movName}_detail`
        const detail = workout.loads[detailKey]
        if (!detail) continue

        // Try to extract a max rep count from the detail
        // Could be "21-15-9" (take max = 21), "50" (single number), "3x15" etc.
        const numbers = detail.match(/\d+/g)?.map(Number) || []
        if (numbers.length === 0) continue

        const maxReps = Math.max(...numbers)
        if (maxReps <= 0) continue

        // Check against existing gymnastics PRs
        const existing = movementPRs.filter(
          pr => pr.movementName.toLowerCase() === movName.toLowerCase()
            && (pr.prType === 'max_reps' || pr.prType === 'max_unbroken')
        )
        const currentBest = existing.length > 0
          ? Math.max(...existing.map(pr => pr.value))
          : 0

        if (maxReps > currentBest) {
          await saveMovementPR({
            movementName: movName,
            category: 'gymnastics',
            prType: 'max_reps',
            value: maxReps,
            unit: 'reps',
            date: today(),
            notes: `Auto-detected from ${workout.name}`,
          })

          const improvement = currentBest > 0 ? maxReps - currentBest : 0

          detectedPRs.push({
            movementName: movName,
            prType: 'Max Reps',
            newValue: `${maxReps} reps`,
            improvement: improvement > 0 ? `+${improvement}` : undefined,
            previousDate: existing.length > 0 ? formatDateShort(existing[0].date) : undefined,
          })
        }
      }
    }

    // ──────────────────────────────────────
    // 4. CARDIO / HYROX PRs
    // ──────────────────────────────────────
    if (['Running', 'Cardio', 'HYROX'].includes(workout.workoutType)) {
      const cardioName = workout.name.trim()
      const cardioDivision = workout.rxOrScaled || 'RX'
      if (cardioName && workout.scoreValue && workout.scoreValue > 0) {
        // For cardio/HYROX, lower time = better  -  filter by same division
        const allWorkouts = useStore.getState().workouts
        const previousBests = allWorkouts.filter(
          w => w.name.toLowerCase() === cardioName.toLowerCase()
            && w.scoreValue
            && w.scoreValue > 0
            && (w.rxOrScaled || 'RX') === cardioDivision
        )

        if (previousBests.length > 0) {
          const bestPrevTime = Math.min(...previousBests.map(w => w.scoreValue!))
          const bestPrevDate = previousBests.find(w => w.scoreValue === bestPrevTime)?.date || ''

          if (workout.scoreValue < bestPrevTime) {
            await saveMovementPR({
              movementName: cardioName,
              category: 'monostructural',
              prType: 'fastest',
              value: workout.scoreValue,
              unit: 'seconds',
              date: today(),
              notes: `${workout.workoutType} PR  -  ${workout.scoreDisplay || ''}`,
            })

            const diff = bestPrevTime - workout.scoreValue
            const mins = Math.floor(diff / 60)
            const secs = Math.round(diff % 60)
            const improvementStr = mins > 0 ? `-${mins}:${String(secs).padStart(2, '0')}` : `-${secs}s`

            detectedPRs.push({
              movementName: cardioName,
              prType: 'Fastest',
              newValue: workout.scoreDisplay || `${workout.scoreValue}s`,
              improvement: improvementStr,
              previousDate: bestPrevDate ? formatDateShort(bestPrevDate) : undefined,
            })
          }
        }
      }
    }

    // Reload PR data
    if (detectedPRs.length > 0) {
      await loadMovementPRs()
    }

    return detectedPRs
  }, [movementPRs, saveMovementPR, loadMovementPRs])

  /**
   * Get the current PR for a movement + RM type.
   * Used for inline display: "Back Squat  -  PR: 115kg (1RM)"
   */
  const getCurrentPR = useCallback((movementName: string, rmType?: string): MovementPR | null => {
    if (!movementName || movementName.trim().length < 2) return null
    const name = movementName.trim().toLowerCase()

    const matches = movementPRs.filter(pr => {
      const prName = pr.movementName.toLowerCase()
      if (prName !== name) return false
      if (rmType && pr.prType !== rmType) return false
      return true
    })

    if (matches.length === 0) return null

    // Return the one with highest value (or lowest for 'fastest')
    if (rmType === 'fastest') {
      return matches.reduce((best, pr) => pr.value < best.value ? pr : best)
    }
    return matches.reduce((best, pr) => pr.value > best.value ? pr : best)
  }, [movementPRs])

  /**
   * Get the current benchmark WOD PR.
   */
  const getBenchmarkPR = useCallback((wodName: string): { scoreDisplay: string; date: string } | null => {
    if (!wodName || wodName.trim().length < 2) return null
    const name = wodName.trim().toLowerCase()

    const allWorkouts = useStore.getState().workouts
    const matches = allWorkouts.filter(
      w => w.name.toLowerCase() === name && w.isBenchmark && w.scoreValue && w.scoreValue > 0
    )

    if (matches.length === 0) return null

    // Determine if time-based or rep-based from the first match
    const isTime = matches[0].scoreUnit === 'time'
    const best = isTime
      ? matches.reduce((b, w) => (w.scoreValue! < b.scoreValue! ? w : b))
      : matches.reduce((b, w) => (w.scoreValue! > b.scoreValue! ? w : b))

    return {
      scoreDisplay: best.scoreDisplay || `${best.scoreValue}`,
      date: best.date,
    }
  }, [])

  return { detectPRs, getCurrentPR, getBenchmarkPR }
}
