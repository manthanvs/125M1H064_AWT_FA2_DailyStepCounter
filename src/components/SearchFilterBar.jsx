import { useRef, useEffect } from 'react'
import { SORT_OPTIONS, hasActiveFilters } from '../utils/activityFilters.js'

/**
 * SearchFilterBar - the search, filter and sort controls on the History page.
 *
 * The component is fully controlled: it holds no state of its own and reports
 * every change up through onChange. That keeps the criteria in one place on
 * the page, which is also where the filtering happens.
 *
 * useRef is used to move focus into the search box when the page opens, so a
 * user who came here to look something up can start typing immediately.
 *
 * Demonstrates: useRef, useEffect, controlled inputs, event handling.
 */

function SearchFilterBar({ criteria, types = [], onChange, onClear, resultCount = 0, totalCount = 0 }) {
  const searchRef = useRef(null)

  // Focus the search field once, when the bar first appears.
  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  /** One handler for every field, keyed by the input's name attribute. */
  const handleChange = (event) => {
    const { name, value } = event.target
    onChange({ ...criteria, [name]: value })
  }

  const filtersActive = hasActiveFilters(criteria)

  return (
    <section className="card filter-bar" aria-label="Search and filter activities">
      <div className="filter-bar__row">
        <label className="field field--grow">
          <span className="field__label">Search</span>
          <input
            ref={searchRef}
            className="input"
            type="search"
            name="search"
            value={criteria.search}
            onChange={handleChange}
            placeholder="Search by name, type or note"
          />
        </label>

        <label className="field">
          <span className="field__label">Type</span>
          <select className="input" name="type" value={criteria.type} onChange={handleChange}>
            <option value="All">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Sort by</span>
          <select className="input" name="sortBy" value={criteria.sortBy} onChange={handleChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-bar__row">
        <label className="field">
          <span className="field__label">From</span>
          <input className="input" type="date" name="from" value={criteria.from} onChange={handleChange} />
        </label>

        <label className="field">
          <span className="field__label">To</span>
          <input className="input" type="date" name="to" value={criteria.to} onChange={handleChange} />
        </label>

        <div className="filter-bar__meta">
          <p className="muted">
            Showing <strong>{resultCount}</strong> of {totalCount} activities
          </p>
          {/* The clear button only appears when there is something to clear. */}
          {filtersActive && (
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default SearchFilterBar
