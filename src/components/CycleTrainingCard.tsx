import { Dumbbell, AlertTriangle, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CyclePhase } from '../types'

interface TrainingRecommendation {
  title: string
  subtitle: string
  recommended: string[]
  avoid: string[]
  nutrition: string[]
  hydration: string
  sleep: string
}

interface CycleTrainingCardProps {
  phase: CyclePhase | null
  cycleDay: number | null
  daysUntilPeriod: number | null
  trainingRec: TrainingRecommendation | null
  compact?: boolean
  onClick?: () => void
}

const PHASE_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  menstrual: { bg: '#EF4444', text: '#FCA5A5' },
  follicular: { bg: '#4ADE80', text: '#BBF7D0' },
  ovulation: { bg: '#FFD700', text: '#FEF08A' },
  luteal: { bg: '#60A5FA', text: '#BFDBFE' },
}

export const CycleTrainingCard = ({
  phase,
  cycleDay,
  daysUntilPeriod,
  trainingRec,
  compact = false,
  onClick,
}: CycleTrainingCardProps) => {
  const { t } = useTranslation()

  // Return null if no phase data
  if (!phase) {
    return null
  }

  const colors = PHASE_COLORS[phase] || PHASE_COLORS.follicular
  const phaseLabel = t(`cycle.${phase}`)
  const cycleLabel =
    cycleDay !== null ? `${t('cycle.dayOf')} ${cycleDay}` : t('cycleCard.cycleTrackingPaused')

  // Compact version: single line with phase, day, and brief recommendation
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-ct-surface hover:bg-ct-surface-solid transition-colors border-l-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617]"
        style={{ borderLeftColor: colors.bg }}
        aria-label={`${phaseLabel} phase training recommendation`}
      >
        {/* Phase indicator dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.bg }}
          aria-hidden="true"
        />

        {/* Phase name and day */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-semibold text-slate-100 truncate">
            {phaseLabel}
          </span>
          <span className="text-xs text-ct-2">{cycleLabel}</span>
        </div>

        {/* Brief recommendation */}
        {trainingRec && (
          <div className="flex-1 min-w-0 px-2">
            <p className="text-sm text-ct-2 truncate">
              {trainingRec.title}
            </p>
          </div>
        )}

        {/* Chevron indicator */}
        <ChevronRight
          size={20}
          className="text-ct-2 flex-shrink-0"
          aria-hidden="true"
        />
      </button>
    )
  }

  // Full version: detailed card with recommendations
  return (
    <div
      className="w-full bg-ct-surface rounded-lg overflow-hidden border-l-4 transition-all hover:bg-ct-surface-solid/80"
      style={{ borderLeftColor: colors.bg }}
      role="region"
      aria-label={`${phaseLabel} phase training card`}
    >
      {/* Header: Phase info + recommendation title */}
      <div className="p-4 pb-3">
        {/* Phase indicator row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.bg }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-slate-100">
            {phaseLabel}
          </span>
          <span className="text-sm text-ct-2">{cycleLabel}</span>
          {daysUntilPeriod !== null && daysUntilPeriod > 0 && (
            <span className="text-xs text-ct-2 ml-auto">
              {t('cycleCard.daysUntilPeriod', { count: daysUntilPeriod })}
            </span>
          )}
        </div>

        {/* Training recommendation title and subtitle */}
        {trainingRec && (
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">
              {trainingRec.title}
            </h3>
            {trainingRec.subtitle && (
              <p className="text-sm text-ct-2">{trainingRec.subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Main content: Recommendations and cautions */}
      {trainingRec && (
        <div className="px-4 pb-3 space-y-3">
          {/* Recommended activities chips */}
          {trainingRec.recommended && trainingRec.recommended.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ct-2 mb-1">
                <Dumbbell size={14} style={{ color: colors.bg }} />
                {t('cycleCard.recommended')}
              </div>
              <div className="flex flex-wrap gap-2">
                {trainingRec.recommended.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-ct-elevated/60 text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cautions / avoid */}
          {trainingRec.avoid && trainingRec.avoid.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ct-2 mb-1">
                <AlertTriangle size={14} className="text-amber-500" />
                {t('cycleCard.useCaution')}
              </div>
              <ul className="space-y-1">
                {trainingRec.avoid.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="text-xs text-ct-2 pl-5">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutrition tip */}
          {trainingRec.nutrition &&
            trainingRec.nutrition.length > 0 &&
            trainingRec.nutrition[0] && (
              <div className="pt-1">
                <p className="text-xs text-ct-2">
                  <span className="font-semibold text-ct-2">{t('cycleCard.nutrition')}</span>{' '}
                  {trainingRec.nutrition[0]}
                </p>
              </div>
            )}

          {/* Hydration hint */}
          {trainingRec.hydration && (
            <div className="pt-1">
              <p className="text-xs text-ct-2">
                <span className="font-semibold text-ct-2">{t('cycleCard.hydration')}</span>{' '}
                {trainingRec.hydration}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer: Click action or learn more hint */}
      {onClick && (
        <div className="px-4 py-3 border-t border-ct-border bg-ct-surface-solid/30">
          <button
            onClick={onClick}
            className="flex items-center justify-between w-full text-sm font-semibold text-ct-2 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617]"
            style={{ outlineColor: colors.bg }}
            aria-label={`Learn more about ${phaseLabel} phase training`}
          >
            <span>{t('cycleCard.viewInsights')}</span>
            <ChevronRight
              size={20}
              className="text-ct-2"
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </div>
  )
}
