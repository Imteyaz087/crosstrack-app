import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel',
  onConfirm, onCancel, destructive = true,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-ct-surface rounded-ct-lg p-6 w-full max-w-sm border border-ct-border shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          {destructive && (
            <div className="w-11 h-11 shrink-0 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-ct-1">{title}</h3>
            <p className="text-sm text-ct-2 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-ct-elevated text-ct-2 font-medium active:bg-ct-elevated/80 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-xl font-bold active:scale-[0.98] transition-all ${
              destructive ? 'bg-red-500 text-ct-1' : 'bg-cyan-500 text-slate-900'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
