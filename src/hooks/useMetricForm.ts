import { useState } from 'react'
import { useStore } from '../stores/useStore'

export function useMetricForm(
  onToast: (msg: string, type: 'success' | 'error') => void,
  onDone: () => void,
) {
  const { saveDailyLog, loadTodayLog } = useStore()

  const [metricValue, setMetricValue] = useState('')

  // Recovery state
  const [readiness, setReadiness] = useState('')
  const [rpe, setRpe] = useState('')
  const [sorenessUpper, setSorenessUpper] = useState('')
  const [sorenessLower, setSorenessLower] = useState('')
  const [restingHR, setRestingHR] = useState('')

  const handleSaveMetric = async (type: string) => {
    const val = parseFloat(metricValue)
    if (isNaN(val) || val <= 0) { onToast('Enter a valid number', 'error'); return }
    if (type === 'energy' && (val < 1 || val > 5)) { onToast('Energy must be 1-5', 'error'); return }
    if (type === 'sleep' && (val < 0.5 || val > 24)) { onToast('Sleep must be 0.5-24 hours', 'error'); return }
    if (type === 'weight' && (val < 20 || val > 300)) { onToast('Weight must be 20-300 kg', 'error'); return }
    if (type === 'water' && (val < 50 || val > 10000)) { onToast('Water must be 50-10,000 ml', 'error'); return }
    const update: Record<string, any> = {}
    if (type === 'weight') update.weightKg = val
    if (type === 'sleep') update.sleepHours = val
    if (type === 'water') update.waterMl = val
    if (type === 'energy') update.energy = Math.min(5, Math.max(1, Math.round(val)))
    await saveDailyLog(update)
    setMetricValue(''); onDone(); loadTodayLog()
    const labels: Record<string, string> = { weight: 'Weight', sleep: 'Sleep', water: 'Water', energy: 'Energy' }
    onToast(`${labels[type] || type} saved!`, 'success')
  }

  const handleSaveRecovery = async () => {
    if (!readiness && !rpe && !sorenessUpper && !sorenessLower && !restingHR) {
      onToast('Enter at least one recovery metric', 'error'); return
    }
    const r = parseInt(readiness), rpeVal = parseInt(rpe), su = parseInt(sorenessUpper), sl = parseInt(sorenessLower), hr = parseInt(restingHR)
    if (readiness && (r < 1 || r > 10)) { onToast('Readiness must be 1-10', 'error'); return }
    if (rpe && (rpeVal < 1 || rpeVal > 10)) { onToast('RPE must be 1-10', 'error'); return }
    if (sorenessUpper && (su < 0 || su > 5)) { onToast('Soreness must be 0-5', 'error'); return }
    if (sorenessLower && (sl < 0 || sl > 5)) { onToast('Soreness must be 0-5', 'error'); return }
    if (restingHR && (hr < 30 || hr > 220)) { onToast('Resting HR must be 30-220 bpm', 'error'); return }
    const update: Record<string, any> = {}
    if (readiness) update.readinessScore = r
    if (rpe) update.rpe = rpeVal
    if (sorenessUpper) update.sorenessUpper = su
    if (sorenessLower) update.sorenessLower = sl
    if (restingHR) update.restingHR = hr
    await saveDailyLog(update)
    onDone(); loadTodayLog()
    onToast('Recovery logged!', 'success')
  }

  return {
    metricValue, setMetricValue,
    readiness, rpe, sorenessUpper, sorenessLower, restingHR,
    setReadiness, setRpe, setSorenessUpper, setSorenessLower, setRestingHR,
    handleSaveMetric, handleSaveRecovery,
  }
}
