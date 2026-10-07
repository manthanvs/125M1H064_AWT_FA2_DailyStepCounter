/**
 * api.js - the single place where the application talks to the outside world.
 *
 * Every request goes through `request()`, so timeouts, non-2xx responses and
 * network failures are all turned into one predictable ApiError type. Nothing
 * above this layer needs to know about fetch, status codes or JSON parsing.
 *
 * Offline fallback
 * ----------------
 * The REST API is JSON Server, started with `npm run api`. When it is not
 * running - which is always the case for a static deployment - the application
 * must still work rather than showing a dead screen. Each operation therefore
 * falls back to a localStorage-backed store with the same interface, and the
 * UI displays an "offline" notice so the user knows where their data is going.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const REQUEST_TIMEOUT_MS = 4000
const STORAGE_KEY = 'dsc.activities'
const SETTINGS_KEY = 'dsc.settings'

/** A single error type for every kind of API failure. */
export class ApiError extends Error {
  constructor(message, { status = 0, cause = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.cause = cause
    // A status of 0 means the request never reached the server.
    this.isNetworkError = status === 0
  }
}

/**
 * Perform one HTTP request against the API.
 * @throws {ApiError} on timeout, network failure or a non-2xx response
 */
async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options
    })

    if (!response.ok) {
      throw new ApiError(
        `The server responded with ${response.status} ${response.statusText}.`,
        { status: response.status }
      )
    }

    // 204 No Content has no body to parse.
    return response.status === 204 ? null : await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') {
      throw new ApiError('The server took too long to respond.', { cause: error })
    }
    throw new ApiError('Could not reach the server.', { cause: error })
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Offline store - same operations, backed by localStorage
// ---------------------------------------------------------------------------

const readLocal = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    // Private browsing and disabled storage both throw here.
    return fallback
  }
}

const writeLocal = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Nothing useful to do if storage is unavailable; the app still works
    // for the current session because state is held in memory.
  }
}

const localStore = {
  list: () => readLocal(STORAGE_KEY, []),
  create(activity) {
    const items = readLocal(STORAGE_KEY, [])
    const created = { ...activity, id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
    writeLocal(STORAGE_KEY, [...items, created])
    return created
  },
  update(id, activity) {
    const items = readLocal(STORAGE_KEY, [])
    const updated = { ...activity, id }
    writeLocal(STORAGE_KEY, items.map((item) => (item.id === id ? updated : item)))
    return updated
  },
  remove(id) {
    const items = readLocal(STORAGE_KEY, [])
    writeLocal(STORAGE_KEY, items.filter((item) => item.id !== id))
  },
  seed(activities) {
    if (readLocal(STORAGE_KEY, null) === null) writeLocal(STORAGE_KEY, activities)
  },
  settings: () => readLocal(SETTINGS_KEY, { id: 1, dailyGoal: 10000, userName: 'Manthan' }),
  saveSettings(settings) {
    writeLocal(SETTINGS_KEY, settings)
    return settings
  }
}

/**
 * Circuit breaker.
 *
 * Reaching a port with nothing listening is not instant: on Windows the
 * browser tries IPv6 and then IPv4, and a single refused connection was
 * measured at roughly 2.4 seconds. Paying that on every button press makes
 * offline mode feel broken.
 *
 * So the first network failure opens the circuit for a while. Calls made
 * during that window skip the request entirely and go straight to local
 * storage, which makes them instant. After the window expires the next call
 * tries the network again, so the application reconnects on its own once the
 * API is started.
 */
const CIRCUIT_OPEN_MS = 30000
let circuitOpenUntil = 0

const circuitIsOpen = () => Date.now() < circuitOpenUntil
const openCircuit = () => { circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS }
const closeCircuit = () => { circuitOpenUntil = 0 }

/** Force the next call to try the network again, whatever the breaker says. */
export const resetConnection = () => closeCircuit()

/**
 * Run an API call, falling back to the local store when the network fails.
 * Returns { data, offline } so callers can tell the user which one was used.
 * A genuine server error (404, 500) is NOT swallowed - only network failures
 * trigger the fallback, because a 500 means the server is there and unhappy.
 */
async function withFallback(apiCall, localCall) {
  // Known to be offline - do not pay the connection timeout again.
  if (circuitIsOpen()) {
    return { data: localCall(), offline: true }
  }

  try {
    const data = await apiCall()
    closeCircuit()
    return { data, offline: false }
  } catch (error) {
    if (error instanceof ApiError && error.isNetworkError) {
      openCircuit()
      return { data: localCall(), offline: true }
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Public API - CRUD operations on activities
// ---------------------------------------------------------------------------

export const activitiesApi = {
  /** GET /activities - read every activity record. */
  getAll: () => withFallback(
    () => request('/activities'),
    () => localStore.list()
  ),

  /** GET /activities/:id - read one record. */
  getById: (id) => withFallback(
    () => request(`/activities/${id}`),
    () => localStore.list().find((item) => item.id === id) ?? null
  ),

  /** POST /activities - create a record. */
  create: (activity) => withFallback(
    () => request('/activities', { method: 'POST', body: JSON.stringify(activity) }),
    () => localStore.create(activity)
  ),

  /** PUT /activities/:id - replace a record. */
  update: (id, activity) => withFallback(
    () => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify({ ...activity, id }) }),
    () => localStore.update(id, activity)
  ),

  /** DELETE /activities/:id - remove a record. */
  remove: (id) => withFallback(
    () => request(`/activities/${id}`, { method: 'DELETE' }),
    () => localStore.remove(id)
  )
}

export const settingsApi = {
  /** GET /settings - read the daily goal and user name. */
  get: () => withFallback(
    () => request('/settings'),
    () => localStore.settings()
  ),

  /** PATCH /settings - update the stored settings. */
  update: (patch) => withFallback(
    () => request('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),
    () => localStore.saveSettings({ ...localStore.settings(), ...patch })
  )
}

/**
 * Give the offline store a starting set of records the first time the
 * application runs without the API, so an offline visitor sees a populated
 * dashboard rather than an empty one.
 */
export const seedOfflineStore = (activities) => localStore.seed(activities)

export { BASE_URL }
