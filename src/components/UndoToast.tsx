import { useEffect, useState } from 'react'
import { Undo2 } from 'lucide-react'

interface UndoToastProps {
  message: string
  duration?: number
  onUndo: () => void
  onExpire: () => void
}

export function UndoToast({ message, duration = 5000, onUndo, onExpire }: UndoToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onExpire()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [duration, onExpire])

  return (
    <div className="fixed top-safe left-0 right-0 z-50 flex justify-center px-4 pt-4 animate-toast-in" role="status" aria-live="polite">
      <div className="bg-slate-800 border border-ct-border rounded-ct-lg px-4 py-3 shadow-xl flex items-center gap-3 max-w-sm w-full">
        <p className="text-sm text-ct-1 flex-1">{message}</p>
        <button onClick={onUndo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 text-sm font-bold active:bg-cyan-500/25 shrink-0">
          <Undo2 size={14} /> Undo
        </button>
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-ct-elevated rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400/50 transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}