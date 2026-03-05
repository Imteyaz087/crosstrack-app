import { useState, useEffect } from 'react'

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<{ outcome: string }> } | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone
      || document.referrer.includes('android-app')
    setIsStandalone(standalone)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as unknown as { prompt: () => Promise<{ outcome: string }> })
    }
    window.addEventListener('beforeinstallprompt', handler)
    const wasDismissed = localStorage.getItem('trackvolt-install-dismissed')
    if (wasDismissed) setDismissed(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDismissed(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('trackvolt-install-dismissed', '1')
  }

  const show = !isStandalone && deferredPrompt && !dismissed

  if (!show) return null

  return (
    <div
      className="fixed left-4 right-4 top-4 z-[55] flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <span className="text-sm font-medium text-white flex-1">
        Add to Home Screen for quick access
      </span>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="tap-target px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'var(--volt)', color: '#0D0D14' }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="tap-target px-2 py-1.5 text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
