import { useState, useRef } from 'react'
import { useStore } from '../stores/useStore'
import { useSaveToast } from '../components/SaveToast'
import { today } from '../utils/macros'
import { Camera, X, Plus, Trash2, Check, Sparkles, Loader2 } from 'lucide-react'
import type { WodType, RxScaled } from '../types'
import { hasApiKey, analyzeImage, WHITEBOARD_PROMPT } from '../services/gemini'

interface ParsedMovement {
  name: string
  reps: string
}

export function PhotoLogPage() {
  const { saveWorkout } = useStore()
  const { showToast, toastEl } = useSaveToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [mode, setMode] = useState<'capture' | 'entry'>('capture')
  const [parsing, setParsing] = useState(false)

  // Manual entry fields
  const [wodName, setWodName] = useState('')
  const [wodType, setWodType] = useState<WodType>('ForTime')
  const [movements, setMovements] = useState<ParsedMovement[]>([{ name: '', reps: '' }])
  const [score, setScore] = useState('')
  const [rx, setRx] = useState<RxScaled>('RX')
  const [notes, setNotes] = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
      }
    } catch {
      showToast('Camera access denied', 'error')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)

    // Stop camera
    const stream = video.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
    setMode('entry')

    // Auto-parse with Gemini if key is available
    if (hasApiKey()) {
      setParsing(true)
      try {
        const result = await analyzeImage(imageData, WHITEBOARD_PROMPT)
        if (!result) {
          showToast('AI parsing failed — enter manually', 'error')
          setParsing(false)
          return
        }
        const jsonStr = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(jsonStr)
        } catch {
          showToast('Could not parse AI response — enter manually', 'error')
          setParsing(false)
          return
        }
        if (parsed.error) {
          showToast('Could not read whiteboard — enter manually', 'error')
        } else {
          if (parsed.wodName) setWodName(parsed.wodName as string)
          if (parsed.wodType) {
            const validTypes: WodType[] = ['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Strength', 'Chipper', 'Other']
            if (validTypes.includes(parsed.wodType as WodType)) setWodType(parsed.wodType as WodType)
          }
          if (Array.isArray(parsed.movements) && parsed.movements.length > 0) {
            setMovements(parsed.movements.map((m: Record<string, string>) => ({ name: m.name || '', reps: m.reps || '' })))
          }
          if (parsed.notes) setNotes(parsed.notes as string)
          showToast('Whiteboard parsed! Review & edit below', 'success')
        }
      } catch {
        showToast('AI parsing failed — enter manually', 'error')
      } finally {
        setParsing(false)
      }
    }
  }

  const addMovement = () => setMovements([...movements, { name: '', reps: '' }])

  const updateMovement = (idx: number, field: 'name' | 'reps', value: string) => {
    const next = [...movements]
    next[idx] = { ...next[idx], [field]: value }
    setMovements(next)
  }

  const removeMovement = (idx: number) => {
    if (movements.length <= 1) return
    setMovements(movements.filter((_, i) => i !== idx))
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!wodName.trim()) { showToast('Enter a WOD name', 'error'); return }
    if (saving) return
    setSaving(true)
    try {
      const movNames = movements.filter(m => m.name.trim()).map(m => m.reps ? `${m.reps} ${m.name}` : m.name)
      await saveWorkout({
        date: today(),
        workoutType: wodType,
        name: wodName,
        description: movNames.join(', '),
        movements: movements.filter(m => m.name.trim()).map(m => m.name),
        scoreDisplay: score || undefined,
        scoreValue: score ? parseFloat(score.replace(':', '.')) : undefined,
        scoreUnit: wodType === 'ForTime' ? 'time' : wodType === 'AMRAP' ? 'rounds' : 'reps',
        rxOrScaled: rx,
        isBenchmark: false,
        prFlag: false,
        notes: notes || undefined,
      })
      showToast(`Logged ${wodName}!`, 'success')
      setMode('capture'); setCapturedImage(null); setWodName('')
      setMovements([{ name: '', reps: '' }]); setScore(''); setNotes('')
    } catch {
      showToast('Failed to save workout — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Camera view
  if (cameraActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <video ref={videoRef} className="flex-1 object-cover" playsInline autoPlay muted />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
          <button onClick={() => {
            const stream = videoRef.current?.srcObject as MediaStream
            stream?.getTracks().forEach(t => t.stop())
            setCameraActive(false)
          }} className="w-12 h-12 bg-ct-elevated/80 rounded-full flex items-center justify-center" aria-label="Close camera">
            <X size={20} className="text-ct-1" />
          </button>
          <button onClick={capturePhoto}
            className="w-16 h-16 bg-white rounded-full border-4 border-cyan-400 flex items-center justify-center" aria-label="Take photo">
            <div className="w-12 h-12 bg-cyan-400 rounded-full" />
          </button>
        </div>
      </div>
    )
  }

  // Entry mode
  if (mode === 'entry') {
    return (
      <div className="space-y-3">
        {toastEl}
        <button onClick={() => { setMode('capture'); setCapturedImage(null) }} className="text-cyan-400 text-sm px-2 py-1 -ml-2 rounded-lg active:bg-ct-surface min-h-[44px] flex items-center" aria-label="Back to capture">&larr; Back</button>

        {capturedImage && (
          <div className="relative rounded-xl overflow-hidden">
            <img src={capturedImage} alt="Whiteboard" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ct-bg/80 to-transparent" />
            {parsing ? (
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <Loader2 size={12} className="text-violet-400 animate-spin" />
                <p className="text-[11px] text-violet-300">AI reading whiteboard...</p>
              </div>
            ) : (
              <p className="absolute bottom-2 left-3 text-[11px] text-ct-2 flex items-center gap-1">
                {hasApiKey() && <Sparkles size={10} className="text-violet-400" />}
                {hasApiKey() ? 'AI-parsed — review & edit below' : 'Type what you see on the whiteboard'}
              </p>
            )}
          </div>
        )}

        <h2 className="text-lg font-bold text-ct-1">Log from Photo</h2>

        <input type="text" value={wodName} onChange={e => setWodName(e.target.value)}
          placeholder="WOD Name (e.g., Monday WOD)" aria-label="WOD name"
          className="w-full bg-ct-surface border border-ct-border text-ct-1 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />

        <div className="flex gap-1.5 flex-wrap">
          {(['ForTime', 'AMRAP', 'EMOM', 'Tabata', 'Strength', 'Other'] as WodType[]).map(t => (
            <button key={t} onClick={() => setWodType(t)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                wodType === t ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated/50 text-ct-2'
              }`}>{t}</button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-ct-2">Movements</p>
          {movements.map((m, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input type="text" value={m.reps} onChange={e => updateMovement(idx, 'reps', e.target.value)}
                placeholder="21-15-9" aria-label="Rep scheme" className="w-20 bg-ct-elevated text-ct-1 rounded-xl py-2 px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-400" />
              <input type="text" value={m.name} onChange={e => updateMovement(idx, 'name', e.target.value)}
                placeholder="Thrusters" aria-label="Movement name" className="flex-1 bg-ct-elevated text-ct-1 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
              {movements.length > 1 && (
                <button onClick={() => removeMovement(idx)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-400/50 active:text-red-400 rounded-lg" aria-label="Remove movement"><Trash2 size={14} /></button>
              )}
            </div>
          ))}
          <button onClick={addMovement}
            className="w-full bg-ct-surface/40 border border-dashed border-ct-border/50 text-ct-2 rounded-lg py-2 text-xs flex items-center justify-center gap-1">
            <Plus size={12} /> Add Movement
          </button>
        </div>

        <div className="flex gap-2">
          <input type="text" value={score} onChange={e => setScore(e.target.value)}
            placeholder={wodType === 'ForTime' ? 'Time (12:30)' : 'Score (rounds/reps)'} aria-label="Score"
            className="flex-1 bg-ct-surface border border-ct-border text-ct-1 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
          <div className="flex gap-1">
            {(['RX', 'Scaled'] as RxScaled[]).map(r => (
              <button key={r} onClick={() => setRx(r)}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  rx === r ? r === 'RX' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  : 'bg-ct-elevated/50 text-ct-2'
                }`}>{r}</button>
            ))}
          </div>
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)" aria-label="Workout notes" rows={2}
          className="w-full bg-ct-surface border border-ct-border text-ct-1 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/30 resize-none" />

        <button onClick={handleSave}
          disabled={!wodName.trim() || saving}
          className={`w-full font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 ${
            wodName.trim() && !saving ? 'bg-cyan-500 text-slate-900 active:scale-[0.98]' : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
          }`}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving...' : 'Save Workout'}
        </button>
      </div>
    )
  }

  // Capture mode (default)
  return (
    <div className="space-y-4 stagger-children">
      {toastEl}
      <h1 className="text-xl font-bold text-ct-1">Photo to Log</h1>
      <p className="text-xs text-ct-2">
        {hasApiKey() ? 'Snap a whiteboard photo — AI will auto-parse the WOD' : 'Snap a photo, then type in the workout'}
      </p>

      <button onClick={startCamera}
        className="w-full bg-ct-surface border-2 border-dashed border-cyan-500/30 rounded-ct-lg py-12 flex flex-col items-center gap-3 active:bg-ct-surface/80">
        <div className="w-16 h-16 bg-cyan-500/10 rounded-ct-lg flex items-center justify-center">
          <Camera size={28} className="text-cyan-400" />
        </div>
        <p className="text-sm font-semibold text-cyan-400">Open Camera</p>
        <p className="text-[11px] text-ct-2">
          {hasApiKey() ? 'AI will read the whiteboard automatically' : 'Take a photo of the whiteboard'}
        </p>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ct-elevated/50" />
        <span className="text-[11px] text-ct-2">OR</span>
        <div className="h-px flex-1 bg-ct-elevated/50" />
      </div>

      <button onClick={() => setMode('entry')}
        className="w-full bg-ct-surface border border-ct-border rounded-xl py-3.5 text-sm font-semibold text-ct-2 flex items-center justify-center gap-2">
        <Plus size={14} /> Enter Manually
      </button>
    </div>
  )
}
