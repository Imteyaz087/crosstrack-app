import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Trophy, Share2 } from 'lucide-react'

const CARD = 'var(--bg-card)'
const BORDER = 'var(--border)'
const VOLT = 'var(--volt)'
const GLOW = 'var(--volt-glow)'
const BSTR = 'var(--border-str)'
const RAISED = 'var(--bg-raised)'
const TXT2 = 'var(--text-secondary)'
const TXT3 = 'var(--text-muted)'

const CATEGORY_COLORS: Record<string, string> = {
  Barbell: '#ef4444',
  Gymnastics: '#a855f7',
  Cardio: '#22d3ee',
  Weightlifting: '#f59e0b',
  Other: '#94a3b8',
}

export function PRWallPage() {
  const { t } = useTranslation()
  const { movementPRs, loadMovementPRs, prs, loadPRs, showToast } = useStore()
  const [filter, setFilter] = useState('All')

  useEffect(() => { loadMovementPRs(); loadPRs() }, [])

  // Combine movement PRs and workout PRs
  const allPRs = [
    ...movementPRs.map(pr => ({
      type: 'movement' as const,
      name: pr.movementName,
      category: pr.category,
      value: `${pr.value} ${pr.unit || ''}`,
      prType: pr.prType,
      date: pr.date,
    })),
    ...prs.map(w => ({
      type: 'workout' as const,
      name: w.name,
      category: w.workoutType,
      value: w.scoreDisplay || '',
      prType: w.workoutType,
      date: w.date,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const categories = ['All', ...new Set(allPRs.map(p => p.category))]
  const filtered = filter === 'All' ? allPRs : allPRs.filter(p => p.category === filter)

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const last30d = allPRs.filter(p => p.date >= thirtyDaysAgo).length

  // Calculate streak
  const uniqueDates = [...new Set(allPRs.map(p => p.date))].sort().reverse()
  let streak = 0
  if (uniqueDates.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    let checkDate = today
    for (const d of uniqueDates) {
      if (d <= checkDate) { streak++; }
    }
    streak = Math.min(streak, uniqueDates.length)
  }

  const latestPR = allPRs[0]

  const handleShare = () => {
    if (latestPR) {
      const text = `New PR! ${latestPR.name} - ${latestPR.value} 💪 #CrossFit #TRACKVOLT`
      if (navigator.share) {
        navigator.share({ text }).catch(() => {})
      } else {
        navigator.clipboard.writeText(text)
        showToast(t('prWall.shared'))
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">{t('prWall.title')}</h1>

      {allPRs.length === 0 ? (
        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-8 border text-center">
          <Trophy size={40} className="mx-auto mb-3" style={{ color: TXT3 }} />
          <p className="text-sm text-white mb-1">{t('prWall.noPRsYet')}</p>
          <p style={{ color: TXT3 }} className="text-xs">{t('prWall.noPRsDesc')}</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl p-3 border text-center">
              <p className="text-lg font-bold text-amber-400">{allPRs.length}</p>
              <p style={{ color: TXT3 }} className="text-[10px]">{t('prWall.totalPRs')}</p>
            </div>
            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl p-3 border text-center">
              <p className="text-lg font-bold text-cyan-400">{last30d}</p>
              <p style={{ color: TXT3 }} className="text-[10px]">{t('prWall.last30d')}</p>
            </div>
            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-xl p-3 border text-center">
              <p className="text-lg font-bold text-green-400">{categories.length - 1}</p>
              <p style={{ color: TXT3 }} className="text-[10px]">{t('prWall.categories')}</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={filter === cat
                  ? { background: GLOW, color: VOLT, borderColor: BSTR }
                  : { background: RAISED, color: TXT2, borderColor: BORDER }
                }
                className="px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Latest PR card */}
          {latestPR && (
            <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ color: TXT3 }} className="text-[10px] font-semibold uppercase tracking-wider">{t('prWall.latestPR')}</p>
                  <p className="text-lg font-bold text-white mt-1">{latestPR.name}</p>
                  <p className="text-sm font-bold text-amber-400">{latestPR.value}</p>
                  <p style={{ color: TXT3 }} className="text-[10px] mt-1">{latestPR.date}</p>
                </div>
                <button onClick={handleShare} className="p-2 rounded-lg" style={{ background: RAISED }}>
                  <Share2 size={16} style={{ color: VOLT }} />
                </button>
              </div>
            </div>
          )}

          {/* PR list by category */}
          {(() => {
            const byCat = filtered.reduce<Record<string, typeof allPRs>>((acc, pr) => {
              if (!acc[pr.category]) acc[pr.category] = []
              acc[pr.category].push(pr)
              return acc
            }, {})

            return Object.entries(byCat).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold" style={{ color: CATEGORY_COLORS[cat] || TXT2 }}>{cat}</span>
                  <span style={{ color: TXT3 }} className="text-[10px]">{items.length} PR{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((pr, i) => (
                    <div key={`${pr.name}-${i}`} style={{ background: CARD, borderColor: BORDER }} className="rounded-xl p-3 border flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{pr.name}</p>
                        <p style={{ color: TXT3 }} className="text-[10px]">{pr.prType} · {pr.date}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{pr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}

          {/* PR Timeline */}
          <div>
            <p style={{ color: TXT3 }} className="text-xs font-semibold uppercase tracking-wider mb-2">PR Timeline</p>
            <div className="space-y-1.5">
              {filtered.slice(0, 10).map((pr, i) => (
                <div key={`timeline-${i}`} className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: CATEGORY_COLORS[pr.category] || TXT3 }} />
                  <div className="flex-1">
                    <p className="text-xs text-white">{pr.name}</p>
                    <p style={{ color: TXT3 }} className="text-[10px]">{pr.date}</p>
                  </div>
                  <p className="text-xs font-bold text-white">{pr.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
