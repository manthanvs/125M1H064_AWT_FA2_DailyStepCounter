/**
 * sampleData.js - static configuration for the interface.
 *
 * In Phase I this file also held the activity records themselves. In Phase II
 * those come from the REST API instead, and the weekly history is derived from
 * them by buildWeeklyHistory(), so only the two presentation-level lists below
 * remain. Both describe how the interface is laid out rather than what the user
 * has done, which is why they are configuration and not data.
 */

/** Quick-add presets shown as buttons on the dashboard. */
export const QUICK_ADD_OPTIONS = [
  { id: 'q1', amount: 100, label: 'Short walk' },
  { id: 'q2', amount: 250, label: 'Around the block' },
  { id: 'q3', amount: 500, label: 'To the shop' },
  { id: 'q4', amount: 1000, label: 'Long walk' }
]

/** Definitions used to render the derived statistic cards. */
export const STAT_DEFINITIONS = [
  { id: 's1', key: 'distance', label: 'Distance', unit: 'km', icon: 'map' },
  { id: 's2', key: 'calories', label: 'Calories', unit: 'kcal', icon: 'flame' },
  { id: 's3', key: 'activeMinutes', label: 'Active time', unit: 'min', icon: 'clock' },
  { id: 's4', key: 'remaining', label: 'To go', unit: 'steps', icon: 'target' }
]
