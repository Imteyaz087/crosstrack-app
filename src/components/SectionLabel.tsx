interface Props {
  children: React.ReactNode
  right?: React.ReactNode
}

export function SectionLabel({ children, right }: Props) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">{children}</p>
      {right && <div>{right}</div>}
    </div>
  )
}