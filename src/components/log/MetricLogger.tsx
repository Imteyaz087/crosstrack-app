import { X } from 'lucide-react'

interface MetricConfig {
  label: string
  placeholder: string
  unit: string
  quickValues?: number[]
}

interface MetricLoggerProps {
  metricValue: string
  metricConfig: MetricConfig
  onMetricValueChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}

export function MetricLogger({
  metricValue,
  metricConfig,
  onMetricValueChange,
  onSave,
  onClose,
}: MetricLoggerProps) {
  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-ct-1">{metricConfig.label}</h1>
        <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ct-2 active:text-ct-1" aria-label="Close"><X size={20} /></button>
      </div>
      <div className="bg-ct-surface rounded-ct-lg p-6 border border-ct-border text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <input type="text" inputMode="decimal" pattern="[0-9.]*" value={metricValue} onChange={e => onMetricValueChange(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={metricConfig.placeholder}
            className="w-36 bg-ct-elevated rounded-xl py-3.5 px-4 text-ct-1 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            autoFocus />
          <span className="text-ct-2 text-lg">{metricConfig.unit}</span>
        </div>
        {metricConfig.quickValues && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {metricConfig.quickValues.map(v => (
              <button key={v} onClick={() => onMetricValueChange(String(v))}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-colors ${
                  metricValue === String(v) ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-ct-elevated text-ct-2'
                }`}>{v}</button>
            ))}
          </div>
        )}
      </div>
      {/* Save  -  sticky at bottom */}
      <div className="sticky-save">
        <button onClick={onSave} className="w-full bg-cyan-500 text-slate-900 font-bold py-4 rounded-xl btn-press text-base shadow-lg shadow-cyan-500/30">Save</button>
      </div>
    </div>
  )
}
