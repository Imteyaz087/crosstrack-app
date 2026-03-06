import { useCallback, useRef } from 'react'

export function useTimerAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.22) => {
    try {
      const ctx = getAudioCtx()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = type
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000)
      osc.start(now)
      osc.stop(now + duration / 1000 + 0.02)
    } catch {}
  }, [getAudioCtx])

  const playPattern = useCallback((steps: Array<{ delay: number; freq: number; duration: number; type?: OscillatorType; volume?: number }>) => {
    for (const step of steps) {
      setTimeout(() => {
        playTone(step.freq, step.duration, step.type, step.volume)
      }, step.delay)
    }
  }, [playTone])

  const beepCountdown = useCallback(() => playTone(880, 110, 'triangle', 0.16), [playTone])

  const beepGo = useCallback(() => {
    playPattern([
      { delay: 0, freq: 740, duration: 120, type: 'triangle', volume: 0.18 },
      { delay: 150, freq: 988, duration: 140, type: 'triangle', volume: 0.2 },
      { delay: 330, freq: 1318, duration: 220, type: 'sawtooth', volume: 0.24 },
    ])
  }, [playPattern])

  const beepRest = useCallback(() => {
    playPattern([
      { delay: 0, freq: 622, duration: 180, type: 'triangle', volume: 0.18 },
      { delay: 210, freq: 466, duration: 220, type: 'triangle', volume: 0.2 },
    ])
  }, [playPattern])

  const beepDone = useCallback(() => {
    playPattern([
      { delay: 0, freq: 1046, duration: 150, type: 'triangle', volume: 0.2 },
      { delay: 180, freq: 1318, duration: 170, type: 'triangle', volume: 0.22 },
      { delay: 390, freq: 1568, duration: 180, type: 'triangle', volume: 0.22 },
      { delay: 620, freq: 1318, duration: 260, type: 'sine', volume: 0.24 },
    ])
  }, [playPattern])

  return { beepCountdown, beepGo, beepRest, beepDone }
}
