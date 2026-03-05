interface Props { text?: string }

export function LoadingSpinner({ text = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-logo-breathe"
        style={{background: '#161B22'}}>
        <svg viewBox="0 0 512 512" className="w-12 h-12">
          <defs>
            <linearGradient id="lsg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00D4AA"/>
              <stop offset="50%" stopColor="#4488FF"/>
              <stop offset="100%" stopColor="#7B61FF"/>
            </linearGradient>
          </defs>
          <path d="M 184.5 120.2 L 320.4 120.2 L 320.4 163.1 L 273.2 163.1 L 273.2 241.7 L 327.5 241.7 L 241.7 406.2 L 270.3 277.5 L 220.3 277.5 L 220.3 163.1 L 184.5 163.1 Z" fill="url(#lsg)"/>
        </svg>
      </div>
      <p className="text-sm text-ct-2">{text}</p>
    </div>
  )
}