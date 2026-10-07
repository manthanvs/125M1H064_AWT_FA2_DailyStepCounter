/**
 * StatePanels - the loading, error and empty screens.
 *
 * Every screen that reads data can be in one of four states: loading, failed,
 * loaded-but-empty, or loaded with content. Giving the first three their own
 * small components means each page handles them the same way, and the user
 * always gets an explanation rather than a blank area.
 *
 * Demonstrates: conditional rendering, reusable presentational components.
 */

/** Shown while a request is in flight. */
export function LoadingState({ message = 'Loading your activity...' }) {
  return (
    <div className="card state-panel" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="state-panel__text">{message}</p>
    </div>
  )
}

/** Shown when a request fails, with a way to try again. */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="card state-panel state-panel--error" role="alert">
      <h2 className="state-panel__title">Could not load your data</h2>
      <p className="state-panel__text">{message}</p>
      <p className="state-panel__detail">
        If you are running the project locally, check that the API is started with{' '}
        <code>npm run api</code> on port 3001.
      </p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

/** Shown when a request succeeded but there is nothing to display. */
export function EmptyState({ title = 'Nothing here yet', text = '', children }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {text && <p className="empty-state__text">{text}</p>}
      {children}
    </div>
  )
}

/** A quiet banner explaining that the API could not be reached. */
export function OfflineNotice() {
  return (
    <div className="banner banner--info" role="status">
      <div className="banner__body">
        <p className="banner__title">Working offline</p>
        <p className="banner__text">
          The REST API is not reachable, so changes are being saved in this browser instead.
          Start it with <code>npm run api</code> to use the server.
        </p>
      </div>
    </div>
  )
}
