import { Flame, UtensilsCrossed, Scale, Moon, Droplets, Zap, Timer, Footprints, Heart } from 'lucide-react'
import type { MealTemplate } from '../../types'

type LogMode = null | 'workout' | 'hyrox' | 'running' | 'events' | 'meal' | 'weight' | 'sleep' | 'water' | 'energy' | 'recovery' | 'cycle'

interface LogModeSelectorProps {
  t: (key: string) => string
  templates: MealTemplate[]
  onSelectMode: (mode: LogMode) => void
  onAddFromTemplate: (template: MealTemplate) => void
}

export function LogModeSelector({
  t, templates, onSelectMode, onAddFromTemplate,
}: LogModeSelectorProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('log.whatLogging')}</h1>

      {/* Training section */}
      <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('logMode.training')}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'workout' as LogMode, icon: Flame, label: t('log.workout'), color: 'text-cyan-400 border-cyan-400/30' },
          { id: 'hyrox' as LogMode, icon: Timer, label: t('logMode.hyrox'), color: 'text-orange-400 border-orange-400/30' },
          { id: 'running' as LogMode, icon: Footprints, label: t('logMode.runCardio'), color: 'text-emerald-400 border-emerald-400/30' },
        ].map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => onSelectMode(id)}
            className={`bg-ct-surface border rounded-ct-lg p-5 flex flex-col items-center gap-2.5 active:scale-95 transition-transform min-h-[88px] ${color}`}>
            <Icon size={28} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Body & Nutrition section */}
      <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('logMode.bodyNutrition')}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'meal' as LogMode, icon: UtensilsCrossed, label: t('log.meal'), color: 'text-green-400 border-green-400/30' },
          { id: 'weight' as LogMode, icon: Scale, label: t('log.weightLog'), color: 'text-purple-400 border-purple-400/30' },
          { id: 'water' as LogMode, icon: Droplets, label: t('log.waterLog'), color: 'text-blue-400 border-blue-400/30' },
        ].map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => onSelectMode(id)}
            className={`bg-ct-surface border rounded-ct-lg p-5 flex flex-col items-center gap-2.5 active:scale-95 transition-transform min-h-[88px] ${color}`}>
            <Icon size={28} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Wellness & Recovery section */}
      <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">{t('logMode.wellness')}</p>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'sleep' as LogMode, icon: Moon, label: t('log.sleepLog'), color: 'text-indigo-400 border-indigo-400/30' },
          { id: 'energy' as LogMode, icon: Zap, label: t('log.energyLog'), color: 'text-yellow-400 border-yellow-400/30' },
          { id: 'cycle' as LogMode, icon: Heart, label: t('logMode.cycleLog'), color: 'text-rose-400 border-rose-400/30' },
        ].map(({ id, icon: Icon, label, color }) => (
          <button key={id} onClick={() => onSelectMode(id)}
            className={`bg-ct-surface border rounded-ct-lg p-5 flex flex-col items-center gap-2.5 active:scale-95 transition-transform min-h-[88px] ${color}`}>
            <Icon size={28} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {templates.length > 0 && (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-3">{t('log.quickTemplates')}</p>
          {templates.map(tmpl => (
            <button key={tmpl.id} onClick={() => onAddFromTemplate(tmpl)}
              className="w-full flex items-center justify-between py-3.5 px-3 border-b border-ct-border last:border-0 active:bg-slate-700/30 transition-colors rounded-lg min-h-[44px]">
              <div className="text-left">
                <p className="text-sm text-ct-1 font-medium">{tmpl.name}</p>
                <p className="text-[11px] text-ct-2">{t(`meals.${tmpl.mealType}`)}</p>
              </div>
              <span className="text-xs text-cyan-400 font-medium">{t('log.add')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
