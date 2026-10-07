import Icon from './Icon.jsx'

/**
 * QuickAddButtons - a row of preset buttons that add a fixed number of steps.
 *
 * The buttons are produced by mapping over the options array rather than being
 * typed out one by one. Each button gets a stable `key` taken from the data,
 * which is what allows React to update the list efficiently.
 *
 * Demonstrates: lists and keys, event handling, passing a callback down as a
 * prop (the parent decides what "add steps" actually means).
 */

function QuickAddButtons({ options = [], onAddSteps, disabled = false }) {
  // Guard clause: if there is nothing to show, show a hint instead of an empty row.
  if (options.length === 0) {
    return <p className="muted">No quick-add presets configured.</p>
  }

  return (
    <div className="quick-add">
      <p className="quick-add__label">Quick add</p>
      <div className="quick-add__row">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="btn btn--preset"
            onClick={() => onAddSteps(option.amount)}
            disabled={disabled}
            title={option.label}
          >
            <Icon name="plus" size={14} />
            <span className="btn__amount">{option.amount}</span>
            <span className="btn__caption">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickAddButtons
