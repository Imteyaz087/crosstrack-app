import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="bg-ct-surface rounded-ct-lg p-8 border border-ct-border border-dashed text-center animate-empty-in">
      <div className="w-14 h-14 bg-ct-elevated rounded-ct-lg flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-ct-2" />
      </div>
      <p className="text-[0.9375rem] font-medium text-ct-2">{title}</p>
      {description && (
        <p className="text-[0.8125rem] text-ct-2 mt-1.5 max-w-[260px] mx-auto leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 rounded-xl text-xs font-semibold card-press"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
