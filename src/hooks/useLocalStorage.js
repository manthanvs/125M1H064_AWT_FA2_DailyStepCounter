import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage - state that survives a page refresh.
 *
 * Behaves exactly like useState, but the value is mirrored into localStorage
 * and read back from it on the first render. Every access is wrapped in
 * try/catch because private browsing modes and disabled site data both make
 * localStorage throw rather than return null.
 *
 * @param {string} key - the storage key
 * @param {*} initialValue - used when nothing is stored yet
 * @returns {[*, Function, Function]} value, setter, and a remove function
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  // Write through to storage whenever the value or the key changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable - the value still works for this session.
    }
  }, [key, value])

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Nothing to do.
    }
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, remove]
}

export default useLocalStorage
