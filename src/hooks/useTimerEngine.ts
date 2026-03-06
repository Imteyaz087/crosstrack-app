import { useState, useEffect, useRef } from 'react'
import type { TimerMode } from '../types'
import { useTimerAudio } from './useTimerAudio'
import { useTimerVoice } from './useTimerVoice'

export type TimerPhase = 'idle' | 'countdown' | 'work' | 'rest' | 'done'

export interface TimerConfig {
  mode: TimerMode
  workMin: number
  workSec: number
  restMin: number
  restSec: number
  sets: number
  hasRest: boolean
  emomInterval: number
  tabataWork: number
  tabataRest: number
  tabataRounds: number
}

export function useTimerEngine(config: TimerConfig) {
  const { mode, workMin, workSec, restMin, restSec, sets, hasRest, emomInterval, tabataWork, tabataRest, tabataRounds } = config
  const { beepCountdown, beepGo, beepRest, beepDone } = useTimerAudio()
  const voice = useTimerVoice()

  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)
  const [currentRound, setCurrentRound] = useState(1)
  const [countdownVal, setCountdownVal] = useState(10)
  const intervalRef = useRef<number>(0)

  const totalWorkSeconds = workMin * 60 + workSec
  const totalRestSeconds = restMin * 60 + restSec
  const emomTotalRounds = mode === 'emom' ? Math.floor(totalWorkSeconds / (emomInterval * 60)) : 1

  const startTimer = () => {
    setPhase('countdown')
    setCountdownVal(10)
    setCurrentSet(1)
    setCurrentRound(1)
    setIsRunning(true)
    voice.speakGetReady()
  }

  const reset = () => {
    setIsRunning(false)
    setPhase('idle')
    setCurrentSet(1)
    setCurrentRound(1)
    setRemaining(0)
  }

  // 10-second Ready Countdown with voice at 5-4-3-2-1-Go
  useEffect(() => {
    if (phase !== 'countdown' || !isRunning) return
    if (countdownVal <= 0) {
      beepGo()
      voice.speakGo()
      setPhase('work')
      if (mode === 'tabata') setRemaining(tabataWork)
      else if (mode === 'emom') setRemaining(emomInterval * 60)
      else setRemaining(totalWorkSeconds)
      return
    }
    // Voice countdown for last 5 seconds
    if (countdownVal <= 5) {
      voice.speakCountdown(countdownVal)
      beepCountdown()
    } else if (countdownVal <= 8) {
      beepCountdown()
    }
    const t = setTimeout(() => setCountdownVal(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdownVal, isRunning])

  // Main tick
  useEffect(() => {
    // Always clear any existing interval first to prevent stacking
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = 0
    }

    if (!isRunning || phase === 'countdown' || phase === 'idle' || phase === 'done') {
      return
    }

    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        // Voice: "10 seconds remaining"
        if (prev === 11) {
          voice.speakTenSecondsRemaining()
        }
        // Voice countdown 5-4-3-2-1
        if (prev >= 2 && prev <= 6) {
          voice.speakCountdown(prev - 1)
        }

        if (prev <= 1) {
          if (mode === 'tabata') {
            if (phase === 'work') {
              beepRest(); voice.speakRest(); setPhase('rest'); return tabataRest
            } else {
              if (currentRound >= tabataRounds) {
                beepDone(); voice.speakTimesUp(); setIsRunning(false); setPhase('done'); return 0
              }
              beepGo(); voice.speakWork(); setCurrentRound(r => r + 1); setPhase('work'); return tabataWork
            }
          }
          if (mode === 'emom') {
            if (currentRound >= emomTotalRounds) {
              beepDone(); voice.speakTimesUp(); setIsRunning(false); setPhase('done'); return 0
            }
            beepGo(); voice.speakWork(); setCurrentRound(r => r + 1); return emomInterval * 60
          }
          if (phase === 'work') {
            if (hasRest && currentSet < sets) { beepRest(); voice.speakRest(); setPhase('rest'); return totalRestSeconds }
            else if (currentSet < sets) { beepGo(); voice.speakWork(); setCurrentSet(s => s + 1); return totalWorkSeconds }
            else { beepDone(); voice.speakTimesUp(); setIsRunning(false); setPhase('done'); return 0 }
          }
          if (phase === 'rest') { beepGo(); voice.speakWork(); setCurrentSet(s => s + 1); setPhase('work'); return totalWorkSeconds }
          setIsRunning(false); setPhase('done'); return 0
        }
        if (prev <= 4 && prev > 1) beepCountdown()
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, phase, mode, currentRound, currentSet, sets, hasRest,
    totalWorkSeconds, totalRestSeconds, tabataWork, tabataRest, tabataRounds,
    emomInterval, emomTotalRounds])

  // Progress
  let progress = 0
  if (mode === 'tabata') progress = remaining / (phase === 'work' ? tabataWork : tabataRest)
  else if (mode === 'emom') progress = remaining / (emomInterval * 60)
  else { const max = phase === 'work' ? totalWorkSeconds : totalRestSeconds; progress = max > 0 ? remaining / max : 0 }

  return {
    phase, remaining, isRunning, currentSet, currentRound, countdownVal,
    totalWorkSeconds, totalRestSeconds, emomTotalRounds, progress,
    startTimer, reset, setIsRunning,
  }
}
