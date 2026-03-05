/**
 * WodScanner — Camera/upload + Gemini OCR for daily WODs
 * Lighter than EventScanner — fills WorkoutLogger form fields
 */

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, AlertCircle, X } from 'lucide-react'
import { analyzeImage, hasApiKey } from '../../services/gemini'
import { WOD_SCAN_PROMPT } from '../../services/gemini'

export interface WodScanResult {
  wodName: string | null
  wodType: string
  description: string
  movements: string[]
  repScheme: string | null
  timeCapMinutes: number | null
  rxWeights: string | null
  isBenchmark: boolean
  confidenceScores: Record<string, number>
  warnings: string[]
  error?: string
}

interface WodScannerProps {
  onScanComplete: (result: WodScanResult) => void
  onClose: () => void
}

export function WodScanner({ onScanComplete, onClose }: WodScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const hasKey = hasApiKey()

  const processImage = async (file: File) => {
    setScanning(true)
    setError(null)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          setPreview(result)
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await analyzeImage(base64, WOD_SCAN_PROMPT)
      if (!response) throw new Error('No response from image analysis')
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed: WodScanResult = JSON.parse(cleaned)

      if (parsed.error) {
        setError(parsed.error)
        setScanning(false)
        return
      }

      onScanComplete(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan WOD')
    }
    setScanning(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  if (!hasKey) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-ct-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-300">Gemini API Key Required</p>
              <p className="text-xs text-ct-2 mt-1">Go to Settings → AI to add your Gemini API key for WOD scanning.</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ct-1">Scan WOD</h3>
          <p className="text-[11px] text-ct-3">Take a photo of the whiteboard or upload a screenshot</p>
        </div>
        <button onClick={onClose} className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <X size={18} className="text-ct-3" />
        </button>
      </div>

      {/* Preview / scanning state */}
      {preview && (
        <div className="relative rounded-ct-lg overflow-hidden border border-ct-border">
          <img src={preview} alt="WOD" className="w-full object-contain max-h-64" />
          {scanning && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-cyan-400 animate-spin" />
              <p className="text-sm font-bold text-white">Reading workout...</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-ct-lg p-3">
          <p className="text-xs text-red-400 font-semibold">{error}</p>
          <button onClick={() => { setError(null); setPreview(null) }} className="text-xs text-ct-2 underline mt-1">Try again</button>
        </div>
      )}

      {/* Capture buttons */}
      {!scanning && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 bg-cyan-500/10 border border-cyan-400/25 rounded-ct-lg active:scale-95 transition-transform min-h-[80px]"
          >
            <Camera size={24} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">Take Photo</span>
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            className="flex flex-col items-center gap-2 p-4 bg-ct-surface border border-ct-border rounded-ct-lg active:scale-95 transition-transform min-h-[80px]"
          >
            <Upload size={24} className="text-ct-2" />
            <span className="text-xs font-bold text-ct-2">Upload</span>
          </button>
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
