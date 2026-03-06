/**
 * PRHighlightCard — Gold PR celebration share card
 * Trophy icon, gold gradient border, confetti elements
 */

import type { ShareCardData } from './types'

interface PRHighlightCardProps {
  data: ShareCardData
  showWatermark: boolean
}

export function PRHighlightCard({ data, showWatermark }: PRHighlightCardProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: '#0D1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 60px',
      }}
    >
      {/* Gold solid border */}
      <div style={{
        position: 'absolute', inset: 0,
        border: '4px solid #d97706',
      }} />

      {/* Gold glow effect */}
      <div style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 70%)',
      }} />

      {/* Confetti decorative elements */}
      {[
        { top: '8%', left: '12%', rot: '15deg', color: '#eab308' },
        { top: '12%', right: '18%', rot: '-20deg', color: '#f59e0b' },
        { top: '6%', left: '40%', rot: '45deg', color: '#22d3ee' },
        { top: '15%', right: '30%', rot: '-10deg', color: '#8b5cf6' },
        { bottom: '18%', left: '15%', rot: '30deg', color: '#f59e0b' },
        { bottom: '12%', right: '12%', rot: '-25deg', color: '#eab308' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...Object.fromEntries(Object.entries(c).filter(([k]) => ['top','left','right','bottom'].includes(k))),
          width: 8, height: 24, borderRadius: 4,
          background: c.color, opacity: 0.4,
          transform: `rotate(${c.rot})`,
        }} />
      ))}

      {/* Trophy — gold circle with PR text */}
      <div style={{
        width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, #fbbf24 0%, #eab308 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 0 30px rgba(234,179,8,0.4)',
      }}>
        <span style={{ fontSize: 60, fontWeight: 900, color: '#78350f' }}>★</span>
      </div>

      {/* NEW PR header */}
      <div style={{
        fontSize: 36, fontWeight: 900, letterSpacing: 8,
        color: '#eab308',
        marginBottom: 40,
      }}>
        NEW PERSONAL RECORD
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: data.title.length > 20 ? 56 : 72,
        fontWeight: 900, color: '#f1f5f9',
        textAlign: 'center', lineHeight: 1.1,
        margin: '0 0 16px 0', maxWidth: 900,
      }}>
        {data.title}
      </h1>

      {/* Category + Year */}
      <span style={{
        fontSize: 22, fontWeight: 700, color: 'rgba(148,163,184,0.5)',
        letterSpacing: 4, marginBottom: 40,
      }}>
        {data.category}
        {data.year ? ` · ${data.year}` : ''}
      </span>

      {/* Gold divider */}
      <div style={{
        width: 160, height: 4, borderRadius: 2,
        background: 'linear-gradient(90deg, transparent, #eab308, transparent)',
        margin: '10px 0 50px 0',
      }} />

      {/* Score — the big hero number */}
      <div style={{
        fontSize: 140, fontWeight: 900, lineHeight: 1,
        color: '#eab308',
        marginBottom: 24,
        textShadow: '0 0 40px rgba(234,179,8,0.3)',
      }}>
        {data.scoreDisplay || '—'}
      </div>

      {/* RX badge */}
      <div style={{
        padding: '12px 36px', borderRadius: 14,
        background: 'rgba(234,179,8,0.1)',
        border: '2px solid rgba(234,179,8,0.3)',
        marginBottom: 48,
      }}>
        <span style={{
          fontSize: 28, fontWeight: 800, letterSpacing: 4,
          color: '#eab308',
        }}>
          {data.rxOrScaled}
        </span>
      </div>

      {/* WOD Type + Time Cap */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
      }}>
        <span style={{
          padding: '6px 16px', borderRadius: 8,
          background: 'rgba(148,163,184,0.06)',
          fontSize: 18, fontWeight: 700, color: '#64748b',
        }}>
          {data.wodType === 'ForTime' ? 'FOR TIME' : data.wodType.toUpperCase()}
        </span>
        {data.timeCapSeconds && (
          <span style={{ fontSize: 18, color: '#475569', fontWeight: 600 }}>
            {Math.round(data.timeCapSeconds / 60)} MIN CAP
          </span>
        )}
      </div>

      {/* Date + Location */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        marginTop: 'auto',
      }}>
        <span style={{ fontSize: 22, color: 'rgba(148,163,184,0.5)', fontWeight: 500 }}>
          {new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        {data.location && (
          <span style={{ fontSize: 20, color: 'rgba(148,163,184,0.4)', fontWeight: 500 }}>
            @ {data.location}
          </span>
        )}
      </div>

      {/* Watermark */}
      {showWatermark && (
        <div style={{
          position: 'absolute', bottom: 40, right: 50,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: 0.3,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#94a3b8', letterSpacing: 2 }}>
            TRACKVOLT //
          </span>
        </div>
      )}
    </div>
  )
}
