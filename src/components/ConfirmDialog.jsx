import { useEffect, useRef } from 'react'

/**
 * ConfirmDialog - a small confirmation prompt shown before a destructive action.
 *
 * Deleting was immediate in Phase I. Now that entries are stored on a server
 * and cannot be recovered by refreshing the page, a mis-click deserves a
 * second chance.
 *
 * useEffect adds an Escape-key listener and removes it again on cleanup, which
 * is what stops listeners accumulating each time the dialog opens.
 *
 * Demonstrates: useEffect with cleanup, useRef, conditional rendering.
 */

function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy = false }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    confirmRef.current?.focus()

    // Cleanup: remove the listener when the dialog closes or unmounts.
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      {/* Stop clicks inside the dialog from reaching the backdrop handler. */}
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="modal__title" id="confirm-title">{title}</h2>
        <p className="modal__text">{message}</p>
        <div className="modal__actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
