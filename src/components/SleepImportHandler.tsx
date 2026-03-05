import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { useSaveToast } from './SaveToast'
import type { DailyLog } from '../types'

export function SleepImportHandler() {
  const { saveDailyLog } = useStore()
  const { t } = useTranslation()
  const { showToast, toastEl } = useSaveToast()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('sl') !== '1') return

    const pf = (key: string) => {
      const v = params.get(key)
      if (!v) return undefined
      const n = parseFloat(v)
      return isNaN(n) ? undefined : n
    }
    const pi = (key: string) => {
      const v = params.get(key)
      if (!v) return undefined
      const n = parseInt(v, 10)
      return isNaN(n) ? undefined : n
    }

    const logData: Partial<DailyLog> = { sleepSource: 'autosleep' }
    const h = pf('h'); if (h !== undefined) logData.sleepHours = h
    const sc = pi('sc'); if (sc !== undefined) logData.sleepScore = sc
    const dp = pf('dp'); if (dp !== undefined) logData.sleepDeepHours = dp
    const rm = pf('rm'); if (rm !== undefined) logData.sleepRemHours = rm
    const lt = pf('lt'); if (lt !== undefined) logData.sleepLightHours = lt
    const aw = pf('aw'); if (aw !== undefined) logData.sleepAwakeHours = aw
    const hrv = pi('hrv'); if (hrv !== undefined) logData.sleepHRV = hrv
    const hr = pi('hr'); if (hr !== undefined) logData.sleepAvgHR = hr
    const ef = pi('ef'); if (ef !== undefined) logData.sleepEfficiency = ef

    saveDailyLog(logData)
      .then(() => {
        window.history.replaceState({}, '', window.location.pathname)
        showToast(t('sleep.importedFrom', { source: 'AutoSleep' }))
      })
      .catch(() => {
        showToast(t('common.error'), 'error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{toastEl}</>
}