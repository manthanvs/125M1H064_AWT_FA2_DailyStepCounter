import { Link, useLocation } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

/**
 * NotFoundPage - the catch-all route.
 *
 * Without this, an unrecognised URL renders nothing at all and the user is left
 * looking at an empty page with no idea what happened. It is registered last in
 * the route table, with the wildcard path.
 *
 * Demonstrates: React Router wildcard route, useLocation, error handling.
 */

function NotFoundPage() {
  useDocumentTitle('Page not found')
  const location = useLocation()

  return (
    <div className="page page--narrow">
      <div className="card state-panel">
        <p className="not-found__code">404</p>
        <h1 className="state-panel__title">That page does not exist</h1>
        <p className="state-panel__text">
          Nothing is available at <code>{location.pathname}</code>. It may have been moved, or the
          address may contain a typing error.
        </p>
        <div className="modal__actions">
          <Link to="/history" className="btn">View history</Link>
          <Link to="/" className="btn btn--primary">Go to dashboard</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
