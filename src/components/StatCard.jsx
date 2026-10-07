import { memo } from 'react'

import Icon from './Icon.jsx'

/**
 * StatCard - one reusable tile showing a single derived statistic.
 *
 * The same component renders distance, calories, active minutes and steps
 * remaining. Only the props change. This is what "reusable component" means in
 * practice: write the markup once, feed it different data.
 *
 * Wrapped in React.memo in Phase II: the four tiles receive the same props on
 * most renders, so skipping their re-render costs one shallow comparison and
 * saves four component renders.
 *
 * Demonstrates: props, destructuring, conditional rendering, React.memo.
 */

function StatCard({ label, value, unit = '', icon = 'target', highlight = false }) {
  return (
    <article className={highlight ? 'stat-card stat-card--highlight' : 'stat-card'}>
      <span className="stat-card__icon">
        <Icon name={icon} size={18} />
      </span>
      <p className="stat-card__value">
        {value}
        {/* Render the unit only when one was supplied. */}
        {unit && <span className="stat-card__unit"> {unit}</span>}
      </p>
      <p className="stat-card__label">{label}</p>
    </article>
  )
}

export default memo(StatCard)
