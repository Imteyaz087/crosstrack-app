import { useCallback, useRef } from 'react'

export function useTimerAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((freq: number, duration: number) => {
    try {
      const ctx = getAudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.value = 0.3
      osc.start()
      setTimeout(() => { osc.stop() }, duration)
    } catch {}
  }, [getAudioCtx])

  const beepCountdown = useCallback(() => playTone(660, 150), [playTone])
  const beepGo = useCallback(() => {
    playTone(880, 200)
    setTimeout(() => playTone(880, 200), 250)
    setTimeout(() => playTone(1100, 400), 500)
  }, [playTone])
  const beepRest = useCallback(() => {
    playTone(440, 300)
    setTimeout(() => playTone(440, 300), 350)
  }, [playTone])
  const beepDone = useCallback(() => {
    playTone(1100, 200)
    setTimeout(() => playTone(880, 200), 250)
    setTimeout(() => playTone(660, 200), 500)
    setTimeout(() => playTone(1100, 400), 750)
  }, [playTone])

  return { beepCountdown, beepGo, beepRest, beepDone }
}