import { useEffect } from 'react'
import { useStore } from './stores/useStore'
import { initializeDB } from './db/database'
import { TabBar } from './components/TabBar'
import { TodayPage } from './pages/TodayPage'
import { LogPage } from './pages/LogPage'
import { TrainingPage } from './pages/TrainingPage'
import { NutritionPage } from './pages/NutritionPage'
import { MorePage } from './pages/MorePage'
import './i18n'

function App() {
  const { activeTab } = useStore()

  useEffect(() => {
    initializeDB()
  }, [])

  const pages: Record<string, React.ReactNode> = {
    today: <TodayPage />,
    log:   <LogPage />,
    train: <TrainingPage />,
    eat:   <NutritionPage />,
    more:  <MorePage />,
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'var(--bg-app)' }}>
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {pages[activeTab] || <TodayPage />}
      </main>
      <TabBar />
    </div>
  )
}

export default App
