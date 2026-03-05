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

  const speak = useCallback((text: string, rate = 1.8, pitch = 1.9) => {
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
    } catch { }
  }, [getSynth, getVoice])

  const speakCountdown = useCallback((num: number) => { speak(String(num), 1.9, 2.0) }, [speak])
  const speakGo = useCallback(() => { speak('GO!', 2.0, 2.0) }, [speak])
  const speakTenSecondsRemaining = useCallback(() => { speak('Ten seconds! Push it!', 1.8, 1.8) }, [speak])
  const speakTimesUp = useCallback(() => { speak("Time! Great effort! Well done!", 1.7, 1.7) }, [speak])
  const speakGetReady = useCallback(() => { speak("Let's go! Get ready!", 1.8, 1.9) }, [speak])
  const speakWork = useCallback(() => { speak('WORK! Let\'s go!', 1.9, 2.0) }, [speak])
  const speakRest = useCallback(() => { speak('Rest! Breathe!', 1.6, 1.6) }, [speak])

  return { speak, speakCountdown, speakGo, speakTenSecondsRemaining, speakTimesUp, speakGetReady, speakWork, speakRest }
}