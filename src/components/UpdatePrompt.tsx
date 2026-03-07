import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface UpdatePromptProps {
  onVisibilityChange?: (visible: boolean) => void
}

export function UpdatePrompt({ onVisibilityChange }: UpdatePromptProps) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | undefined>()
  const [dismissed, setDismissed] = useState(false)
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl: string, swRegistration?: ServiceWorkerRegistration) {
      setRegistration(swRegistration ?? undefined)
    },
    onRegisterError(error: unknown) {
      if (import.meta.env.DEV) console.error('Service worker registration failed:', error)
    },
  })

  useEffect(() => {
    onVisibilityChange?.(needRefresh && !dismissed)
  }, [dismissed, needRefresh, onVisibilityChange])

  useEffect(() => {
    if (!needRefresh) {
      setDismissed(false)
    }
  }, [needRefresh])

  useEffect(() => {
    if (!registration || !import.meta.env.PROD) return

    const checkForUpdate = () => {
      registration.update().catch((error) => {
        if (import.meta.env.DEV) console.error('Service worker update check failed:', error)
      })
    }

    checkForUpdate()

    const interval = window.setInterval(checkForUpdate, 15 * 60 * 1000)
    const handleFocus = () => checkForUpdate()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [registration])

  if (needRefresh && !dismissed) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[95] p-3 animate-fade-in"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="max-w-lg mx-auto bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <RefreshCw size={18} className="text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ct-1">New TRACKVOLT update ready</p>
            <p className="text-[11px] text-ct-2">Refresh to load the latest fixes and screens.</p>
          </div>
          <button
            onClick={() => void updateServiceWorker(true)}
            className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shrink-0"
          >
            Update
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 shrink-0"
            aria-label="Dismiss update prompt"
          >
            <X size={14} className="text-ct-2" />
          </button>
        </div>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-[95] p-3 animate-fade-in"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="max-w-lg mx-auto bg-green-500/15 border border-green-500/30 rounded-xl p-3 flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
            <RefreshCw size={18} className="text-green-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ct-1">TRACKVOLT is ready offline</p>
            <p className="text-[11px] text-ct-2">Your latest install is cached for offline use.</p>
          </div>
          <button
            onClick={() => setOfflineReady(false)}
            className="p-1 shrink-0"
            aria-label="Dismiss offline ready prompt"
          >
            <X size={14} className="text-ct-2" />
          </button>
        </div>
      </div>
    )
  }

  return null
}
