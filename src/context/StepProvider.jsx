import { useReducer, useEffect, useCallback, useMemo } from 'react'

import {
  activitiesApi, settingsApi, seedOfflineStore, resetConnection, ApiError
} from '../services/api.js'
import StepContext from './stepContext.js'
import seedData from '../../db.json'

/**
 * StepProvider - one source of truth for activities and settings.
 *
 * In Phase I the activity list lived in App and was threaded down through
 * props. With routing added, several pages that are not parent and child now
 * need the same data, so passing it through props would mean routing it
 * through components that have no interest in it. Context solves exactly that.
 *
 * State transitions go through a reducer rather than several useState calls,
 * because loading, success, failure and each CRUD result are all transitions of
 * one machine. Keeping them in a reducer means an impossible combination -
 * loading and error at once, say - cannot be represented.
 */

const initialState = {
  activities: [],
  settings: { id: 1, dailyGoal: 10000, userName: 'Manthan' },
  status: 'idle',   // idle | loading | ready | error
  error: null,
  offline: false
}

function stepReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null }

    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'ready',
        error: null,
        activities: action.activities,
        settings: action.settings,
        offline: action.offline
      }

    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.error }

    case 'ACTIVITY_ADDED':
      return { ...state, activities: [...state.activities, action.activity], offline: action.offline }

    case 'ACTIVITY_UPDATED':
      return {
        ...state,
        offline: action.offline,
        activities: state.activities.map((item) =>
          item.id === action.activity.id ? action.activity : item
        )
      }

    case 'ACTIVITY_DELETED':
      return {
        ...state,
        offline: action.offline,
        activities: state.activities.filter((item) => item.id !== action.id)
      }

    case 'SETTINGS_UPDATED':
      return { ...state, settings: action.settings, offline: action.offline }

    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export function StepProvider({ children }) {
  const [state, dispatch] = useReducer(stepReducer, initialState)

  /** Load activities and settings. Also used by the error screen's retry button. */
  const load = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    // A manual reload should always re-probe the network, even if the circuit
    // breaker currently has us marked as offline.
    resetConnection()
    try {
      // If the API is unreachable, the offline store should not start empty.
      seedOfflineStore(seedData.activities)

      const [activitiesResult, settingsResult] = await Promise.all([
        activitiesApi.getAll(),
        settingsApi.get()
      ])

      dispatch({
        type: 'FETCH_SUCCESS',
        activities: activitiesResult.data ?? [],
        settings: settingsResult.data ?? initialState.settings,
        offline: activitiesResult.offline || settingsResult.offline
      })
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        error: error instanceof ApiError ? error.message : 'Something went wrong while loading your data.'
      })
    }
  }, [])

  // Load once when the provider mounts.
  useEffect(() => { load() }, [load])

  // ----- CRUD operations ---------------------------------------------------
  // Each returns the saved record so the calling page can navigate or show a
  // confirmation, and each throws on failure so the form can display an error.

  const addActivity = useCallback(async (activity) => {
    const { data, offline } = await activitiesApi.create(activity)
    dispatch({ type: 'ACTIVITY_ADDED', activity: data, offline })
    return data
  }, [])

  const updateActivity = useCallback(async (id, activity) => {
    const { data, offline } = await activitiesApi.update(id, activity)
    dispatch({ type: 'ACTIVITY_UPDATED', activity: data ?? { ...activity, id }, offline })
    return data
  }, [])

  const deleteActivity = useCallback(async (id) => {
    const { offline } = await activitiesApi.remove(id)
    dispatch({ type: 'ACTIVITY_DELETED', id, offline })
  }, [])

  const updateGoal = useCallback(async (dailyGoal) => {
    const { data, offline } = await settingsApi.update({ dailyGoal })
    dispatch({
      type: 'SETTINGS_UPDATED',
      settings: data ?? { ...initialState.settings, dailyGoal },
      offline
    })
  }, [])

  /**
   * The context value is memoised so that consumers only re-render when the
   * data actually changes. Without useMemo a new object would be created on
   * every provider render and every consumer would re-render with it.
   */
  const value = useMemo(() => ({
    ...state,
    reload: load,
    addActivity,
    updateActivity,
    deleteActivity,
    updateGoal
  }), [state, load, addActivity, updateActivity, deleteActivity, updateGoal])

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>
}
