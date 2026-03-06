/**
 * CelebrationOverlay - Centralized post-save celebration + share flow
 *
 * Replaces the old SaveCelebration.tsx with:
 *   - Longer display time (2500ms vs 1400ms) for share button visibility
 *   - Share button with spring animation (appears at 400ms)
 *   - Improvement badge for PR type
 *   - Achievement type support
 *   - Centralized trigger: any logger calls triggerCelebration() -> this renders
 *
 * Types:
 *   'save'        -> green checkmark + circle burst
 *   'pr'          -> gold trophy + confetti + gold flash
 *   'streak'      -> orange flame + ring expansion
 *   'achievement' -> violet star + bounce
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Trophy, Flame, Check, Star, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { haptic } from '../hooks/useHaptic'

export type CelebrationType = 'save' | 'pr' | 'streak' | 'achievement'

export interface CelebrationData {
  type: CelebrationType
  title: string
  subtitle?: string
  metric?: {
    value: string
    label: string
    improvement?: string
  }
  sharePayload?: {
    workoutName?: string
    score?: string
    prValue?: string
    streakDays?: number
    date: string
  }
}

interface CelebrationOverlayProps {
  celebration: CelebrationData | null
  onDismiss: () => void
  onShare?: (payload: NonNullable<CelebrationData['sharePayload']>) => void
}

// Confetti config
const CONFETTI_COLORS = ['#4ade80', '#22d3ee', '#f59e0b', '#ef4444', '#a78bfa', '#fb923c', '#f472b6', '#facc15', '#34d399', '#818cf8', '#fb7185', '#fbbf24']
const CONFETTI_COUNT = 12

function ConfettiParticle({ delay, color, x, size }: {
  delay: number; color: string; x: number; size: number
}) {
  return (
    <div
      className="absolute rounded-full animate-confetti"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: '40%',
        width: size,
        height: size,
        animationDelay: `${delay}ms`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

const SHARE_BUTTON_STYLES = {
  save: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400',
  pr: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-lg shadow-yellow-500/20',
  streak: 'bg-orange-500/15 border border-orange-500/30 text-orange-400',
  achievement: 'bg-violet-500/15 border border-violet-500/30 text-violet-400',
} as const

const SHARE_LABELS: Record<CelebrationType, string> = {
  save: 'celebration.shareWorkout',
  pr: 'celebration.sharePR',
  streak: 'celebration.shareStreak',
  achievement: 'celebration.shareWorkout',
}

export function CelebrationOverlay({ celebration, onDismiss, onShare }: CelebrationOverlayProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const prefersReduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const dismiss = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      setShowShare(false)
      setFading(false)
      onDismiss()
    }, 200)
  }, [onDismiss])

  // Mount/unmount based on celebration data
  useEffect(() => {
    if (!celebration) {
      setVisible(false)
      setShowShare(false)
      return
    }

    setVisible(true)
    setFading(false)
    setShowShare(false)

    // Haptic feedback
    if (celebration.type === 'pr') haptic('success')
    else if (celebration.type === 'streak') haptic('success')
    else haptic('heavy')

    // Show share button after 400ms
    const shareTimer = setTimeout(() => setShowShare(true), 400)

    // Auto-dismiss after 2500ms
    const dismissTimer = setTimeout(dismiss, 2500)

    return () => {
      clearTimeout(shareTimer)
      clearTimeout(dismissTimer)
    }
  }, [celebration, dismiss])

  if (!visible || !celebration) return null

  const { type, title, subtitle, metric, sharePayload } = celebration

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-200 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={dismiss}
      role="alert"
      aria-live="assertive"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ct-bg/85 backdrop-blur-sm" />

      {/* Gold flash for PR */}
      {type === 'pr' && !prefersReduced && (
        <div className="absolute inset-0 bg-yellow-500/20 animate-gold-flash" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8">

        {/* --- ICON --- */}
        {type === 'save' && (
          <div className="relative">
            {!prefersReduced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-green-400/40 animate-circle-burst" />
              </div>
            )}
            <div className="w-18 h-18 rounded-full bg-green-500 flex items-center justify-center animate-spring-in"
              style={{ width: 72, height: 72 }}
            >
              <Check size={36} className="text-slate-900" strokeWidth={3} />
            </div>
          </div>
        )}

        {type === 'pr' && (
          <div className="relative">
            {!prefersReduced && (
              <>
                {CONFETTI_COLORS.slice(0, CONFETTI_COUNT).map((color, i) => (
                  <ConfettiParticle
                    key={i}
                    delay={80 + i * 50}
                    color={color}
                    x={10 + (i * 7)}
                    size={2 + Math.random() * 2}
                  />
                ))}
              </>
            )}
            <div
              className="rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center animate-trophy-bounce shadow-lg shadow-yellow-500/40"
              style={{ width: 72, height: 72 }}
            >
              <Trophy size={36} className="text-slate-900" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {type === 'streak' && (
          <div className="relative">
            {!prefersReduced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-orange-400/40 animate-streak-ring" />
              </div>
            )}
            <div
              className="rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-spring-in shadow-lg shadow-orange-500/40"
              style={{ width: 72, height: 72 }}
            >
              <Flame size={36} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {type === 'achievement' && (
          <div className="relative">
            {!prefersReduced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-violet-400/40 animate-circle-burst" />
              </div>
            )}
            <div
              className="rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center animate-spring-in shadow-lg shadow-violet-500/40"
              style={{ width: 72, height: 72 }}
            >
              <Star size={36} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {/* --- TITLE --- */}
        <p
          className="text-ct-1 font-bold text-xl mt-5 animate-spring-in text-center"
          style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          {title}
        </p>

        {/* --- SUBTITLE --- */}
        {subtitle && (
          <p
            className="text-ct-2 text-sm mt-1.5 animate-spring-in text-center"
            style={{ animationDelay: '250ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            {subtitle}
          </p>
        )}

        {/* --- METRIC + IMPROVEMENT --- */}
        {metric && (
          <div
            className="flex items-baseline gap-2 mt-2 animate-spring-in"
            style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            <span className={`text-lg font-bold ${type === 'pr' ? 'text-yellow-400' : 'text-ct-1'}`}>
              {metric.value}
            </span>
            <span className="text-sm text-ct-2">{metric.label}</span>
            {metric.improvement && (
              <span
                className="text-xs font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full animate-spring-in"
                style={{ animationDelay: '600ms', opacity: 0, animationFillMode: 'forwards' }}
              >
                {metric.improvement}
              </span>
            )}
          </div>
        )}

        {/* --- SHARE BUTTON --- */}
        {sharePayload && showShare && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare?.(sharePayload)
            }}
            className={`mt-5 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 min-h-[44px] animate-spring-in card-press ${SHARE_BUTTON_STYLES[type]}`}
            style={{ animationDelay: '0ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            <Share2 size={14} />
            {t(SHARE_LABELS[type])}
          </button>
        )}

        {/* --- TAP HINT --- */}
        <p
          className="text-[11px] text-ct-2/50 mt-4 animate-spring-in"
          style={{ animationDelay: '500ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          {t('celebration.tapToClose')}
        </p>
      </div>
    </div>
  )
}
