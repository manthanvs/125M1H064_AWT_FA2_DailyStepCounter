import { memo } from 'react'
import { Link } from 'react-router-dom'

import Icon from './Icon.jsx'
import { formatNumber, formatTime, formatDate } from '../utils/metrics.js'

/**
 * ActivityItem - one logged walking session.
 *
 * Wrapped in React.memo. The History page can render dozens of these at once,
 * and without memo every row re-renders whenever the search box changes, even
 * though only the filtered set changes. memo compares props and skips the
 * re-render when they are unchanged.
 *
 * memo only helps if the props are stable between renders, which is why the
 * parent wraps its onDelete handler in useCallback. Passing a fresh arrow
 * function each render would defeat the comparison entirely.
 *
 * Demonstrates: React.memo, React Router Link, props, callbacks.
 */

function ActivityItem({ activity, onDelete, showDate = false }) {
  const { id, label, steps, time, type, date, note } = activity

  return (
    <li className="activity-item">
      <span className="activity-item__icon">
        <Icon name="walk" size={18} />
      </span>

      <div className="activity-item__body">
        <p className="activity-item__label">{label}</p>
        <p className="activity-item__meta">
          {showDate && <>{formatDate(date)} &middot; </>}
          {formatTime(time)} &middot; <span className="tag">{type}</span>
        </p>
        {/* The note is optional, so only render the line when one exists. */}
        {note && <p className="activity-item__note">{note}</p>}
      </div>

      <p className="activity-item__steps">{formatNumber(steps)}</p>

      <div className="activity-item__actions">
        <Link
          to={`/activity/${id}/edit`}
          className="btn btn--icon"
          aria-label={`Edit ${label}`}
          title="Edit this entry"
        >
          <Icon name="pencil" size={16} />
        </Link>
        <button
          type="button"
          className="btn btn--icon btn--icon-danger"
          onClick={() => onDelete(activity)}
          aria-label={`Delete ${label}`}
          title="Delete this entry"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  )
}

export default memo(ActivityItem)
