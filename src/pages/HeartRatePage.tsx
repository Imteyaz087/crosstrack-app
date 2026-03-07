import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, Bluetooth, Play, Square, Activity, Zap, Flame } from 'lucide-react'
import { useStore } from '../stores/useStore'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BT = any

interface HRReading {
  hr: number
  timestamp: number
}

export function HeartRatePage() {
  const { t } = useTranslation()
  const { profile } = useStore()
  const [isSupported] = useState(() => {
    // Lazy init - check Bluetooth support on mount
    return !!(navigator as BT).bluetooth
  })
  const [device, setDevice] = useState<BT>(null)
  const [connected, setConnected] = useState(false)
  const [currentHR, setCurrentHR] = useState<number | null>(null)
  const [readings, setReadings] = useState<HRReading[]>([])
  const [recording, setRecording] = useState(false)
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const charRef = useRef<BT>(null)
  const hrHandlerRef = useRef<((event: Event) => void) | null>(null)

  useEffect(() => {
    // Cleanup BLE listener on unmount
    return () => {
      if (charRef.current && hrHandlerRef.current) {
        try { charRef.current.removeEventListener('characteristicvaluechanged', hrHandlerRef.current) } catch { /* ignore */ }
        try { charRef.current.stopNotifications() } catch { /* ignore */ }
      }
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      const dev = await (navigator as BT).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['heart_rate']
      })
      setDevice(dev)

      const server = await dev.gatt?.connect()
      const service = await server?.getPrimaryService('heart_rate')
      const characteristic = await service?.getCharacteristic('heart_rate_measurement')

      if (characteristic) {
        charRef.current = characteristic
        await characteristic.startNotifications()
        const handler = (event: Event) => {
          const value = (event.target as BT).value
          if (value) {
            const flags = value.getUint8(0)
            const is16bit = flags & 0x01
            const hr = is16bit ? value.getUint16(1, true) : value.getUint8(1)
            setCurrentHR(hr)
            if (recording) {
              setReadings(prev => [...prev, { hr, timestamp: Date.now() }])
            }
          }
        }
        hrHandlerRef.current = handler
        characteristic.addEventListener('characteristicvaluechanged', handler)
        setConnected(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('cancelled')) return
      console.error('BLE connection error:', err)
    }
  }, [recording])

  const disconnect = useCallback(async () => {
    if (charRef.current) {
      if (hrHandlerRef.current) {
        try { charRef.current.removeEventListener('characteristicvaluechanged', hrHandlerRef.current) } catch { /* ignore */ }
        hrHandlerRef.current = null
      }
      try { await charRef.current.stopNotifications() } catch { /* ignore */ }
    }
    if (device?.gatt?.connected) device.gatt.disconnect()
    setConnected(false)
    setDevice(null)
    setCurrentHR(null)
    charRef.current = null
  }, [device])

  const startRecording = () => {
    setReadings([])
    setSessionStart(Date.now())
    setRecording(true)
  }

  const stopRecording = () => {
    setRecording(false)
  }

  // Memoize current time to avoid calling Date.now() during render
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    // Update current time every second when recording
    if (!recording || !sessionStart) return
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [recording, sessionStart])

  // Stats
  const avgHR = readings.length > 0 ? Math.round(readings.reduce((s, r) => s + r.hr, 0) / readings.length) : null
  const maxHR = readings.length > 0 ? Math.max(...readings.map(r => r.hr)) : null
  const minHR = readings.length > 0 ? Math.min(...readings.map(r => r.hr)) : null
  const duration = sessionStart ? Math.floor((currentTime - sessionStart) / 1000) : 0

  const getZone = (hr: number): { zone: number; name: string; color: string } => {
    const maxEstimated = 220 - (profile?.age || 30)
    const pct = hr / maxEstimated
    if (pct < 0.6) return { zone: 1, name: t('heartRate.zoneRecovery'), color: 'text-blue-400' }
    if (pct < 0.7) return { zone: 2, name: t('heartRate.zoneFatBurn'), color: 'text-green-400' }
    if (pct < 0.8) return { zone: 3, name: t('heartRate.zoneAerobic'), color: 'text-yellow-400' }
    if (pct < 0.9) return { zone: 4, name: t('heartRate.zoneThreshold'), color: 'text-orange-400' }
    return { zone: 5, name: t('heartRate.zoneMaxEffort'), color: 'text-red-400' }
  }

  // Calories estimate (very rough)
  const caloriesEstimate = readings.length > 0 && avgHR
    ? Math.round((duration / 60) * (avgHR * 0.1) * 0.5)
    : 0

  if (!isSupported) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-xl font-bold text-ct-1">{t('heartRate.title')}</h1>
        <div className="bg-ct-surface rounded-ct-lg p-6 border border-ct-border text-center">
          <Bluetooth size={32} className="text-ct-2 mx-auto mb-3" />
          <p className="text-sm text-ct-2">{t('heartRate.btNotSupported')}</p>
          <p className="text-xs text-ct-2 mt-1">{t('heartRate.btNotSupportedDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <h1 className="text-xl font-bold text-ct-1">{t('heartRate.title')}</h1>
      <p className="text-xs text-ct-2">{t('heartRate.subtitle')}</p>

      {/* Connection */}
      {!connected ? (
        <button onClick={connect}
          className="w-full bg-red-500/10 border-2 border-dashed border-red-500/30 rounded-ct-lg py-8 flex flex-col items-center gap-3 active:bg-red-500/20">
          <div className="w-14 h-14 bg-red-500/15 rounded-ct-lg flex items-center justify-center animate-pulse">
            <Heart size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-red-400">{t('heartRate.connectMonitor')}</p>
          <p className="text-[11px] text-ct-2">{t('heartRate.connectDesc')}</p>
        </button>
      ) : (
        <>
          {/* Live HR */}
          <div className="bg-ct-surface rounded-ct-lg p-6 border border-ct-border text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-[11px] text-green-400 font-semibold">{device?.name || t('heartRate.connected')}</p>
            </div>

            {currentHR ? (
              <>
                <div className="flex items-center justify-center gap-3 my-4">
                  <Heart size={28} className="text-red-400 animate-pulse" />
                  <p className="text-5xl font-bold text-ct-1">{currentHR}</p>
                  <span className="text-sm text-ct-2 self-end mb-2">{t('heartRate.bpm')}</span>
                </div>
                {(() => {
                  const zone = getZone(currentHR)
                  return (
                    <p className={`text-xs font-bold ${zone.color}`}>
                      {t('heartRate.zone')} {zone.zone}  -  {zone.name}
                    </p>
                  )
                })()}
              </>
            ) : (
              <p className="text-ct-2 text-sm py-4">{t('heartRate.waitingData')}</p>
            )}
          </div>

          {/* Record controls */}
          <div className="flex gap-2">
            {!recording ? (
              <button onClick={startRecording}
                className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                <Play size={14} /> {t('heartRate.startRecording')}
              </button>
            ) : (
              <button onClick={stopRecording}
                className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                <Square size={14} /> {t('heartRate.stop')}
              </button>
            )}
            <button onClick={disconnect}
              className="bg-ct-elevated/50 text-ct-2 font-bold py-3 px-4 rounded-xl text-sm">
              {t('heartRate.disconnect')}
            </button>
          </div>

          {/* Session Stats */}
          {readings.length > 0 && (
            <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
              <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">
                {recording ? t('heartRate.recording') : t('heartRate.sessionSummary')}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div>
                  <Activity size={14} className="text-cyan-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-ct-1">{avgHR}</p>
                  <p className="text-[11px] text-ct-2">{t('heartRate.avgHR')}</p>
                </div>
                <div>
                  <Zap size={14} className="text-red-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-ct-1">{maxHR}</p>
                  <p className="text-[11px] text-ct-2">{t('heartRate.maxHR')}</p>
                </div>
                <div>
                  <Flame size={14} className="text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-ct-1">{caloriesEstimate}</p>
                  <p className="text-[11px] text-ct-2">{t('heartRate.calEst')}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-ct-2">
                <span>{t('heartRate.duration')} {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
                <span>{t('heartRate.minHR')} {minHR} {t('heartRate.bpm')}</span>
                <span>{t('heartRate.readings', { count: readings.length })}</span>
              </div>
            </div>
          )}

          {/* HR Zone guide */}
          <div className="bg-ct-surface/40 rounded-xl p-3 border border-ct-border/30">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">{t('heartRate.hrZones')}</p>
            <div className="space-y-1">
              {[
                { zone: 1, name: t('heartRate.zoneRecovery'), range: '<60%', color: 'bg-blue-400' },
                { zone: 2, name: t('heartRate.zoneFatBurn'), range: '60-70%', color: 'bg-green-400' },
                { zone: 3, name: t('heartRate.zoneAerobic'), range: '70-80%', color: 'bg-yellow-400' },
                { zone: 4, name: t('heartRate.zoneThreshold'), range: '80-90%', color: 'bg-orange-400' },
                { zone: 5, name: t('heartRate.zoneMaxEffort'), range: '90%+', color: 'bg-red-400' },
              ].map(z => (
                <div key={z.zone} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${z.color}`} />
                  <span className="text-[11px] text-ct-2 w-4">{z.zone}</span>
                  <span className="text-[11px] text-ct-2 flex-1">{z.name}</span>
                  <span className="text-[11px] text-ct-2">{z.range}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
