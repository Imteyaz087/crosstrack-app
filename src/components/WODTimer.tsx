import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Play, Pause, RotateCcw } from 'lucide-react'

type TimerMode = 'stopwatch' | 'countdown' | 'emom' | 'tabata'

const CARD   = 'var(--bg-card)'
const RAISED = 'var(--bg-raised)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const TXT2   = 'var(--text-secondary)'
const APP    = 'var(--bg-app)'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(200)
  }
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const ss = s % 60
  const mm = m % 60
  if (h > 0) return `${h}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

interface WODTimerProps {
  onClose: () => void
}

export function WODTimer({ onClose }: WODTimerProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<TimerMode>('stopwatch')
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number | undefined>(undefined)
  const startRef = useRef<number>(0)
  const accRef = useRef<number>(0)
  // Presets for config
  const [countdownMins, setCountdownMins] = useState(20)
  const [emomMins, setEmomMins] = useState(12)
  const [tabataWork, setTabataWork] = useState(20)
  const [tabataRest, setTabataRest] = useState(10)
  const [tabataRounds, setTabataRounds] = useState(8)
  // Tabata/EMOM phase state
  const [tabataPhase, setTabataPhase] = useState<'work' | 'rest'>('work')
  const lastBeepRef = useRef<number>(0)

  const [display, setDisplay] = useState({ main: '0:00', sub: '' })
  const [isConfiguring, setIsConfiguring] = useState(true)

  const tick = useCallback(() => {
    const now = performance.now()
    const elapsed = accRef.current + (running ? now - startRef.current : 0)

    if (mode === 'stopwatch') {
      setDisplay({ main: formatTime(elapsed) + '.' + Math.floor((elapsed % 1000) / 100), sub: '' })
    }

    if (mode === 'countdown') {
      const total = countdownMins * 60 * 1000
      const left = Math.max(0, total - elapsed)
      const secs = left / 1000
      const m = Math.floor(secs / 60)
      const s = Math.floor(secs % 60)
      setDisplay({ main: `${m}:${s.toString().padStart(2, '0')}`, sub: '' })
      if (left <= 0 && running) {
        setRunning(false)
        vibrate()
        vibrate()
        vibrate()
      }
    }

    if (mode === 'emom') {
      const intoCurrentMin = elapsed % 60000
      const currentMin = Math.floor(elapsed / 60000) + 1
      const secsLeft = 60 - intoCurrentMin / 1000
      if (currentMin > emomMins) {
        setRunning(false)
        vibrate()
        vibrate()
        vibrate()
        setDisplay({ main: 'DONE', sub: '' })
      } else {
        const m = Math.floor(secsLeft / 60)
        const s = Math.floor(secsLeft % 60)
        setDisplay({
          main: `${m}:${s.toString().padStart(2, '0')}`,
          sub: `Minute ${currentMin}/${emomMins}`,
        })
        if (secsLeft < 1 && secsLeft > 0 && now - lastBeepRef.current > 500) {
          lastBeepRef.current = now
          vibrate()
        }
      }
    }

    if (mode === 'tabata') {
      const workMs = tabataWork * 1000
      const restMs = tabataRest * 1000
      const roundMs = workMs + restMs
      const totalMs = tabataRounds * roundMs
      if (elapsed >= totalMs) {
        setRunning(false)
        vibrate()
        vibrate()
        vibrate()
        setDisplay({ main: 'DONE', sub: `${tabataRounds} rounds` })
      } else {
        const inRound = elapsed % roundMs
        const phase: 'work' | 'rest' = inRound < workMs ? 'work' : 'rest'
        const phaseStart = phase === 'work' ? 0 : workMs
        const phaseElapsed = inRound - phaseStart
        const phaseTotal = phase === 'work' ? workMs : restMs
        const left = phaseTotal - phaseElapsed
        const r = Math.floor(elapsed / roundMs) + 1
        setTabataPhase(phase)
        const secs = left / 1000
        const sm = Math.floor(secs / 60)
        const ss = Math.floor(secs % 60)
        setDisplay({
          main: `${sm}:${ss.toString().padStart(2, '0')}`,
          sub: `R${r}/${tabataRounds} · ${phase === 'work' ? t('timer.work') : t('timer.rest')}`,
        })
        if (left < 500 && left > 0 && now - lastBeepRef.current > 400) {
          lastBeepRef.current = now
          vibrate()
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [mode, running, countdownMins, emomMins, tabataWork, tabataRest, tabataRounds, t])

  useEffect(() => {
    if (running) startRef.current = performance.now()
  }, [running])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [tick])

  const handleStart = () => {
    if (isConfiguring) {
      setIsConfiguring(false)
      accRef.current = 0
      startRef.current = performance.now()
    }
    setRunning(true)
  }

  const handlePause = () => {
    if (running) accRef.current += performance.now() - startRef.current
    setRunning(false)
  }
  const handleReset = () => {
    setRunning(false)
    accRef.current = 0
    setIsConfiguring(true)
    setTabataPhase('work')
  }

  const modes: TimerMode[] = ['stopwatch', 'countdown', 'emom', 'tabata']

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: APP }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-white">{t('timer.title')}</h1>
        <button onClick={onClose} style={{ color: TXT2 }} className="p-2 -m-2">
          <X size={22} />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 px-4 overflow-x-auto pb-3">
        {modes.map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); handleReset() }}
            style={mode === m ? { background: 'var(--volt-glow)', color: VOLT } : { background: CARD, color: TXT2 }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border"
          >
            {t(`timer.${m}`)}
          </button>
        ))}
      </div>

      {/* Config (when not running and configuring) */}
      {isConfiguring && !running && (
        <div style={{ background: CARD, borderColor: BORDER }} className="mx-4 rounded-2xl p-4 border mb-4">
          {mode === 'countdown' && (
            <div>
              <p style={{ color: TXT2 }} className="text-xs mb-2">{t('timer.duration')} (min)</p>
              <div className="flex gap-2 items-center">
                <button onClick={() => setCountdownMins(Math.max(1, countdownMins - 1))} style={{ background: RAISED, color: VOLT }} className="w-10 h-10 rounded-xl font-bold">−</button>
                <span className="text-xl font-bold text-white w-12 text-center">{countdownMins}</span>
                <button onClick={() => setCountdownMins(Math.min(60, countdownMins + 1))} style={{ background: RAISED, color: VOLT }} className="w-10 h-10 rounded-xl font-bold">+</button>
              </div>
            </div>
          )}
          {mode === 'emom' && (
            <div>
              <p style={{ color: TXT2 }} className="text-xs mb-2">{t('timer.emomMinutes')}</p>
              <div className="flex gap-2 items-center">
                <button onClick={() => setEmomMins(Math.max(1, emomMins - 1))} style={{ background: RAISED, color: VOLT }} className="w-10 h-10 rounded-xl font-bold">−</button>
                <span className="text-xl font-bold text-white w-12 text-center">{emomMins}</span>
                <button onClick={() => setEmomMins(Math.min(30, emomMins + 1))} style={{ background: RAISED, color: VOLT }} className="w-10 h-10 rounded-xl font-bold">+</button>
              </div>
            </div>
          )}
          {mode === 'tabata' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={{ color: TXT2 }} className="text-xs">{t('timer.workSec')}</span>
                <div className="flex gap-1">
                  <button onClick={() => setTabataWork(Math.max(5, tabataWork - 5))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">−</button>
                  <span className="text-white font-bold w-8 text-center">{tabataWork}</span>
                  <button onClick={() => setTabataWork(Math.min(60, tabataWork + 5))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: TXT2 }} className="text-xs">{t('timer.restSec')}</span>
                <div className="flex gap-1">
                  <button onClick={() => setTabataRest(Math.max(5, tabataRest - 5))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">−</button>
                  <span className="text-white font-bold w-8 text-center">{tabataRest}</span>
                  <button onClick={() => setTabataRest(Math.min(60, tabataRest + 5))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: TXT2 }} className="text-xs">{t('timer.rounds')}</span>
                <div className="flex gap-1">
                  <button onClick={() => setTabataRounds(Math.max(1, tabataRounds - 1))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">−</button>
                  <span className="text-white font-bold w-8 text-center">{tabataRounds}</span>
                  <button onClick={() => setTabataRounds(Math.min(20, tabataRounds + 1))} style={{ background: RAISED, color: VOLT }} className="w-8 h-8 rounded-lg text-sm font-bold">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4"
        style={{
          background: mode === 'tabata' && !isConfiguring
            ? (tabataPhase === 'work' ? 'rgba(74,222,128,0.08)' : 'rgba(251,146,60,0.08)')
            : 'transparent',
        }}
      >
        <p className="text-6xl md:text-7xl font-mono font-bold tracking-tighter text-white tabular-nums">
          {display.main}
        </p>
        {display.sub && (
          <p style={{ color: TXT2 }} className="mt-2 text-sm">{display.sub}</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 pb-8">
        {running ? (
          <button
            onClick={handlePause}
            style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
          >
            <Pause size={24} />
          </button>
        ) : (
          <button
            onClick={handleStart}
            style={{ background: VOLT, color: APP }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
          >
            <Play size={24} />
          </button>
        )}
        <button
          onClick={handleReset}
          style={{ background: RAISED, color: TXT2 }}
          className="w-14 h-14 rounded-full flex items-center justify-center"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  )
}
