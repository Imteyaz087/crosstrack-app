import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface RecoveryLoggerProps {
  readiness: string
  rpe: string
  sorenessUpper: string
  sorenessLower: string
  restingHR: string
  onReadinessChange: (value: string) => void
  onRpeChange: (value: string) => void
  onSorenessUpperChange: (value: string) => void
  onSorenessLowerChange: (value: string) => void
  onRestingHRChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}

export function RecoveryLogger({
  readiness, rpe, sorenessUpper, sorenessLower, restingHR,
  onReadinessChange, onRpeChange, onSorenessUpperChange,
  onSorenessLowerChange, onRestingHRChange, onSave, onClose,
}: RecoveryLoggerProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-ct-1">{t('recovery.title')}</h1>
        <button onClick={onClose} className="p-2 text-ct-2 active:text-ct-1" aria-label="Close"><X size={20} /></button>
      </div>

      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-4">
        <div>
          <label className="text-xs text-ct-2 block mb-1.5">{t('recovery.readiness')}</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
            value={readiness}
            onChange={e => { const v = e.target.value.replace(/\D/g, ''); const n = parseInt(v); if (v === '' || (n >= 1 && n <= 10)) onReadinessChange(v) }}
            placeholder={t('recovery.readinessPlaceholder')}
            className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
        </div>

        <div>
          <label className="text-xs text-ct-2 block mb-1.5">{t('recovery.rpe')}</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}
            value={rpe}
            onChange={e => { const v = e.target.value.replace(/\D/g, ''); const n = parseInt(v); if (v === '' || (n >= 1 && n <= 10)) onRpeChange(v) }}
            placeholder={t('recovery.rpePlaceholder')}
            className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-ct-2 block mb-1.5">{t('recovery.sorenessUpper')}</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
              value={sorenessUpper}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); const n = parseInt(v); if (v === '' || (n >= 0 && n <= 5)) onSorenessUpperChange(v) }}
              className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-ct-2 block mb-1.5">{t('recovery.sorenessLower')}</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
              value={sorenessLower}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); const n = parseInt(v); if (v === '' || (n >= 0 && n <= 5)) onSorenessLowerChange(v) }}
              className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
        </div>

        <div>
          <label className="text-xs text-ct-2 block mb-1.5">{t('recovery.restingHR')}</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
            value={restingHR}
            onChange={e => onRestingHRChange(e.target.value.replace(/\D/g, ''))}
            placeholder={t('recovery.restingHRPlaceholder')}
            className="w-full bg-ct-elevated rounded-xl py-3 px-4 text-ct-1 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
        </div>
      </div>

      {/* Save — sticky at bottom */}
      <div className="sticky-save">
        <button onClick={onSave} className="w-full bg-cyan-500 text-slate-900 font-bold py-4 rounded-xl btn-press text-base shadow-lg shadow-cyan-500/30">{t('recovery.saveRecovery')}</button>
      </div>
    </div>
  )
}
