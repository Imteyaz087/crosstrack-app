import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useStore } from './stores/useStore'
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
  const [prevTab, setPrevTab] = useState(activeTab)

  // Tab order for directional transitions
  const TAB_ORDER = ['today', 'log', 'train', 'eat', 'more']

  useEffect(() => {
    loadProfile()
  }, [])

  // Scroll to top on tab switch
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [activeTab])

  // Update previous tab when activeTab changes (only depends on activeTab)
  useEffect(() => {
    setPrevTab(activeTab)
  }, [activeTab])

  // Compute slide direction
  const slideDirection = (() => {
    const prevIdx = TAB_ORDER.indexOf(prevTab)
    const nextIdx = TAB_ORDER.indexOf(activeTab)
    return nextIdx > prevIdx ? 'right' : 'left'
  })()

  // Show loading while profile is being fetched
  if (isLoading) {
    return (
      <div className="h-screen-safe bg-ct-bg text-white flex items-center justify-center">
        <LoadingSpinner text="Starting TRACKVOLT..." />
      </div>
    )
  }

  // Show error with retry if loading failed
  if (loadError) {
    return (
      <div className="h-screen-safe bg-ct-bg text-white flex items-center justify-center">
        <ErrorRetry message={loadError} onRetry={() => { clearLoadError(); loadProfile() }} />
      </div>
    )
  }

  // Show onboarding if profile doesn't exist or onboarding not complete
  if (!profile || !profile.onboardingComplete) {
    return (
      <Suspense fallback={<div className="h-screen-safe bg-ct-bg text-white flex items-center justify-center"><LoadingSpinner text="Loading..." /></div>}>
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
    <div className="h-screen-safe bg-ct-bg text-white flex flex-col overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-900 focus:rounded-lg focus:text-sm focus:font-bold">
        Skip to content
      </a>
      <main ref={mainRef} id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain" role="tabpanel" aria-label={activeTab}>
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
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {activeTab === 'today' ? 'Today' : activeTab === 'log' ? 'Log' : activeTab === 'train' ? 'Training' : activeTab === 'eat' ? 'Nutrition' : 'More'} tab selected
      </div>
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
