import Icon from './Icon.jsx'

/**
 * AchievementBanner - congratulates the user once the daily goal is met.
 *
 * This component is the clearest example of conditional rendering in the
 * project. When the goal has not been reached the component returns null,
 * which tells React to render nothing at all for this position in the tree.
 *
 * Demonstrates: conditional rendering (early return of null), props.
 */

function AchievementBanner({ goalReached = false, steps = 0, goal = 10000 }) {
  // Nothing to celebrate yet - render nothing.
  if (!goalReached) return null

  const extraSteps = steps - goal

  return (
    <div className="banner banner--success" role="status">
      <span className="banner__icon">
        <Icon name="trophy" size={22} />
      </span>
      <div className="banner__body">
        <p className="banner__title">Daily goal achieved!</p>
        <p className="banner__text">
          {/* A nested conditional chooses between two different messages. */}
          {extraSteps > 0
            ? `You have walked ${extraSteps.toLocaleString('en-IN')} steps beyond your goal of ${goal.toLocaleString('en-IN')}.`
            : `You have reached your goal of ${goal.toLocaleString('en-IN')} steps exactly. Well done.`}
        </p>
      </div>
    </div>
  )
}

export default AchievementBanner
