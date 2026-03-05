import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import type { Achievement } from '../data/achievements'
import { haptic } from '../hooks/useHaptic'

interface Props {
  achievement: Achievement
  onDone: () => void
}

export function AchievementToast({ achievement, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    haptic('success')
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onDone])

  const tierColors = {
    bronze: 'from-amber-900/80 to-amber-800/60 border-amber-500/50',
    silver: 'from-slate-600/80 to-slate-500/60 border-slate-300/50',
    gold: 'from-yellow-700/80 to-yellow-600/60 border-yellow-400/50',
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] flex justify-center transition-all duration-400 ${visible ? 'opacity-100 translate-y-4' : 'opacity-0 -translate-y-4'}`}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
      <div className={`bg-gradient-to-r ${tierColors[achievement.tier as keyof typeof tierColors]} border rounded-ct-lg px-5 py-3.5 flex items-center gap-3 shadow-2xl max-w-sm`}>
        <div className="w-11 h-11 bg-yellow-400/20 rounded-xl flex items-center justify-center shrink-0">
          <Trophy size={20} className="text-yellow-300" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-yellow-300/80 font-bold">Achievement Unlocked!</p>
          <p className="text-sm font-bold text-ct-1">{achievement.name}</p>
          <p className="text-[11px] text-ct-1/60">{achievement.description}</p>
        </div>
      </div>
    </div>
  )
}