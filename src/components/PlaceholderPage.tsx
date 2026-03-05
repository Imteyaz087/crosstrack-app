interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-lg font-semibold text-white mb-2">{title}</p>
      <p style={{ color: 'var(--text-muted)' }} className="text-sm">Coming soon</p>
    </div>
  )
}
