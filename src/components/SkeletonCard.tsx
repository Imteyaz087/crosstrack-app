/** Skeleton loading cards with shimmer effect for perceived performance */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-ct-surface rounded-ct-lg p-4 border border-ct-border ${className}`}>
      <Bone className="h-3 w-1/3 mb-3" />
      <Bone className="h-6 w-2/3 mb-2" />
      <Bone className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-11 h-11 skeleton rounded-xl shrink-0" />
      <div className="flex-1">
        <Bone className="h-4 w-3/4 mb-2" />
        <Bone className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function TodayPageSkeleton() {
  return (
    <div className="space-y-4 stagger-children">
      {/* Header — greeting + streak */}
      <div className="flex justify-between items-start">
        <div>
          <Bone className="h-4 w-36 mb-2" />
          <Bone className="h-7 w-48" />
        </div>
        <Bone className="h-9 w-16 rounded-full" />
      </div>

      {/* Quick tools */}
      <div className="flex gap-2">
        <Bone className="flex-1 h-12 rounded-xl" />
        <Bone className="flex-1 h-12 rounded-xl" />
        <Bone className="flex-1 h-12 rounded-xl" />
      </div>

      {/* Workout card */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <Bone className="h-3 w-28 mb-3" />
        <Bone className="h-6 w-3/4 mb-2" />
        <Bone className="h-4 w-1/2 mb-3" />
        <div className="flex gap-2">
          <Bone className="h-5 w-10 rounded-full" />
          <Bone className="h-5 w-8 rounded-full" />
        </div>
      </div>

      {/* Weekly progress */}
      <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
        <div className="flex justify-between mb-2">
          <Bone className="h-3 w-20" />
          <Bone className="h-3 w-16" />
        </div>
        <Bone className="h-1.5 w-full rounded-full" />
      </div>

      {/* Macros card */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <div className="flex justify-between mb-3">
          <Bone className="h-3 w-24" />
          <Bone className="h-3 w-20" />
        </div>
        <div className="flex gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1">
              <Bone className="h-3 w-full mb-1" />
              <Bone className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Body metrics grid */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border text-center">
            <Bone className="h-4 w-4 mx-auto mb-1 rounded" />
            <Bone className="h-5 w-8 mx-auto mb-1" />
            <Bone className="h-3 w-6 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
