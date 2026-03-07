import {
  ChevronRight,
  Droplets,
  Flame,
  Footprints,
  Heart,
  Moon,
  Scale,
  Timer,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import type { MealTemplate } from '../../types'

type LogMode =
  | null
  | 'workout'
  | 'hyrox'
  | 'running'
  | 'events'
  | 'meal'
  | 'weight'
  | 'sleep'
  | 'water'
  | 'energy'
  | 'recovery'
  | 'cycle'

interface LogModeSelectorProps {
  t: (key: string) => string
  templates: MealTemplate[]
  onSelectMode: (mode: LogMode) => void
  onAddFromTemplate: (template: MealTemplate) => void
}

type AccentTone = 'orange' | 'amber' | 'steel' | 'green' | 'violet' | 'blue' | 'indigo' | 'rose'

interface TileConfig {
  id: LogMode
  icon: typeof Flame
  label: string
  tone: AccentTone
}

const TONE_CLASSES: Record<AccentTone, { badge: string; edge: string; icon: string }> = {
  orange: {
    badge: 'border-orange-400/20 bg-orange-500/10',
    edge: 'from-transparent via-orange-400/35 to-transparent',
    icon: 'text-orange-300',
  },
  amber: {
    badge: 'border-amber-400/20 bg-amber-500/10',
    edge: 'from-transparent via-amber-400/30 to-transparent',
    icon: 'text-amber-300',
  },
  steel: {
    badge: 'border-sky-300/12 bg-sky-400/8',
    edge: 'from-transparent via-sky-300/22 to-transparent',
    icon: 'text-sky-200',
  },
  green: {
    badge: 'border-emerald-400/18 bg-emerald-500/10',
    edge: 'from-transparent via-emerald-400/28 to-transparent',
    icon: 'text-emerald-300',
  },
  violet: {
    badge: 'border-violet-400/18 bg-violet-500/10',
    edge: 'from-transparent via-violet-400/26 to-transparent',
    icon: 'text-violet-300',
  },
  blue: {
    badge: 'border-blue-400/18 bg-blue-500/10',
    edge: 'from-transparent via-blue-400/28 to-transparent',
    icon: 'text-blue-300',
  },
  indigo: {
    badge: 'border-indigo-400/18 bg-indigo-500/10',
    edge: 'from-transparent via-indigo-400/26 to-transparent',
    icon: 'text-indigo-300',
  },
  rose: {
    badge: 'border-rose-400/18 bg-rose-500/10',
    edge: 'from-transparent via-rose-400/28 to-transparent',
    icon: 'text-rose-300',
  },
}

const TRAINING_TILES: TileConfig[] = [
  { id: 'workout', icon: Flame, label: 'log.workout', tone: 'orange' },
  { id: 'hyrox', icon: Timer, label: 'logMode.hyrox', tone: 'amber' },
  { id: 'running', icon: Footprints, label: 'logMode.runCardio', tone: 'steel' },
]

const BODY_TILES: TileConfig[] = [
  { id: 'meal', icon: UtensilsCrossed, label: 'log.meal', tone: 'green' },
  { id: 'weight', icon: Scale, label: 'log.weightLog', tone: 'violet' },
  { id: 'water', icon: Droplets, label: 'log.waterLog', tone: 'blue' },
]

const WELLNESS_TILES: TileConfig[] = [
  { id: 'sleep', icon: Moon, label: 'log.sleepLog', tone: 'indigo' },
  { id: 'energy', icon: Zap, label: 'log.energyLog', tone: 'amber' },
  { id: 'cycle', icon: Heart, label: 'logMode.cycleLog', tone: 'rose' },
]

function TileGrid({
  tiles,
  onSelectMode,
}: {
  tiles: TileConfig[]
  onSelectMode: (mode: LogMode) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(({ id, icon: Icon, label, tone }, i) => {
        const toneClass = TONE_CLASSES[tone]
        return (
          <button
            key={id}
            onClick={() => onSelectMode(id)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,25,34,0.9),rgba(11,15,20,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_24px_rgba(0,0,0,0.22)] transition-all duration-200 active:scale-[0.97]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`absolute inset-x-3 top-0 h-px bg-gradient-to-r ${toneClass.edge}`} />
            <div className="flex h-full flex-col items-start justify-between text-left">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClass.badge} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
                <Icon size={22} strokeWidth={1.9} className={toneClass.icon} />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-semibold leading-tight text-ct-1">{label}</p>
                <div className="h-1 w-8 rounded-full bg-white/[0.06] transition-all duration-200 group-active:w-10" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function LogModeSelector({
  t,
  templates,
  onSelectMode,
  onAddFromTemplate,
}: LogModeSelectorProps) {
  const training = TRAINING_TILES.map((tile) => ({ ...tile, label: t(tile.label) }))
  const body = BODY_TILES.map((tile) => ({ ...tile, label: t(tile.label) }))
  const wellness = WELLNESS_TILES.map((tile) => ({ ...tile, label: t(tile.label) }))

  return (
    <div className="space-y-5 stagger-children">
      <div className="space-y-1">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-ct-1">{t('log.whatLogging')}</h1>
        <p className="text-sm text-ct-2">Choose one thing to log fast.</p>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ct-2">{t('logMode.training')}</p>
        <TileGrid tiles={training} onSelectMode={onSelectMode} />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ct-2">{t('logMode.bodyNutrition')}</p>
        <TileGrid tiles={body} onSelectMode={onSelectMode} />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ct-2">{t('logMode.wellness')}</p>
        <TileGrid tiles={wellness} onSelectMode={onSelectMode} />
      </div>

      {templates.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ct-2">{t('log.quickTemplates')}</p>
          <div className="overflow-hidden rounded-ct-lg border border-ct-border bg-ct-surface/80 backdrop-blur-sm">
            {templates.map((tmpl, i) => (
              <button
                key={tmpl.id}
                onClick={() => onAddFromTemplate(tmpl)}
                className={`group flex min-h-[52px] w-full items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-white/[0.03] ${
                  i < templates.length - 1 ? 'border-b border-ct-border/50' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-ct-1">{tmpl.name}</p>
                  <p className="mt-0.5 text-[11px] text-ct-2">{t(`meals.${tmpl.mealType}`)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-ct-brand">{t('log.add')}</span>
                  <ChevronRight size={14} className="text-ct-brand/60 transition-transform group-active:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
