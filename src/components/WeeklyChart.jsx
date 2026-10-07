import { formatNumber, weeklyBest, weeklyAverage } from '../utils/metrics.js'

/**
 * WeeklyChart - a lightweight bar chart of the last seven days.
 *
 * The chart is built from plain <div> elements whose height is set as a
 * percentage of the best day in the week. No charting library is required,
 * which keeps the bundle small and the logic easy to follow.
 *
 * Demonstrates: lists and keys, conditional rendering (empty state and the
 * "goal met" styling on individual bars), derived values from props.
 */

function WeeklyChart({ history = [], goal = 10000 }) {
  // Empty state - render a friendly message instead of a broken chart.
  if (history.length === 0) {
    return (
      <section className="card">
        <h2 className="card__title">This week</h2>
        <p className="muted">No history recorded yet. Your daily totals will appear here.</p>
      </section>
    )
  }

  const best = weeklyBest(history)
  const average = weeklyAverage(history)

  return (
    <section className="card weekly-chart" aria-label="Steps over the last seven days">
      <div className="card__header">
        <h2 className="card__title">This week</h2>
        <p className="card__meta">Average {formatNumber(average)} steps/day</p>
      </div>

      <div className="weekly-chart__plot">
        {history.map((day) => {
          // Scale each bar against the best day so the tallest bar fills the plot.
          const heightPercent = best > 0 ? Math.round((day.steps / best) * 100) : 0
          const metGoal = day.steps >= goal

          return (
            <div className="weekly-chart__column" key={day.id}>
              <div className="weekly-chart__bar-track">
                <div
                  className={metGoal ? 'weekly-chart__bar weekly-chart__bar--met' : 'weekly-chart__bar'}
                  style={{ height: `${heightPercent}%` }}
                  title={`${day.day}: ${formatNumber(day.steps)} steps`}
                />
              </div>
              <p className="weekly-chart__value">{Math.round(day.steps / 1000)}k</p>
              <p className="weekly-chart__day">{day.day}</p>
            </div>
          )
        })}
      </div>

      <p className="weekly-chart__legend">
        <span className="legend-swatch legend-swatch--met" /> Goal met
        <span className="legend-swatch legend-swatch--miss" /> Below goal
      </p>
    </section>
  )
}

export default WeeklyChart
