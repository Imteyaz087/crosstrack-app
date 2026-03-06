import { Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DailyLog } from '../types'

interface SleepDetailCardProps {
  log: DailyLog
}

/** Format decimal hours → "Xh Ym" */
function fmtHours(h: number): string {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (hrs === 0) return `${mins}m`
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

/** Color based on sleep score */
function scoreColor(score: number): string {
  if (score >= 80) return '#22d3ee'  // excellent — cyan
  if (score >= 60) return '#a855f7'  // good — purple
  if (score >= 40) return '#f59e0b'  // fair — amber
  return '#ef4444'                    // poor — red
}

export function SleepDetailCard({ log }: SleepDetailCardProps) {
  const { t } = useTranslation()

  // Only render if we have AutoSleep detailed data
  if (!log.sleepDeepHours && !log.sleepScore && !log.sleepHRV) return null

  const total   = log.sleepHours       || 0
  const score   = log.sleepScore
  const deep    = log.sleepDeepHours   || 0
  const rem     = log.sleepRemHours    || 0
  const light   = log.sleepLightHours  || 0
  const awake   = log.sleepAwakeHours  || 0
  const stageTotal = deep + rem + light + awake

  // SVG ring constants
  const R = 30
  const circ = 2 * Math.PI * R
  const pct = score !== undefined ? Math.min(score / 100, 1) : 0
  const dashOffset = circ * (1 - pct)

  // Stage bar widths (% of total sleep time)
  const deepPct  = stageTotal > 0 ? (deep  / stageTotal) * 100 : 0
  const remPct   = stageTotal > 0 ? (rem   / stageTotal) * 100 : 0
  const lightPct = stageTotal > 0 ? (light / stageTotal) * 100 : 0
  const awakePct = stageTotal > 0 ? (awake / stageTotal) * 100 : 0

  return (
    <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3.5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon size={13} className="text-indigo-400" />
          <span className="text-[11px] font-semibold text-ct-2 uppercase tracking-wider">
            {t('sleep.lastNight')}
          </span>
        </div>
        {log.sleepSource === 'autosleep' && (
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="text-[10px] font-bold text-indigo-400">AutoSleep</span>
          </div>
        )}
        {log.sleepSource === 'health' && (
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            <span className="text-[10px] font-bold text-green-400">Apple Health</span>
          </div>
        )}
      </div>

      {/* Main row: score ring + total + stats */}
      <div className="flex items-center gap-4">

        {/* Score ring */}
        {score !== undefined ? (
          <div className="relative shrink-0 w-[72px] h-[72px]">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <defs>
                <linearGradient id="sleepRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle
                cx="36" cy="36" r={R}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="7"
              />
              {/* Progress */}
              <circle
                cx="36" cy="36" r={R}
                fill="none"
                stroke={score >= 60 ? 'url(#sleepRingGrad)' : scoreColor(score)}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-ct-1 leading-none">{score}</span>
              <span className="text-[8px] text-ct-2 font-semibold uppercase mt-0.5">
                {t('sleep.score')}
              </span>
            </div>
          </div>
        ) : (
          /* No score — just show moon icon placeholder */
          <div className="w-[72px] h-[72px] shrink-0 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Moon size={28} className="text-indigo-400" />
          </div>
        )}

        {/* Right side: total + stats */}
        <div className="flex-1 space-y-2">
          {total > 0 && (
            <div>
              <p className="text-2xl font-black text-ct-1 leading-none">{fmtHours(total)}</p>
              <p className="text-[11px] text-ct-2 mt-0.5">{t('sleep.total')}</p>
            </div>
          )}

          {/* HRV / HR / Efficiency chips */}
          <div className="flex gap-3 flex-wrap">
            {log.sleepHRV !== undefined && (
              <div>
                <p className="text-sm font-bold text-cyan-400">{log.sleepHRV}</p>
                <p className="text-[10px] text-ct-2">HRV ms</p>
              </div>
            )}
            {log.sleepAvgHR !== undefined && (
              <div>
                <p className="text-sm font-bold text-pink-400">{log.sleepAvgHR}</p>
                <p className="text-[10px] text-ct-2">{t('sleep.avgHR')} bpm</p>
              </div>
            )}
            {log.sleepEfficiency !== undefined && (
              <div>
                <p className="text-sm font-bold text-green-400">{log.sleepEfficiency}%</p>
                <p className="text-[10px] text-ct-2">{t('sleep.efficiency')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sleep stage breakdown bar */}
      {stageTotal > 0 && (
        <div className="space-y-2">
          <div className="h-2.5 flex rounded-full overflow-hidden" style={{ gap: '2px' }}>
            {deepPct > 0 && (
              <div
                className="rounded-l-full"
                style={{ width: `${deepPct}%`, backgroundColor: '#7c3aed', minWidth: 4 }}
              />
            )}
            {remPct > 0 && (
              <div style={{ width: `${remPct}%`, backgroundColor: '#6366f1', minWidth: 4 }} />
            )}
            {lightPct > 0 && (
              <div style={{ width: `${lightPct}%`, backgroundColor: '#22d3ee', minWidth: 4 }} />
            )}
            {awakePct > 0 && (
              <div
                className="rounded-r-full"
                style={{ width: `${awakePct}%`, backgroundColor: '#475569', minWidth: 4 }}
              />
            )}
          </div>

          {/* Stage labels */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {deep > 0 && (
              <span className="text-[10px] text-ct-2">
                <span style={{ color: '#a78bfa' }}>● </span>
                {t('sleep.deep')} {fmtHours(deep)}
              </span>
            )}
            {rem > 0 && (
              <span className="text-[10px] text-ct-2">
                <span style={{ color: '#818cf8' }}>● </span>
                REM {fmtHours(rem)}
              </span>
            )}
            {light > 0 && (
              <span className="text-[10px] text-ct-2">
                <span style={{ color: '#22d3ee' }}>● </span>
                {t('sleep.light')} {fmtHours(light)}
              </span>
            )}
            {awake > 0 && (
              <span className="text-[10px] text-ct-2">
                <span style={{ color: '#64748b' }}>● </span>
                {t('sleep.awake')} {fmtHours(awake)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
