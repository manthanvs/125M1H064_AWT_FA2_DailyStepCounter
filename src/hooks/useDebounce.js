import { useState, useEffect } from 'react'

/**
 * useDebounce - returns a value that only updates once the input has stopped
 * changing for `delay` milliseconds.
 *
 * The search box on the History page updates its own state on every keystroke
 * so typing stays responsive, but the debounced value is what actually drives
 * the filtering. Without this, a long list is re-filtered on every character.
 *
 * The cleanup function cancels the pending timer, which is what makes the
 * debounce work: each new keystroke throws away the previous timer.
 *
 * @param {*} value - the fast-changing value
 * @param {number} delay - milliseconds of quiet required before updating
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
