import { useState, useCallback } from 'react'

export function useUnsavedChanges() {
  const [isDirty, setIsDirty] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const markDirty = useCallback(() => setIsDirty(true), [])
  const markClean = useCallback(() => { setIsDirty(false); setShowDialog(false); setPendingAction(null) }, [])

  const confirmDiscard = useCallback((action: () => void) => {
    if (isDirty) {
      setPendingAction(() => action)
      setShowDialog(true)
    } else {
      action()
    }
  }, [isDirty])

  const doDiscard = useCallback(() => {
    setShowDialog(false)
    setIsDirty(false)
    pendingAction?.()
    setPendingAction(null)
  }, [pendingAction])

  const cancelDiscard = useCallback(() => {
    setShowDialog(false)
    setPendingAction(null)
  }, [])

  return { isDirty, markDirty, markClean, confirmDiscard, showDialog, doDiscard, cancelDiscard }
}