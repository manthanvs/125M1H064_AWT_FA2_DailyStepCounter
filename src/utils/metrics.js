/**
 * metrics.js - Pure ES6+ helper functions for the Daily Step Counter Interface.
 *
 * Every function here is a pure function: same input always produces the same
 * output and nothing outside the function is modified. Keeping the calculation
 * logic separate from the React components makes the code easier to reason
 * about, easier to reuse, and easier to unit-test in Phase II.
 *
 * ES6+ features used: arrow functions, default parameters, destructuring,
 * template literals, spread operator, and array methods (map/filter/reduce).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Average stride length of an adult in metres. */
export const STRIDE_LENGTH_METRES = 0.762

/** Approximate calories burned per step for an average adult. */
export const CALORIES_PER_STEP = 0.04

/** Approximate number of steps an average walker covers in one minute. */
export const STEPS_PER_ACTIVE_MINUTE = 100

/** Goal presets offered to the user in the goal selector. */
export const GOAL_PRESETS = [4000, 6000, 8000, 10000, 12000]

// ---------------------------------------------------------------------------
// Derived metric calculations
// ---------------------------------------------------------------------------

/**
 * Convert a step count into distance covered in kilometres.
 * @param {number} steps - total number of steps
 * @returns {number} distance in kilometres, rounded to 2 decimal places
 */
export const calculateDistance = (steps = 0) => {
  const metres = steps * STRIDE_LENGTH_METRES
  return Number((metres / 1000).toFixed(2))
}

/**
 * Convert a step count into approximate calories burned.
 * @param {number} steps - total number of steps
 * @returns {number} calories burned, rounded to the nearest whole number
 */
export const calculateCalories = (steps = 0) => Math.round(steps * CALORIES_PER_STEP)

/**
 * Convert a step count into approximate active minutes.
 * @param {number} steps - total number of steps
 * @returns {number} active minutes, rounded to the nearest whole number
 */
export const calculateActiveMinutes = (steps = 0) =>
  Math.round(steps / STEPS_PER_ACTIVE_MINUTE)

/**
 * Work out how much of the daily goal has been completed.
 * The value is capped at 100 so the progress bar can never overflow visually,
 * even when the user walks past their goal.
 * @param {number} steps - steps walked so far
 * @param {number} goal - the daily step goal
 * @returns {number} completion percentage between 0 and 100
 */
export const calculateProgress = (steps = 0, goal = 10000) => {
  if (goal <= 0) return 0
  const percentage = (steps / goal) * 100
  return Math.min(Math.round(percentage), 100)
}

/**
 * Steps still required to reach the goal.
 * @param {number} steps - steps walked so far
 * @param {number} goal - the daily step goal
 * @returns {number} remaining steps, never negative
 */
export const stepsRemaining = (steps = 0, goal = 10000) => Math.max(goal - steps, 0)

/**
 * Build the complete set of derived statistics for a step count in one call.
 * Returning an object lets the caller destructure exactly what it needs.
 * @param {number} steps - steps walked so far
 * @param {number} goal - the daily step goal
 * @returns {{steps:number, goal:number, distance:number, calories:number,
 *            activeMinutes:number, progress:number, remaining:number,
 *            goalReached:boolean}}
 */
export const buildDailySummary = (steps = 0, goal = 10000) => ({
  steps,
  goal,
  distance: calculateDistance(steps),
  calories: calculateCalories(steps),
  activeMinutes: calculateActiveMinutes(steps),
  progress: calculateProgress(steps, goal),
  remaining: stepsRemaining(steps, goal),
  goalReached: steps >= goal
})

// ---------------------------------------------------------------------------
// Weekly aggregation
// ---------------------------------------------------------------------------

/**
 * Total the steps across a week of records.
 * @param {Array<{steps:number}>} week - array of daily records
 * @returns {number} total steps for the week
 */
export const weeklyTotal = (week = []) =>
  week.reduce((total, day) => total + day.steps, 0)

/**
 * Average steps per day across a week of records.
 * @param {Array<{steps:number}>} week - array of daily records
 * @returns {number} average steps per day, rounded to a whole number
 */
export const weeklyAverage = (week = []) => {
  if (week.length === 0) return 0
  return Math.round(weeklyTotal(week) / week.length)
}

/**
 * Find the highest step count in a week so the bar chart can be scaled.
 * The spread operator turns the array of numbers into Math.max arguments.
 * @param {Array<{steps:number}>} week - array of daily records
 * @returns {number} the best single-day step count
 */
export const weeklyBest = (week = []) => {
  if (week.length === 0) return 0
  return Math.max(...week.map((day) => day.steps))
}

/**
 * Count how many days in the week met or exceeded the goal.
 * @param {Array<{steps:number}>} week - array of daily records
 * @param {number} goal - the daily step goal
 * @returns {number} number of successful days
 */
export const goalsAchievedCount = (week = [], goal = 10000) =>
  week.filter((day) => day.steps >= goal).length

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format a number with thousands separators, e.g. 8450 becomes "8,450".
 * @param {number} value - the number to format
 * @returns {string} the formatted number
 */
export const formatNumber = (value = 0) => value.toLocaleString('en-IN')

/**
 * Produce a short, encouraging message based on how far along the user is.
 * The Daily Step Counter deliberately keeps the tone positive at every stage.
 * @param {number} progress - completion percentage between 0 and 100
 * @returns {string} a motivational message
 */
export const motivationMessage = (progress = 0) => {
  if (progress >= 100) return 'Goal complete. Outstanding effort today!'
  if (progress >= 75) return 'Almost there - a short walk will finish this off.'
  if (progress >= 50) return 'Halfway done. Keep the momentum going.'
  if (progress >= 25) return 'Good start. Every step is counting.'
  if (progress > 0) return 'You are on the board. Time for a quick stroll.'
  return 'No steps logged yet. Start with a short walk.'
}

/**
 * Convert a 24-hour time string into a friendly 12-hour label.
 * @param {string} time - time in "HH:MM" format
 * @returns {string} time in "h:MM am/pm" format
 */
export const formatTime = (time = '00:00') => {
  const [hourText, minuteText] = time.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteText} ${suffix}`
}

/**
 * Convert an ISO date into a short readable label, e.g. "28 Aug".
 * Added in Phase II, where activities span several days and the History list
 * has to say which day each entry belongs to.
 * @param {string} isoDate - date in "YYYY-MM-DD" format
 * @returns {string} the formatted date
 */
export const formatDate = (isoDate = '') => {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/**
 * Convert an ISO date into a full readable label, e.g. "Friday, 28 August".
 * @param {string} isoDate - date in "YYYY-MM-DD" format
 * @returns {string} the formatted date
 */
export const formatLongDate = (isoDate = '') => {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}
