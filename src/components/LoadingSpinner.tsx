interface Props {
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ text = 'Loading...', fullScreen = false }: Props) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5 animate-fade-in">
      <div className="relative w-full max-w-[280px] animate-logo-breathe">
        <div className="absolute inset-0 rounded-[28px] bg-orange-500/15 blur-2xl animate-pulse" />
        <div
          className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-[#161B22]"
          style={{ boxShadow: '0 0 48px rgba(249,115,22,0.12)' }}
        >
          <img
            src="/og-image.png"
            alt="TrackVolt logo"
            className="block w-full h-auto"
            width={1200}
            height={630}
            loading="eager"
          />
        </div>
      </div>

      <div className="text-center space-y-1 max-w-xs">
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
