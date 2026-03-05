import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { haptic } from '../hooks/useHaptic'

export interface PRInfo {
  movementName: string
  prType: string
  newValue: string
  improvement?: string
  previousDate?: string
}

interface Props {
  pr: PRInfo
  onDone: () => void
}

export function PRToast({ pr, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    haptic('success')
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className={`fixed left-3 right-3 z-[200] flex justify-center transition-all duration-500 ease-out ${
      visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-6 scale-95 pointer-events-none'
    }`} style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      role="alert" aria-live="assertive">
      <div className="w-full max-w-sm bg-gradient-to-r from-yellow-600/90 via-amber-500/90 to-yellow-600/90 border border-yellow-400/60 backdrop-blur-md rounded-ct-lg px-4 py-3.5 shadow-2xl shadow-yellow-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-yellow-300/20 rounded-xl flex items-center justify-center shrink-0 animate-bounce"
            style={{ animationDuration: '1s', animationIterationCount: '2' }}>
            <Trophy size={22} className="text-yellow-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.15em] text-yellow-200/80 font-bold">New PR!</p>
            <p className="text-[15px] font-bold text-ct-1 truncate">{pr.movementName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-yellow-100 font-semibold">{pr.prType}: {pr.newValue}</span>
            </div>
          </div>
          {pr.improvement && (
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-ct-1 tabular-nums">{pr.improvement}</p>
              {pr.previousDate && (
                <p className="text-[9px] text-yellow-200/60">since {pr.previousDate}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}