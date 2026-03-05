import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { calc1RM, getPercentageChart } from '../utils/macros'
import { X, Calculator } from 'lucide-react'

export function CalcPage({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0
  const oneRM = calc1RM(w, r)
  const chart = oneRM > 0 ? getPercentageChart(oneRM) : []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-ct-1 flex items-center gap-2"><Calculator size={20} className="text-cyan-400" /> {t('calc.title')}</h1>
        <button onClick={onClose} className="text-ct-2 p-2" aria-label={t('common.close')}><X size={20} /></button>
      </div>

      <p className="text-xs text-ct-2">{t('calc.desc')}</p>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] text-ct-2 uppercase mb-1 block">{t('calc.weight')}</label>
          <input type="text" inputMode="decimal" pattern="[0-9.]*" value={weight}
            onChange={e => setWeight(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="kg"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-ct-1 text-2xl text-center font-bold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30" />
        </div>
        <div className="flex-1">
          <label className="text-[11px] text-ct-2 uppercase mb-1 block">{t('calc.reps')}</label>
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={reps}
            onChange={e => setReps(e.target.value.replace(/\D/g, ''))}
            placeholder="reps"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-ct-1 text-2xl text-center font-bold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30" />
        </div>
      </div>

      {oneRM > 0 && (
        <>
          <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-ct-lg p-5 text-center">
            <p className="text-xs text-cyan-400 uppercase tracking-widest mb-1">{t('calc.estimated1RM')}</p>
            <p className="text-5xl font-black text-ct-1">{oneRM}<span className="text-lg text-ct-2 ml-1">kg</span></p>
          </div>

          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-3">{t('calc.percentChart')}</p>
            {chart.map(({ pct, weight }) => (
              <div key={pct} className="flex items-center py-1.5 border-b border-slate-700/30 last:border-0">
                <span className={`text-sm font-bold w-12 ${pct >= 90 ? 'text-red-400' : pct >= 75 ? 'text-orange-400' : pct >= 60 ? 'text-yellow-400' : 'text-green-400'}`}>{pct}%</span>
                <div className="flex-1 mx-3">
                  <div className="h-2 bg-ct-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-400/50" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-ct-1 w-16 text-right">{weight} kg</span>
              </div>
            ))}
          </div>

          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-2">{t('calc.quickRef')}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-700/40 rounded-lg p-2">
                <p className="text-red-400 font-bold">{t('calc.heavy')}</p>
                <p className="text-ct-1 font-bold">{chart.find(c => c.pct === 90)?.weight}kg</p>
                <p className="text-ct-2">85-95%</p>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-2">
                <p className="text-orange-400 font-bold">{t('calc.moderate')}</p>
                <p className="text-ct-1 font-bold">{chart.find(c => c.pct === 75)?.weight}kg</p>
                <p className="text-ct-2">70-80%</p>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-2">
                <p className="text-green-400 font-bold">{t('calc.light')}</p>
                <p className="text-ct-1 font-bold">{chart.find(c => c.pct === 60)?.weight}kg</p>
                <p className="text-ct-2">55-65%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
