/**
 * dates.js - local-time date helpers.
 *
 * Why this module exists
 * ----------------------
 * `new Date().toISOString().slice(0, 10)` looks like a harmless way to get
 * "today" as YYYY-MM-DD, but toISOString converts to UTC first. In India
 * (UTC+5:30) local midnight on 28 August is 27 August 18:30 UTC, so that
 * expression returns the *previous* day for every moment between 00:00 and
 * 05:30 local time - and for a Date built from a local midnight, it is wrong
 * around the clock.
 *
 * Activity dates in this application are plain calendar days in the user's own
 * timezone, never instants, so they must be formatted from the local date
 * parts. Every date string in the app goes through the helpers below.
 */

/**
 * Format a Date as YYYY-MM-DD using its local calendar date.
 * @param {Date} date - the date to format
 * @returns {string} the ISO calendar date, in local time
 */
export const toLocalIso = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today's calendar date in the user's timezone, as YYYY-MM-DD. */
export const todayIso = () => toLocalIso(new Date())

/**
 * Parse a YYYY-MM-DD string into a Date at local midnight.
 * Appending the time is what stops the browser treating a bare date string as
 * UTC, which would reintroduce exactly the shift this module exists to avoid.
 * @param {string} isoDate - date in "YYYY-MM-DD" format
 * @returns {Date} local midnight on that calendar day
 */
export const fromLocalIso = (isoDate) => new Date(`${isoDate}T00:00:00`)

/**
 * Move a calendar date by a number of days, staying in local time.
 * @param {string} isoDate - starting date in "YYYY-MM-DD" format
 * @param {number} days - days to add; negative moves backwards
 * @returns {string} the shifted date in "YYYY-MM-DD" format
 */
export const addDays = (isoDate, days) => {
  const date = fromLocalIso(isoDate)
  date.setDate(date.getDate() + days)
  return toLocalIso(date)
}
