import { formatNumber } from '../utils/metrics.js'

/**
 * GoalSelector - lets the user pick their daily step target.
 *
 * The currently selected preset is highlighted by comparing each preset value
 * against the goal prop. Because the goal lives in the parent, every other
 * component (ring, statistics, chart) updates the moment a new goal is chosen.
 *
 * Demonstrates: lists and keys, event handling, conditional class names,
 * single source of truth for shared state.
 */

function GoalSelector({ presets = [], goal = 10000, onChangeGoal }) {
  return (
    <section className="card goal-selector" aria-label="Daily goal">
      <div className="card__header">
        <h2 className="card__title">Daily goal</h2>
        <p className="card__meta">{formatNumber(goal)} steps</p>
      </div>

      <div className="goal-selector__options" role="group" aria-label="Choose a daily step goal">
        {presets.map((preset) => {
          const isSelected = preset === goal
          return (
            <button
              key={preset}
              type="button"
              className={isSelected ? 'chip chip--active' : 'chip'}
              onClick={() => onChangeGoal(preset)}
              aria-pressed={isSelected}
            >
              {formatNumber(preset)}
            </button>
          )
        })}
      </div>

      <p className="muted goal-selector__hint">
        A target between 6,000 and 10,000 steps suits most daily routines.
      </p>
    </section>
  )
}

export default GoalSelector
