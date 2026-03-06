import { useEffect, useState, useCallback } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { haptic } from '../hooks/useHaptic'

interface Props {
  message: string
  type?: 'success' | 'error'
  onDone: () => void
}

export function SaveToast({ message, type = 'success', onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Haptic on toast appear
    haptic(type === 'success' ? 'heavy' : 'error')
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2200)
    return () => clearTimeout(timer)
  }, [onDone, type])

  const Icon = type === 'success' ? Check : AlertCircle
  const styles = type === 'success'
    ? { bg: 'bg-green-500/15 border-green-500/30', icon: 'text-green-400', text: 'text-green-300' }
    : { bg: 'bg-red-500/15 border-red-500/30', icon: 'text-red-400', text: 'text-red-300' }

  return (
    <div
      className={`fixed left-4 right-4 z-[100] flex justify-center transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      role="status"
      aria-live="polite"
    >
      <div className={`${styles.bg} border backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg max-w-sm animate-toast-in`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Icon size={14} className={styles.icon} />
        </div>
        <span className={`text-sm font-medium ${styles.text}`}>{message}</span>
      </div>
    </div>
  )
}

// Reusable toast hook
export function useSaveToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }, [])

  const toastEl = toast ? (
    <SaveToast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
  ) : null

  return { toast, showToast, toastEl }
}
