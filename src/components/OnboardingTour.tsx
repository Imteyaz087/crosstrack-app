import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Dumbbell, Plus, UtensilsCrossed, MoreHorizontal, Home } from 'lucide-react'

const TOUR_KEY = 'trackvolt_tour_done'

interface TourStep {
  title: string
  description: string
  icon: typeof Home
  color: string
  position: 'center' | 'bottom'
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to TRACKVOLT!',
    description: 'Your hybrid athlete operating system. Let me show you around  -  it only takes 30 seconds.',
    icon: Home,
    color: 'text-cyan-400',
    position: 'center',
  },
  {
    title: 'Today Tab',
    description: 'Your daily dashboard  -  see today\'s workout, macros, streaks, and quick access to Timer and 1RM Calculator.',
    icon: Home,
    color: 'text-cyan-400',
    position: 'bottom',
  },
  {
    title: 'Train Tab',
    description: 'Training calendar, workout history, Movement PRs, and your benchmark WOD tracker.',
    icon: Dumbbell,
    color: 'text-violet-400',
    position: 'bottom',
  },
  {
    title: 'Log Button',
    description: 'The big + button! Log workouts (CrossFit, HYROX, Cardio), meals, weight, sleep, water, energy, and recovery.',
    icon: Plus,
    color: 'text-cyan-400',
    position: 'bottom',
  },
  {
    title: 'Eat Tab',
    description: 'Nutrition hub  -  food library, meal templates, meal prep, weekly meal planner, and grocery lists.',
    icon: UtensilsCrossed,
    color: 'text-emerald-400',
    position: 'bottom',
  },
  {
    title: 'More Tab',
    description: 'Settings, achievements, PR wall, AI coaching, photo OCR, body measurements, heart rate, and cloud sync.',
    icon: MoreHorizontal,
    color: 'text-amber-400',
    position: 'bottom',
  },
]

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const prevStep = useRef(0)

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY)
    if (!done) setVisible(true)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(TOUR_KEY, 'true')
  }

  if (!visible) return null

  const goToStep = (next: number) => {
    setSlideDir(next > step ? 'left' : 'right')
    prevStep.current = step
    setStep(next)
    // Reset animation class after it plays
    setTimeout(() => setSlideDir(null), 320)
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0
  const Icon = current.icon
  const slideClass = slideDir === 'left' ? 'animate-tour-left' : slideDir === 'right' ? 'animate-tour-right' : ''

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center" onClick={dismiss} role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Card */}
      <div
        className={`relative mx-4 mb-24 max-w-sm w-full bg-ct-surface rounded-ct-lg border border-ct-border p-5 shadow-2xl animate-fade-in ${
          current.position === 'center' ? 'self-center mb-0' : ''
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={dismiss} className="absolute top-3 right-3 p-1 text-ct-2 active:text-ct-1" aria-label="Skip tour">
          <X size={16} />
        </button>

        {/* Icon + Step indicator  -  slides on step change */}
        <div key={step} className={slideClass}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-11 h-11 rounded-xl bg-ct-elevated/60 flex items-center justify-center ${current.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-ct-2">{step + 1} of {STEPS.length}</p>
              <p className="text-sm font-bold text-ct-1">{current.title}</p>
            </div>
          </div>

          <p className="text-xs text-ct-2 leading-relaxed mb-4">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-cyan-400' : i < step ? 'bg-cyan-400/40' : 'bg-ct-elevated'}`} />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button onClick={() => goToStep(step - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ct-elevated text-ct-2 text-xs font-medium active:bg-ct-elevated/80">
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {isLast ? (
              <button onClick={dismiss}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-900 text-xs font-bold active:bg-cyan-400">
                Let's Go!
              </button>
            ) : (
              <button onClick={() => goToStep(step + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium active:bg-cyan-500/30">
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        {!isLast && (
          <button onClick={dismiss} className="w-full text-center text-[11px] text-ct-2 mt-3 active:text-ct-2">
            Skip tour
          </button>
        )}
      </div>
    </div>
  )
}
