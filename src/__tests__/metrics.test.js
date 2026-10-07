import { describe, it, expect } from 'vitest'

import {
  calculateDistance,
  calculateCalories,
  calculateActiveMinutes,
  calculateProgress,
  stepsRemaining,
  buildDailySummary,
  weeklyTotal,
  weeklyAverage,
  weeklyBest,
  goalsAchievedCount,
  formatNumber,
  formatTime,
  formatDate,
  motivationMessage
} from '../utils/metrics.js'

/**
 * Unit tests for the calculation module.
 *
 * These need no DOM and no React, because metrics.js deliberately imports
 * neither. That separation is what makes the arithmetic behind every number on
 * screen testable directly, including the edge cases a user would struggle to
 * reproduce by clicking.
 */

describe('calculateDistance', () => {
  it('converts steps to kilometres using the average stride length', () => {
    expect(calculateDistance(10000)).toBe(7.62)
    expect(calculateDistance(8450)).toBe(6.44)
  })

  it('returns zero for no steps', () => {
    expect(calculateDistance(0)).toBe(0)
  })

  it('defaults to zero when called with no argument', () => {
    expect(calculateDistance()).toBe(0)
  })
})

describe('calculateCalories', () => {
  it('rounds to the nearest whole calorie', () => {
    expect(calculateCalories(10000)).toBe(400)
    expect(calculateCalories(8450)).toBe(338)
  })

  it('returns zero for no steps', () => {
    expect(calculateCalories(0)).toBe(0)
  })
})

describe('calculateActiveMinutes', () => {
  it('converts steps into minutes at the assumed walking rate', () => {
    expect(calculateActiveMinutes(10000)).toBe(100)
    expect(calculateActiveMinutes(450)).toBe(5)
  })
})

describe('calculateProgress', () => {
  it('returns the percentage of the goal completed', () => {
    expect(calculateProgress(5000, 10000)).toBe(50)
    expect(calculateProgress(8450, 10000)).toBe(85)
  })

  it('caps at 100 so the progress ring can never overflow', () => {
    expect(calculateProgress(25000, 10000)).toBe(100)
  })

  it('returns zero rather than dividing by zero when the goal is zero', () => {
    expect(calculateProgress(5000, 0)).toBe(0)
  })

  it('treats a negative goal as no goal', () => {
    expect(calculateProgress(5000, -100)).toBe(0)
  })
})

describe('stepsRemaining', () => {
  it('reports how many steps are still needed', () => {
    expect(stepsRemaining(6000, 10000)).toBe(4000)
  })

  it('never goes negative once the goal is passed', () => {
    expect(stepsRemaining(12000, 10000)).toBe(0)
  })
})

describe('buildDailySummary', () => {
  it('bundles every derived figure for a step count', () => {
    expect(buildDailySummary(8450, 10000)).toEqual({
      steps: 8450,
      goal: 10000,
      distance: 6.44,
      calories: 338,
      activeMinutes: 85,
      progress: 85,
      remaining: 1550,
      goalReached: false
    })
  })

  it('marks the goal as reached when the steps match it exactly', () => {
    expect(buildDailySummary(10000, 10000).goalReached).toBe(true)
  })

  it('marks the goal as reached when the steps exceed it', () => {
    const summary = buildDailySummary(11000, 10000)
    expect(summary.goalReached).toBe(true)
    expect(summary.remaining).toBe(0)
    expect(summary.progress).toBe(100)
  })
})

describe('weekly aggregates', () => {
  const week = [
    { steps: 7000 }, { steps: 12000 }, { steps: 5000 }, { steps: 11000 },
    { steps: 9000 }, { steps: 14000 }, { steps: 6000 }
  ]

  it('totals the week', () => {
    expect(weeklyTotal(week)).toBe(64000)
  })

  it('averages the week', () => {
    expect(weeklyAverage(week)).toBe(9143)
  })

  it('finds the best day', () => {
    expect(weeklyBest(week)).toBe(14000)
  })

  it('counts the days that met the goal', () => {
    expect(goalsAchievedCount(week, 10000)).toBe(3)
  })

  it('handles an empty week without dividing by zero', () => {
    expect(weeklyTotal([])).toBe(0)
    expect(weeklyAverage([])).toBe(0)
    expect(weeklyBest([])).toBe(0)
    expect(goalsAchievedCount([], 10000)).toBe(0)
  })
})

describe('formatting helpers', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(8450)).toBe('8,450')
  })

  it('converts 24-hour time into a 12-hour label', () => {
    expect(formatTime('18:45')).toBe('6:45 pm')
    expect(formatTime('09:05')).toBe('9:05 am')
  })

  it('renders midnight and midday correctly rather than as 0 or 12 twice', () => {
    expect(formatTime('00:30')).toBe('12:30 am')
    expect(formatTime('12:00')).toBe('12:00 pm')
  })

  it('formats an ISO date as a short label', () => {
    expect(formatDate('2026-08-28')).toBe('28 Aug')
  })

  it('returns the input unchanged when the date cannot be parsed', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

describe('motivationMessage', () => {
  it('changes with the progress band', () => {
    expect(motivationMessage(0)).toMatch(/No steps logged/i)
    expect(motivationMessage(10)).toMatch(/on the board/i)
    expect(motivationMessage(30)).toMatch(/Good start/i)
    expect(motivationMessage(60)).toMatch(/Halfway/i)
    expect(motivationMessage(80)).toMatch(/Almost there/i)
    expect(motivationMessage(100)).toMatch(/Goal complete/i)
  })
})
