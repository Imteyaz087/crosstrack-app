import { pct } from '../utils/macros'

interface Props {
  label: string
  current: number
  target: number
  unit: string
  color: string
}

export function MacroBar({ label, current, target, unit, color }: Props) {
  const p = pct(current, target)
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-slate-500">{Math.round(current)}/{target}{unit}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
    </div>
  )
}
