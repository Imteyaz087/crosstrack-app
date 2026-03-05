type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [30, 50, 30],
  error: [50, 30, 50, 30, 80],
  selection: 5,
}

function canVibrate(): boolean {
  return typeof navigator !== 'undefined'
    && 'vibrate' in navigator
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function haptic(pattern: HapticPattern = 'light'): void {
  if (!canVibrate()) return
  try { navigator.vibrate(PATTERNS[pattern]) } catch { }
}

export function useHaptic() {
  return {
    light: () => haptic('light'),
    medium: () => haptic('medium'),
    heavy: () => haptic('heavy'),
    success: () => haptic('success'),
    error: () => haptic('error'),
    selection: () => haptic('selection'),
    tap: () => haptic('light'),
  }
}