/**
 * SaveCelebration  -  Fullscreen overlay for key moments
 *
 * Three modes:
 *   'save'   -> Green checkmark with circle burst (workout/meal saved)
 *   'pr'     -> Gold trophy with flash + confetti (new PR)
 *   'streak' -> Orange flame with ring expansion (streak milestone)
 *
 * Auto-dismisses after duration. Renders on top of everything.
 */

import { useEffect, useState, useCallback } from 'react'
import { Trophy, Flame, Check } from 'lucide-react'
import { haptic } from '../hooks/useHaptic'

type CelebrationType = 'save' | 'pr' | 'streak'

interface SaveCelebrationProps {
  type: CelebrationType
  message?: string
  subMessage?: string
  onDone?: () => void
  duration?: number
}

// Confetti colors
const CONFETTI_COLORS = ['#4ade80', '#22d3ee', '#f59e0b', '#ef4444', '#a78bfa', '#fb923c', '#f472b6']

function ConfettiParticle({ delay, color, x }: { delay: number; color: string; x: number }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-confetti"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: '40%',
        animationDelay: `${delay}ms`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

export function SaveCelebration({ type, message, subMessage, onDone, duration = 1400 }: SaveCelebrationProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  const dismiss = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 200)
  }, [onDone])

  useEffect(() => {
    // Fire haptic on mount
    if (type === 'pr') haptic('success')
    else if (type === 'streak') haptic('success')
    else haptic('heavy')

    const timer = setTimeout(dismiss, duration)
    return () => clearTimeout(timer)
  }, [type, duration, dismiss])

  if (!visible) return null

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      <div className="absolute inset-0 bg-ct-bg/80 backdrop-blur-sm" />

      {/* Gold flash for PR */}
      {type === 'pr' && !prefersReduced && (
        <div className="absolute inset-0 bg-yellow-500/20 animate-gold-flash" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        {type === 'save' && (
          <div className="relative">
            {/* Circle burst */}
            {!prefersReduced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-green-400/50 animate-circle-burst" />
              </div>
            )}
            {/* Checkmark circle */}
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-spring-in">
              <Check size={32} className="text-slate-900" strokeWidth={3} />
            </div>
          </div>
        )}

        {type === 'pr' && (
          <div className="relative">
            {/* Confetti */}
            {!prefersReduced && (
              <>
                {CONFETTI_COLORS.map((color, i) => (
                  <ConfettiParticle
                    key={i}
                    delay={100 + i * 60}
                    color={color}
                    x={20 + (i * 10)}
                  />
                ))}
              </>
            )}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center animate-trophy-bounce shadow-lg shadow-yellow-500/40">
              <Trophy size={32} className="text-slate-900" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {type === 'streak' && (
          <div className="relative">
            {/* Ring expansion */}
            {!prefersReduced && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-orange-400/50 animate-streak-ring" />
              </div>
            )}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-spring-in shadow-lg shadow-orange-500/40">
              <Flame size={32} className="text-ct-1" strokeWidth={2.5} />
            </div>
          </div>
        )}

        {/* Text */}
        <p className="text-ct-1 font-bold text-lg mt-4 animate-spring-in" style={{ animationDelay: '150ms', opacity: 0 }}>
          {message || (type === 'save' ? 'Saved!' : type === 'pr' ? 'New PR!' : 'Streak!')}
        </p>
        {subMessage && (
          <p className="text-ct-2 text-sm mt-1 animate-spring-in" style={{ animationDelay: '250ms', opacity: 0 }}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  )
}
