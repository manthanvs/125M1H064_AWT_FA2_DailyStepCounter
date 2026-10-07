import { describe, it, expect } from 'vitest'

import {
  validateField,
  validateActivity,
  emptyActivity,
  toApiActivity,
  todayIso,
  MAX_NOTE_LENGTH
} from '../utils/validation.js'

/**
 * Unit tests for the activity form validation rules.
 *
 * The rules are tested directly rather than by typing into a rendered form.
 * That keeps each case fast and unambiguous: when one of these fails, the rule
 * is wrong, not the markup.
 */

const validValues = {
  label: 'Morning walk',
  steps: '2400',
  date: '2026-08-20',
  time: '07:30',
  type: 'Walk',
  note: 'Felt good.'
}

describe('validateField - label', () => {
  it('rejects an empty name', () => {
    expect(validateField('label', '')).toMatch(/give this activity a name/i)
  })

  it('rejects a name made only of spaces', () => {
    expect(validateField('label', '    ')).toMatch(/give this activity a name/i)
  })

  it('rejects a name shorter than three characters', () => {
    expect(validateField('label', 'ab')).toMatch(/at least 3 characters/i)
  })

  it('rejects a name longer than the limit', () => {
    expect(validateField('label', 'a'.repeat(61))).toMatch(/cannot exceed/i)
  })

  it('accepts a reasonable name', () => {
    expect(validateField('label', 'Morning walk')).toBe('')
  })
})

describe('validateField - steps', () => {
  it('rejects an empty value', () => {
    expect(validateField('steps', '')).toMatch(/enter the number of steps/i)
  })

  it('rejects zero', () => {
    expect(validateField('steps', '0')).toMatch(/greater than zero/i)
  })

  it('rejects a negative number', () => {
    expect(validateField('steps', '-50')).toMatch(/greater than zero/i)
  })

  it('rejects a fractional number of steps', () => {
    expect(validateField('steps', '12.5')).toMatch(/whole number/i)
  })

  it('rejects text', () => {
    expect(validateField('steps', 'abc')).toMatch(/must be a number/i)
  })

  it('rejects an implausibly large entry', () => {
    expect(validateField('steps', '100001')).toMatch(/too high/i)
  })

  it('accepts the value exactly on the upper limit', () => {
    expect(validateField('steps', '100000')).toBe('')
  })

  it('accepts a normal entry', () => {
    expect(validateField('steps', '2400')).toBe('')
  })
})

describe('validateField - date', () => {
  it('rejects an empty date', () => {
    expect(validateField('date', '')).toMatch(/choose a date/i)
  })

  it('rejects a malformed date', () => {
    expect(validateField('date', '20-08-2026')).toMatch(/format YYYY-MM-DD/i)
  })

  it('rejects a date in the future', () => {
    expect(validateField('date', '2099-01-01')).toMatch(/cannot be in the future/i)
  })

  it('accepts today', () => {
    expect(validateField('date', todayIso())).toBe('')
  })
})

describe('validateField - time', () => {
  it('rejects an empty time', () => {
    expect(validateField('time', '')).toMatch(/choose a time/i)
  })

  it('rejects an invalid hour', () => {
    expect(validateField('time', '25:00')).toMatch(/24-hour time format/i)
  })

  it('accepts a valid 24-hour time', () => {
    expect(validateField('time', '18:45')).toBe('')
    expect(validateField('time', '00:00')).toBe('')
  })
})

describe('validateField - type and note', () => {
  it('rejects a type that is not on the list', () => {
    expect(validateField('type', 'Swimming')).toMatch(/listed activity types/i)
  })

  it('accepts a listed type', () => {
    expect(validateField('type', 'Jog')).toBe('')
  })

  it('accepts an empty note, because the note is optional', () => {
    expect(validateField('note', '')).toBe('')
  })

  it('rejects a note that is too long', () => {
    expect(validateField('note', 'x'.repeat(MAX_NOTE_LENGTH + 1))).toMatch(/cannot exceed/i)
  })
})

describe('validateActivity', () => {
  it('reports no errors for a complete, valid activity', () => {
    const { errors, isValid } = validateActivity(validValues)
    expect(isValid).toBe(true)
    expect(errors).toEqual({})
  })

  it('collects every problem at once rather than stopping at the first', () => {
    const { errors, isValid } = validateActivity({
      label: '', steps: '-1', date: '', time: 'nope', type: '', note: ''
    })
    expect(isValid).toBe(false)
    expect(Object.keys(errors).sort()).toEqual(['date', 'label', 'steps', 'time', 'type'])
  })

  it('treats the blank starting form as invalid', () => {
    expect(validateActivity(emptyActivity()).isValid).toBe(false)
  })
})

describe('toApiActivity', () => {
  it('converts the steps string into a number for storage', () => {
    const result = toApiActivity(validValues)
    expect(result.steps).toBe(2400)
    expect(typeof result.steps).toBe('number')
  })

  it('trims surrounding whitespace from text fields', () => {
    const result = toApiActivity({ ...validValues, label: '  Morning walk  ', note: '  Good.  ' })
    expect(result.label).toBe('Morning walk')
    expect(result.note).toBe('Good.')
  })
})
