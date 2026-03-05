import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Home, Plus, Dumbbell, UtensilsCrossed, MoreHorizontal } from 'lucide-react'
import { haptic } from '../hooks/useHaptic'

const tabs = [
  { id: 'today', icon: Home, key: 'tabs.today' },
  { id: 'train', icon: Dumbbell, key: 'tabs.train' },
  { id: 'log', icon: Plus, key: 'tabs.log', isCta: true },
  { id: 'eat', icon: UtensilsCrossed, key: 'tabs.eat' },
  { id: 'more', icon: MoreHorizontal, key: 'tabs.more' },
]

export function TabBar() {
  const { t } = useTranslation()
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ct-bg/95 backdrop-blur-md border-t border-ct-border flex items-end justify-around z-50 pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
      role="tablist" aria-label="Main navigation">
      {tabs.map(({ id, icon: Icon, key, isCta }) => {
        const isActive = activeTab === id
        return (
          <button key={id} onClick={() => { haptic('selection'); setActiveTab(id) }}
            role="tab" aria-selected={isActive} aria-label={t(key)}
            className={`flex flex-col items-center gap-0.5 transition-all duration-150 relative ${
              isCta ? 'relative -mt-3' : 'px-3 py-2 min-h-[44px] min-w-[44px]'
            } ${
              isActive && !isCta ? 'text-cyan-400' : !isCta ? 'text-ct-2 active:text-ct-2' : ''
            }`}>
            {isActive && !isCta && (
              <div className="absolute -top-0.5 left-1/2 w-1.5 h-1.5 rounded-full bg-v21 animate-tab-dot" />
            )}
            {isCta ? (
              <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-150 ${
                isActive ? 'bg-v21 shadow-v21 scale-105' : 'bg-v21 shadow-v21 opacity-90 active:scale-95'
              }`} style={{ width: 52, height: 52 }}>
                <Icon size={24} strokeWidth={2.5} className="text-white" />
              </div>
            ) : (
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} className="transition-all duration-150" />
            )}
            <span className={`text-[11px] font-medium transition-colors ${isCta ? (isActive ? 'text-cyan-400' : 'text-ct-2') : ''}`}>
              {t(key)}
            </span>
          </button>
        )
      })}
    </nav>
  )
}