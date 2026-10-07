import { formatNumber, weeklyTotal, weeklyAverage, goalsAchievedCount } from '../utils/metrics.js'

/**
 * WeeklySummary - three headline numbers describing the week.
 *
 * All three values are calculated on the fly from the history prop using the
 * pure helper functions, so the summary can never drift out of sync with the
 * chart sitting next to it.
 *
 * Demonstrates: props, derived state, conditional rendering.
 */

function WeeklySummary({ history = [], goal = 10000 }) {
  if (history.length === 0) return null

  const total = weeklyTotal(history)
  const average = weeklyAverage(history)
  const achieved = goalsAchievedCount(history, goal)

  return (
    <section className="weekly-summary" aria-label="Weekly summary">
      <div className="weekly-summary__item">
        <p className="weekly-summary__value">{formatNumber(total)}</p>
        <p className="weekly-summary__label">Total steps</p>
      </div>
      <div className="weekly-summary__item">
        <p className="weekly-summary__value">{formatNumber(average)}</p>
        <p className="weekly-summary__label">Daily average</p>
      </div>
      <div className="weekly-summary__item">
        <p className="weekly-summary__value">
          {achieved}<span className="weekly-summary__of"> / {history.length}</span>
        </p>
        <p className="weekly-summary__label">Goals met</p>
      </div>
    </section>
  )
}

export default WeeklySummary
