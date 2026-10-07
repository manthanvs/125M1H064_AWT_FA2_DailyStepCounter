import StatCard from './StatCard.jsx'
import { formatNumber } from '../utils/metrics.js'

/**
 * StatsGrid - renders the row of derived statistic tiles.
 *
 * Rather than writing four <StatCard> elements by hand, the grid maps over a
 * definitions array and reads the matching value out of the summary object.
 * Adding a fifth statistic later means adding one entry to the data file - no
 * change to this component at all.
 *
 * Demonstrates: lists and keys, passing props through, computed values.
 */

function StatsGrid({ definitions = [], summary = {} }) {
  // Conditional rendering: cover the case where no definitions were passed.
  if (definitions.length === 0) {
    return <p className="muted">No statistics to display.</p>
  }

  return (
    <section className="stats-grid" aria-label="Today's statistics">
      {definitions.map((definition) => {
        const rawValue = summary[definition.key] ?? 0
        // Large step counts read better with thousands separators.
        const displayValue =
          definition.key === 'remaining' ? formatNumber(rawValue) : rawValue

        return (
          <StatCard
            key={definition.id}
            label={definition.label}
            value={displayValue}
            unit={definition.unit}
            icon={definition.icon}
            highlight={definition.key === 'remaining' && rawValue === 0}
          />
        )
      })}
    </section>
  )
}

export default StatsGrid
