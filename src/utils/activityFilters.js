import { toLocalIso, todayIso, fromLocalIso } from './dates.js'

/**
 * activityFilters.js - searching, filtering, sorting and date grouping.
 *
 * All pure functions. The History page holds the criteria in state and calls
 * `applyFilters` inside a useMemo; this module never touches React, so each
 * rule below can be unit-tested on its own with plain arrays.
 */

/** The criteria object the History page starts from. */
export const emptyCriteria = () => ({
  search: '',
  type: 'All',
  from: '',
  to: '',
  sortBy: 'date-desc'
})

export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'steps-desc', label: 'Most steps' },
  { value: 'steps-asc', label: 'Fewest steps' },
  { value: 'label-asc', label: 'Name A to Z' }
]

/**
 * Case-insensitive search across the activity name, type and note.
 * An empty search term matches everything.
 */
export function searchActivities(activities = [], term = '') {
  const needle = term.trim().toLowerCase()
  if (!needle) return activities

  return activities.filter((activity) => {
    const haystack = `${activity.label} ${activity.type} ${activity.note ?? ''}`.toLowerCase()
    return haystack.includes(needle)
  })
}

/** Keep only activities of one type. The pseudo-type "All" keeps everything. */
export function filterByType(activities = [], type = 'All') {
  if (!type || type === 'All') return activities
  return activities.filter((activity) => activity.type === type)
}

/**
 * Keep activities inside an inclusive date range.
 * Either bound may be omitted, which leaves that side open.
 * ISO dates compare correctly as strings, so no Date objects are needed.
 */
export function filterByDateRange(activities = [], from = '', to = '') {
  return activities.filter((activity) => {
    if (from && activity.date < from) return false
    if (to && activity.date > to) return false
    return true
  })
}

/** Return a new sorted array; the input array is never modified. */
export function sortActivities(activities = [], sortBy = 'date-desc') {
  const sorted = [...activities]

  const byDateTime = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)

  switch (sortBy) {
    case 'date-asc':
      return sorted.sort(byDateTime)
    case 'steps-desc':
      return sorted.sort((a, b) => b.steps - a.steps)
    case 'steps-asc':
      return sorted.sort((a, b) => a.steps - b.steps)
    case 'label-asc':
      return sorted.sort((a, b) => a.label.localeCompare(b.label))
    case 'date-desc':
    default:
      return sorted.sort((a, b) => byDateTime(b, a))
  }
}

/**
 * Apply search, type filter, date range and sort in one call.
 * The order matters: narrowing before sorting means less work for the sort.
 */
export function applyFilters(activities = [], criteria = emptyCriteria()) {
  const { search, type, from, to, sortBy } = { ...emptyCriteria(), ...criteria }

  let result = searchActivities(activities, search)
  result = filterByType(result, type)
  result = filterByDateRange(result, from, to)
  return sortActivities(result, sortBy)
}

/** True when any criterion would narrow the list. Drives the "Clear" button. */
export function hasActiveFilters(criteria = {}) {
  const { search, type, from, to } = { ...emptyCriteria(), ...criteria }
  return Boolean(search.trim()) || (type && type !== 'All') || Boolean(from) || Boolean(to)
}

// ---------------------------------------------------------------------------
// Grouping - used to build daily totals from individual activity records
// ---------------------------------------------------------------------------

/**
 * Total the steps for each date.
 * @returns {Object<string, number>} an ISO date to step-total lookup
 */
export function totalsByDate(activities = []) {
  return activities.reduce((totals, activity) => {
    totals[activity.date] = (totals[activity.date] ?? 0) + activity.steps
    return totals
  }, {})
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Build the seven-day history the dashboard chart expects, ending on `endDate`.
 * Days with no recorded activity are included with a total of zero, so the
 * chart always shows a full week rather than a ragged one.
 *
 * @param {Array} activities - every activity record
 * @param {string} endDate - ISO date of the last day in the window
 * @returns {Array<{id:string, day:string, date:string, steps:number}>}
 */
export function buildWeeklyHistory(activities = [], endDate = todayIso()) {
  const totals = totalsByDate(activities)
  const end = fromLocalIso(endDate)
  const week = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(end)
    day.setDate(end.getDate() - offset)
    // Local formatting, not toISOString - see utils/dates.js for why.
    const iso = toLocalIso(day)
    week.push({
      id: iso,
      day: DAY_LABELS[day.getDay()],
      date: iso,
      steps: totals[iso] ?? 0
    })
  }

  return week
}

/** Every activity recorded on one particular date. */
export function activitiesForDate(activities = [], date) {
  return activities.filter((activity) => activity.date === date)
}

/** The distinct activity types present in the data, for the filter dropdown. */
export function availableTypes(activities = []) {
  return [...new Set(activities.map((activity) => activity.type))].sort()
}
