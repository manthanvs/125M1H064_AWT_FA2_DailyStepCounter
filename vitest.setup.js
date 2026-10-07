/**
 * Vitest setup - runs once before the test files.
 *
 * jest-dom adds readable DOM matchers such as toBeInTheDocument() and
 * toBeDisabled(), which make the assertions describe intent rather than
 * internal structure.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount anything rendered by a test so that state cannot leak into the next.
afterEach(() => {
  cleanup()
})
