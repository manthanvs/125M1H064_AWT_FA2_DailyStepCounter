// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import useDebounce from '../hooks/useDebounce.js'
import useLocalStorage from '../hooks/useLocalStorage.js'

/**
 * Tests for the custom hooks.
 *
 * renderHook lets a hook be exercised on its own, without inventing a component
 * whose only purpose is to host it. Fake timers make the debounce delay
 * instant and deterministic instead of making the test wait in real time.
 */

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebounce('first', 250))
    expect(result.current).toBe('first')
  })

  it('does not update until the delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: 'first' }
    })

    rerender({ value: 'second' })
    expect(result.current).toBe('first')          // still the old value

    act(() => { vi.advanceTimersByTime(249) })
    expect(result.current).toBe('first')          // one millisecond short

    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('second')         // now it lands
  })

  it('reports only the final value when the input changes rapidly', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: 'j' }
    })

    // Simulate somebody typing "jog" quickly.
    rerender({ value: 'jo' })
    act(() => { vi.advanceTimersByTime(100) })
    rerender({ value: 'jog' })
    act(() => { vi.advanceTimersByTime(100) })

    expect(result.current).toBe('j')              // nothing settled yet

    act(() => { vi.advanceTimersByTime(250) })
    expect(result.current).toBe('jog')            // only the last value arrives
  })
})

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear())

  it('falls back to the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test.key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('reads an existing value out of storage', () => {
    window.localStorage.setItem('test.key', JSON.stringify({ goal: 12000 }))
    const { result } = renderHook(() => useLocalStorage('test.key', null))
    expect(result.current[0]).toEqual({ goal: 12000 })
  })

  it('writes the value through to storage when it changes', () => {
    const { result } = renderHook(() => useLocalStorage('test.key', 0))

    act(() => { result.current[1](42) })

    expect(result.current[0]).toBe(42)
    expect(JSON.parse(window.localStorage.getItem('test.key'))).toBe(42)
  })

  it('clears the stored value and returns to the initial one', () => {
    const { result } = renderHook(() => useLocalStorage('test.key', 'start'))

    act(() => { result.current[1]('changed') })
    act(() => { result.current[2]() })            // the remove function

    expect(result.current[0]).toBe('start')
  })

  it('survives corrupted JSON in storage rather than throwing', () => {
    window.localStorage.setItem('test.key', '{ not valid json')
    const { result } = renderHook(() => useLocalStorage('test.key', 'safe default'))
    expect(result.current[0]).toBe('safe default')
  })
})
