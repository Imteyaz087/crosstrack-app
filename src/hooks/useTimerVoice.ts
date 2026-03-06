import { useCallback, useRef } from 'react'

export function useTimerVoice() {
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  const getSynth = useCallback(() => {
    if (!synthRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis
    }
    return synthRef.current
  }, [])

  const getVoice = useCallback(() => {
    if (voiceRef.current) return voiceRef.current
    const synth = getSynth()
    if (!synth) return null
    const voices = synth.getVoices()
    const preferred = [
      'Google UK English Male', 'Microsoft David', 'Microsoft Mark',
      'Google US English', 'Daniel', 'Alex', 'Fred', 'Tom',
    ]
    for (const name of preferred) {
      const v = voices.find(voice => voice.name.includes(name) && voice.lang.startsWith('en'))
      if (v) { voiceRef.current = v; return v }
    }
    const fallback = voices.find(v => v.lang.startsWith('en') && v.localService)
      || voices.find(v => v.lang.startsWith('en'))
    if (fallback) voiceRef.current = fallback
    return voiceRef.current
  }, [getSynth])

  const speak = useCallback((text: string, rate = 1.15, pitch = 1.0) => {
    try {
      const synth = getSynth()
      if (!synth) return
      synth.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = rate
      utter.pitch = pitch
      utter.volume = 1.0
      const voice = getVoice()
      if (voice) utter.voice = voice
      synth.speak(utter)
    } catch {
      // Speech synthesis not available
    }
  }, [getSynth, getVoice])

  const speakCountdown = useCallback((num: number) => {
    speak(String(num), 1.05, 0.95)
  }, [speak])

  const speakGo = useCallback(() => {
    speak('Go', 1.2, 1.0)
  }, [speak])

  const speakTenSecondsRemaining = useCallback(() => {
    speak('Ten seconds', 1.08, 0.95)
  }, [speak])

  const speakTimesUp = useCallback(() => {
    speak('Time', 1.05, 0.95)
  }, [speak])

  const speakGetReady = useCallback(() => {
    speak('Get ready', 1.05, 0.98)
  }, [speak])

  const speakWork = useCallback(() => {
    speak('Work', 1.15, 1.0)
  }, [speak])

  const speakRest = useCallback(() => {
    speak('Rest', 1.05, 0.95)
  }, [speak])

  return {
    speak,
    speakCountdown,
    speakGo,
    speakTenSecondsRemaining,
    speakTimesUp,
    speakGetReady,
    speakWork,
    speakRest,
  }
}
