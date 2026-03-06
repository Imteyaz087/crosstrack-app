import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Trophy, Dumbbell, Star, TrendingUp, Flame, Award, Zap, Share2, Check, Loader2 } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof Dumbbell }> = {
  barbell: { label: 'Barbell', color: '#f97316', icon: Dumbbell },
  dumbbell: { label: 'Dumbbell', color: '#a78bfa', icon: Dumbbell },
  gymnastics: { label: 'Gymnastics', color: '#4ade80', icon: Star },
  monostructural: { label: 'Cardio', color: '#60a5fa', icon: Zap },
  other: { label: 'Other', color: '#94a3b8', icon: Award },
}

const PR_TYPE_LABELS: Record<string, string> = {
  '1rm': '1RM',
  '3rm': '3RM',
  '5rm': '5RM',
  'max_reps': 'Max Reps',
  'max_unbroken': 'Max UB',
  'fastest': 'Fastest',
}

export function PRWallPage() {
  const { t } = useTranslation()
  const { movementPRs, workouts, loadMovementPRs, loadWorkouts } = useStore()
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.allSettled([loadMovementPRs(), loadWorkouts()]).finally(() => setLoading(false)) }, [])

  const sharePR = async (name: string, display: string, date: string, improvement?: string) => {
    const text = [
      `New PR! ${name}: ${display}`,
      improvement ? `(+${improvement} improvement)` : '',
      `Set on ${date}`,
      '',
      'Tracked with TRACKVOLT'
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: `PR: ${name}`, text })
        return true
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      return true
    }
    return false
  }

  // Combine movement PRs and workout PRs into one view
  const allPRs = useMemo(() => {
    // Movement PRs (from dedicated PR tracking)
    const movPRs = movementPRs.map(pr => ({
      id: `mov-${pr.id}`,
      name: pr.movementName,
      category: pr.category,
      prType: pr.prType,
      value: pr.value,
      unit: pr.unit,
      date: pr.date,
      improvement: pr.previousBest ? pr.value - pr.previousBest : null,
      source: 'movement' as const,
    }))

    // Workout PRs (flagged in workouts)
    const wodPRs = workouts.filter(w => w.prFlag).map(w => ({
      id: `wod-${w.id}`,
      name: w.name,
      category: 'other' as const,
      prType: w.workoutType === 'ForTime' ? 'fastest' : 'max_reps',
      value: w.scoreValue || 0,
      unit: w.scoreUnit || 'reps',
      date: w.date,
      improvement: null,
      source: 'workout' as const,
      scoreDisplay: w.scoreDisplay,
    }))

    return [...movPRs, ...wodPRs].sort((a, b) => b.date.localeCompare(a.date))
  }, [movementPRs, workouts])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof allPRs>()
    allPRs.forEach(pr => {
      const cat = pr.category
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(pr)
    })
    return Array.from(map.entries())
  }, [allPRs])

  // Stats
  const totalPRs = allPRs.length
  const recentPRs = allPRs.filter(pr => {
    const d = new Date(pr.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000
  }).length
  // PR streak  -  weeks in a row with at least one PR
  const prStreak = useMemo(() => {
    if (allPRs.length === 0) return 0
    const now = new Date()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    let weeks = 0
    for (let w = 0; w < 52; w++) {
      const weekStart = new Date(now.getTime() - (w + 1) * oneWeek)
      const weekEnd = new Date(now.getTime() - w * oneWeek)
      const hasPR = allPRs.some(pr => {
        const d = new Date(pr.date)
        return d >= weekStart && d < weekEnd
      })
      if (hasPR) weeks++
      else break
    }
    return weeks
  }, [allPRs])

  // Filtered PRs by category tab
  const filteredGrouped = useMemo(() => {
    if (activeCategory === 'all') return grouped
    return grouped.filter(([cat]) => cat === activeCategory)
  }, [grouped, activeCategory])

  // Find the most impressive PR (latest with biggest improvement)
  const spotlightPR = useMemo(() => {
    const withImprovement = allPRs.filter(pr => pr.improvement && pr.improvement > 0)
    if (withImprovement.length > 0) return withImprovement[0]
    return allPRs[0] || null
  }, [allPRs])

  if (loading) {
    return (
      <div className="space-y-3 stagger-children">
        <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" /> {t('prWall.title')}
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (allPRs.length === 0) {
    return (
      <div className="space-y-3 stagger-children">
        <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" /> {t('prWall.title')}
        </h2>
        <EmptyState icon={Trophy} title={t('prWall.noPRsYet')} description={t('prWall.noPRsDesc')} />
      </div>
    )
  }

  return (
    <div className="space-y-3 stagger-children">
      <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-400" /> {t('prWall.title')}
      </h2>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-ct-surface rounded-ct-lg p-3 text-center border border-ct-border">
          <Trophy size={16} className="mx-auto mb-0.5 text-yellow-400" />
          <p className="text-xl font-bold text-ct-1">{totalPRs}</p>
          <p className="text-[11px] text-ct-2">{t('prWall.totalPRs')}</p>
        </div>
        <div className="bg-ct-surface rounded-ct-lg p-3 text-center border border-ct-border">
          <Flame size={16} className="mx-auto mb-0.5 text-orange-400" />
          <p className="text-xl font-bold text-ct-1">{recentPRs}</p>
          <p className="text-[11px] text-ct-2">{t('prWall.last30d')}</p>
        </div>
        <div className="bg-ct-surface rounded-ct-lg p-3 text-center border border-ct-border">
          <TrendingUp size={16} className="mx-auto mb-0.5 text-cyan-400" />
          <p className="text-xl font-bold text-ct-1">{prStreak}</p>
          <p className="text-[11px] text-ct-2">Week Streak</p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
            activeCategory === 'all' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' : 'bg-ct-surface text-ct-2 border border-transparent'
          }`}
        >All</button>
        {grouped.map(([cat]) => {
          const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                activeCategory === cat ? 'border shadow-sm' : 'bg-ct-surface text-ct-2 border border-transparent'
              }`}
              style={activeCategory === cat ? { backgroundColor: `${config.color}20`, color: config.color, borderColor: `${config.color}50` } : undefined}
            >{config.label}</button>
          )
        })}
      </div>

      {/* Spotlight PR */}
      {spotlightPR && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-ct-lg p-4 border border-yellow-500/30">
          <p className="text-[11px] uppercase tracking-widest text-yellow-400/70 mb-1">{t('prWall.latestPR')}</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-ct-1">{spotlightPR.name}</p>
              <p className="text-sm text-yellow-400 font-bold">
                {'scoreDisplay' in spotlightPR && spotlightPR.scoreDisplay
                  ? spotlightPR.scoreDisplay
                  : `${spotlightPR.value} ${spotlightPR.unit}`
                }
              </p>
            </div>
            {spotlightPR.improvement && spotlightPR.improvement > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">+{spotlightPR.improvement.toFixed(1)}</p>
                <p className="text-[11px] text-green-400/70">{spotlightPR.unit}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-ct-2">{spotlightPR.date}</p>
            <button
              onClick={async () => {
                const display = 'scoreDisplay' in spotlightPR && spotlightPR.scoreDisplay
                  ? spotlightPR.scoreDisplay : `${spotlightPR.value} ${spotlightPR.unit}`
                const imp = spotlightPR.improvement && spotlightPR.improvement > 0 ? spotlightPR.improvement.toFixed(1) : undefined
                const ok = await sharePR(spotlightPR.name, display, spotlightPR.date, imp)
                if (ok) { setSharedId(spotlightPR.id); setTimeout(() => setSharedId(null), 2000) }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-[11px] font-bold active:bg-yellow-500/30"
              aria-label={`Share ${spotlightPR.name} PR`}
            >
              {sharedId === spotlightPR.id ? <Check size={12} /> : <Share2 size={12} />}
              {sharedId === spotlightPR.id ? t('prWall.shared') : t('prWall.sharePR')}
            </button>
          </div>
        </div>
      )}

      {/* Grouped PRs by category */}
      {filteredGrouped.map(([category, prs]) => {
        const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other
        const CatIcon = config.icon
        return (
          <div key={category} className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <div className="flex items-center gap-2 mb-3">
              <CatIcon size={16} style={{ color: config.color }} />
              <p className="text-sm font-bold text-ct-1">{config.label}</p>
              <span className="text-[11px] text-ct-2 ml-auto">{prs.length} PR{prs.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Best PRs per movement */}
            {(() => {
              // Group by movement name, show best per movement
              const byName = new Map<string, typeof prs>()
              prs.forEach(pr => {
                if (!byName.has(pr.name)) byName.set(pr.name, [])
                byName.get(pr.name)!.push(pr)
              })

              return Array.from(byName.entries()).map(([name, movPRs]) => {
                const best = movPRs[0] // Already sorted by date desc
                return (
                  <div key={name} className="flex items-center py-2 border-b border-ct-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ct-1 truncate">{name}</p>
                      <p className="text-[11px] text-ct-2">
                        {PR_TYPE_LABELS[best.prType] || best.prType} &middot; {best.date}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold" style={{ color: config.color }}>
                        {'scoreDisplay' in best && best.scoreDisplay ? best.scoreDisplay : `${best.value} ${best.unit}`}
                      </p>
                      {best.improvement && best.improvement > 0 && (
                        <p className="text-[11px] text-green-400">+{best.improvement.toFixed(1)}</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        const display = 'scoreDisplay' in best && best.scoreDisplay ? best.scoreDisplay : `${best.value} ${best.unit}`
                        const imp = best.improvement && best.improvement > 0 ? best.improvement.toFixed(1) : undefined
                        const ok = await sharePR(best.name, display, best.date, imp)
                        if (ok) { setSharedId(best.id); setTimeout(() => setSharedId(null), 2000) }
                      }}
                      className="ml-2 p-1.5 rounded-lg text-ct-2 active:text-cyan-400 active:bg-ct-elevated/50"
                      aria-label={`Share ${name} PR`}
                    >
                      {sharedId === best.id ? <Check size={12} className="text-green-400" /> : <Share2 size={12} />}
                    </button>
                    {movPRs.length > 1 && (
                      <span className="ml-1 text-[11px] text-ct-2 bg-ct-elevated/50 px-1.5 py-0.5 rounded-full">{movPRs.length}x</span>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )
      })}

      {/* Timeline  -  last 10 PRs */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">{t('prWall.timeline')}</p>
        {allPRs.slice(0, 10).map((pr, i) => (
          <div key={pr.id} className="flex items-start gap-3 pb-3 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-ct-elevated'}`} />
              {i < Math.min(allPRs.length, 10) - 1 && <div className="w-px h-8 bg-ct-elevated" />}
            </div>
            <div className="flex-1 -mt-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-ct-1">{pr.name}</p>
                  <p className="text-[11px] text-ct-2">{pr.date}</p>
                </div>
                <p className="text-xs font-bold text-cyan-400">
                  {'scoreDisplay' in pr && pr.scoreDisplay ? pr.scoreDisplay : `${pr.value} ${pr.unit}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
