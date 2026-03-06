/**
 * PosterCard — Official CF poster-style share card
 * Split layout: top branding, middle workout, bottom score
 */

import type { ShareCardData } from './types'

interface PosterCardProps {
  data: ShareCardData
  showWatermark: boolean
}

export function PosterCard({ data, showWatermark }: PosterCardProps) {
  const categoryColor = data.categoryType === 'open' ? '#8b5cf6'
    : data.categoryType === 'hero' ? '#ef4444'
    : data.categoryType === 'girl' ? '#ec4899'
    : data.categoryType === 'wod' ? '#22d3ee'
    : data.categoryType === 'strength' ? '#a78bfa'
    : '#22d3ee'

  // Build display lines: use workoutLines if available, otherwise split description
  const displayLines = data.workoutLines && data.workoutLines.length > 0
    ? data.workoutLines
    : data.description
      ? data.description.split('\n').filter(l => l.trim())
      : []

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: '#0D1117',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top section — Category branding */}
      <div style={{
        padding: '80px 60px 40px',
        background: `linear-gradient(180deg, ${categoryColor}15 0%, transparent 100%)`,
        borderBottom: `1px solid ${categoryColor}30`,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 800, color: categoryColor,
          letterSpacing: 6, marginBottom: 16,
        }}>
          {data.category}
        </div>
        {data.year && (
          <span style={{
            fontSize: 24, fontWeight: 700, color: 'rgba(148,163,184,0.4)',
            letterSpacing: 4,
          }}>
            {data.year}
          </span>
        )}
        <h1 style={{
          fontSize: data.title.length > 18 ? 56 : 72,
          fontWeight: 900, color: '#f1f5f9',
          lineHeight: 1.1, margin: '16px 0 0 0',
        }}>
          {data.title}
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginTop: 16,
        }}>
          <span style={{
            padding: '6px 16px', borderRadius: 8,
            background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
            fontSize: 18, fontWeight: 700, color: '#22d3ee',
          }}>
            {data.wodType === 'ForTime' ? 'FOR TIME' : data.wodType.toUpperCase()}
          </span>
          {data.timeCapSeconds && (
            <span style={{ fontSize: 18, color: '#64748b', fontWeight: 600 }}>
              {Math.round(data.timeCapSeconds / 60)} MIN CAP
            </span>
          )}
        </div>
      </div>

      {/* Middle section — Workout lines */}
      <div style={{
        flex: 1,
        padding: '40px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {displayLines.map((line, i) => {
          const isHeader = /^\d+[-–]\d+/.test(line) || /^round/i.test(line) || line.endsWith(':')
          return (
            <div key={i} style={{
              fontSize: isHeader ? 32 : 28,
              fontWeight: isHeader ? 800 : 600,
              color: isHeader ? '#f1f5f9' : '#94a3b8',
              lineHeight: 1.6,
              paddingLeft: isHeader ? 0 : 20,
            }}>
              {line}
            </div>
          )
        })}

        {/* Standards */}
        {data.rxStandard && (
          <div style={{
            marginTop: 32, padding: '16px 20px',
            background: 'rgba(16,185,129,0.06)',
            borderLeft: '3px solid rgba(16,185,129,0.3)',
            borderRadius: '0 8px 8px 0',
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981', letterSpacing: 2 }}>
              RX
            </span>
            <span style={{ fontSize: 18, color: '#64748b', marginLeft: 16 }}>
              {data.rxStandard}
            </span>
          </div>
        )}
      </div>

      {/* Bottom section — Score */}
      <div style={{
        padding: '40px 60px 80px',
        background: 'linear-gradient(0deg, rgba(34,211,238,0.05) 0%, transparent 100%)',
        borderTop: '1px solid rgba(34,211,238,0.15)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 20,
        }}>
          <span style={{
            fontSize: 96, fontWeight: 900, color: '#22d3ee',
            lineHeight: 1, textShadow: '0 0 40px rgba(34,211,238,0.2)',
          }}>
            {data.scoreDisplay || '—'}
          </span>
          <span style={{
            padding: '8px 20px', borderRadius: 10,
            background: data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.15)' : 'rgba(34,211,238,0.15)',
            border: `1px solid ${data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.3)' : 'rgba(34,211,238,0.3)'}`,
            fontSize: 22, fontWeight: 800, letterSpacing: 2,
            color: data.rxOrScaled === 'RX' ? '#10b981' : '#22d3ee',
          }}>
            {data.rxOrScaled}
          </span>
        </div>

        {data.prFlag && (
          <div style={{
            fontSize: 24, fontWeight: 800, color: '#eab308',
            letterSpacing: 2, marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            ★ PERSONAL RECORD
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 20, color: 'rgba(148,163,184,0.5)', fontWeight: 500 }}>
            {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          {data.location && (
            <span style={{ fontSize: 20, color: 'rgba(148,163,184,0.4)', fontWeight: 500 }}>
              @ {data.location}
            </span>
          )}
        </div>
      </div>

      {/* Watermark */}
      {showWatermark && (
        <div style={{
          position: 'absolute', bottom: 30, right: 40,
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: 0.3,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#94a3b8', letterSpacing: 2 }}>
            TRACKVOLT //
          </span>
        </div>
      )}
    </div>
  )
}
