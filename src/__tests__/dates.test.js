import { describe, it, expect } from 'vitest'

import { toLocalIso, todayIso, fromLocalIso, addDays } from '../utils/dates.js'

/**
 * Regression tests for the local-date helpers.
 *
 * These exist because of a real defect: the weekly chart originally formatted
 * dates with `toISOString().slice(0, 10)`, which converts to UTC first. In any
 * timezone ahead of UTC that returned the previous calendar day, so every bar
 * on the chart showed the wrong day's total and the goals-met count was wrong.
 * The tests below fail against that implementation and pass against this one,
 * in every timezone.
 */

describe('toLocalIso', () => {
  it('formats a date using its local calendar day', () => {
    // Local midnight. Under toISOString this is the previous day in IST.
    expect(toLocalIso(new Date(2026, 7, 28, 0, 0, 0))).toBe('2026-08-28')
  })

  it('still reports the same day just before local midnight', () => {
    expect(toLocalIso(new Date(2026, 7, 28, 23, 59, 59))).toBe('2026-08-28')
  })

  it('pads single-digit months and days to two characters', () => {
    expect(toLocalIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('does not disagree with the Date object it was given', () => {
    const date = new Date(2026, 7, 28)
    const [year, month, day] = toLocalIso(date).split('-').map(Number)
    expect(year).toBe(date.getFullYear())
    expect(month).toBe(date.getMonth() + 1)
    expect(day).toBe(date.getDate())
  })
})

describe('todayIso', () => {
  it('agrees with the local calendar date right now', () => {
    const now = new Date()
    expect(todayIso()).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    )
  })
})

describe('fromLocalIso', () => {
  it('parses to local midnight, not UTC midnight', () => {
    const date = fromLocalIso('2026-08-28')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7)
    expect(date.getDate()).toBe(28)
    expect(date.getHours()).toBe(0)
  })

  it('round-trips with toLocalIso', () => {
    expect(toLocalIso(fromLocalIso('2026-08-28'))).toBe('2026-08-28')
  })
})

describe('addDays', () => {
  it('moves forward', () => {
    expect(addDays('2026-08-28', 1)).toBe('2026-08-29')
  })

  it('moves backward', () => {
    expect(addDays('2026-08-28', -6)).toBe('2026-08-22')
  })

  it('crosses a month boundary', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
  })

  it('crosses a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})
