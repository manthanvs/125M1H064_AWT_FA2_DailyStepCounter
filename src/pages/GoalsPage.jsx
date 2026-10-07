import { useState, useMemo, useEffect } from 'react'

import { useSteps } from '../context/stepContext.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

import GoalSelector from '../components/GoalSelector.jsx'
import StatCard from '../components/StatCard.jsx'
import { LoadingState, ErrorState, OfflineNotice } from '../components/StatePanels.jsx'

import { GOAL_PRESETS, formatNumber } from '../utils/metrics.js'
import { totalsByDate } from '../utils/activityFilters.js'

/**
 * GoalsPage - choose the daily step target.
 *
 * The goal is stored on the server through PATCH /settings rather than living
 * in component state, so it survives a refresh and applies on every screen.
 *
 * As well as the presets carried over from Phase I, a custom goal can be typed
 * in. That input is validated with the same approach used by the activity form:
 * the Save button stays disabled while the entry is unusable.
 *
 * Demonstrates: useContext, useState, useEffect, useMemo, validation, update
 * operation against the API.
 */

const MIN_GOAL = 1000
const MAX_GOAL = 50000

function GoalsPage() {
  useDocumentTitle('Goals')

  const { activities, settings, status, error, offline, reload, updateGoal } = useSteps()

  const [customGoal, setCustomGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  // Clear the confirmation message after a few seconds.
  useEffect(() => {
    if (!savedMessage) return undefined
    const timer = setTimeout(() => setSavedMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [savedMessage])

  /** How often the current goal has actually been met across all recorded days. */
  const attainment = useMemo(() => {
    const totals = totalsByDate(activities)
    const days = Object.values(totals)
    const met = days.filter((steps) => steps >= settings.dailyGoal).length
    const best = days.length > 0 ? Math.max(...days) : 0
    const average = days.length > 0
      ? Math.round(days.reduce((sum, steps) => sum + steps, 0) / days.length)
      : 0
    return { totalDays: days.length, met, best, average }
  }, [activities, settings.dailyGoal])

  const parsedCustom = Number(customGoal)
  const customIsValid =
    customGoal !== '' &&
    Number.isInteger(parsedCustom) &&
    parsedCustom >= MIN_GOAL &&
    parsedCustom <= MAX_GOAL

  const customError = customGoal !== '' && !customIsValid
    ? `Enter a whole number between ${formatNumber(MIN_GOAL)} and ${formatNumber(MAX_GOAL)}.`
    : ''

  const saveGoal = async (goal) => {
    setSaving(true)
    setSaveError('')
    try {
      await updateGoal(goal)
      setSavedMessage(`Daily goal set to ${formatNumber(goal)} steps.`)
      setCustomGoal('')
    } catch (err) {
      setSaveError(err.message ?? 'The goal could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const handleCustomSubmit = (event) => {
    event.preventDefault()
    if (!customIsValid) return
    saveGoal(parsedCustom)
  }

  if (status === 'loading' || status === 'idle') return <LoadingState />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="page page--narrow">
      {offline && <OfflineNotice />}

      <div className="page__header">
        <div>
          <h1 className="page__title">Daily goal</h1>
          <p className="page__subtitle">
            Your target applies to every day and is used across the whole application.
          </p>
        </div>
      </div>

      {saveError && (
        <div className="banner banner--error" role="alert">
          <div className="banner__body">
            <p className="banner__title">Could not save</p>
            <p className="banner__text">{saveError}</p>
          </div>
        </div>
      )}

      {savedMessage && (
        <div className="banner banner--success" role="status">
          <div className="banner__body">
            <p className="banner__title">Saved</p>
            <p className="banner__text">{savedMessage}</p>
          </div>
        </div>
      )}

      <GoalSelector
        presets={GOAL_PRESETS}
        goal={settings.dailyGoal}
        onChangeGoal={saveGoal}
      />

      <section className="card">
        <h2 className="card__title">Set a custom goal</h2>
        <form className="form__inline" onSubmit={handleCustomSubmit}>
          <div className="field field--grow">
            <label className="field__label" htmlFor="customGoal">
              Steps per day ({formatNumber(MIN_GOAL)} to {formatNumber(MAX_GOAL)})
            </label>
            <input
              id="customGoal"
              className={customError ? 'input input--error' : 'input'}
              type="number"
              value={customGoal}
              onChange={(event) => setCustomGoal(event.target.value)}
              placeholder="e.g. 9500"
              aria-invalid={Boolean(customError)}
            />
            {customError && <p className="field__error">{customError}</p>}
          </div>
          <button type="submit" className="btn btn--primary" disabled={!customIsValid || saving}>
            {saving ? 'Saving...' : 'Save goal'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="card__title">How you are doing against this goal</h2>
        <p className="muted quick-add__intro">
          Based on all {attainment.totalDays} days you have recorded.
        </p>
        <div className="stats-grid">
          <StatCard label="Days recorded" value={attainment.totalDays} icon="chart" />
          <StatCard
            label="Goal met"
            value={`${attainment.met} / ${attainment.totalDays}`}
            icon="target"
            highlight={attainment.met > 0 && attainment.met === attainment.totalDays}
          />
          <StatCard label="Daily average" value={formatNumber(attainment.average)} icon="walk" />
          <StatCard label="Best day" value={formatNumber(attainment.best)} icon="flame" />
        </div>
      </section>
    </div>
  )
}

export default GoalsPage
