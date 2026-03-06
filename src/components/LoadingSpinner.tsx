interface Props {
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ text = 'Loading...', fullScreen = false }: Props) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5 animate-fade-in">
      {/* Logo with breathing glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center animate-logo-breathe"
          style={{ background: 'linear-gradient(145deg, #1a1f2e 0%, #161B22 100%)', boxShadow: '0 0 40px rgba(34,211,238,0.15)' }}>
          <svg viewBox="0 0 512 512" className="w-14 h-14">
            <defs>
              <linearGradient id="lsg-splash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="50%" stopColor="#4488FF"/>
                <stop offset="100%" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
            <path d="M 184.5 120.2 L 320.4 120.2 L 320.4 163.1 L 273.2 163.1 L 273.2 241.7 L 327.5 241.7 L 241.7 406.2 L 270.3 277.5 L 220.3 277.5 L 220.3 163.1 L 184.5 163.1 Z" fill="url(#lsg-splash)"/>
          </svg>
        </div>
      </div>

      {/* Brand name */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-bold tracking-wider"
          style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TRACKVOLT
        </h1>
        <p className="text-xs text-ct-2 font-medium">{text}</p>
      </div>

      {/* Animated loading bar */}
      <div className="w-32 h-0.5 bg-ct-border/30 rounded-full overflow-hidden">
        <div className="h-full w-1/3 rounded-full animate-loading-slide"
          style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, #a855f7, transparent)' }} />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-ct-bg flex items-center justify-center z-[100]">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  )
}
