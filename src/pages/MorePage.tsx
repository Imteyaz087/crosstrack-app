import React, { useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, BarChart3, Settings, ChevronRight, Timer, Calculator, BookOpen, Target, Trophy, ChefHat, Dumbbell, Brain, Cloud, Camera, Heart, History, Ruler, CalendarDays, Award, Loader2 } from 'lucide-react'

// Lazy-load ALL sub-pages — cuts MorePage chunk from 800KB to ~5KB
const GroceryPage = lazy(() => import('./GroceryPage').then(m => ({ default: m.GroceryPage })))
const ProgressPage = lazy(() => import('./ProgressPage').then(m => ({ default: m.ProgressPage })))
const SettingsPage = lazy(() => import('./SettingsPage').then(m => ({ default: m.SettingsPage })))
const TimerPage = lazy(() => import('./TimerPage').then(m => ({ default: m.TimerPage })))
const CalcPage = lazy(() => import('./CalcPage').then(m => ({ default: m.CalcPage })))
const BenchmarkPage = lazy(() => import('./BenchmarkPage').then(m => ({ default: m.BenchmarkPage })))
const MovementPRPage = lazy(() => import('./MovementPRPage').then(m => ({ default: m.MovementPRPage })))
const AchievementsPage = lazy(() => import('./AchievementsPage').then(m => ({ default: m.AchievementsPage })))
const WorkoutTemplatesPage = lazy(() => import('./WorkoutTemplatesPage').then(m => ({ default: m.WorkoutTemplatesPage })))
const MealPrepPage = lazy(() => import('./MealPrepPage').then(m => ({ default: m.MealPrepPage })))
const AICoachPage = lazy(() => import('./AICoachPage').then(m => ({ default: m.AICoachPage })))
const CloudSyncPage = lazy(() => import('./CloudSyncPage').then(m => ({ default: m.CloudSyncPage })))
const PhotoLogPage = lazy(() => import('./PhotoLogPage').then(m => ({ default: m.PhotoLogPage })))
const HeartRatePage = lazy(() => import('./HeartRatePage').then(m => ({ default: m.HeartRatePage })))
const WorkoutHistoryPage = lazy(() => import('./WorkoutHistoryPage').then(m => ({ default: m.WorkoutHistoryPage })))
const BodyMeasurementsPage = lazy(() => import('./BodyMeasurementsPage').then(m => ({ default: m.BodyMeasurementsPage })))
const WeeklyPlannerPage = lazy(() => import('./WeeklyPlannerPage').then(m => ({ default: m.WeeklyPlannerPage })))
const PRWallPage = lazy(() => import('./PRWallPage').then(m => ({ default: m.PRWallPage })))

type SubPage = 'menu' | 'grocery' | 'progress' | 'settings' | 'timer' | 'calc' | 'benchmarks' | 'movementPRs' | 'achievements' | 'wodTemplates' | 'mealPrep' | 'aiCoach' | 'cloudSync' | 'photoLog' | 'heartRate' | 'workoutHistory' | 'bodyMeasurements' | 'weeklyPlanner' | 'prWall'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="text-cyan-400 animate-spin" />
    </div>
  )
}

export function MorePage() {
  const { t } = useTranslation()
  const [subPage, setSubPage] = useState<SubPage>('menu')

  const back = <button onClick={() => setSubPage('menu')} className="flex items-center gap-1 text-cyan-400 text-sm mb-3 px-2 py-1 -ml-2 rounded-lg active:bg-ct-surface transition-colors min-h-[44px]" aria-label={t('common.back')}>&larr; {t('common.back')}</button>

  if (subPage !== 'menu') {
    const pageMap: Record<Exclude<SubPage, 'menu'>, React.ReactNode> = {
      grocery: <div>{back}<GroceryPage /></div>,
      progress: <div>{back}<ProgressPage /></div>,
      settings: <div>{back}<SettingsPage /></div>,
      timer: <TimerPage onClose={() => setSubPage('menu')} />,
      calc: <CalcPage onClose={() => setSubPage('menu')} />,
      benchmarks: <div>{back}<BenchmarkPage /></div>,
      movementPRs: <div>{back}<MovementPRPage /></div>,
      achievements: <div>{back}<AchievementsPage /></div>,
      wodTemplates: <div>{back}<WorkoutTemplatesPage /></div>,
      mealPrep: <div>{back}<MealPrepPage /></div>,
      aiCoach: <div>{back}<AICoachPage /></div>,
      cloudSync: <div>{back}<CloudSyncPage /></div>,
      photoLog: <div>{back}<PhotoLogPage /></div>,
      heartRate: <div>{back}<HeartRatePage /></div>,
      workoutHistory: <div>{back}<WorkoutHistoryPage /></div>,
      bodyMeasurements: <div>{back}<BodyMeasurementsPage /></div>,
      weeklyPlanner: <div>{back}<WeeklyPlannerPage /></div>,
      prWall: <div>{back}<PRWallPage /></div>,
    }
    return <Suspense fallback={<LoadingFallback />}>{pageMap[subPage]}</Suspense>
  }

  type ItemDef = { id: SubPage; icon: typeof Timer; label: string; desc: string; color: string; badge?: string }
  type Section = { title: string; items: ItemDef[] }

  const sections: Section[] = [
    {
      title: t('logMode.training'),
      items: [
        { id: 'workoutHistory', icon: History, label: t('more.workoutHistory'), desc: t('more.workoutHistoryDesc'), color: 'text-teal-400' },
        { id: 'weeklyPlanner', icon: CalendarDays, label: t('more.weeklyPlanner'), desc: t('more.weeklyPlannerDesc'), color: 'text-indigo-400' },
        { id: 'prWall', icon: Award, label: t('more.prWall'), desc: t('more.prWallDesc'), color: 'text-yellow-400' },
        { id: 'movementPRs', icon: Target, label: t('more.movementPRs'), desc: t('more.movementPRsDesc'), color: 'text-red-400' },
        { id: 'wodTemplates', icon: Dumbbell, label: t('more.benchmarkWODs'), desc: t('more.benchmarkWODsDesc'), color: 'text-pink-400' },
        { id: 'benchmarks', icon: BookOpen, label: t('more.myBenchmarks'), desc: t('more.myBenchmarksDesc'), color: 'text-orange-400' },
      ],
    },
    {
      title: t('logMode.bodyNutrition'),
      items: [
        { id: 'mealPrep', icon: ChefHat, label: t('more.mealPrep'), desc: t('more.mealPrepDesc'), color: 'text-emerald-400' },
        { id: 'grocery', icon: ShoppingCart, label: t('grocery.title'), desc: t('grocery.autoGenerated'), color: 'text-green-400' },
        { id: 'bodyMeasurements', icon: Ruler, label: t('more.bodyMeasurements'), desc: t('more.bodyMeasurementsDesc'), color: 'text-rose-400' },
        { id: 'heartRate', icon: Heart, label: t('more.heartRate'), desc: t('more.heartRateDesc'), color: 'text-red-400' },
      ],
    },
    {
      title: t('more.trainingInsights'),
      items: [
        { id: 'aiCoach', icon: Brain, label: t('more.trainingInsights'), desc: t('more.trainingInsightsDesc'), color: 'text-violet-400' },
        { id: 'progress', icon: BarChart3, label: t('progress.title'), desc: t('more.chartsDesc'), color: 'text-blue-400' },
        { id: 'achievements', icon: Trophy, label: t('more.achievements'), desc: t('more.achievementsDesc'), color: 'text-yellow-400' },
        { id: 'photoLog', icon: Camera, label: t('more.photoToLog'), desc: t('more.photoToLogDesc'), color: 'text-amber-400' },
      ],
    },
    {
      title: t('more.wodTimer'),
      items: [
        { id: 'timer', icon: Timer, label: t('more.wodTimer'), desc: t('more.wodTimerDesc'), color: 'text-cyan-400' },
        { id: 'calc', icon: Calculator, label: t('more.oneRMCalc'), desc: t('more.oneRMCalcDesc'), color: 'text-purple-400' },
      ],
    },
    {
      title: t('settings.app'),
      items: [
        { id: 'cloudSync', icon: Cloud, label: t('more.cloudSync'), desc: t('more.cloudSyncDesc'), color: 'text-sky-400' },
        { id: 'settings', icon: Settings, label: t('settings.title'), desc: t('more.profileDesc'), color: 'text-ct-2' },
      ],
    },
  ]

  return (
    <div className="space-y-5 pb-20">
      <h1 className="text-xl font-bold text-ct-1">{t('tabs.more')}</h1>

      {sections.map(section => (
        <div key={section.title}>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold mb-2 px-1">{section.title}</p>
          <div className="space-y-2">
            {section.items.map(({ id, icon: Icon, label, desc, color, badge }) => (
              <button
                key={id}
                onClick={() => setSubPage(id)}
                className="w-full bg-ct-surface rounded-ct-lg p-3.5 border border-ct-border flex items-center gap-3 card-press"
              >
                <div className="w-10 h-10 bg-ct-elevated/60 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className={color} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ct-1">{label}</p>
                    {badge && <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
                  </div>
                  <p className="text-[11px] text-ct-2 truncate">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-ct-2 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}