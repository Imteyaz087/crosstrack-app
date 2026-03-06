import { Flame, UtensilsCrossed, Scale, Moon, Droplets, Zap, Timer, Footprints, Heart } from 'lucide-react'
import type { MealTemplate } from '../../types'
import { ChevronRight } from 'lucide-react'

type LogMode = null | 'workout' | 'hyrox' | 'running' | 'events' | 'meal' | 'weight' | 'sleep' | 'water' | 'energy' | 'recovery' | 'cycle'

interface LogModeSelectorProps {
  t: (key: string) => string
  templates: MealTemplate[]
  onSelectMode: (mode: LogMode) => void
  onAddFromTemplate: (template: MealTemplate) => void
}

/* ── Premium tile config with icon halos ── */
const TRAINING_TILES = [
  { id: 'workout' as LogMode, icon: Flame, label: 'log.workout',
    halo: 'from-cyan-500/20 to-cyan-400/5', border: 'border-cyan-500/25 hover:border-cyan-400/40',
    iconColor: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  { id: 'hyrox' as LogMode, icon: Timer, label: 'logMode.hyrox',
    halo: 'from-orange-500/20 to-orange-400/5', border: 'border-orange-500/25 hover:border-orange-400/40',
    iconColor: 'text-orange-400', glow: 'shadow-orange-500/10' },
  { id: 'running' as LogMode, icon: Footprints, label: 'logMode.runCardio',
    halo: 'from-emerald-500/20 to-emerald-400/5', border: 'border-emerald-500/25 hover:border-emerald-400/40',
    iconColor: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
]

const BODY_TILES = [
  { id: 'meal' as LogMode, icon: UtensilsCrossed, label: 'log.meal',
    halo: 'from-green-500/20 to-green-400/5', border: 'border-green-500/25 hover:border-green-400/40',
    iconColor: 'text-green-400', glow: 'shadow-green-500/10' },
  { id: 'weight' as LogMode, icon: Scale, label: 'log.weightLog',
    halo: 'from-purple-500/20 to-purple-400/5', border: 'border-purple-500/25 hover:border-purple-400/40',
    iconColor: 'text-purple-400', glow: 'shadow-purple-500/10' },
  { id: 'water' as LogMode, icon: Droplets, label: 'log.waterLog',
    halo: 'from-blue-500/20 to-blue-400/5', border: 'border-blue-500/25 hover:border-blue-400/40',
    iconColor: 'text-blue-400', glow: 'shadow-blue-500/10' },
]

const WELLNESS_TILES = [
  { id: 'sleep' as LogMode, icon: Moon, label: 'log.sleepLog',
    halo: 'from-indigo-500/20 to-indigo-400/5', border: 'border-indigo-500/25 hover:border-indigo-400/40',
    iconColor: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
  { id: 'energy' as LogMode, icon: Zap, label: 'log.energyLog',
    halo: 'from-yellow-500/20 to-yellow-400/5', border: 'border-yellow-500/25 hover:border-yellow-400/40',
    iconColor: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
  { id: 'cycle' as LogMode, icon: Heart, label: 'logMode.cycleLog',
    halo: 'from-rose-500/20 to-rose-400/5', border: 'border-rose-500/25 hover:border-rose-400/40',
    iconColor: 'text-rose-400', glow: 'shadow-rose-500/10' },
]

function TileGrid({ tiles, onSelectMode }: {
  tiles: typeof TRAINING_TILES
  onSelectMode: (mode: LogMode) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(({ id, icon: Icon, label, halo, border, iconColor, glow }, i) => (
        <button
          key={id}
          onClick={() => onSelectMode(id)}
          className={`
            relative overflow-hidden
            bg-gradient-to-br ${halo}
            backdrop-blur-sm
            border ${border}
            rounded-2xl p-4 pt-5
            flex flex-col items-center gap-3
            active:scale-[0.93] transition-all duration-200
            min-h-[100px]
            shadow-lg ${glow}
            group
          `}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Icon halo glow */}
          <div className={`
            w-11 h-11 rounded-xl
            bg-gradient-to-br ${halo}
            flex items-center justify-center
            transition-transform duration-200 group-active:scale-90
          `}>
            <Icon size={24} strokeWidth={1.8} className={`${iconColor} drop-shadow-sm`} />
          </div>
          <span className={`text-xs font-semibold ${iconColor}`}>{label}</span>
        </button>
      ))}
    </div>
  )
}

export function LogModeSelector({
  t,
  templates,
  onSelectMode,
  onAddFromTemplate,
}: LogModeSelectorProps) {
  // Remap tiles with translated labels
  const training = TRAINING_TILES.map(tile => ({ ...tile, label: t(tile.label) }))
  const body = BODY_TILES.map(tile => ({ ...tile, label: t(tile.label) }))
  const wellness = WELLNESS_TILES.map(tile => ({ ...tile, label: t(tile.label) }))

  return (
    <div className="space-y-5 stagger-children">
      <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('log.whatLogging')}</h1>

      {/* ── Training ── */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-400/70 font-bold mb-3">{t('logMode.training')}</p>
        <TileGrid tiles={training} onSelectMode={onSelectMode} />
      </div>

      {/* ── Body & Nutrition ── */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-green-400/70 font-bold mb-3">{t('logMode.bodyNutrition')}</p>
        <TileGrid tiles={body} onSelectMode={onSelectMode} />
      </div>

      {/* ── Wellness & Recovery ── */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-indigo-400/70 font-bold mb-3">{t('logMode.wellness')}</p>
        <TileGrid tiles={wellness} onSelectMode={onSelectMode} />
      </div>

      {/* ── Quick Templates ── */}
      {templates.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ct-2 font-bold mb-3">{t('log.quickTemplates')}</p>
          <div className="bg-ct-surface/80 backdrop-blur-sm rounded-2xl border border-ct-border overflow-hidden">
            {templates.map((tmpl, i) => (
              <button
                key={tmpl.id}
                onClick={() => onAddFromTemplate(tmpl)}
                className={`
                  w-full flex items-center justify-between py-3.5 px-4
                  active:bg-slate-700/40 transition-colors
                  min-h-[52px] group
                  ${i < templates.length - 1 ? 'border-b border-ct-border/50' : ''}
                `}
              >
                <div className="text-left">
                  <p className="text-sm text-ct-1 font-semibold">{tmpl.name}</p>
                  <p className="text-[11px] text-ct-2 mt-0.5">{t(`meals.${tmpl.mealType}`)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-cyan-400 font-semibold">{t('log.add')}</span>
                  <ChevronRight size={14} className="text-cyan-400/50 group-active:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
