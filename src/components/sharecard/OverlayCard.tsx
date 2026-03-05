/**
 * OverlayCard – Transparent/semi-transparent overlay card (Strava-style)
 * User can layer this on top of their own photo
 * Semi-transparent dark gradient at bottom, score + workout info overlaid
 */

import type { ShareCardData } from './types'

interface OverlayCardProps {
  data: ShareCardData
  showWatermark: boolean
}

// Helper to get display lines (workout description)
function getDisplayLines(data: ShareCardData): string[] {
  if (data.workoutLines && data.workoutLines.length > 0) {
    return data.workoutLines
  }
  if (data.description) {
    return data.description.split('\n').filter(l => l.trim())
  }
  return []
}

export function OverlayCard({ data, showWatermark }: OverlayCardProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top subtle gradient – keeps top transparent for photo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
      }} />

      {/* Top bar – category + date */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {data.category}
        </span>
        <span style={{
          fontSize: 20,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Bottom solid overlay – holds all the info */}
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        padding: '80px 60px 60px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* WOD title */}
        <h1 style={{
          fontSize: data.title.length > 20 ? 56 : 72,
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.1,
          margin: '0 0 8px 0',
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}>
          {data.title}
        </h1>

        {/* Score row – the hero number */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 20,
          marginTop: 8,
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 100,
            fontWeight: 900,
            color: '#22d3ee',
            lineHeight: 1,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}>
            {data.scoreDisplay || '—'}
          </span>

          {/* RX badge – solid background */}
          <span style={{
            padding: '8px 20px',
            borderRadius: 10,
            background: data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.4)'
              : data.rxOrScaled === 'Elite' ? 'rgba(234,179,8,0.4)'
              : 'rgba(34,211,238,0.4)',
            border: `1px solid ${
              data.rxOrScaled === 'RX' ? 'rgba(16,185,129,0.6)'
              : data.rxOrScaled === 'Elite' ? 'rgba(234,179,8,0.6)'
              : 'rgba(34,211,238,0.6)'
            }`,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            color: data.rxOrScaled === 'RX' ? '#10b981'
              : data.rxOrScaled === 'Elite' ? '#fbbf24'
              : '#22d3ee',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {data.rxOrScaled}
          </span>
        </div>

        {/* PR flag */}
        {data.prFlag && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#fbbf24',
              letterSpacing: 2,
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}>
              ★ PERSONAL RECORD
            </span>
          </div>
        )}

        {/* WOD Type + Time Cap */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            fontSize: 16,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {data.wodType === 'ForTime' ? 'FOR TIME' : data.wodType.toUpperCase()}
          </span>
          {data.timeCapSeconds && (
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              {Math.round(data.timeCapSeconds / 60)} MIN CAP
            </span>
          )}
        </div>

        {/* Workout lines / Description section */}
        {(() => {
          const displayLines = getDisplayLines(data)
          return displayLines.length > 0 && (
            <div style={{
              marginBottom: 12,
              marginTop: 8,
            }}>
              {displayLines.slice(0, 5).map((line, i) => {
                const isHeader = /^\d+[-–]\d+/.test(line) || /^round/i.test(line) || line.endsWith(':')
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: isHeader ? 18 : 16,
                      fontWeight: isHeader ? 700 : 500,
                      color: isHeader ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                      lineHeight: 1.5,
                      paddingLeft: isHeader ? 0 : 12,
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  >
                    {line}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* RX Standard display */}
        {data.rxStandard && (
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'rgba(16,185,129,0.15)',
            borderLeft: '3px solid rgba(16,185,129,0.5)',
            borderRadius: '0 4px 4px 0',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', letterSpacing: 1, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              RX
            </span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 8, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {data.rxStandard}
            </span>
          </div>
        )}

        {/* Watermark */}
        {showWatermark && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            opacity: 0.4,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 2,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              TRACKVOLT //
            </span>
          </div>
        )}
      </div>
    </div>
  )
}