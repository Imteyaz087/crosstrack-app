import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorRetryProps {
  message?: string
  onRetry: () => void
}

export function ErrorRetry({ message = 'Something went wrong', onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <p className="text-sm text-ct-2 text-center">{message}</p>
      <button onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ct-surface border border-ct-border text-sm text-cyan-400 font-medium active:bg-ct-elevated transition-colors">
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  )
}
