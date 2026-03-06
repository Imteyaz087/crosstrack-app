import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { haptic } from '../../hooks/useHaptic'
import { E } from '../../utils/emoji'

interface WaterTrackerProps {
  t: (key: string) => string
  currentWaterMl: number
  waterTarget: number
  onSave: (totalMl: number) => void
  onClose: () => void
}

const GLASS_ML = 250
const QUICK_AMOUNTS = [100, 200, 500, 1000]

export function WaterTracker({ t, currentWaterMl, waterTarget, onSave, onClose }: WaterTrackerProps) {
  const [totalMl, setTotalMl] = useState(currentWaterMl)
  const [customMode, setCustomMode] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  const glassCount = Math.floor(totalMl / GLASS_ML)
  const targetGlasses = Math.ceil(waterTarget / GLASS_ML)
  const percentage = Math.min(100, Math.round((totalMl / waterTarget) * 100))
  const isComplete = totalMl >= waterTarget

  const toggleGlass = (index: number) => {
    haptic('medium')
    const clickedGlassMl = (index + 1) * GLASS_ML
    if (totalMl >= clickedGlassMl) {
      setTotalMl(index * GLASS_ML)
    } else {
      setTotalMl(clickedGlassMl)
    }
  }

  const addCustom = () => {
    const amount = parseInt(customAmount)
    if (amount > 0 && amount <= 5000) {
      setTotalMl(prev => Math.min(prev + amount, 10000))
      setCustomAmount('')
      setCustomMode(false)
    }
  }

  const quickAdd = (amount: number) => {
    haptic('light')
    setTotalMl(prev => Math.min(prev + amount, 10000))
  }

  const quickRemove = (amount: number) => {
    haptic('light')
    setTotalMl(prev => Math.max(prev - amount, 0))
  }

  const displayGlasses = Math.max(targetGlasses, glassCount + 2, 8)

  return (
    <div className="space-y-4 w-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ct-1 flex items-center gap-2">
          <span className="text-2xl">{E.droplet}</span>
          {t('water.title')}
        </h1>
        <button onClick={onClose} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Big progress display */}
      <div className="bg-gradient-to-br from-blue-950/60 to-ct-surface rounded-ct-lg p-5 border border-blue-500/20 text-center">
        {/* Water wave emoji */}
        <div className="text-4xl mb-2">
          {isComplete ? E.party : percentage >= 75 ? E.wave : percentage >= 50 ? E.splash : percentage >= 25 ? E.droplet : E.cup_straw}
        </div>
        {/* Current amount */}
        <div className="mb-3">
          <p className={`text-4xl font-black tabular-nums ${isComplete ? 'text-blue-400' : 'text-ct-1'}`}>
            {totalMl < 1000 ? `${totalMl}` : `${(totalMl / 1000).toFixed(1)}`}
          </p>
          <p className="text-sm text-ct-2 mt-0.5">
            {totalMl < 1000 ? 'ml' : 'L'} / {(waterTarget / 1000).toFixed(1)}L
          </p>
        </div>

        {/* Progress bar with wave effect */}
        <div className="w-full h-4 bg-ct-elevated/80 rounded-full overflow-hidden mb-2 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className={`text-xs font-semibold ${isComplete ? 'text-cyan-400' : 'text-ct-2'}`}>
          {isComplete ? `${t('water.goalReached')} ${E.target}` : `${percentage}% ${t('water.ofGoal')}`}
        </p>
      </div>

      {/* Glasses grid — tap to fill/unfill */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold">
            {t('water.tapGlasses')}
          </p>
          <p className="text-xs text-ct-2 tabular-nums">{GLASS_ML}ml / {t('water.glass')}</p>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: Math.min(displayGlasses, 20) }).map((_, i) => {
            const isFilled = totalMl >= (i + 1) * GLASS_ML
            const isPartial = !isFilled && totalMl > i * GLASS_ML
            const isTarget = i === targetGlasses - 1
            return (
              <button
                key={i}
                onClick={() => toggleGlass(i)}
                className={`relative flex flex-col items-center justify-center py-2 rounded-ct-lg transition-all min-h-[64px] ${
                  isFilled
                    ? 'bg-blue-500/20 border-2 border-blue-400/40 scale-100 active:scale-90'
                    : isPartial
                      ? 'bg-blue-500/10 border-2 border-blue-400/20 active:scale-90'
                      : 'bg-ct-elevated/40 border-2 border-ct-border active:bg-ct-elevated/60 active:scale-90'
                }`}
                aria-label={`Glass ${i + 1}: ${isFilled ? 'filled' : 'empty'}`}
              >
                {/* Emoji glass */}
                <span className={`text-2xl transition-all ${
                  isFilled ? 'grayscale-0' : isPartial ? 'grayscale-0 opacity-60' : 'grayscale opacity-30'
                }`}>
                  {E.glass}
                </span>
                {/* Glass number */}
                <span className={`text-[0.6rem] font-bold tabular-nums mt-0.5 ${
                  isFilled ? 'text-blue-400' : 'text-ct-2'
                }`}>{i + 1}</span>
                {/* Target marker */}
                {isTarget && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 border-2 border-ct-bg flex items-center justify-center shadow-lg shadow-cyan-400/30">
                    <span className="text-[0.45rem] text-slate-900 font-black">{E.target}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[0.6rem] text-ct-2 text-center mt-2.5">
          {t('water.tapToAddRemove')}
        </p>
      </div>

      {/* Quick add/remove buttons */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] text-ct-2 uppercase tracking-wider font-semibold mb-3">
          {t('water.quickAdjust')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map(amount => (
            <div key={amount} className="flex flex-col items-center gap-1">
              <span className="text-xs text-ct-2 font-bold tabular-nums">
                {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
              </span>
              <div className="flex gap-1">
                <button onClick={() => quickRemove(amount)}
                  className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 active:bg-red-500/30 active:scale-95"
                  aria-label={`Remove ${amount}ml`}>
                  <Minus size={16} />
                </button>
                <button onClick={() => quickAdd(amount)}
                  className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 active:bg-blue-500/30 active:scale-95"
                  aria-label={`Add ${amount}ml`}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      {customMode ? (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border flex gap-2">
          <input type="text" inputMode="numeric" value={customAmount} onChange={e => setCustomAmount(e.target.value.replace(/\D/g, ''))}
            placeholder={t('water.customPlaceholder')}
            className="flex-1 bg-ct-elevated rounded-xl py-3 px-3 text-ct-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400/40 min-h-[44px] tabular-nums"
            autoFocus />
          <span className="text-ct-2 text-sm self-center">ml</span>
          <button onClick={addCustom}
            className="bg-blue-500 text-ct-1 font-bold px-4 rounded-xl text-sm min-h-[44px]">
            {t('log.add')}
          </button>
        </div>
      ) : (
        <button onClick={() => setCustomMode(true)}
          className="w-full bg-ct-surface rounded-ct-lg p-3 border border-ct-border text-ct-2 text-sm font-semibold min-h-[44px]">
          {t('water.addCustomAmount')}
        </button>
      )}

      {/* Summary info */}
      <div className="bg-ct-surface rounded-xl p-3 flex items-center justify-between">
        <div className="text-xs text-ct-2">
          <span className="font-semibold text-ct-2">{glassCount}</span> {t('water.glasses')} {E.glass} × {GLASS_ML}ml = <span className="font-semibold text-blue-400 tabular-nums">{glassCount * GLASS_ML}ml</span>
          {totalMl % GLASS_ML > 0 && (
            <span> + <span className="text-blue-400 tabular-nums">{totalMl % GLASS_ML}ml</span></span>
          )}
        </div>
      </div>

      {/* Save */}
      <button onClick={() => onSave(totalMl)}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform text-base shadow-lg shadow-blue-500/30 min-h-[52px]">
        {t('common.save')} ({totalMl < 1000 ? `${totalMl}ml` : `${(totalMl / 1000).toFixed(1)}L`}) {E.droplet}
      </button>
    </div>
  )
}
