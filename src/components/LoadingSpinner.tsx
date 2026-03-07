interface Props {
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ text = 'Loading...', fullScreen = false }: Props) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5 animate-fade-in">
      <div className="relative w-24 h-24 rounded-[28px] border border-orange-500/20 bg-[#15181F] shadow-[0_20px_60px_rgba(255,122,26,0.16)] overflow-hidden animate-logo-breathe">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,122,26,0.18),transparent_68%)]" />
        <img
          src="/TrackVolt-Bolt-Icon-Master.png"
          alt="TrackVolt bolt icon"
          className="relative block w-full h-full object-cover"
          width={768}
          height={768}
          loading="eager"
        />
      </div>

      <div className="text-center space-y-1 max-w-xs">
        <p className="text-xs text-ct-2 font-medium">{text}</p>
      </div>

      <div className="w-32 h-0.5 bg-ct-border/30 rounded-full overflow-hidden">
        <div
          className="h-full w-1/3 rounded-full animate-loading-slide"
          style={{ background: 'linear-gradient(90deg, transparent, #ff7a1a, #ff4d00, transparent)' }}
        />
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
