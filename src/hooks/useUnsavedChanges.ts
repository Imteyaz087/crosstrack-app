import { useState, useCallback } from 'react'

/**
 * Hook for tracking unsaved form changes.
 * Returns { isDirty, markDirty, markClean, confirmDiscard, showDiscardDialog, cancelDiscard }
 * Usage: call markDirty() on any form input change, markClean() on save.
 * Call confirmDiscard(callback) when user tries to navigate away.
 */
export function useUnsavedChanges() {
  const [isDirty, setIsDirty] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const markDirty = useCallback(() => setIsDirty(true), [])
  const markClean = useCallback(() => { setIsDirty(false); setShowDialog(false); setPendingAction(null) }, [])

  /** Call when user tries to leave. If dirty, shows dialog. If clean, runs action immediately. */
  const confirmDiscard = useCallback((action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action)
      setShowDialog(true)
    } else {
      action()
    }
  }, [isDirty])

  /** User confirmed discard */
  const doDiscard = useCallback(() => {
    setShowDialog(false)
    setIsDirty(false)
    pendingAction?.()
    setPendingAction(null)
  }, [pendingAction])

  /** User cancelled discard */
  const cancelDiscard = useCallback(() => {
    setShowDialog(false)
    setPendingAction(null)
  }, [])

  return { isDirty, markDirty, markClean, confirmDiscard, showDialog, doDiscard, cancelDiscard }
}
