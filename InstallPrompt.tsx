import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const INSTALL_KEY = 'tv_install'

interface InstallState {
  dismissed: boolean
  visitCount: number
  lastVisit: string | null
}

function getInstallState(): InstallState {
  try {
    const raw = localStorage.getItem(INSTALL_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { dismissed: false, visitCount: 0, lastVisit: null }
}

function saveInstallState(state: InstallState): void {
  localStorage.setItem(INSTALL_KEY, JSON.stringify(state))
}

export function InstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Track visits and decide when to show
  useEffect(() => {
    const state = getInstallState()
    if (state.dismissed) return

    // Count unique days (not every page load)
    const today = new Date().toISOString().split('T')[0]
    if (state.lastVisit !== today) {
      state.visitCount++
      state.lastVisit = today
      saveInstallState(state)
    }

    // Show after 3+ visits (user has come back multiple days)
    // or after 2nd workout (checked via IndexedDB count below)
    if (state.visitCount >= 3) {
      setShow(true)
      return
    }

    // Also check workout count — if 2+ workouts, they're invested
    ;(async () => {
      try {
        const { db } = await import('../db/database')
        const count = await db.workouts.count()
        if (count >= 2) setShow(true)
      } catch { /* non-critical */ }
    })()
  }, [])

  if (!deferredPrompt || !show) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    handleDismiss()
  }

  const handleDismiss = () => {
    setShow(false)
    const state = getInstallState()
    state.dismissed = true
    saveInstallState(state)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[90] p-3 animate-fade-in" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
      <div className="max-w-lg mx-auto bg-cyan-500/15 border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
        <Download size={20} className="text-cyan-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ct-1">{t('install.title')}</p>
          <p className="text-[11px] text-ct-2">{t('install.desc')}</p>
        </div>
        <button onClick={handleInstall} className="px-3 py-1.5 bg-cyan-500 text-black text-xs font-bold rounded-lg shrink-0">
          {t('install.install')}
        </button>
        <button onClick={handleDismiss} className="p-1 shrink-0" aria-label="Dismiss">
          <X size={14} className="text-ct-2" />
        </button>
      </div>
    </div>
  )
}
