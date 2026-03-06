/**
 * useCelebrationShare - Bridge between CelebrationOverlay and ShareCardExporter
 *
 * Converts the lightweight CelebrationData.sharePayload into a full ShareCardData
 * object that ShareCardExporter can render.
 *
 * Usage (in TodayPage or App.tsx):
 *   const { shareData, openShare, closeShare, isShareOpen } = useCelebrationShare()
 *
 *   <CelebrationOverlay ... onShare={openShare} />
 *   {isShareOpen && shareData && (
 *     <ShareCardExporter data={shareData} onClose={closeShare} onToast={showToast} />
 *   )}
 *
 * Owner: Cowork (presentation layer)
 */

import { useState, useCallback } from 'react'
import type { CelebrationData } from '../components/CelebrationOverlay'
import type { ShareCardData } from '../components/sharecard/types'

type SharePayload = NonNullable<CelebrationData['sharePayload']>

export function useCelebrationShare() {
  const [shareData, setShareData] = useState<ShareCardData | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const openShare = useCallback((payload: SharePayload) => {
    // Convert lightweight payload -> full ShareCardData
    const data: ShareCardData = {
      title: payload.workoutName || 'Workout',
      category: payload.prValue ? 'PERSONAL RECORD' : payload.streakDays ? 'STREAK' : 'WOD',
      categoryType: payload.prValue ? 'custom' : 'wod',
      wodType: 'ForTime',
      scoreDisplay: payload.score || payload.prValue || `${payload.streakDays} days`,
      rxOrScaled: 'RX',
      prFlag: !!payload.prValue,
      date: payload.date,
    }
    setShareData(data)
    setIsShareOpen(true)
  }, [])

  const closeShare = useCallback(() => {
    setIsShareOpen(false)
    setShareData(null)
  }, [])

  return { shareData, isShareOpen, openShare, closeShare }
}