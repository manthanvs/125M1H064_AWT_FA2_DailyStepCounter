import { motivationMessage, formatNumber } from '../utils/metrics.js'

/**
 * GoalProgress - circular progress ring showing how much of the daily goal
 * has been completed.
 *
 * The ring is drawn with two overlapping SVG circles. The coloured circle uses
 * strokeDasharray / strokeDashoffset so that the visible arc length is
 * proportional to the completion percentage.
 *
 * Demonstrates: props, derived values, conditional rendering (the ring changes
 * colour and the caption changes text depending on progress).
 */

const RADIUS = 74
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function GoalProgress({ steps = 0, goal = 10000, progress = 0, goalReached = false }) {
  // How much of the circle should stay hidden.
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  // Conditional styling: the ring turns green once the goal is met.
  const ringClass = goalReached ? 'ring__value ring__value--complete' : 'ring__value'

  return (
    <section className="card goal-progress" aria-label="Daily goal progress">
      <div className="ring">
        <svg className="ring__svg" viewBox="0 0 180 180" role="img"
             aria-label={`${progress} percent of daily goal completed`}>
          {/* Track: the faint full circle behind the value. */}
          <circle className="ring__track" cx="90" cy="90" r={RADIUS} />
          {/* Value: the coloured arc, length driven by the progress prop. */}
          <circle
            className={ringClass}
            cx="90"
            cy="90"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <div className="ring__centre">
          <p className="ring__steps">{formatNumber(steps)}</p>
          <p className="ring__label">of {formatNumber(goal)} steps</p>
          <p className="ring__percent">{progress}%</p>
        </div>
      </div>

      <p className={goalReached ? 'goal-progress__message goal-progress__message--success' : 'goal-progress__message'}>
        {motivationMessage(progress)}
      </p>
    </section>
  )
}

export default GoalProgress
