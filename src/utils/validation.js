/**
 * validation.js - form validation rules for the activity form.
 *
 * These are pure functions with no React and no DOM. The form component decides
 * when to validate and how to display the result; this module only decides what
 * counts as valid. Keeping the two apart means the rules can be unit-tested
 * directly, and the same rules could be reused by a different form later.
 */

import { todayIso } from './dates.js'

/** The activity types the form will accept. */
export const ACTIVITY_TYPES = ['Walk', 'Jog', 'Run', 'Commute', 'Hike']

export const MAX_STEPS_PER_ENTRY = 100000
export const MAX_LABEL_LENGTH = 60
export const MAX_NOTE_LENGTH = 200

/** Today as an ISO date string, used as the upper bound for the date field. */
export { todayIso }

/**
 * Validate a single field.
 * @returns {string} an error message, or an empty string when the field is valid
 */
export function validateField(name, value, allValues = {}) {
  switch (name) {
    case 'label': {
      const label = String(value ?? '').trim()
      if (!label) return 'Please give this activity a name.'
      if (label.length < 3) return 'The name needs at least 3 characters.'
      if (label.length > MAX_LABEL_LENGTH) return `The name cannot exceed ${MAX_LABEL_LENGTH} characters.`
      return ''
    }

    case 'steps': {
      const raw = String(value ?? '').trim()
      if (!raw) return 'Please enter the number of steps.'
      const steps = Number(raw)
      if (!Number.isFinite(steps)) return 'Steps must be a number.'
      if (!Number.isInteger(steps)) return 'Steps must be a whole number.'
      if (steps <= 0) return 'Steps must be greater than zero.'
      if (steps > MAX_STEPS_PER_ENTRY) {
        return `That looks too high - the limit is ${MAX_STEPS_PER_ENTRY.toLocaleString('en-IN')} steps per entry.`
      }
      return ''
    }

    case 'date': {
      const date = String(value ?? '').trim()
      if (!date) return 'Please choose a date.'
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Use the date format YYYY-MM-DD.'
      if (Number.isNaN(new Date(date).getTime())) return 'That is not a real date.'
      if (date > todayIso()) return 'The date cannot be in the future.'
      return ''
    }

    case 'time': {
      const time = String(value ?? '').trim()
      if (!time) return 'Please choose a time.'
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return 'Use the 24-hour time format HH:MM.'
      return ''
    }

    case 'type': {
      if (!value) return 'Please choose an activity type.'
      if (!ACTIVITY_TYPES.includes(value)) return 'Choose one of the listed activity types.'
      return ''
    }

    case 'note': {
      const note = String(value ?? '')
      if (note.length > MAX_NOTE_LENGTH) {
        return `Notes cannot exceed ${MAX_NOTE_LENGTH} characters (currently ${note.length}).`
      }
      return ''
    }

    default:
      return ''
  }
}

/**
 * Validate a whole form.
 * @returns {{errors: Object, isValid: boolean}}
 */
export function validateActivity(values) {
  const fields = ['label', 'steps', 'date', 'time', 'type', 'note']
  const errors = {}

  for (const field of fields) {
    const message = validateField(field, values[field], values)
    if (message) errors[field] = message
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}

/** The blank form used when adding a new activity. */
export const emptyActivity = () => ({
  label: '',
  steps: '',
  date: todayIso(),
  time: '09:00',
  type: 'Walk',
  note: ''
})

/**
 * Convert validated form values into the shape the API stores.
 * Steps arrive from the form as a string and must be persisted as a number.
 */
export const toApiActivity = (values) => ({
  label: values.label.trim(),
  steps: Number(values.steps),
  date: values.date,
  time: values.time,
  type: values.type,
  note: values.note.trim()
})
