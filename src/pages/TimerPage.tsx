import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import type { TimerMode, TimerPreset } from '../types'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

const VOLT = 'var(--volt)'
const TXT2 = 'var(--text-secondary)'
const TXT3 = 'var(--text-muted)'
const RAISED = 'var(--bg-raised)'

interface TimerPageProps {
  onClose?: () => void
}

export function TimerPage({ onClose }: TimerPageProps) {
  const { t } = useTranslation()
  const { timerPresets, loadTimerPresets } = useStore()
  const [mode, setMode] = useState<TimerMode | null>(null)
  const [totalSeconds, setTotalSeconds] = useState(720)
  const [remaining, setRemaining] = useState(720)
  const [isRunning, setIsRunning] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(10)
  const [workSeconds, setWorkSeconds] = useState(20)
  const [restSeconds, setRestSeconds] = useState(10)
  const [isWork, setIsWork] = useState(true)
  const intervalRef = useRef<number>(0)

  useEffect(() => { loadTimerPresets() }, [])

  const beep = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      osc.connect(ctx.destination)
      osc.frequency.value = 880
      osc.start()
      setTimeout(() => osc.stop(), 200)
    } catch {}
  }, [])

  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return }
    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          beep()
          if (mode === 'tabata') {
            if (isWork) {
              setIsWork(false)
              return restSeconds
            } else {
              if (currentRound >= totalRounds) { setIsRunning(false); return 0 }
              setCurrentRound(r => r + 1)
              setIsWork(true)
              return workSeconds
            }
          }
          if (mode === 'emom') {
            if (currentRound >= totalRounds) { setIsRunning(false); return 0 }
            setCurrentRound(r => r + 1)
            return workSeconds
          }
          setIsRunning(false)
          return 0
        }
        if (prev <= 4) beep()
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode, currentRound, totalRounds, workSeconds, restSeconds, isWork, beep])

  const reset = () => {
    setIsRunning(false)
    setCurrentRound(1)
    setIsWork(true)
    if (mode === 'tabata') setRemaining(workSeconds)
    else if (mode === 'emom') setRemaining(workSeconds)
    else setRemaining(totalSeconds)
  }

  const selectPreset = (preset: TimerPreset) => {
    const ts = preset.totalSeconds ?? 720
    const rds = preset.rounds ?? 1
    const ws = preset.workSeconds ?? 60
    const rs = preset.restSeconds ?? 10
    setMode(preset.mode)
    setTotalSeconds(ts)
    setTotalRounds(rds)
    setWorkSeconds(ws)
    setRestSeconds(rs)
    setCurrentRound(1)
    setIsWork(true)
    if (preset.mode === 'tabata') setRemaining(ws)
    else if (preset.mode === 'emom') setRemaining(ws)
    else setRemaining(ts)
  }

  const progress = mode === 'tabata' || mode === 'emom'
    ? remaining / (isWork ? workSeconds : restSeconds)
    : totalSeconds > 0 ? remaining / totalSeconds : 0

  if (!mode) {
    const categories: TimerMode[] = ['amrap', 'emom', 'fortime', 'tabata', 'rest', 'custom']
    const labels: Record<TimerMode, string> = { amrap: 'AMRAP', emom: 'EMOM', fortime: 'For Time', tabata: 'Tabata', rest: 'Rest Timer', custom: 'Custom' }
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">{t('more.wodTimer')}</h1>
          {onClose && <button onClick={onClose} style={{ color: TXT2 }}><X size={20} /></button>}
        </div>
        {categories.map(cat => {
          const presets = timerPresets.filter(p => p.mode === cat)
          if (presets.length === 0) return null
          return (
            <div key={cat}>
              <p className="text-xs font-bold mb-2 uppercase" style={{ color: VOLT }}>{labels[cat]}</p>
              <div className="flex gap-2 flex-wrap">
                {presets.map(p => (
                  <button
                    key={p.id ?? p.name}
                    onClick={() => selectPreset(p)}
                    className="glass-card tap-target px-4 py-3 text-sm text-white font-medium"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <button onClick={() => { setMode(null); reset() }} className="text-sm self-start" style={{ color: VOLT }}>
        ← Presets
      </button>

      <div className="text-center">
        <p className="text-xs uppercase tracking-widest" style={{ color: TXT3 }}>{mode?.toUpperCase()}</p>
        {(mode === 'emom' || mode === 'tabata') && (
          <p className="text-sm mt-1" style={{ color: TXT2 }}>
            Round {currentRound} / {totalRounds}
            {mode === 'tabata' && (
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${isWork ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isWork ? 'WORK' : 'REST'}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-raised)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={remaining <= 3 ? '#ef4444' : isWork ? VOLT : '#f59e0b'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${progress * 283} 283`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-mono font-black ${remaining <= 3 ? 'text-red-400' : 'text-white'}`}>
            {minutes}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={reset} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: RAISED }}>
          <RotateCcw size={20} style={{ color: TXT2 }} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: isRunning ? '#ef4444' : VOLT }}
        >
          {isRunning ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-black ml-0.5" />}
        </button>
      </div>
    </div>
  )
}
