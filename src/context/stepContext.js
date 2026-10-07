import { createContext, useContext } from 'react'

/**
 * stepContext.js - the context object and the hook used to read it.
 *
 * These live in their own module, separate from the provider component, for a
 * practical reason: React Fast Refresh can only hot-update a module when every
 * export is a component. A file that exports both <StepProvider> and a plain
 * hook forces a full page reload on every edit during development. Splitting
 * the two keeps hot reloading working.
 */

const StepContext = createContext(null)

/**
 * useSteps - read the shared activity data from any component.
 *
 * Throwing on a missing provider turns a confusing "cannot read property of
 * null" further down the tree into a message that says exactly what is wrong.
 */
export function useSteps() {
  const context = useContext(StepContext)
  if (context === null) {
    throw new Error('useSteps must be used inside a <StepProvider>.')
  }
  return context
}

export default StepContext
