import { Component, type ReactNode, type ErrorInfo } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

// Lightweight i18n fallback — ErrorBoundary can't use hooks
const STRINGS: Record<string, Record<string, string>> = {
  en: {
    title: 'Something went wrong',
    desc: 'The app ran into an unexpected error. Your data is safe \u2014 try refreshing the page.',
    details: 'Error Details',
    tryAgain: 'Try Again',
    reload: 'Reload App',
  },
  'zh-TW': {
    title: '\u51fa\u4e86\u9ede\u554f\u984c',
    desc: '\u61c9\u7528\u7a0b\u5f0f\u767c\u751f\u610f\u5916\u932f\u8aa4\u3002\u60a8\u7684\u8cc7\u6599\u5b89\u5168\u7121\u865e \u2014 \u8acb\u5617\u8a66\u91cd\u65b0\u6574\u7406\u3002',
    details: '\u932f\u8aa4\u8a73\u60c5',
    tryAgain: '\u518d\u8a66\u4e00\u6b21',
    reload: '\u91cd\u65b0\u8f09\u5165',
  },
  'zh-CN': {
    title: '\u51fa\u4e86\u70b9\u95ee\u9898',
    desc: '\u5e94\u7528\u7a0b\u5e8f\u53d1\u751f\u610f\u5916\u9519\u8bef\u3002\u60a8\u7684\u6570\u636e\u5b89\u5168\u65e0\u865e \u2014 \u8bf7\u5c1d\u8bd5\u91cd\u65b0\u52a0\u8f7d\u3002',
    details: '\u9519\u8bef\u8be6\u60c5',
    tryAgain: '\u518d\u8bd5\u4e00\u6b21',
    reload: '\u91cd\u65b0\u52a0\u8f7d',
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
