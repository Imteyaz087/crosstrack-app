/**
 * MinimalCard — Clean, minimal share card template
 * Dark bg, centered layout, cyan accent
 */

import type { ShareCardData } from './types'

interface MinimalCardProps {
  data: ShareCardData
  showWatermark: boolean
}

export function MinimalCard({ data, showWatermark }: MinimalCardProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: 'linear-gradient(180deg, #0D1117 0%, #0F172A 50%, #0D1117 100%)',
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
      {/* Subtle gradient orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '5%', width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
      }} />

      {/* Category badge */}
      <div style={{
        padding: '10px 28px', borderRadius: 50,
        border: '1px solid rgba(99,102,241,0.3)',
        background: 'rgba(99,102,241,0.08)',
        marginBottom: 32,
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#a78bfa' }}>
          {data.category}
        </span>
      </div>

      {/* Year badge */}
      {data.year && (
        <span style={{
          fontSize: 28, fontWeight: 800, color: 'rgba(148,163,184,0.6)',
          letterSpacing: 6, marginBottom: 12,
        }}>
          {data.year}
        </span>
      )}

      {/* Title */}
      <h1 style={{
        fontSize: data.title.length > 20 ? 64 : 80,
        fontWeight: 900, color: '#f1f5f9', textAlign: 'center',
        lineHeight: 1.1, margin: '0 0 24px 0', maxWidth: 900,
      }}>
        {data.title}
      </h1>

      {/* Divider */}
      <div style={{
        width: 120, height: 3, borderRadius: 2,
        background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
        margin: '20px 0 40px 0',
      }} />

      {/* Score — the hero */}
      <div style={{
        fontSize: 120, fontWeight: 900, color: '#22d3ee',
        lineHeight: 1, marginBottom: 16,
        textShadow: '0 0 60px rgba(34,211,238,0.3)',
      }}>
        {data.scoreDisplay || '—'}
      </div>

      {/* RX / Scaled badge */}
      <div style={{
        padding: '10px 32px', borderRadius: 12,
        background: data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.15)' :
                    data.rxOrScaled === 'Elite' ? 'rgba(234,179,8,0.15)' : 'rgba(34,211,238,0.15)',
        border: `1px solid ${
          data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.3)' :
          data.rxOrScaled === 'Elite' ? 'rgba(234,179,8,0.3)' : 'rgba(34,211,238,0.3)'
        }`,
        marginBottom: 48,
      }}>
        <span style={{
          fontSize: 26, fontWeight: 800, letterSpacing: 3,
          color: data.rxOrScaled === 'RX' ? '#10b981' :
                 data.rxOrScaled === 'Elite' ? '#eab308' : '#22d3ee',
        }}>
          {data.rxOrScaled}
        </span>
      </div>

      {/* PR flag */}
      {data.prFlag && (
        <div style={{
          fontSize: 28, fontWeight: 800, color: '#eab308', letterSpacing: 2,
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 32, fontWeight: 900 }}>★</span> NEW PERSONAL RECORD
        </div>
      )}

      {/* Date + Location */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, marginTop: 'auto',
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
          display: 'flex', alignItems: 'center', gap: 10, opacity: 0.35,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#94a3b8', letterSpacing: 2 }}>
            TRACKVOLT //
          </span>
        </div>
      )}
    </div>
  )
}
