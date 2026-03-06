import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Trophy } from 'lucide-react'

export function BenchmarkPage() {
  const { t } = useTranslation()
  const { benchmarkWods, loadBenchmarkWods } = useStore()

  useEffect(() => { loadBenchmarkWods() }, [])

  const categories = [
    { key: 'girl', label: t('benchmark.theGirls'), color: 'text-pink-400' },
    { key: 'hero', label: t('benchmark.heroWODs'), color: 'text-red-400' },
  ]

  return (
    <div className="space-y-4 stagger-children">
      <h1 className="text-xl font-bold text-ct-1">{t('benchmark.title')}</h1>

      {categories.map(({ key, label, color }) => {
        const wods = benchmarkWods.filter(w => w.category === key)
        if (wods.length === 0) return null
        return (
          <div key={key}>
            <p className={`text-xs font-bold mb-2 uppercase ${color}`}>{label}</p>
            {wods.map(wod => (
              <div key={wod.id} className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className={color} />
                  <span className="text-base font-bold text-ct-1">{wod.name}</span>
                  <span className="px-1.5 py-0.5 bg-ct-elevated rounded text-[11px] text-ct-2">{wod.wodType}</span>
                </div>
                <p className="text-sm text-ct-2">{wod.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs"><span className="text-green-400 font-semibold">RX:</span> <span className="text-ct-2">{wod.rxStandard}</span></p>
                  {wod.scaledStandard && (
                    <p className="text-xs"><span className="text-orange-400 font-semibold">Scaled:</span> <span className="text-ct-2">{wod.scaledStandard}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
