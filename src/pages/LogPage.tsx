import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { today } from '../utils/macros'
import { useWorkoutForm } from '../hooks/useWorkoutForm'
import { useMealForm } from '../hooks/useMealForm'
import { useMetricForm } from '../hooks/useMetricForm'
import { useAchievementCheck } from '../hooks/useAchievementCheck'
import { LogModeSelector } from '../components/log/LogModeSelector'
import { MealLogger } from '../components/log/MealLogger'
import { MetricLogger } from '../components/log/MetricLogger'
import { RecoveryLogger } from '../components/log/RecoveryLogger'
import { useCycleTracking } from '../hooks/useCycleTracking'
import { WaterTracker } from '../components/log/WaterTracker'
import { SaveToast } from '../components/SaveToast'
import { AchievementToast } from '../components/AchievementToast'
import { PRToast } from '../components/PRToast'
import type { PRInfo } from '../components/PRToast'
import { usePRDetection } from '../hooks/usePRDetection'
import type { Achievement } from '../data/achievements'
import type { FoodItem } from '../types'
import { Loader2 } from 'lucide-react'

// Lazy-load heavy components — WorkoutLogger alone is ~200KB
const WorkoutLogger = lazy(() => import('../components/log/WorkoutLogger').then(m => ({ default: m.WorkoutLogger })))
const HyroxLogger = lazy(() => import('../components/log/HyroxLogger').then(m => ({ default: m.HyroxLogger })))
const CardioLogger = lazy(() => import('../components/log/CardioLogger').then(m => ({ default: m.CardioLogger })))
const BarcodeScanner = lazy(() => import('../components/log/BarcodeScanner').then(m => ({ default: m.BarcodeScanner })))
const CustomFoodCreator = lazy(() => import('../components/log/CustomFoodCreator').then(m => ({ default: m.CustomFoodCreator })))
const EventLogger = lazy(() => import('../components/log/EventLogger').then(m => ({ default: m.EventLogger })))
const ShareCardExporter = lazy(() => import('../components/sharecard/ShareCardExporter').then(m => ({ default: m.ShareCardExporter })))
const WodScanner = lazy(() => import('../components/log/WodScanner').then(m => ({ default: m.WodScanner })))
const WodScanReview = lazy(() => import('../components/log/WodScanReview').then(m => ({ default: m.WodScanReview })))
const CycleLogger = lazy(() => import('../components/log/CycleLogger').then(m => ({ default: m.CycleLogger })))
const CycleOnboarding = lazy(() => import('../components/log/CycleOnboarding').then(m => ({ default: m.CycleOnboarding })))

import type { WodScanResult } from '../components/log/WodScanner'

type LogMode = null | 'workout' | 'hyrox' | 'running' | 'events' | 'meal' | 'weight' | 'sleep' | 'water' | 'energy' | 'recovery' | 'cycle' | 'scanner' | 'customfood' | 'wodScan' | 'wodScanReview'

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="text-cyan-400 animate-spin" />
    </div>
  )
}

export function LogPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<LogMode>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([])
  const [prQueue, setPrQueue] = useState<PRInfo[]>([])
  const { isLoading, templates, loadFoods, loadTemplates, loadTodayLog, loadTodayMeals, loadProfile, loadRecentFoods, loadWorkouts, loadAllDailyLogs, loadMovementPRs, saveWorkout, addMealFromTemplate, saveCustomFood, saveDailyLog, todayLog, profile } = useStore()
  const { checkNewAchievements } = useAchievementCheck()
  const { detectPRs, getCurrentPR } = usePRDetection()
  const [wodScanResult, setWodScanResult] = useState<WodScanResult | null>(null)

  const triggerAchievementCheck = useCallback(() => {
    // Small delay to let store update
    setTimeout(() => {
      const newOnes = checkNewAchievements()
      if (newOnes.length > 0) setAchievementQueue(prev => [...prev, ...newOnes])
    }, 500)
  }, [checkNewAchievements])

  const onToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    triggerAchievementCheck()
  }
  const closeDone = () => setMode(null)

  useEffect(() => { Promise.allSettled([loadFoods(), loadTemplates(), loadTodayLog(), loadTodayMeals(), loadProfile(), loadRecentFoods(), loadWorkouts(), loadAllDailyLogs(), loadMovementPRs()]) }, [])

  const handleCrossFitPR = useCallback(async (data: import('../hooks/useWorkoutForm').PRDetectionData) => {
    const prs = await detectPRs(data)
    if (prs.length > 0) setPrQueue(prev => [...prev, ...prs])
  }, [detectPRs])

  const workout = useWorkoutForm(onToast, closeDone, handleCrossFitPR)

  // Compute inline PR for strength movement input
  const strengthCurrentPR = (() => {
    if (!workout.strengthMovement || workout.strengthMovement.trim().length < 2) return null
    const pr = getCurrentPR(workout.strengthMovement, '1rm')
      || getCurrentPR(workout.strengthMovement, '3rm')
      || getCurrentPR(workout.strengthMovement, '5rm')
    if (!pr) return null
    return { value: pr.value, unit: pr.unit, prType: pr.prType }
  })()

  const cycle = useCycleTracking()
  const meal = useMealForm(onToast)
  const metric = useMetricForm(onToast, closeDone)

  const toastEl = toast ? <SaveToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} /> : null
  const achievementEl = achievementQueue.length > 0 ? (
    <AchievementToast key={achievementQueue[0].id} achievement={achievementQueue[0]} onDone={() => setAchievementQueue(q => q.slice(1))} />
  ) : null
  const prToastEl = prQueue.length > 0 ? (
    <PRToast key={`pr-${prQueue[0].movementName}-${prQueue[0].newValue}`} pr={prQueue[0]} onDone={() => setPrQueue(q => q.slice(1))} />
  ) : null

  // ---- Barcode Scanner ----
  if (mode === 'scanner') {
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<BarcodeScanner
          t={t}
          onFoodFound={async (food: FoodItem) => {
            try {
              const saved = await saveCustomFood(food)
              onToast(`${food.name} added to library!`, 'success')
              meal.handleSelectFood(saved)
              setMode('meal')
            } catch { onToast('Failed to save food', 'error') }
          }}
          onClose={() => setMode('meal')}
        />
      </Suspense>
    )
  }

  // ---- Custom Food Creator ----
  if (mode === 'customfood') {
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<CustomFoodCreator
          t={t}
          onSave={async (food: FoodItem) => {
            try {
              const saved = await saveCustomFood(food)
              onToast(`${food.name} created!`, 'success')
              meal.handleSelectFood(saved)
              setMode('meal')
            } catch { onToast('Failed to save food', 'error') }
          }}
          onClose={() => setMode('meal')}
        />
      </Suspense>
    )
  }

  // ---- Mode selector ----
  if (!mode) {
    return (
      <>{toastEl}{achievementEl}{prToastEl}<LogModeSelector
        t={t}
        templates={templates}
        onSelectMode={(m) => { setMode(m); metric.setMetricValue(''); workout.resetAll() }}
        onAddFromTemplate={addMealFromTemplate}
      /></>
    )
  }

  // ---- HYROX ----
  if (mode === 'hyrox') {
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<HyroxLogger
          onSave={async (data) => {
            const scoreDisplay = `${data.totalTimeMin}:${String(data.totalTimeSec).padStart(2, '0')}`
            const scoreValue = data.totalTimeMin * 60 + data.totalTimeSec
            await saveWorkout({
              date: today(), workoutType: 'HYROX', name: 'HYROX',
              description: `${data.rxScaled === 'RX' ? 'Open' : data.rxScaled === 'Elite' ? 'Pro' : 'Doubles'} division`,
              scoreDisplay, scoreValue, scoreUnit: 'time',
              rxOrScaled: data.rxScaled, prFlag: data.prFlag, isBenchmark: true,
              duration: data.totalTimeMin,
              hyroxStations: data.stations.length > 0 ? data.stations : undefined,
              notes: data.notes || undefined,
            } as any)
            const prs = await detectPRs({
              name: 'HYROX', workoutType: 'HYROX', scoreDisplay, scoreValue, scoreUnit: 'time',
              isBenchmark: true, rxOrScaled: data.rxScaled,
            })
            if (prs.length > 0) setPrQueue(prev => [...prev, ...prs])
            setMode(null); loadWorkouts()
            onToast(`HYROX ${scoreDisplay} logged!${prs.length > 0 ? ' PR!' : ''}`, 'success')
          }}
          onClose={closeDone}
        />
      </Suspense>
    )
  }

  // ---- Cardio ----
  if (mode === 'running') {
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<CardioLogger
          onSave={async (data) => {
            const scoreDisplay = `${data.distanceValue}${data.distanceUnit} in ${data.durationMin}:${String(data.durationSec).padStart(2, '0')}`
            const cardioLabels: Record<string, string> = { run: 'Run', row: 'Row', bike: 'Bike', ski: 'SkiErg', swim: 'Swim', hike: 'Hike' }
            const label = cardioLabels[data.cardioType] || 'Cardio'
            const workoutName = `${label} — ${data.distanceValue}${data.distanceUnit}`
            const scoreValue = data.durationMin * 60 + data.durationSec
            const workoutType = data.cardioType === 'run' ? 'Running' : 'Cardio'
            await saveWorkout({
              date: today(), workoutType,
              name: workoutName,
              description: data.paceDisplay ? `Pace: ${data.paceDisplay}` : undefined,
              scoreDisplay, scoreValue, scoreUnit: 'time',
              rxOrScaled: 'RX', prFlag: data.prFlag, isBenchmark: false, duration: data.durationMin,
              cardioType: data.cardioType, distanceValue: data.distanceValue,
              distanceUnit: data.distanceUnit, paceDisplay: data.paceDisplay,
              splits: data.splits.length > 0 ? data.splits : undefined,
              elevationGain: data.elevationGain, notes: data.notes || undefined,
            } as any)
            const prs = await detectPRs({
              name: workoutName, workoutType, scoreDisplay, scoreValue, scoreUnit: 'time',
              isBenchmark: false, rxOrScaled: 'RX',
              cardioType: data.cardioType, distanceValue: data.distanceValue, distanceUnit: data.distanceUnit,
            })
            if (prs.length > 0) setPrQueue(prev => [...prev, ...prs])
            setMode(null); loadWorkouts()
            onToast(`${label} ${data.distanceValue}${data.distanceUnit} logged!${prs.length > 0 ? ' PR!' : ''}`, 'success')
          }}
          onClose={closeDone}
        />
      </Suspense>
    )
  }

  // ---- Cycle Tracking ----
  if (mode === 'cycle') {
    if (!cycle.settings) {
      return (
        <Suspense fallback={<LazyFallback />}>
          {toastEl}{achievementEl}{prToastEl}<CycleOnboarding
            onComplete={async (data) => {
              await cycle.saveCycleSettings({
                enabled: true,
                lastPeriodStart: data.lastPeriodStart,
                averageCycleLength: data.averageCycleLength,
                averagePeriodLength: data.averagePeriodLength,
                contraceptionType: data.contraceptionType,
                isPregnant: data.isPregnant,
                isTryingToConceive: data.isTryingToConceive,
              })
              onToast('Cycle tracking enabled!', 'success')
            }}
            onSkip={closeDone}
          />
        </Suspense>
      )
    }
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<CycleLogger
          currentPhase={cycle.currentPhase}
          cycleDay={cycle.cycleDay}
          daysUntilPeriod={cycle.daysUntilPeriod}
          todayLog={cycle.todayLog}
          trainingRec={cycle.trainingRec}
          phaseColor={cycle.phaseColor}
          onSave={async (logData) => {
            await cycle.saveCycleLog(logData)
            onToast('Cycle log saved!', 'success')
            closeDone()
          }}
          onOpenCalendar={() => {/* TODO: calendar overlay */}}
          onClose={closeDone}
        />
      </Suspense>
    )
  }

  // ---- Recovery ----
  if (mode === 'recovery') {
    return (
      <>{toastEl}{achievementEl}{prToastEl}<RecoveryLogger
        readiness={metric.readiness} rpe={metric.rpe}
        sorenessUpper={metric.sorenessUpper} sorenessLower={metric.sorenessLower}
        restingHR={metric.restingHR}
        onReadinessChange={metric.setReadiness} onRpeChange={metric.setRpe}
        onSorenessUpperChange={metric.setSorenessUpper}
        onSorenessLowerChange={metric.setSorenessLower}
        onRestingHRChange={metric.setRestingHR}
        onSave={metric.handleSaveRecovery}
        onClose={closeDone}
      /></>
    )
  }

  // ---- WOD Scanner ----
  if (mode === 'wodScan') {
    return (
      <Suspense fallback={<LazyFallback />}>
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-tab-bar">
          {toastEl}{achievementEl}{prToastEl}
          <WodScanner
            onScanComplete={(result) => {
              setWodScanResult(result)
              setMode('wodScanReview')
            }}
            onClose={() => setMode('workout')}
          />
        </div>
      </Suspense>
    )
  }

  // ---- WOD Scan Review ----
  if (mode === 'wodScanReview' && wodScanResult) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-tab-bar">
          {toastEl}{achievementEl}{prToastEl}
          <WodScanReview
            result={wodScanResult}
            onConfirm={(edited) => {
              workout.fillFromScan({
                wodName: edited.wodName,
                wodType: edited.wodType,
                description: edited.description,
                movements: edited.movements,
                timeCapMinutes: edited.timeCapMinutes,
                isBenchmark: edited.isBenchmark,
              })
              workout.setClassFormat('wod_only')
              setWodScanResult(null)
              setMode('workout')
            }}
            onRetry={() => {
              setWodScanResult(null)
              setMode('wodScan')
            }}
            onCancel={() => {
              setWodScanResult(null)
              setMode('workout')
            }}
          />
        </div>
      </Suspense>
    )
  }

  // ---- CrossFit Events ----
  if (mode === 'events') {
    return (
      <Suspense fallback={<LazyFallback />}>
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-tab-bar">
          {toastEl}{achievementEl}{prToastEl}
          <EventLogger
            onDone={() => { closeDone(); triggerAchievementCheck() }}
            onToast={onToast}
          />
        </div>
      </Suspense>
    )
  }

  // ---- Meal ----
  if (mode === 'meal') {
    if (isLoading) {
      return (
        <>{toastEl}{achievementEl}{prToastEl}<LazyFallback /></>
      )
    }
    return (
      <>{toastEl}{achievementEl}{prToastEl}<MealLogger
        t={t}
        mealType={meal.mealType} selectedFood={meal.selectedFood} grams={meal.grams}
        foodSearch={meal.foodSearch} showAllFoods={meal.showAllFoods}
        foods={meal.foods} recentFoods={meal.recentFoods} macros={meal.macros}
        mealsForType={meal.mealsForType} mealsForTypeMacros={meal.mealsForTypeMacros}
        targets={meal.targets} todayMacros={meal.todayMacros} goalName={meal.goalName}
        onMealTypeChange={meal.setMealType}
        onSelectFood={meal.handleSelectFood}
        onDeselectFood={() => { meal.setSelectedFood(null); meal.setGrams('') }}
        onGramsChange={meal.setGrams}
        onFoodSearchChange={(v) => { meal.setFoodSearch(v); meal.setShowAllFoods(false) }}
        onShowAllFoodsChange={meal.setShowAllFoods}
        onSaveMeal={meal.handleSaveMeal}
        onDeleteMeal={meal.handleDeleteMeal}
        onClose={() => { setMode(null); meal.resetMeal() }}
        onOpenScanner={() => setMode('scanner')}
        onOpenCustomFood={() => setMode('customfood')}
        gramsRef={meal.gramsRef} searchRef={meal.searchRef}
        apiResults={meal.apiResults} apiSearching={meal.apiSearching}
        onSelectApiResult={meal.handleSelectApiResult}
        savingMeal={meal.savingMeal}
      /></>
    )
  }

  // ---- Workout Share Card (after save) ----
  if (mode === 'workout' && workout.pendingShareData) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-tab-bar">
          {toastEl}{achievementEl}{prToastEl}
          <ShareCardExporter
            data={workout.pendingShareData}
            onClose={() => { workout.clearShareData(); closeDone() }}
            onToast={onToast}
          />
        </div>
      </Suspense>
    )
  }

  // ---- Workout ----
  if (mode === 'workout') {
    return (
      <Suspense fallback={<LazyFallback />}>
        {toastEl}{achievementEl}{prToastEl}<WorkoutLogger
          t={t}
          classFormat={workout.classFormat} workoutStep={workout.workoutStep}
          wodType={workout.wodType} wodName={workout.wodName} wodDescription={workout.wodDescription}
          rxScaled={workout.rxScaled} prFlag={workout.prFlag} isBenchmark={workout.isBenchmark}
          workoutNotes={workout.workoutNotes} weightUnit={workout.weightUnit}
          strengthMovement={workout.strengthMovement} strengthSchemeType={workout.strengthSchemeType}
          strengthInterval={workout.strengthInterval} strengthSets={workout.strengthSets}
          strengthRepScheme={workout.strengthRepScheme}
          strengthStartWeight={workout.strengthStartWeight} strengthEndWeight={workout.strengthEndWeight}
          strengthPercent={workout.strengthPercent} strengthBuildTarget={workout.strengthBuildTarget}
          scoreMin={workout.scoreMin} scoreSec={workout.scoreSec}
          scoreRounds={workout.scoreRounds} scoreReps={workout.scoreReps}
          timeCap={workout.timeCap}
          movements={workout.movements} showMovementPicker={workout.showMovementPicker}
          movementSearch={workout.movementSearch} workouts={workout.workouts}
          prevResults={workout.prevResults} strengthPrevResults={workout.strengthPrevResults}
          showBenchmarkPicker={workout.showBenchmarkPicker}
          editingWorkoutId={workout.editingWorkoutId}
          strengthCurrentPR={strengthCurrentPR}
          onLoadWorkoutForEdit={workout.loadWorkoutForEdit}
          onDeleteWorkout={workout.handleDeleteWorkout}
          onClassFormatChange={workout.setClassFormat} onWorkoutStepChange={workout.setWorkoutStep}
          onWodTypeChange={workout.setWodType} onWodNameChange={workout.setWodName}
          onWodDescriptionChange={workout.setWodDescription}
          onRxScaledChange={workout.setRxScaled} onPrFlagChange={workout.setPrFlag}
          onIsBenchmarkChange={workout.setIsBenchmark}
          onWorkoutNotesChange={workout.setWorkoutNotes} onWeightUnitChange={workout.setWeightUnit}
          onStrengthMovementChange={workout.setStrengthMovement}
          onStrengthSchemeTypeChange={workout.setStrengthSchemeType}
          onStrengthIntervalChange={workout.setStrengthInterval}
          onStrengthSetsChange={workout.setStrengthSets}
          onStrengthRepSchemeChange={workout.setStrengthRepScheme}
          onStrengthStartWeightChange={workout.setStrengthStartWeight}
          onStrengthEndWeightChange={workout.setStrengthEndWeight}
          onStrengthPercentChange={workout.setStrengthPercent}
          onStrengthBuildTargetChange={workout.setStrengthBuildTarget}
          onScoreMinChange={workout.setScoreMin} onScoreSecChange={workout.setScoreSec}
          onScoreRoundsChange={workout.setScoreRounds} onScoreRepsChange={workout.setScoreReps}
          onTimeCapChange={workout.setTimeCap}
          onAddMovement={workout.addMovement} onUpdateMovement={workout.updateMovement}
          onRemoveMovement={workout.removeMovement}
          onShowMovementPickerChange={workout.setShowMovementPicker}
          onMovementSearchChange={workout.setMovementSearch}
          onShowBenchmarkPickerChange={workout.setShowBenchmarkPicker}
          onSelectBenchmarkWod={workout.selectBenchmarkWod}
          onSaveWorkout={workout.handleSaveWorkout}
          onClose={closeDone}
          onSwitchToEvents={() => setMode('events')}
          onScanWod={() => setMode('wodScan')}
        />
      </Suspense>
    )
  }

  // ---- Water (new glass-based tracker) ----
  if (mode === 'water') {
    return (
      <>{toastEl}{achievementEl}{prToastEl}<WaterTracker
        t={t}
        currentWaterMl={todayLog?.waterMl || 0}
        waterTarget={profile?.waterTarget || 2500}
        onSave={async (totalMl) => {
          await saveDailyLog({ waterMl: totalMl })
          loadTodayLog()
          onToast(t('water.saved'), 'success')
          triggerAchievementCheck()
          closeDone()
        }}
        onClose={closeDone}
      /></>
    )
  }

  // ---- Metric (weight/sleep/energy) ----
  const metricLabels: Record<string, { label: string; placeholder: string; unit: string; quickValues?: number[] }> = {
    weight: { label: t('log.weightLog'), placeholder: 'e.g. 72.1', unit: 'kg' },
    sleep: { label: t('log.sleepLog'), placeholder: 'e.g. 7.5', unit: 'hrs', quickValues: [5, 6, 6.5, 7, 7.5, 8, 9] },
    energy: { label: t('log.energyLog'), placeholder: '1-5', unit: '/ 5', quickValues: [1, 2, 3, 4, 5] },
  }
  const meta = metricLabels[mode] || metricLabels.weight

  return (
    <>{toastEl}{achievementEl}{prToastEl}<MetricLogger
      metricValue={metric.metricValue}
      metricConfig={meta}
      onMetricValueChange={metric.setMetricValue}
      onSave={() => metric.handleSaveMetric(mode)}
      onClose={closeDone}
    /></>
  )
}
