import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOnline(false)
    const goOnline = () => {
      setIsOnline(true)
      setShowBack(true)
      setTimeout(() => setShowBack(false), 3000)
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (isOnline && !showBack) return null

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-[80] flex justify-center px-4 transition-all duration-300"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
        isOnline ? 'bg-green-500/20 border border-green-500/30 text-green-400'
          : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
      }`}>
        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isOnline ? 'Back online' : 'Offline — your data is safe'}
      </div>
    </div>
  )
}