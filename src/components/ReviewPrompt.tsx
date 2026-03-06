/**
 * ReviewPrompt  -  Smart app review request
 *
 * Shows at peak happiness moments:
 *   - After 5th workout
 *   - After first PR
 *   - After 7-day streak
 *
 * Rules:
 *   - Never during onboarding
 *   - Never after a failed action
 *   - Max once per 30 days
 *   - Never again if user already reviewed or dismissed twice
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, X, Heart } from 'lucide-react'
import { haptic } from '../hooks/useHaptic'

const REVIEW_KEY = 'trackvolt_review_prompt'

interface ReviewData {
  lastShown: string | null
  dismissCount: number
  reviewed: boolean
}

function getReviewData(): ReviewData {
  try {
    const raw = localStorage.getItem(REVIEW_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { lastShown: null, dismissCount: 0, reviewed: false }
}

function saveReviewData(data: ReviewData): void {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(data))
}

export function shouldShowReview(workoutCount: number, hasPR: boolean, streak: number): boolean {
  const data = getReviewData()

  // Never show if already reviewed or dismissed twice
  if (data.reviewed || data.dismissCount >= 2) return false

  // Cooldown: 30 days
  if (data.lastShown) {
    const daysSince = (Date.now() - new Date(data.lastShown).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 30) return false
  }

  // Trigger conditions (any one):
  return workoutCount >= 5 || hasPR || streak >= 7
}

interface ReviewPromptProps {
  onDismiss: () => void
}

export function ReviewPrompt({ onDismiss }: ReviewPromptProps) {
  const { t } = useTranslation()
  const [fading, setFading] = useState(false)

  const handleDismiss = () => {
    const data = getReviewData()
    data.dismissCount++
    data.lastShown = new Date().toISOString()
    saveReviewData(data)
    setFading(true)
    setTimeout(onDismiss, 250)
  }

  const handleReview = () => {
    haptic('success')
    const data = getReviewData()
    data.reviewed = true
    data.lastShown = new Date().toISOString()
    saveReviewData(data)

    // For PWA: open the store page or share dialog
    // In production, this would link to App Store / Play Store
    if (navigator.share) {
      navigator.share({
        title: t('app.name'),
        text: t('review.shareText'),
        url: 'https://trackvolt.app',
      }).catch(() => { /* user cancelled */ })
    }

    setFading(true)
    setTimeout(onDismiss, 250)
  }

  return (
    <div className={`bg-gradient-to-br from-violet-500/15 to-pink-500/10 rounded-ct-lg p-4 border border-violet-500/25 transition-all duration-250 ${
      fading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-spring-in'
    }`}>
      <div className="flex items-start gap-3">
        {/* Heart icon */}
        <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Heart size={20} className="text-violet-400 animate-heart-pulse" fill="currentColor" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ct-1">{t('review.lovingApp')}</p>
          <p className="text-xs text-ct-2 mt-0.5">{t('review.shareHelps')}</p>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleReview}
              className="flex-1 bg-violet-500 text-ct-1 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 btn-press min-h-[44px]"
            >
              <Star size={14} fill="currentColor" />
              {t('review.shareTheLove')}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 text-ct-2 text-xs font-medium min-h-[44px] flex items-center"
            >
              {t('common.notNow')}
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="p-1 text-ct-3 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-1"
          aria-label={t('common.dismiss')}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
