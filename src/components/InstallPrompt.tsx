import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    setDismissed(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] p-3 animate-fade-in" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
      <div className="max-w-lg mx-auto bg-cyan-500/15 border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
        <Download size={20} className="text-cyan-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ct-1">Install TRACKVOLT</p>
          <p className="text-[11px] text-ct-2">Add to home screen for the best experience</p>
        </div>
        <button onClick={handleInstall} className="px-3 py-1.5 bg-cyan-500 text-black text-xs font-bold rounded-lg shrink-0">
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 shrink-0" aria-label="Dismiss">
          <X size={14} className="text-ct-2" />
        </button>
      </div>
    </div>
  )
}
