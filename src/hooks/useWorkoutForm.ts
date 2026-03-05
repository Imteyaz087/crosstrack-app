import { useState, useMemo, useCallback, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { today } from '../utils/macros'
import type { WodType, RxScaled, Workout } from '../types'
import type { MovementEntry } from '../components/log/constants'
import type { BenchmarkWod } from '../components/log/BenchmarkWodPicker'
import type { ShareCardData } from '../components/sharecard/types'

type ClassFormat = 'full' | 'wod_only' | 'strength_only'

export interface PRDetectionData {
  name: string
  workoutType: string
  scoreDisplay?: string
  scoreValue?: number
  scoreUnit?: string
  isBenchmark: boolean
  rxOrScaled: string
  loads?: Record<string, string>
  movements?: string[]
  strengthMovement?: string
  strengthEndWeight?: string
  strengthBuildTarget?: string
  strengthRepScheme?: string
  weightUnit?: string
}

export function useWorkoutForm(
  onToast: (msg: string, type: 'success' | 'error') => void,
  onDone: () => void,
  onPRsDetected?: (data: PRDetectionData) => void,
) {
  const { workouts, saveWorkout, deleteWorkout, loadWorkouts, profile } = useStore()

  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [classFormat, setClassFormat] = useState<ClassFormat>('full')
  const [workoutStep, setWorkoutStep] = useState(1)
  const [wodType, setWodType] = useState<WodType>('AMRAP')
  const [wodName, setWodName] = useState('')
  const [wodDescription, setWodDescription] = useState('')
  const [rxScaled, setRxScaled] = useState<RxScaled>('RX')
  const [prFlag, setPrFlag] = useState(false)
  const [isBenchmark, setIsBenchmark] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('lbs')
  const [showBenchmarkPicker, setShowBenchmarkPicker] = useState(false)

  const [scoreMin, setScoreMin] = useState('')
  const [scoreSec, setScoreSec] = useState('')
  const [scoreRounds, setScoreRounds] = useState('')
  const [scoreReps, setScoreReps] = useState('')
  const [timeCap, setTimeCap] = useState('')

  const [strengthMovement, setStrengthMovement] = useState('')
  const [strengthSchemeType, setStrengthSchemeType] = useState<'programmed' | 'build'>('programmed')
  const [strengthInterval, setStrengthInterval] = useState('120')
  const [strengthSets, setStrengthSets] = useState('5')
  const [strengthRepScheme, setStrengthRepScheme] = useState('')
  const [strengthStartWeight, setStrengthStartWeight] = useState('')
  const [strengthEndWeight, setStrengthEndWeight] = useState('')
  const [strengthPercent, setStrengthPercent] = useState('')
  const [strengthBuildTarget, setStrengthBuildTarget] = useState('Heavy Single')

  const [movements, setMovements] = useState<MovementEntry[]>([])
  const [showMovementPicker, setShowMovementPicker] = useState(false)
  const [movementSearch, setMovementSearch] = useState('')

  // Store selected benchmark so we can update weights when RX/Scaled changes
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkWod | null>(null)

  // Share card data — set after save, cleared when user dismisses
  const [pendingShareData, setPendingShareData] = useState<ShareCardData | null>(null)

  // ── #2 Previous Result Auto-load ──
  const prevResults = useMemo((): Workout[] => {
    const nameToMatch = wodName.trim().toLowerCase()
    if (!nameToMatch || nameToMatch.length < 2) return []
    return workouts
      .filter(w => w.name.toLowerCase() === nameToMatch)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [wodName, workouts])

  // Also match strength movement for previous results
  const strengthPrevResults = useMemo((): Workout[] => {
    const nameToMatch = strengthMovement.trim().toLowerCase()
    if (!nameToMatch || nameToMatch.length < 2) return []
    return workouts
      .filter(w => {
        // Match by name or by strength_movement in loads
        if (w.name.toLowerCase() === nameToMatch) return true
        if (w.loads?.['strength_movement']?.toLowerCase() === nameToMatch) return true
        return false
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [strengthMovement, workouts])

  // Helper: extract weight from benchmark weight string based on unit
  const extractBenchmarkWeight = useCallback((weightStr: string, unit: 'kg' | 'lbs'): string => {
    // Format: "95 lb / 43 kg" or "135 lb / 61 kg"
    if (unit === 'lbs') {
      return weightStr.split('/')[0].trim().replace(' lb', '').replace('lb', '').trim()
    }
    return weightStr.split('/')[1]?.trim().replace(' kg', '').replace('kg', '').trim() || ''
  }, [])

  // Helper: get correct weights for current RX/Scaled level from a benchmark
  const getBenchmarkWeights = useCallback((wod: BenchmarkWod, level: RxScaled, unit: 'kg' | 'lbs'): string => {
    const weightSource = level === 'Scaled' ? wod.scaledWeights : wod.rxWeights
    // Use profile gender preference (default to male if not set or 'other'/'prefer_not_to_say')
    const genderKey = profile?.gender === 'female' ? 'female' : 'male'
    return extractBenchmarkWeight(weightSource[genderKey], unit)
  }, [extractBenchmarkWeight, profile?.gender])

  // ── #1 Benchmark WOD Auto-fill ──
  const selectBenchmarkWod = useCallback((wod: BenchmarkWod) => {
    setWodName(wod.name)
    setWodDescription(wod.description)
    setIsBenchmark(true)
    setShowBenchmarkPicker(false)
    setSelectedBenchmark(wod) // Store for RX/Scaled weight switching

    // Map scoreType to WodType
    const typeMap: Record<string, WodType> = {
      'time': 'ForTime',
      'rounds+reps': 'AMRAP',
      'reps': 'Other',
      'load': 'Other',
    }
    const mappedType = typeMap[wod.scoreType] || 'Other'
    setWodType(mappedType)

    // Set time cap if available
    if (wod.timeCapMinutes) {
      setTimeCap(String(wod.timeCapMinutes))
    }

    // Auto-add movements from the benchmark WOD with correct weights for current RX level
    const weight = getBenchmarkWeights(wod, rxScaled, weightUnit)
    const newMovements: MovementEntry[] = wod.movements.map(name => {
      return { name, weight: wod.movements.length === 1 ? weight : '', detail: wod.scheme }
    })
    setMovements(newMovements)
  }, [weightUnit, rxScaled, getBenchmarkWeights])

  // ── Update movement weights when RX/Scaled/Elite changes (only for benchmark WODs) ──
  useEffect(() => {
    if (!selectedBenchmark) return
    const weight = getBenchmarkWeights(selectedBenchmark, rxScaled, weightUnit)
    setMovements(prev => prev.map(m => ({
      ...m,
      weight: selectedBenchmark.movements.length === 1 ? weight : m.weight,
    })))
  }, [rxScaled, weightUnit, selectedBenchmark, getBenchmarkWeights])

  const loadWorkoutForEdit = useCallback((w: Workout) => {
    setEditingWorkoutId(w.id ?? null)

    // Determine class format from workoutType
    if (w.workoutType === 'Strength') {
      setClassFormat('strength_only')
    } else if (w.workoutType === 'StrengthMetcon') {
      setClassFormat('full')
    } else {
      setClassFormat('wod_only')
    }

    // WOD fields
    if (w.workoutType !== 'Strength') {
      const wt = w.workoutType as WodType
      if (['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Other'].includes(wt)) {
        setWodType(wt)
      }
    }
    setWodName(w.name || '')
    // Strip the "WOD: " prefix that was added during save — extract just the
    // WOD part from the stored description (handles both WOD-only and combined)
    const rawDesc = w.description || ''
    const wodLine = rawDesc.split('\n').find(l => l.startsWith('WOD: '))
    setWodDescription(wodLine ? wodLine.replace(/^WOD: /, '') : rawDesc)
    setRxScaled(w.rxOrScaled || 'RX')
    setPrFlag(w.prFlag || false)
    setIsBenchmark(w.isBenchmark || false)
    setWorkoutNotes(w.notes || '')

    // Parse score from scoreDisplay
    if (w.scoreDisplay) {
      const sd = w.scoreDisplay
      // Full class: "Str: 100lbs | WOD: 5+12"
      const wodPart = sd.includes('WOD: ') ? sd.split('WOD: ')[1] : sd
      // AMRAP: "5+12" or "5 rounds"
      const amrapMatch = wodPart.match(/^(\d+)\+(\d+)$/)
      if (amrapMatch) {
        setScoreRounds(amrapMatch[1])
        setScoreReps(amrapMatch[2])
      } else if (wodPart.includes(' rounds')) {
        setScoreRounds(wodPart.replace(' rounds', '').replace(' rounds completed', ''))
      }
      // ForTime: "12:30"
      const timeMatch = wodPart.match(/^(\d+):(\d{2})$/)
      if (timeMatch) {
        setScoreMin(timeMatch[1])
        setScoreSec(timeMatch[2])
      }
      // Tabata: "15 reps (lowest)"
      const tabMatch = wodPart.match(/^(\d+) reps/)
      if (tabMatch) setScoreReps(tabMatch[1])
    }

    // Loads → strength fields
    if (w.loads) {
      if (w.loads['strength_movement']) setStrengthMovement(w.loads['strength_movement'])
      if (w.loads['strength_start']) {
        const val = w.loads['strength_start'].replace(/[^\d.]/g, '')
        setStrengthStartWeight(val)
        setWeightUnit(w.loads['strength_start'].includes('kg') ? 'kg' : 'lbs')
      }
      if (w.loads['strength_end']) {
        const val = w.loads['strength_end'].replace(/[^\d.]/g, '')
        setStrengthEndWeight(val)
      }
      if (w.loads['strength_reps']) setStrengthRepScheme(w.loads['strength_reps'])
      if (w.loads['strength_percent']) setStrengthPercent(w.loads['strength_percent'])
      if (w.loads['strength_scheme']) {
        const scheme = w.loads['strength_scheme']
        if (scheme.startsWith('Build to')) {
          setStrengthSchemeType('build')
          setStrengthBuildTarget(scheme.replace('Build to ', ''))
        } else {
          setStrengthSchemeType('programmed')
        }
      }
      if (w.loads['time_cap']) setTimeCap(w.loads['time_cap'])

      // Rebuild movements from loads
      const movEntries: MovementEntry[] = []
      const skipKeys = ['strength_movement', 'strength_start', 'strength_end', 'strength_reps', 'strength_percent', 'strength_scheme', 'time_cap']
      const processed = new Set<string>()
      for (const [key, val] of Object.entries(w.loads)) {
        if (skipKeys.includes(key) || key.endsWith('_detail') || processed.has(key)) continue
        const detail = w.loads[`${key}_detail`] || ''
        const weight = val.replace(/[^\d.]/g, '')
        movEntries.push({ name: key, weight, detail })
        processed.add(key)
      }
      if (movEntries.length > 0) setMovements(movEntries)
    }

    setWorkoutStep(2)
  }, [])

  const handleDeleteWorkout = useCallback(async () => {
    if (editingWorkoutId) {
      await deleteWorkout(editingWorkoutId)
      setEditingWorkoutId(null)
      resetAll()
      onDone()
      onToast('Workout deleted', 'success')
    }
  }, [editingWorkoutId, deleteWorkout, onDone, onToast])

  const buildScoreDisplay = (): string => {
    if (classFormat === 'strength_only') {
      const end = strengthEndWeight || strengthStartWeight
      return end ? `${end} ${weightUnit}` : ''
    }
    if (wodType === 'AMRAP') {
      const r = parseInt(scoreRounds) || 0
      const rep = parseInt(scoreReps) || 0
      return rep > 0 ? `${r}+${rep}` : `${r} rounds`
    }
    if (wodType === 'ForTime' || wodType === 'Chipper') {
      const m = parseInt(scoreMin) || 0
      const s = parseInt(scoreSec) || 0
      return `${m}:${String(s).padStart(2, '0')}`
    }
    if (wodType === 'EMOM') return `${parseInt(scoreRounds) || 0} rounds completed`
    if (wodType === 'Tabata') return `${parseInt(scoreReps) || 0} reps (lowest)`
    return scoreRounds || ''
  }

  const buildStrengthSummary = (): string => {
    const parts: string[] = []
    if (strengthMovement) parts.push(strengthMovement)
    if (strengthSchemeType === 'programmed') {
      const intSec = parseInt(strengthInterval) || 120
      const intDisplay = intSec >= 60 ? `${Math.round(intSec / 60)}min` : `${intSec}s`
      parts.push(`E${intDisplay} × ${strengthSets}`)
      if (strengthRepScheme) parts.push(strengthRepScheme)
    } else {
      parts.push(`Build to ${strengthBuildTarget}`)
    }
    const sw = strengthStartWeight, ew = strengthEndWeight
    if (sw && ew) parts.push(`${sw}→${ew} ${weightUnit}`)
    else if (ew) parts.push(`${ew} ${weightUnit}`)
    if (strengthPercent) parts.push(`@${strengthPercent}%`)
    return parts.join(' — ')
  }

  const resetAll = () => {
    setEditingWorkoutId(null)
    setWorkoutStep(1); setWodName(''); setWodDescription('')
    setScoreMin(''); setScoreSec(''); setScoreRounds(''); setScoreReps('')
    setMovements([]); setTimeCap(''); setWorkoutNotes(''); setPrFlag(false); setIsBenchmark(false)
    setStrengthMovement(''); setStrengthStartWeight(''); setStrengthEndWeight('')
    setStrengthRepScheme(''); setStrengthPercent(''); setShowBenchmarkPicker(false)
    setWeightUnit('lbs'); setStrengthSchemeType('programmed'); setStrengthInterval('120'); setStrengthSets('5')
    setStrengthBuildTarget('Heavy Single'); setWodType('AMRAP'); setRxScaled('RX'); setClassFormat('full')
    setMovementSearch(''); setShowMovementPicker(false); setSelectedBenchmark(null)
  }

  const handleSaveWorkout = async () => {
    const hasStrength = classFormat === 'full' || classFormat === 'strength_only'
    const hasWod = classFormat === 'full' || classFormat === 'wod_only'

    if (hasWod && !wodName && !strengthMovement) {
      onToast('Enter a workout name or movement', 'error'); return
    }
    if (!hasWod && !strengthMovement) {
      onToast('Enter a strength movement', 'error'); return
    }

    const scoreDisplay = buildScoreDisplay()
    const strengthSummary = hasStrength ? buildStrengthSummary() : ''
    const movementNames = movements.map(m => m.name)
    if (hasStrength && strengthMovement) movementNames.unshift(strengthMovement)

    const loads: Record<string, string> = {}
    if (hasStrength) {
      if (strengthMovement) loads['strength_movement'] = strengthMovement
      if (strengthStartWeight) loads['strength_start'] = `${strengthStartWeight} ${weightUnit}`
      if (strengthEndWeight) loads['strength_end'] = `${strengthEndWeight} ${weightUnit}`
      if (strengthRepScheme) loads['strength_reps'] = strengthRepScheme
      if (strengthPercent) loads['strength_percent'] = strengthPercent
      const intSec = parseInt(strengthInterval) || 120
      loads['strength_scheme'] = strengthSchemeType === 'programmed'
        ? `Every ${intSec >= 60 ? `${Math.round(intSec / 60)}min` : `${intSec}s`} × ${strengthSets}`
        : `Build to ${strengthBuildTarget}`
    }
    movements.forEach(m => {
      if (m.weight) loads[m.name] = `${m.weight} ${weightUnit}`
      if (m.detail) loads[`${m.name}_detail`] = m.detail
    })
    if (timeCap) loads['time_cap'] = timeCap

    const workoutType: WodType = classFormat === 'strength_only' ? 'Strength'
      : classFormat === 'full' ? 'StrengthMetcon' : wodType
    const name = hasWod ? (wodName || strengthMovement || 'Workout')
      : (strengthMovement || 'Strength')

    const descParts: string[] = []
    if (hasStrength && strengthSummary) descParts.push(`Strength: ${strengthSummary}`)
    if (hasWod && wodDescription) descParts.push(`WOD: ${wodDescription}`)
    const description = descParts.join('\n') || undefined

    let fullScore = ''
    if (hasStrength && hasWod) {
      const strWeight = strengthEndWeight || strengthStartWeight
      if (strWeight) fullScore += `Str: ${strWeight}${weightUnit}`
      if (scoreDisplay) fullScore += (fullScore ? ' | ' : '') + `WOD: ${scoreDisplay}`
    } else {
      fullScore = scoreDisplay
    }

    let dur: number | undefined
    if (hasWod && (wodType === 'ForTime' || wodType === 'Chipper')) {
      const m = parseInt(scoreMin) || 0
      const s = parseInt(scoreSec) || 0
      if (m || s) dur = m + (s > 0 ? 1 : 0)
    }
    if (!dur && timeCap) dur = parseInt(timeCap) || undefined

    // PR auto-detection
    const scoreVal = parseFloat(strengthEndWeight || scoreRounds || scoreMin || '0') || undefined
    const unit = classFormat === 'strength_only' ? 'load' : wodType === 'AMRAP' ? 'rounds' : wodType === 'ForTime' ? 'time' : 'reps'
    let autoPR = prFlag
    if (!prFlag && scoreVal && name.trim()) {
      const prev = workouts.filter(w => w.name.toLowerCase() === name.toLowerCase() && w.scoreValue)
      if (prev.length > 0) {
        const bestPrev = prev.reduce((best, w) => {
          if (!w.scoreValue) return best
          if (unit === 'time') return w.scoreValue < best ? w.scoreValue : best
          return w.scoreValue > best ? w.scoreValue : best
        }, unit === 'time' ? Infinity : 0)
        if (unit === 'time' && scoreVal < bestPrev) autoPR = true
        else if (unit !== 'time' && scoreVal > bestPrev) autoPR = true
      }
    }

    await saveWorkout({
      ...(editingWorkoutId ? { id: editingWorkoutId } : {}),
      date: today(), workoutType, name, description,
      scoreDisplay: fullScore, scoreValue: scoreVal, scoreUnit: unit,
      rxOrScaled: rxScaled, prFlag: autoPR, isBenchmark,
      duration: dur,
      movements: movementNames.length > 0 ? movementNames : undefined,
      loads: Object.keys(loads).length > 0 ? loads : undefined,
      notes: workoutNotes || undefined,
    } as any)

    const savedName = name
    const wasEditing = !!editingWorkoutId

    // Trigger auto PR detection (for all workout types: strength, WOD, full class)
    if (onPRsDetected && !wasEditing) {
      onPRsDetected({
        name, workoutType, scoreDisplay: fullScore, scoreValue: scoreVal, scoreUnit: unit,
        isBenchmark, rxOrScaled: rxScaled,
        loads: Object.keys(loads).length > 0 ? loads : undefined,
        movements: movementNames.length > 0 ? movementNames : undefined,
        strengthMovement: hasStrength ? strengthMovement : undefined,
        strengthEndWeight: hasStrength ? strengthEndWeight : undefined,
        strengthBuildTarget: hasStrength ? strengthBuildTarget : undefined,
        strengthRepScheme: hasStrength ? strengthRepScheme : undefined,
        weightUnit,
      })
    }

    // For new workouts (not edits), show share card instead of closing
    if (!wasEditing && hasWod) {
      const isStrength = workoutType === 'Strength' || workoutType === 'StrengthMetcon'
      const categoryType = isStrength ? 'strength' as const : 'wod' as const
      const categoryLabel = isStrength ? 'STRENGTH' : isBenchmark ? 'BENCHMARK WOD' : 'WOD'
      // Build workoutLines for share card (movement names + weights)
      const shareLines: string[] = []
      if (wodDescription) {
        shareLines.push(...wodDescription.split('\n').filter((l: string) => l.trim()))
      }
      // Add movement details if description doesn't cover it
      if (shareLines.length === 0 && movements.length > 0) {
        movements.forEach(m => {
          const parts = [m.name]
          if (m.weight) parts.push(`${m.weight} ${weightUnit}`)
          if (m.detail) parts.push(`(${m.detail})`)
          shareLines.push(parts.join(' — '))
        })
      }

      setPendingShareData({
        title: name,
        category: categoryLabel,
        categoryType,
        wodType: workoutType as import('../types').WodType,
        scoreDisplay: fullScore || '—',
        rxOrScaled: rxScaled,
        prFlag: autoPR,
        date: today(),
        description: wodDescription || undefined,
        workoutLines: shareLines.length > 0 ? shareLines : undefined,
        timeCapSeconds: timeCap ? parseInt(timeCap) * 60 : undefined,
      })
    }

    resetAll()
    loadWorkouts()
    onToast(`${savedName} ${wasEditing ? 'updated' : 'logged'}!`, 'success')

    // For edits or strength-only, close immediately
    if (wasEditing || !hasWod) {
      onDone()
    }
  }

  const addMovement = (name: string) => {
    setMovements(prev => [...prev, { name, weight: '', detail: '' }])
    setShowMovementPicker(false)
    setMovementSearch('')
  }

  const updateMovement = (idx: number, field: keyof MovementEntry, value: string) => {
    setMovements(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const removeMovement = (idx: number) => {
    setMovements(prev => prev.filter((_, i) => i !== idx))
  }

  // Fill form fields from WOD scan result
  const fillFromScan = useCallback((data: {
    wodName: string | null; wodType: string; description: string;
    movements: string[]; timeCapMinutes: number | null; isBenchmark: boolean
  }) => {
    if (data.wodName) setWodName(data.wodName)
    setWodDescription(data.description || '')
    const typeMap: Record<string, WodType> = {
      'ForTime': 'ForTime', 'AMRAP': 'AMRAP', 'EMOM': 'EMOM',
      'Tabata': 'Tabata', 'Chipper': 'Chipper', 'Other': 'Other',
    }
    setWodType(typeMap[data.wodType] || 'ForTime')
    if (data.timeCapMinutes) setTimeCap(String(data.timeCapMinutes))
    setIsBenchmark(data.isBenchmark)
    if (data.movements.length > 0) {
      setMovements(data.movements.map(name => ({ name, weight: '', detail: '' })))
    }
    setWorkoutStep(2) // Go to details form
  }, [])

  return {
    // State
    classFormat, workoutStep, wodType, wodName, wodDescription, rxScaled, prFlag,
    isBenchmark, workoutNotes, weightUnit,
    scoreMin, scoreSec, scoreRounds, scoreReps, timeCap,
    strengthMovement, strengthSchemeType, strengthInterval, strengthSets,
    strengthRepScheme, strengthStartWeight, strengthEndWeight, strengthPercent, strengthBuildTarget,
    movements, showMovementPicker, movementSearch, workouts,
    showBenchmarkPicker, prevResults, strengthPrevResults, editingWorkoutId,
    // Setters
    setClassFormat, setWorkoutStep, setWodType, setWodName, setWodDescription,
    setRxScaled, setPrFlag, setIsBenchmark, setWorkoutNotes, setWeightUnit,
    setScoreMin, setScoreSec, setScoreRounds, setScoreReps, setTimeCap,
    setStrengthMovement, setStrengthSchemeType, setStrengthInterval, setStrengthSets,
    setStrengthRepScheme, setStrengthStartWeight, setStrengthEndWeight,
    setStrengthPercent, setStrengthBuildTarget,
    setMovements, setShowMovementPicker, setMovementSearch,
    setShowBenchmarkPicker,
    // Actions
    handleSaveWorkout, handleDeleteWorkout, addMovement, updateMovement, removeMovement, resetAll,
    selectBenchmarkWod, loadWorkoutForEdit, fillFromScan,
    pendingShareData, clearShareData: () => setPendingShareData(null),
  }
}
