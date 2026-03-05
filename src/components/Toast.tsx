import { useEffect } from 'react'
import { Check } from 'lucide-react'

interface Props {
  message: string
  visible: boolean
  onHide: () => void
}

export function Toast({ message, visible, onHide }: Props) {
  useEffect(() => {
    if (!visible || !message) return
    const t = setTimeout(onHide, 2500)
    return () => clearTimeout(t)
  }, [visible, message, onHide])

  if (!visible) return null

  return (
    <div
      className="fixed left-4 right-4 bottom-24 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-toast"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(200, 255, 0, 0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(200, 255, 0, 0.2)' }}
      >
        <Check size={18} style={{ color: 'var(--volt)' }} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-medium text-white">{message}</span>
    </div>
  )
}
