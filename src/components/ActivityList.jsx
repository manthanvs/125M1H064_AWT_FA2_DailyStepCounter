import { Link } from 'react-router-dom'

import ActivityItem from './ActivityItem.jsx'
import { EmptyState } from './StatePanels.jsx'
import { formatNumber } from '../utils/metrics.js'

/**
 * ActivityList - a list of logged walking sessions.
 *
 * Used on both the Dashboard (today only) and the History page (the filtered
 * set, with dates shown). The differences are entirely prop-driven, so there
 * is one list component rather than two.
 *
 * Demonstrates: lists and keys, conditional rendering, component reuse.
 */

function ActivityList({
  activities = [],
  onDelete,
  showDate = false,
  title = "Today's activity",
  emptyTitle = 'No sessions logged yet',
  emptyText = 'Add your first walk of the day to start counting.',
  showTotal = true
}) {
  const total = activities.reduce((sum, item) => sum + item.steps, 0)

  return (
    <section className="card activity-list" aria-label={title}>
      <div className="card__header">
        <h2 className="card__title">{title}</h2>
        {showTotal && activities.length > 0 && (
          <p className="card__meta">{formatNumber(total)} steps</p>
        )}
      </div>

      {activities.length === 0 ? (
        <EmptyState title={emptyTitle} text={emptyText}>
          <Link to="/activity/new" className="btn btn--primary empty-state__action">
            Add an activity
          </Link>
        </EmptyState>
      ) : (
        <ul className="activity-list__items">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onDelete={onDelete}
              showDate={showDate}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ActivityList
