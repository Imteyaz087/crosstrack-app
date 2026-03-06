/**
 * ShareCardExporter  -  Template picker + export to PNG + share
 * 4 templates: Minimal, Poster, PR Highlight, Overlay (transparent)
 * Output: 1080×1920 PNG (9:16 story format)
 *
 * FIX: Uses off-screen full-size rendering for reliable capture.
 * The preview uses CSS scale(0.3) for display, but capture happens
 * on a separate hidden full-size node to avoid transform issues.
 *
 * FIX: Mobile download uses blob URL opened in new tab (iOS PWA
 * blocks programmatic <a>.click() downloads).
 */

import { useState, useRef, useCallback } from 'react'
import { Download, Share2, Loader2, Check, Image, X, Layers } from 'lucide-react'
import { toPng } from 'html-to-image'
import { MinimalCard } from './MinimalCard'
import { PosterCard } from './PosterCard'
import { PRHighlightCard } from './PRHighlightCard'
import { OverlayCard } from './OverlayCard'
import type { ShareCardData } from './types'
import { haptic } from '../../hooks/useHaptic'

type CardTemplate = 'minimal' | 'poster' | 'pr' | 'overlay'

interface ShareCardExporterProps {
  data: ShareCardData
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}

const TEMPLATES: { id: CardTemplate; label: string; desc: string; icon?: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Clean & simple' },
  { id: 'poster', label: 'Poster', desc: 'Full workout' },
  { id: 'pr', label: 'PR Gold', desc: 'Celebration' },
  { id: 'overlay', label: 'Overlay', desc: 'For your photo' },
]

function CardContent({ template, data, showWatermark }: { template: CardTemplate; data: ShareCardData; showWatermark: boolean }) {
  switch (template) {
    case 'minimal': return <MinimalCard data={data} showWatermark={showWatermark} />
    case 'poster': return <PosterCard data={data} showWatermark={showWatermark} />
    case 'pr': return <PRHighlightCard data={data} showWatermark={showWatermark} />
    case 'overlay': return <OverlayCard data={data} showWatermark={showWatermark} />
  }
}

export function ShareCardExporter({ data, onClose, onToast }: ShareCardExporterProps) {
  const [template, setTemplate] = useState<CardTemplate>(data.prFlag ? 'pr' : 'minimal')
  const [showWatermark, setShowWatermark] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const canShare = typeof navigator.share === 'function'

  // For overlay template, show a checkerboard background in preview
  const isOverlay = template === 'overlay'

  const generatePng = useCallback(async (): Promise<Blob> => {
    if (!captureRef.current) throw new Error('Capture ref not ready')

    // Give browser multiple frames to fully paint the off-screen node
    await new Promise<void>(r => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 100)))
    })

    // Retry up to 3 times  -  first attempt sometimes captures blank on mobile
    let lastErr: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const dataUrl = await toPng(captureRef.current, {
          width: 1080,
          height: 1920,
          pixelRatio: 1,
          cacheBust: true,
          skipAutoScale: true,
          backgroundColor: isOverlay ? undefined : '#0f172a',
        })
        // Validate it's not a blank/tiny image
        if (dataUrl && dataUrl.length > 1000) {
          const res = await fetch(dataUrl)
          return res.blob()
        }
      } catch (e) {
        lastErr = e
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 200))
    }
    throw lastErr || new Error('Failed to generate PNG after 3 attempts')
  }, [isOverlay])

  const handleExport = async (mode: 'share' | 'download') => {
    setExporting(true)
    try {
      const blob = await generatePng()
      const filename = `trackvolt-${data.title.replace(/\s+/g, '-').toLowerCase()}-${data.date}.png`

      if (mode === 'share' && canShare) {
        const file = new File([blob], filename, { type: 'image/png' })
        await navigator.share({
          files: [file],
          title: `${data.title}  -  ${data.scoreDisplay}`,
          text: `${data.title} ${data.scoreDisplay} ${data.rxOrScaled}`,
        })
        haptic('success')
        onToast('Shared!', 'success')
      } else {
        // Download: create blob URL
        const url = URL.createObjectURL(blob)

        // Try programmatic download first (works on desktop browsers)
        try {
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()

          // Small delay then clean up
          setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }, 1000)
        } catch {
          // Fallback for iOS PWA: open image in new tab so user can long-press to save
          window.open(url, '_blank')
          setTimeout(() => URL.revokeObjectURL(url), 60000)
        }

        haptic('success')
        onToast('Image saved!', 'success')
      }
      setExported(true)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // User cancelled share sheet  -  no toast needed
      } else {
        console.error('Share card export failed:', e)
        onToast('Export failed. Try again.', 'error')
      }
    }
    setExporting(false)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ct-1">Share Your Result</h2>
        <button onClick={onClose} className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <X size={18} className="text-ct-3" />
        </button>
      </div>

      {/* Template picker  -  2×2 grid for 4 templates */}
      <div className="grid grid-cols-4 gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => { setTemplate(t.id); setExported(false); haptic('selection') }}
            className={`p-2.5 rounded-ct-lg text-center transition-all min-h-[56px] ${
              template === t.id
                ? 'bg-cyan-400/15 border border-cyan-400/30'
                : 'bg-ct-surface border border-ct-border'
            }`}
          >
            {t.id === 'overlay' && (
              <Layers size={12} className={`mx-auto mb-1 ${template === t.id ? 'text-cyan-400' : 'text-ct-2'}`} />
            )}
            <p className={`text-[11px] font-bold ${template === t.id ? 'text-cyan-400' : 'text-ct-1'}`}>
              {t.label}
            </p>
            <p className="text-[9px] text-ct-3 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Card preview (scaled down for display) */}
      <div className={`relative border border-ct-border rounded-ct-lg overflow-hidden ${
        isOverlay ? 'bg-checkerboard' : 'bg-ct-surface'
      }`}>
        <div className="w-full" style={{ aspectRatio: '9/16' }}>
          <div
            style={{
              transform: 'scale(0.3)',
              transformOrigin: 'top left',
              width: 1080,
              height: 1920,
              pointerEvents: 'none',
            }}
          >
            <CardContent template={template} data={data} showWatermark={showWatermark} />
          </div>
        </div>
        {/* Preview label */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-[10px] text-white font-semibold">
          {isOverlay ? 'Transparent PNG' : '9:16 Story'}
        </div>
      </div>

      {/* Off-screen capture node  -  positioned way off-screen, full size, no transforms */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 1080,
          height: 1920,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
          // NO opacity:0 or visibility:hidden  -  those prevent the browser from painting
          // position:fixed + left:-9999 is enough to hide it off-screen
        }}
        aria-hidden="true"
      >
        <div ref={captureRef} style={{ width: 1080, height: 1920 }}>
          <CardContent template={template} data={data} showWatermark={showWatermark} />
        </div>
      </div>

      {/* Overlay hint */}
      {isOverlay && (
        <div className="bg-violet-500/10 border border-violet-400/20 rounded-ct-lg px-4 py-2.5">
          <p className="text-[11px] text-violet-300 font-medium">
            Transparent background  -  layer this on your gym photo in IG Stories or any photo editor.
          </p>
        </div>
      )}

      {/* Watermark toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg">
        <div className="flex items-center gap-2">
          <Image size={14} className="text-ct-3" />
          <span className="text-xs text-ct-2">TrackVolt watermark</span>
        </div>
        <button
          onClick={() => { setShowWatermark(!showWatermark); setExported(false) }}
          className={`w-10 h-6 rounded-full transition-colors relative ${
            showWatermark ? 'bg-cyan-500' : 'bg-ct-border'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            showWatermark ? 'left-5' : 'left-1'
          }`} />
        </button>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        {canShare && (
          <button
            onClick={() => handleExport('share')}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 rounded-ct-lg text-sm font-bold text-slate-900 btn-press min-h-[44px] disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : exported ? (
              <><Check size={18} /> Shared!</>
            ) : (
              <><Share2 size={18} /> Share</>
            )}
          </button>
        )}
        <button
          onClick={() => handleExport('download')}
          disabled={exporting}
          className={`${canShare ? '' : 'flex-1'} flex items-center justify-center gap-2 py-3 ${
            canShare ? 'px-6 bg-ct-surface border border-ct-border' : 'bg-cyan-500 text-slate-900'
          } rounded-ct-lg text-sm font-bold ${canShare ? 'text-ct-2' : ''} min-h-[44px] disabled:opacity-50`}
        >
          {exporting && !canShare ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <><Download size={18} /> Save PNG</>
          )}
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="w-full py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm font-semibold text-ct-2 min-h-[44px]"
      >
        Done
      </button>
    </div>
  )
}
