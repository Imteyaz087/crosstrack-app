import { useState, useEffect } from 'react'

/**
 * Animates a number from 0 to target using requestAnimationFrame.
 * Uses ease-out cubic easing for a satisfying deceleration.
 * Respects prefers-reduced-motion  -  instantly shows final value.
 */
export function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) { setValue(0); return }

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { setValue(target); return }

    const start = performance.now()
    let raf: number

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
