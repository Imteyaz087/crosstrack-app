/**
 * useHaptic  -  Haptic feedback for PWA
 *
 * Uses Vibration API (Android) for tactile feedback on key actions.
 * iOS Safari doesn't support Vibration API, so this gracefully no-ops.
 * Respects prefers-reduced-motion.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,           // Quick tap  -  button press, selection change
  medium: 25,          // Card press, toggle switch
  heavy: 50,           // Save action, confirm
  success: [30, 50, 30], // Workout saved, streak milestone
  error: [50, 30, 50, 30, 80], // Validation error, delete confirm
  selection: 5,        // Picker scroll, tab switch
}

function canVibrate(): boolean {
  return typeof navigator !== 'undefined'
    && 'vibrate' in navigator
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function haptic(pattern: HapticPattern = 'light'): void {
  if (!canVibrate()) return
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    // Silently fail  -  vibration is enhancement, not requirement
  }
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
