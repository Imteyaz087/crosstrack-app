import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Home, Plus, Dumbbell, UtensilsCrossed, MoreHorizontal } from 'lucide-react'

const tabs = [
  { id: 'today', icon: Home,            key: 'tabs.today' },
  { id: 'log',   icon: Plus,            key: 'tabs.log'   },
  { id: 'train', icon: Dumbbell,        key: 'tabs.train' },
  { id: 'eat',   icon: UtensilsCrossed, key: 'tabs.eat'   },
  { id: 'more',  icon: MoreHorizontal,  key: 'tabs.more'  },
]

export function TabBar() {
  const { t } = useTranslation()
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111118] border-t border-white/[0.06] flex items-center justify-around h-16 z-50 safe-area-pb">
      {tabs.map(({ id, icon: Icon, key }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 transition-all duration-200"
          style={{
            color: activeTab === id ? '#C8FF00' : '#4a4a5a',
          }}
        >
          <Icon
            size={22}
            strokeWidth={activeTab === id ? 2.5 : 1.5}
          />
          <span
            className="text-[10px] font-semibold tracking-wide"
            style={{ opacity: activeTab === id ? 1 : 0.5 }}
          >
            {t(key)}
          </span>
        </button>
      ))}
    </nav>
  )
}
