/**
 * EventScanner – Camera/upload + Gemini OCR for CrossFit event posters
 */
import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react'
import { analyzeImage, hasApiKey, EVENT_SCAN_PROMPT } from '../../services/gemini'
import type { EventScanResult } from '../../types/eventTypes'

interface EventScannerProps {
  onScanComplete: (result: EventScanResult, sourceImage?: string) => void
  onClose: () => void
}

export function EventScanner({ onScanComplete, onClose }: EventScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const hasKey = hasApiKey()

  const processImage = async (base64: string) => {
    setScanning(true)
    setError(null)
    try {
      const raw = await analyzeImage(base64, EVENT_SCAN_PROMPT)
      if (!raw) throw new Error('No response from image analysis')
      const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      const result: EventScanResult = JSON.parse(jsonStr)
      if (result.error) {
        setError(result.error)
        setScanning(false)
        return
      }
      onScanComplete(result, base64)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan image. Try again or enter manually.')
    }
    setScanning(false)
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      processImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (!hasKey) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-orange-500/10 border border-orange-400/30 rounded-ct-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-ct-1">Gemini API Key Required</p>
              <p className="text-xs text-ct-2 mt-1">
                To scan event posters, you need a Gemini API key. Add it in Settings → AI Coach → API Key.
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Instructions */}
      <div className="bg-ct-surface border border-ct-border rounded-ct-lg p-4">
        <p className="text-sm font-bold text-ct-1 mb-1">Scan an event workout</p>
        <p className="text-xs text-ct-2">Take a photo or upload an image of:</p>
        <div className="mt-2 space-y-1">
          {['Official CrossFit Open poster', 'Instagram workout screenshot', 'Gym whiteboard', 'Handwritten workout notes', 'Scoreboard photo'].map(item => (
            <p key={item} className="text-xs text-ct-3">• {item}</p>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      {!scanning && !preview && (
        <div className="flex gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 p-6 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-400/30 rounded-ct-lg active:scale-[0.97] transition-transform min-h-[100px]"
          >
            <Camera size={28} className="text-violet-400" />
            <span className="text-sm font-bold text-ct-1">Take Photo</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 p-6 bg-ct-surface border border-ct-border rounded-ct-lg active:scale-[0.97] transition-transform min-h-[100px]"
          >
            <Upload size={28} className="text-cyan-400" />
            <span className="text-sm font-bold text-ct-1">Upload Image</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

      {/* Preview + Loading */}
      {preview && (
        <div className="relative rounded-ct-lg overflow-hidden">
          <img src={preview} alt="Scanned poster" className="w-full rounded-ct-lg" />
          {scanning && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-cyan-400 animate-spin" />
              <p className="text-sm font-bold text-white">Scanning workout poster...</p>
              <p className="text-xs text-slate-300">AI is extracting event data</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-ct-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-ct-1">Scan Failed</p>
              <p className="text-xs text-ct-2 mt-1">{error}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setPreview(null); setError(null) }}
              className="flex-1 py-2 bg-ct-surface border border-ct-border rounded-ct-lg text-xs font-semibold text-ct-2 min-h-[36px]"
            >
              Try Again
            </button>
            <button onClick={onClose}
              className="flex-1 py-2 bg-ct-surface border border-ct-border rounded-ct-lg text-xs font-semibold text-ct-2 min-h-[36px]"
            >
              Enter Manually
            </button>
          </div>
        </div>
      )}

      {/* Cancel */}
      <button onClick={onClose} className="w-full py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]">
        Cancel
      </button>
    </div>
  )
}