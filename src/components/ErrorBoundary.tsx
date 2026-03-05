import { Component, type ReactNode, type ErrorInfo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReload = () => { window.location.reload() }
  handleReset = () => { this.setState({ hasError: false, error: null }) }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-slate-950 text-ct-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-ct-lg bg-red-500/15 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ct-1 mb-2">Something went wrong</h1>
              <p className="text-sm text-ct-2 leading-relaxed">
                The app ran into an unexpected error. Your data is safe — try refreshing the page.
              </p>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border text-left">
                <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-1">Error Details</p>
                <p className="text-xs text-red-400 font-mono break-all">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={this.handleReset} className="flex-1 bg-slate-800 border border-slate-700 text-ct-2 font-semibold py-3 rounded-xl text-sm min-h-[48px]">
                Try Again
              </button>
              <button onClick={this.handleReload} className="flex-1 bg-cyan-500 text-slate-900 font-bold py-3 rounded-xl text-sm min-h-[48px] flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Reload App
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}