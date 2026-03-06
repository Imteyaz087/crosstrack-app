import { Component, type ReactNode, type ErrorInfo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

// Lightweight i18n fallback  -  ErrorBoundary can't use hooks
const STRINGS: Record<string, Record<string, string>> = {
  en: {
    title: 'Something went wrong',
    desc: 'The app ran into an unexpected error. Your data is safe — try refreshing the page.',
    details: 'Error Details',
    tryAgain: 'Try Again',
    reload: 'Reload App',
  },
  'zh-TW': {
    title: '出了點問題',
    desc: '應用程式發生意外錯誤。您的資料安全無虞 — 請嘗試重新整理。',
    details: '錯誤詳情',
    tryAgain: '再試一次',
    reload: '重新載入',
  },
  'zh-CN': {
    title: '出了点问题',
    desc: '应用程序发生意外错误。您的数据安全无虞 — 请尝试重新加载。',
    details: '错误详情',
    tryAgain: '再试一次',
    reload: '重新加载',
  },
}

function getStrings(): Record<string, string> {
  const stored = localStorage.getItem('i18nextLng') || navigator.language || 'en'
  if (stored.startsWith('zh-TW') || stored === 'zh-Hant') return STRINGS['zh-TW']
  if (stored.startsWith('zh')) return STRINGS['zh-CN']
  return STRINGS.en
}

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

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

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const s = getStrings()
      return (
        <div className="h-screen bg-ct-bg text-ct-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-ct-lg bg-red-500/15 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ct-1 mb-2">{s.title}</h1>
              <p className="text-sm text-ct-2 leading-relaxed">{s.desc}</p>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border text-left">
                <p className="text-[11px] uppercase tracking-widest text-ct-2 mb-1">{s.details}</p>
                <p className="text-xs text-red-400 font-mono break-all">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={this.handleReset}
                className="flex-1 bg-ct-surface border border-ct-border text-ct-2 font-semibold py-3 rounded-xl text-sm min-h-[48px] card-press">
                {s.tryAgain}
              </button>
              <button onClick={this.handleReload}
                className="flex-1 bg-cyan-500 text-slate-900 font-bold py-3 rounded-xl text-sm min-h-[48px] flex items-center justify-center gap-2 card-press">
                <RefreshCw size={16} /> {s.reload}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
