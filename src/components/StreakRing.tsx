/**
 * StreakRing - Circular streak progress indicator for Today page header
 *
 * Pure presentational component. All data comes via props from useStreak() hook.
 * Shows: streak day count, weekly progress ring, freeze status.
 *
 * Visual tiers:
 *   0 days    -> muted "Start a streak" text
 *   1-6       -> orange flame + ring
 *   7-29      -> orange flame, slightly larger
 *   30-99     -> orange with animated glow
 *   100-364   -> gold gradient ring
 *   365+      -> gold + diamond sparkle
 */

import { useMemo } from 'react'
import { Flame, Snowflake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCountUp } from '../hooks/useCountUp'

interface StreakRingProps {
  currentStreak: number
  weeklyDone: number
  weeklyTarget: number
  freezeAvailable: boolean
  freezeUsedThisWeek: boolean
  bestStreak: number
  onTap?: () => void
}

// Ring geometry
const SIZE = 52
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function StreakRing({
  currentStreak,
  weeklyDone,
  weeklyTarget,
  freezeAvailable,
  freezeUsedThisWeek,
  onTap,
}: StreakRingProps) {
  const { t } = useTranslation()
  const animatedStreak = useCountUp(currentStreak, 400)

  // Weekly progress as fraction (0-1)
  const weeklyProgress = useMemo(() => {
    if (weeklyTarget <= 0) return 0
    return Math.min(1, weeklyDone / weeklyTarget)
  }, [weeklyDone, weeklyTarget])

  const strokeDashoffset = CIRCUMFERENCE * (1 - weeklyProgress)

  // Visual tier
  const isGold = currentStreak >= 100
  const hasGlow = currentStreak >= 30
  const weeklyComplete = weeklyDone >= weeklyTarget

  // No streak state
  if (currentStreak === 0) {
    return (
      <button
        onClick={onTap}
        className="text-[11px] text-ct-2 bg-ct-elevated/40 px-3 py-1.5 rounded-full min-h-[44px] flex items-center card-press"
        aria-label={t('streak.startStreak')}
      >
        <Flame size={12} className="text-slate-500 mr-1" />
        {t('streak.startStreak')}
      </button>
    )
  }

  // Gradient IDs
  const gradientId = isGold ? 'streak-grad-gold' : 'streak-grad-orange'

  return (
    <button
      onClick={onTap}
      className={`relative flex items-center justify-center min-h-[44px] card-press ${hasGlow ? 'animate-streak-glow' : ''}`}
      aria-label={`${currentStreak} ${t('streak.days')} streak`}
    >
      {/* SVG Ring */}
      <svg
        width={SIZE}
        height={SIZE}
        className={`-rotate-90 ${weeklyComplete ? 'animate-ring-pulse' : ''}`}
      >
        <defs>
          <linearGradient id="streak-grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="streak-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={isGold ? 'rgba(250,204,21,0.12)' : 'rgba(249,115,22,0.12)'}
          strokeWidth={STROKE}
        />

        {/* Fill */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-600 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame
          size={currentStreak >= 7 ? 15 : 13}
          className={isGold ? 'text-yellow-400' : 'text-orange-400'}
        />
        <span className={`text-[13px] font-bold tabular-nums leading-none mt-0.5 ${
          isGold ? 'text-yellow-400' : 'text-orange-400'
        }`}>
          {animatedStreak}
        </span>
        <span className="text-[8px] text-ct-2 leading-none mt-px">
          {t('streak.days')}
        </span>
      </div>

      {/* Freeze badge */}
      {(freezeAvailable || freezeUsedThisWeek) && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
          freezeUsedThisWeek
            ? 'bg-slate-700 border border-slate-600'
            : 'bg-blue-500/20 border border-blue-400/30'
        }`}>
          <Snowflake size={8} className={freezeUsedThisWeek ? 'text-slate-500' : 'text-blue-400'} />
        </div>
      )}
    </button>
  )
}
