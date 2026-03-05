import { useState, useRef, useEffect } from 'react'
import { Camera, X, Search, Loader2, AlertCircle, Barcode, Edit3, Check, WifiOff } from 'lucide-react'
import type { FoodItem } from '../../types'
import { lookupBarcode, resultToFoodItem } from '../../services/nutritionApi'
import type { NutritionResult } from '../../types'

interface BarcodeScannerProps {
  t: (key: string) => string
  onFoodFound: (food: FoodItem) => void
  onClose: () => void
  onCreateCustom?: () => void
}

type ScanMode = 'choose' | 'camera' | 'manual' | 'result' | 'review' | 'notfound'

export function BarcodeScanner({ t, onFoodFound, onClose, onCreateCustom }: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>('choose')
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<NutritionResult | null>(null)
  const [error, setError] = useState('')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [fromCache, setFromCache] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Editable fields for review mode
  const [editName, setEditName] = useState('')
  const [editCal, setEditCal] = useState('')
  const [editProtein, setEditProtein] = useState('')
  const [editCarbs, setEditCarbs] = useState('')
  const [editFat, setEditFat] = useState('')
  const [editFiber, setEditFiber] = useState('')

  // Track online/offline
  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setMode('camera')
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        startBarcodeDetection()
      }
    } catch {
      setError(t('scanner.cameraError'))
      setMode('manual')
    }
  }

  const startBarcodeDetection = () => {
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
      })
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue
            stopCamera()
            setBarcode(code)
            doLookup(code)
          }
        } catch {
          // Detection failed, continue scanning
        }
      }, 300)
    } else {
      // BarcodeDetector not supported — fall back to manual entry
      stopCamera()
      setError('Camera barcode scanning not supported on this device. Enter the number manually.')
      setMode('manual')
    }
  }

  const doLookup = async (code: string) => {
    setLoading(true)
    setError('')
    setProduct(null)
    try {
      const result = await lookupBarcode(code)
      setFromCache(result.fromCache)
      if (result.found && result.product) {
        setProduct(result.product)
        setMode('result')
      } else {
        setMode('notfound')
      }
    } catch {
      setError(t('scanner.networkError'))
      setMode('notfound')
    } finally {
      setLoading(false)
    }
  }

  const handleManualLookup = () => {
    const code = barcode.trim()
    if (!code) return
    doLookup(code)
  }

  const openReview = () => {
    if (!product) return
    setEditName(product.name)
    setEditCal(String(product.caloriesPer100g))
    setEditProtein(String(product.proteinPer100g))
    setEditCarbs(String(product.carbsPer100g))
    setEditFat(String(product.fatPer100g))
    setEditFiber(String(product.fiberPer100g || 0))
    setMode('review')
  }

  const handleConfirmSave = () => {
    const food: FoodItem = {
      name: editName.trim() || 'Unknown',
      category: product?.category || 'Other',
      caloriesPer100g: Math.round(parseFloat(editCal) || 0),
      proteinPer100g: Math.round((parseFloat(editProtein) || 0) * 10) / 10,
      carbsPer100g: Math.round((parseFloat(editCarbs) || 0) * 10) / 10,
      fatPer100g: Math.round((parseFloat(editFat) || 0) * 10) / 10,
      fiberPer100g: parseFloat(editFiber) || 0,
      sugarPer100g: product?.sugarPer100g,
      sodiumPer100g: product?.sodiumPer100g,
      defaultServingG: product?.servingSize || 100,
      isCustom: true,
    }
    onFoodFound(food)
  }

  const handleQuickAdd = () => {
    if (!product) return
    onFoodFound(resultToFoodItem(product))
  }

  const qualityBadge = (q: string) => {
    if (q === 'high') return <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">Complete</span>
    if (q === 'medium') return <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">Partial</span>
    return <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">Limited</span>
  }

  return (
    <div className="space-y-4 w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ct-1">{t('scanner.title')}</h2>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
              <WifiOff size={12} /> Offline
            </span>
          )}
          <button onClick={() => { stopCamera(); onClose() }} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Choose mode */}
      {mode === 'choose' && (
        <div className="space-y-3">
          <p className="text-sm text-ct-2">{t('scanner.chooseMethod')}</p>
          <button onClick={startCamera}
            className="w-full bg-slate-800 border border-slate-700 rounded-ct-lg p-5 flex items-center gap-4 active:bg-ct-elevated min-h-[72px]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <Camera size={24} className="text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-ct-1 font-semibold">{t('scanner.scanCamera')}</p>
              <p className="text-xs text-ct-2 mt-0.5">{t('scanner.scanCameraDesc')}</p>
            </div>
          </button>
          <button onClick={() => setMode('manual')}
            className="w-full bg-slate-800 border border-slate-700 rounded-ct-lg p-5 flex items-center gap-4 active:bg-ct-elevated min-h-[72px]">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Barcode size={24} className="text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-ct-1 font-semibold">{t('scanner.enterManually')}</p>
              <p className="text-xs text-ct-2 mt-0.5">{t('scanner.enterManuallyDesc')}</p>
            </div>
          </button>
        </div>
      )}

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="space-y-3">
          <div className="relative rounded-ct-lg overflow-hidden bg-black aspect-[4/3]">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-cyan-400/60 rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-cyan-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-cyan-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-cyan-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-cyan-400 rounded-br" />
                <div className="absolute left-2 right-2 h-0.5 bg-cyan-400/80 animate-pulse top-1/2" />
              </div>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 size={32} className="text-cyan-400 animate-spin" />
              </div>
            )}
          </div>
          {error && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-orange-400 mt-0.5 shrink-0" />
              <p className="text-xs text-orange-300">{error}</p>
            </div>
          )}
          <p className="text-xs text-ct-2 text-center">{t('scanner.pointAtBarcode')}</p>
          <button onClick={() => { stopCamera(); setMode('manual') }}
            className="w-full bg-slate-800 text-ct-2 font-semibold py-3 rounded-xl text-sm min-h-[44px]">
            {t('scanner.enterManually')}
          </button>
        </div>
      )}

      {/* Manual entry */}
      {mode === 'manual' && (
        <div className="space-y-3">
          <div className="bg-ct-surface rounded-ct-lg p-5 border border-ct-border">
            <label className="text-sm text-ct-2 mb-2 block">{t('scanner.barcodeNumber')}</label>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" value={barcode} onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
                placeholder={t('scanner.barcodePlaceholder')}
                className="flex-1 bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 min-h-[48px] tabular-nums"
                autoFocus />
            </div>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
          <button onClick={handleManualLookup} disabled={!barcode.trim() || loading}
            className="w-full bg-cyan-500 text-slate-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-sm min-h-[48px] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            {loading ? t('scanner.searching') : t('scanner.lookup')}
          </button>
          <button onClick={() => setMode('choose')} className="w-full text-ct-2 text-sm py-2 min-h-[44px]">
            {t('common.back')}
          </button>
        </div>
      )}

      {/* Result found — quick view */}
      {mode === 'result' && product && (
        <div className="space-y-3">
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-green-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-ct-1 leading-tight">{product.name}</p>
                {product.brand && <p className="text-xs text-ct-2 mt-0.5">{product.brand}</p>}
                <p className="text-xs text-ct-2 mt-0.5 tabular-nums">{t('scanner.barcode')}: {barcode}</p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                {qualityBadge(product.dataQuality)}
                {fromCache && <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">Cached</span>}
              </div>
            </div>

            {/* Nutrition grid */}
            <div className="grid grid-cols-4 gap-1 bg-ct-elevated/50 rounded-xl px-2 py-2.5 mb-3">
              <div className="text-center">
                <p className="text-sm font-bold text-ct-1 tabular-nums">{product.caloriesPer100g}</p>
                <p className="text-[0.6rem] text-ct-2">cal</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-400 tabular-nums">{product.proteinPer100g}g</p>
                <p className="text-[0.6rem] text-ct-2">prot</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-orange-400 tabular-nums">{product.carbsPer100g}g</p>
                <p className="text-[0.6rem] text-ct-2">carb</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-pink-400 tabular-nums">{product.fatPer100g}g</p>
                <p className="text-[0.6rem] text-ct-2">fat</p>
              </div>
            </div>
            <p className="text-[0.6rem] text-ct-2 text-center mb-1">{t('scanner.per100g')}</p>
            {product.servingSize && (
              <p className="text-xs text-ct-2 text-center">{t('scanner.servingSize')}: {product.servingSize}g</p>
            )}
          </div>

          {/* Action buttons */}
          <button onClick={handleQuickAdd}
            className="w-full bg-green-500 text-slate-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-sm min-h-[48px]">
            {t('scanner.addToLibrary')}
          </button>
          <button onClick={openReview}
            className="w-full bg-slate-800 border border-slate-700 text-ct-1 font-semibold py-3 rounded-xl text-sm min-h-[44px] flex items-center justify-center gap-2">
            <Edit3 size={16} /> Review & Edit Before Saving
          </button>
          <button onClick={() => { setMode('choose'); setBarcode(''); setProduct(null) }}
            className="w-full text-ct-2 text-sm py-2 min-h-[44px]">
            {t('scanner.scanAnother')}
          </button>
        </div>
      )}

      {/* Review & Edit mode */}
      {mode === 'review' && (
        <div className="space-y-3">
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-cyan-500/30">
            <p className="text-sm font-semibold text-ct-1 mb-3">Review Nutrition (per 100g)</p>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs text-ct-2 mb-1 block">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 min-h-[40px]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-ct-2 mb-1 block">Calories</label>
                  <input type="text" inputMode="decimal" value={editCal} onChange={e => setEditCal(e.target.value)}
                    className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 min-h-[40px] tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-green-400 mb-1 block">Protein (g)</label>
                  <input type="text" inputMode="decimal" value={editProtein} onChange={e => setEditProtein(e.target.value)}
                    className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-400/50 min-h-[40px] tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-orange-400 mb-1 block">Carbs (g)</label>
                  <input type="text" inputMode="decimal" value={editCarbs} onChange={e => setEditCarbs(e.target.value)}
                    className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[40px] tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-pink-400 mb-1 block">Fat (g)</label>
                  <input type="text" inputMode="decimal" value={editFat} onChange={e => setEditFat(e.target.value)}
                    className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-pink-400/50 min-h-[40px] tabular-nums" />
                </div>
              </div>
              <div className="w-1/2">
                <label className="text-xs text-ct-2 mb-1 block">Fiber (g)</label>
                <input type="text" inputMode="decimal" value={editFiber} onChange={e => setEditFiber(e.target.value)}
                  className="w-full bg-ct-elevated rounded-lg py-2.5 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50 min-h-[40px] tabular-nums" />
              </div>
            </div>
          </div>

          <button onClick={handleConfirmSave}
            className="w-full bg-green-500 text-slate-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-sm min-h-[48px] flex items-center justify-center gap-2">
            <Check size={18} /> Confirm & Save
          </button>
          <button onClick={() => setMode('result')} className="w-full text-ct-2 text-sm py-2 min-h-[44px]">
            {t('common.back')}
          </button>
        </div>
      )}

      {/* Not found */}
      {mode === 'notfound' && (
        <div className="space-y-3">
          <div className="bg-ct-surface rounded-ct-lg p-6 border border-ct-border text-center">
            <div className="w-14 h-14 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={28} className="text-orange-400" />
            </div>
            <p className="text-ct-1 font-semibold mb-1">{t('scanner.notFound')}</p>
            <p className="text-sm text-ct-2">{t('scanner.notFoundDesc')}</p>
            {barcode && <p className="text-xs text-ct-2 mt-2 font-mono tabular-nums">{barcode}</p>}
            {isOffline && (
              <p className="text-xs text-orange-400 mt-2">You're offline — try again when connected</p>
            )}
          </div>
          {onCreateCustom && (
            <button onClick={onCreateCustom}
              className="w-full bg-cyan-500 text-slate-900 font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform text-sm min-h-[48px]">
              Create Custom Food
            </button>
          )}
          <button onClick={() => { setMode('choose'); setBarcode('') }}
            className="w-full bg-slate-800 text-ct-2 font-semibold py-3 rounded-xl text-sm min-h-[44px]">
            {t('scanner.tryAgain')}
          </button>
        </div>
      )}
    </div>
  )
}
