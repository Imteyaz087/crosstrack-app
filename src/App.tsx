import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useStore } from './stores/useStore'
import { initializeDB } from './db/database'
import { TabBar } from './components/TabBar'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorRetry } from './components/ErrorRetry'
import { TodayPageSkeleton } from './components/SkeletonCard'
import { InstallPrompt } from './components/InstallPrompt'
import { OfflineBar } from './components/OfflineBar'
import { OnboardingTour } from './components/OnboardingTour'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SleepImportHandler } from './components/SleepImportHandler'
import './i18n'

// Lazy-load pages for better initial bundle (~300KB saved)
const TodayPage = lazy(() => import('./pages/TodayPage').then(m => ({ default: m.TodayPage })))
const LogPage = lazy(() => import('./pages/LogPage').then(m => ({ default: m.LogPage })))
const TrainingPage = lazy(() => import('./pages/TrainingPage').then(m => ({ default: m.TrainingPage })))
const NutritionPage = lazy(() => import('./pages/NutritionPage').then(m => ({ default: m.NutritionPage })))
const MorePage = lazy(() => import('./pages/MorePage').then(m => ({ default: m.MorePage })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })))

function App() {
  const { activeTab, profile, isLoading, loadProfile, loadError, clearLoadError } = useStore()
  const mainRef = useRef<HTMLElement>(null)
  const prevTabRef = useRef(activeTab)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none')

  // Tab order for directional transitions
  const TAB_ORDER = ['today', 'log', 'train', 'eat', 'more']

  useEffect(() => {
    initializeDB()
    loadProfile()
  }, [])

  // Determine slide direction on tab switch + scroll to top
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      const prevIdx = TAB_ORDER.indexOf(prevTabRef.current)
      const nextIdx = TAB_ORDER.indexOf(activeTab)
      setSlideDirection(nextIdx > prevIdx ? 'right' : 'left')
      prevTabRef.current = activeTab
    }
    mainRef.current?.scrollTo(0, 0)
  }, [activeTab])

  // Show loading while profile is being fetched
  if (isLoading) {
    return (
      <div className="h-screen-safe bg-slate-950 text-white flex items-center justify-center">
        <LoadingSpinner text="Starting TRACKVOLT..." />
      </div>
    )
  }

  // Show error with retry if loading failed
  if (loadError) {
    return (
      <div className="h-screen-safe bg-slate-950 text-white flex items-center justify-center">
        <ErrorRetry message={loadError} onRetry={() => { clearLoadError(); loadProfile() }} />
      </div>
    )
  }

  // Show onboarding if profile doesn't exist or onboarding not complete
  if (!profile || !profile.onboardingComplete) {
    return (
      <Suspense fallback={<div className="h-screen-safe bg-slate-950 text-white flex items-center justify-center"><LoadingSpinner text="Loading..." /></div>}>
        <OnboardingPage />
      </Suspense>
    )
  }

  const pages: Record<string, React.ReactNode> = {
    today: <TodayPage />,
    log: <LogPage />,
    train: <TrainingPage />,
    eat: <NutritionPage />,
    more: <MorePage />,
  }

  return (
    <div className="h-screen-safe bg-slate-950 text-white flex flex-col overflow-hidden">
      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain" role="tabpanel" aria-label={activeTab}>
        <Suspense fallback={<div className="max-w-lg mx-auto w-full px-4 pt-safe-plus pb-tab-bar"><TodayPageSkeleton /></div>}>
          <div className={`max-w-lg mx-auto w-full px-4 pt-safe-plus pb-tab-bar ${
            slideDirection === 'right' ? 'animate-slide-right' :
            slideDirection === 'left' ? 'animate-slide-left' :
            'animate-page-in'
          }`} key={activeTab}>
            {pages[activeTab] || <TodayPage />}
          </div>
        </Suspense>
      </main>

      <OfflineBar />
      <TabBar />
      <InstallPrompt />
      <OnboardingTour />
      <SleepImportHandler />
    </div>
  )
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithErrorBoundary
