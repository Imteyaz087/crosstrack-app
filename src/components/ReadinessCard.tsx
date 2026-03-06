/**
 * ReadinessCard - Decisive coaching-forward readiness display
 *
 * Pure presentational. Receives all data from useReadiness() hook.
 * Shows: score arc gauge, status color, coaching recommendation, expandable factor breakdown.
 *
 * Status tiers:
 *   >= 70  -> green  "Ready to Push"
 *   40-69  -> yellow "Moderate Day"
 *   < 40   -> red    "Recovery Day"
 */

import { useState } from 'react'
import { Zap, Activity, Shield, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCountUp } from '../hooks/useCountUp'

interface FactorData {
  value: number    // 0-100 normalized score
  label: string    // display value e.g. "7.5h", "4/5", "3/5"
}

interface CycleFactorData extends FactorData {
  phase: string
  color: string
}

interface ReadinessCardProps {
  score: number
  status: 'green' | 'yellow' | 'red'
  recommendation: string
  factorsBreakdown?: {
    sleep: FactorData
    energy: FactorData
    training: FactorData
    cycle?: CycleFactorData
  }
  onLogNow?: () => void
}

// Arc gauge geometry (semi-circle)
const ARC_SIZE = 64
const ARC_STROKE = 5
const ARC_RADIUS = (ARC_SIZE - ARC_STROKE) / 2
const ARC_CIRCUMFERENCE = Math.PI * ARC_RADIUS // half circle

const STATUS_CONFIG = {
  green: {
    icon: Zap,
    gradient: 'from-green-400 to-emerald-500',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    accent: 'border-l-green-400',
    barGradient: 'from-green-500 to-green-400',
  },
  yellow: {
    icon: Activity,
    gradient: 'from-yellow-400 to-amber-500',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    accent: 'border-l-yellow-400',
    barGradient: 'from-yellow-500 to-yellow-400',
  },
  red: {
    icon: Shield,
    gradient: 'from-red-400 to-rose-500',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    accent: 'border-l-red-400',
    barGradient: 'from-red-500 to-red-400',
  },
} as const

const STATUS_LABELS: Record<string, string> = {
  green: 'readiness.readyToPush',
  yellow: 'readiness.moderateDay',
  red: 'readiness.recoveryDay',
}

const FACTOR_COLORS = {
  sleep: 'bg-indigo-400',
  energy: 'bg-yellow-400',
  training: 'bg-cyan-400',
} as const

export function ReadinessCard({
  score,
  status,
  recommendation,
  factorsBreakdown,
  onLogNow: _onLogNow,
}: ReadinessCardProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const animatedScore = useCountUp(score, 800)
  void _onLogNow // reserved for future use

  const config = STATUS_CONFIG[status]
  void config.icon // StatusIcon reserved for future use

  // Arc offset: full = hidden, 0 = full semicircle shown
  const arcOffset = ARC_CIRCUMFERENCE * (1 - score / 100)

  return (
    <div
      className={`bg-ct-surface rounded-ct-lg border border-ct-border border-l-[3px] ${config.accent} overflow-hidden`}
      role="region"
      aria-label={t('readiness.title')}
    >
      {/* Header row */}
      <button
        onClick={() => factorsBreakdown && setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 pt-3 pb-0 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === 'green' ? 'bg-green-400' : status === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`} />
          <span className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">
            {t('readiness.title')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[11px] font-bold ${config.text}`}>
            {t(STATUS_LABELS[status])}
          </span>
          {factorsBreakdown && (
            expanded
              ? <ChevronDown size={12} className="text-ct-2" />
              : <ChevronRight size={12} className="text-ct-2" />
          )}
        </div>
      </button>

      {/* Main content */}
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Arc gauge */}
        <div className="relative shrink-0" style={{ width: ARC_SIZE, height: ARC_SIZE / 2 + 8 }}>
          <svg width={ARC_SIZE} height={ARC_SIZE / 2 + ARC_STROKE} className="overflow-visible">
            <defs>
              <linearGradient id={`readiness-arc-${status}`} x1="0%" y1="0%" x2="100%" y2="0%">
                {status === 'green' && <><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#10b981" /></>}
                {status === 'yellow' && <><stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#f59e0b" /></>}
                {status === 'red' && <><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#fb7185" /></>}
              </linearGradient>
            </defs>

            {/* Track */}
            <path
              d={`M ${ARC_STROKE / 2},${ARC_SIZE / 2} A ${ARC_RADIUS},${ARC_RADIUS} 0 0,1 ${ARC_SIZE - ARC_STROKE / 2},${ARC_SIZE / 2}`}
              fill="none"
              stroke="rgba(100,116,139,0.15)"
              strokeWidth={ARC_STROKE}
              strokeLinecap="round"
            />

            {/* Fill */}
            <path
              d={`M ${ARC_STROKE / 2},${ARC_SIZE / 2} A ${ARC_RADIUS},${ARC_RADIUS} 0 0,1 ${ARC_SIZE - ARC_STROKE / 2},${ARC_SIZE / 2}`}
              fill="none"
              stroke={`url(#readiness-arc-${status})`}
              strokeWidth={ARC_STROKE}
              strokeLinecap="round"
              strokeDasharray={ARC_CIRCUMFERENCE}
              strokeDashoffset={arcOffset}
              className="transition-[stroke-dashoffset] duration-600 ease-out"
            />
          </svg>

          {/* Score number centered below arc */}
          <div className="absolute bottom-0 left-0 right-0 flex items-baseline justify-center">
            <span className={`text-[22px] font-bold tabular-nums ${config.text}`}>
              {animatedScore}
            </span>
          </div>
        </div>

        {/* Recommendation text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ct-2 leading-snug line-clamp-3">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-ct-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bar-glow bg-gradient-to-r ${config.barGradient} transition-[width] duration-600 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Expanded factor breakdown */}
      {factorsBreakdown && (
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-250 ease-in-out ${
            expanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-3 space-y-2 border-t border-ct-border/50 pt-2.5">
            {/* Sleep */}
            <FactorRow
              label={t('readiness.sleep')}
              value={factorsBreakdown.sleep.label}
              score={factorsBreakdown.sleep.value}
              color={FACTOR_COLORS.sleep}
            />

            {/* Energy */}
            <FactorRow
              label={t('readiness.energy')}
              value={factorsBreakdown.energy.label}
              score={factorsBreakdown.energy.value}
              color={FACTOR_COLORS.energy}
            />

            {/* Training Load */}
            <FactorRow
              label={t('readiness.trainingLoad')}
              value={factorsBreakdown.training.label}
              score={factorsBreakdown.training.value}
              color={FACTOR_COLORS.training}
            />

            {/* Cycle Phase (optional) */}
            {factorsBreakdown.cycle && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ct-2">{t('readiness.cyclePhase')}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: factorsBreakdown.cycle.color }}
                  />
                  <span className="text-ct-2">{factorsBreakdown.cycle.phase}</span>
                  <span className={`font-bold ${factorsBreakdown.cycle.value >= 70 ? 'text-green-400' : factorsBreakdown.cycle.value >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {factorsBreakdown.cycle.value >= 50 ? '+' : ''}{Math.round(factorsBreakdown.cycle.value - 50)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** No-data empty state: prompts user to log sleep + energy */
export function ReadinessCardEmpty({ onLogNow }: { onLogNow?: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border border-dashed flex items-center gap-3">
      <div className="w-10 h-10 bg-ct-elevated/50 rounded-xl flex items-center justify-center shrink-0">
        <Activity size={18} className="text-ct-2" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ct-2">{t('readiness.noData')}</p>
      </div>
      {onLogNow && (
        <button
          onClick={onLogNow}
          className="shrink-0 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold px-3 py-1.5 rounded-lg min-h-[36px] card-press"
        >
          <Plus size={10} className="inline mr-0.5" />
          {t('readiness.logNow')}
        </button>
      )}
    </div>
  )
}

/** Individual factor mini bar */
function FactorRow({ label, value, score, color }: {
  label: string
  value: string
  score: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-ct-2 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-ct-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <span className="text-ct-2 tabular-nums w-10 text-right shrink-0">{value}</span>
    </div>
  )
}