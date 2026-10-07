import { describe, it, expect } from 'vitest'

import {
  searchActivities,
  filterByType,
  filterByDateRange,
  sortActivities,
  applyFilters,
  hasActiveFilters,
  totalsByDate,
  buildWeeklyHistory,
  activitiesForDate,
  availableTypes,
  emptyCriteria
} from '../utils/activityFilters.js'

/**
 * Unit tests for searching, filtering, sorting and grouping.
 *
 * A fixed sample is used so every assertion has an exact expected answer.
 */

const sample = [
  { id: '1', label: 'Morning walk',    steps: 3200, date: '2026-08-26', time: '07:15', type: 'Walk',    note: 'Cool morning.' },
  { id: '2', label: 'Walk to college', steps: 1850, date: '2026-08-26', time: '09:40', type: 'Commute', note: '' },
  { id: '3', label: 'Evening jog',     steps: 2300, date: '2026-08-27', time: '18:45', type: 'Jog',     note: 'Riverside route.' },
  { id: '4', label: 'Hill trail',      steps: 5400, date: '2026-08-28', time: '06:00', type: 'Hike',    note: '' },
  { id: '5', label: 'Lunch stroll',    steps: 900,  date: '2026-08-28', time: '13:20', type: 'Walk',    note: 'Short one.' }
]

describe('searchActivities', () => {
  it('returns everything for an empty term', () => {
    expect(searchActivities(sample, '')).toHaveLength(5)
  })

  it('matches the activity name regardless of case', () => {
    const result = searchActivities(sample, 'MORNING')
    expect(result.map((a) => a.id)).toEqual(['1'])
  })

  it('matches on the activity type as well as the name', () => {
    expect(searchActivities(sample, 'commute').map((a) => a.id)).toEqual(['2'])
  })

  it('matches inside the note', () => {
    expect(searchActivities(sample, 'riverside').map((a) => a.id)).toEqual(['3'])
  })

  it('ignores surrounding whitespace in the term', () => {
    expect(searchActivities(sample, '  jog  ')).toHaveLength(1)
  })

  it('returns nothing when there is no match', () => {
    expect(searchActivities(sample, 'swimming')).toHaveLength(0)
  })
})

describe('filterByType', () => {
  it('keeps everything for the All pseudo-type', () => {
    expect(filterByType(sample, 'All')).toHaveLength(5)
  })

  it('keeps only the requested type', () => {
    expect(filterByType(sample, 'Walk').map((a) => a.id)).toEqual(['1', '5'])
  })
})

describe('filterByDateRange', () => {
  it('keeps everything when both bounds are empty', () => {
    expect(filterByDateRange(sample, '', '')).toHaveLength(5)
  })

  it('applies a lower bound inclusively', () => {
    expect(filterByDateRange(sample, '2026-08-27', '').map((a) => a.id)).toEqual(['3', '4', '5'])
  })

  it('applies an upper bound inclusively', () => {
    expect(filterByDateRange(sample, '', '2026-08-26').map((a) => a.id)).toEqual(['1', '2'])
  })

  it('applies both bounds together', () => {
    expect(filterByDateRange(sample, '2026-08-27', '2026-08-27').map((a) => a.id)).toEqual(['3'])
  })
})

describe('sortActivities', () => {
  it('sorts newest first by default, using the time to break ties within a day', () => {
    // Ids 1 and 2 share 26 Aug, so 09:40 must come before 07:15.
    expect(sortActivities(sample, 'date-desc').map((a) => a.id)).toEqual(['5', '4', '3', '2', '1'])
  })

  it('sorts oldest first', () => {
    expect(sortActivities(sample, 'date-asc').map((a) => a.id)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('sorts by most steps', () => {
    expect(sortActivities(sample, 'steps-desc')[0].id).toBe('4')
  })

  it('sorts by fewest steps', () => {
    expect(sortActivities(sample, 'steps-asc')[0].id).toBe('5')
  })

  it('sorts by name', () => {
    expect(sortActivities(sample, 'label-asc')[0].label).toBe('Evening jog')
  })

  it('does not modify the array it was given', () => {
    const original = [...sample]
    sortActivities(sample, 'steps-desc')
    expect(sample).toEqual(original)
  })
})

describe('applyFilters', () => {
  it('returns everything under the default criteria', () => {
    expect(applyFilters(sample, emptyCriteria())).toHaveLength(5)
  })

  it('combines a search, a type filter and a sort', () => {
    const result = applyFilters(sample, {
      ...emptyCriteria(), search: 'walk', type: 'Walk', sortBy: 'steps-desc'
    })
    expect(result.map((a) => a.id)).toEqual(['1', '5'])
  })

  it('combines a date range with a type filter', () => {
    const result = applyFilters(sample, {
      ...emptyCriteria(), type: 'Walk', from: '2026-08-28'
    })
    expect(result.map((a) => a.id)).toEqual(['5'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(applyFilters(sample, { ...emptyCriteria(), search: 'nothing here' })).toEqual([])
  })
})

describe('hasActiveFilters', () => {
  it('is false for the default criteria', () => {
    expect(hasActiveFilters(emptyCriteria())).toBe(false)
  })

  it('is true once a search term is entered', () => {
    expect(hasActiveFilters({ ...emptyCriteria(), search: 'walk' })).toBe(true)
  })

  it('is true once a type is chosen', () => {
    expect(hasActiveFilters({ ...emptyCriteria(), type: 'Jog' })).toBe(true)
  })

  it('ignores the sort order, which does not narrow anything', () => {
    expect(hasActiveFilters({ ...emptyCriteria(), sortBy: 'steps-desc' })).toBe(false)
  })
})

describe('totalsByDate and grouping', () => {
  it('totals the steps for each date', () => {
    expect(totalsByDate(sample)).toEqual({
      '2026-08-26': 5050,
      '2026-08-27': 2300,
      '2026-08-28': 6300
    })
  })

  it('returns the activities for one date', () => {
    expect(activitiesForDate(sample, '2026-08-28').map((a) => a.id)).toEqual(['4', '5'])
  })

  it('lists the distinct types in alphabetical order', () => {
    expect(availableTypes(sample)).toEqual(['Commute', 'Hike', 'Jog', 'Walk'])
  })
})

describe('buildWeeklyHistory', () => {
  const week = buildWeeklyHistory(sample, '2026-08-28')

  it('always returns exactly seven days', () => {
    expect(week).toHaveLength(7)
  })

  it('ends on the requested date', () => {
    expect(week[6].date).toBe('2026-08-28')
  })

  it('starts six days earlier', () => {
    expect(week[0].date).toBe('2026-08-22')
  })

  it('fills days with no recorded activity with zero rather than omitting them', () => {
    const empty = week.filter((day) => day.steps === 0)
    expect(empty.length).toBe(4)
  })

  it('carries the correct totals through for days that do have activity', () => {
    expect(week.find((d) => d.date === '2026-08-28').steps).toBe(6300)
    expect(week.find((d) => d.date === '2026-08-26').steps).toBe(5050)
  })

  it('labels each day with its weekday name', () => {
    expect(week[6].day).toBe('Fri')
  })
})
