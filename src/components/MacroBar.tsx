import { pct } from '../utils/macros'

interface Props {
  label: string
  current: number
  target: number
  unit: string
  color: string
}

const OVER_COLOR = '#ef4444'

export function MacroBar({ label, current, target, unit, color }: Props) {
  const p = pct(current, target)
  const isOver = p > 100
  const barColor = isOver ? OVER_COLOR : color

  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] text-ct-2 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-[11px] text-ct-2 tabular-nums">{Math.round(current)}{unit} <span className="text-ct-2">/ {target}</span></span>
      </div>
      <div className="h-2 bg-ct-elevated/80 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(p, 100)}%`, background: barColor }}
        />
      </div>
      <p className="text-[11px] text-right mt-0.5 font-medium tabular-nums" style={{ color: barColor }}>
        {Math.round(p)}%
      </p>
    </div>
  )
}
