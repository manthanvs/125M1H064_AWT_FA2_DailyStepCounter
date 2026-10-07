import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { useSteps } from '../context/stepContext.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

import { LoadingState, OfflineNotice } from '../components/StatePanels.jsx'
import {
  validateActivity, validateField, emptyActivity, toApiActivity,
  ACTIVITY_TYPES, MAX_NOTE_LENGTH, todayIso
} from '../utils/validation.js'

/**
 * ActivityFormPage - one form used for both adding and editing an activity.
 *
 * Which mode it is in comes from the route: /activity/new has no id parameter,
 * /activity/:id/edit does. Sharing one component means the validation rules and
 * the markup exist once.
 *
 * Validation strategy: a field is only marked invalid once the user has left it
 * (onBlur) or once they have tried to submit. Showing "this field is required"
 * while somebody is still typing their first character is unhelpful, so errors
 * are tracked separately from "has this field been touched".
 *
 * Demonstrates: useState, useEffect, useRef, useParams, useNavigate, controlled
 * inputs, field-level validation, create and update operations.
 */

function ActivityFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  useDocumentTitle(isEditing ? 'Edit activity' : 'Add activity')

  const { activities, status, offline, addActivity, updateActivity } = useSteps()

  const [values, setValues] = useState(emptyActivity)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const firstFieldRef = useRef(null)

  /** The record being edited, looked up from the data already in context. */
  const existing = useMemo(
    () => (isEditing ? activities.find((item) => item.id === id) : null),
    [isEditing, activities, id]
  )

  // Populate the form once the record is available.
  useEffect(() => {
    if (!isEditing) return
    if (status !== 'ready') return

    if (existing) {
      setValues({
        label: existing.label ?? '',
        steps: String(existing.steps ?? ''),
        date: existing.date ?? todayIso(),
        time: existing.time ?? '09:00',
        type: existing.type ?? 'Walk',
        note: existing.note ?? ''
      })
    } else {
      setNotFound(true)
    }
  }, [isEditing, status, existing])

  // Put the cursor in the first field so the form is ready to type into.
  useEffect(() => {
    firstFieldRef.current?.focus()
  }, [])

  /** Update one field, and re-validate it if it has already been touched. */
  const handleChange = (event) => {
    const { name, value } = event.target
    const next = { ...values, [name]: value }
    setValues(next)

    if (touched[name]) {
      setErrors((previous) => ({ ...previous, [name]: validateField(name, value, next) }))
    }
  }

  /** Validate a field once the user leaves it. */
  const handleBlur = (event) => {
    const { name, value } = event.target
    setTouched((previous) => ({ ...previous, [name]: true }))
    setErrors((previous) => ({ ...previous, [name]: validateField(name, value, values) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const { errors: allErrors, isValid } = validateActivity(values)
    setErrors(allErrors)
    // Mark everything touched so every message becomes visible at once.
    setTouched({ label: true, steps: true, date: true, time: true, type: true, note: true })

    if (!isValid) {
      // Move focus to the first field with a problem.
      const firstBad = ['label', 'steps', 'date', 'time', 'type', 'note'].find((f) => allErrors[f])
      document.querySelector(`[name="${firstBad}"]`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      const payload = toApiActivity(values)
      if (isEditing) {
        await updateActivity(id, payload)
      } else {
        await addActivity(payload)
      }
      navigate('/history')
    } catch (error) {
      setSubmitError(error.message ?? 'The activity could not be saved. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /** Show an error under a field only when it has been touched. */
  const errorFor = (field) => (touched[field] ? errors[field] : '')

  if (isEditing && status !== 'ready') return <LoadingState message="Loading this activity..." />

  if (notFound) {
    return (
      <div className="page">
        <div className="card state-panel state-panel--error">
          <h2 className="state-panel__title">That activity does not exist</h2>
          <p className="state-panel__text">
            It may have been deleted, or the link may be wrong.
          </p>
          <Link to="/history" className="btn btn--primary">Back to history</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      {offline && <OfflineNotice />}

      <div className="page__header">
        <div>
          <h1 className="page__title">{isEditing ? 'Edit activity' : 'Add activity'}</h1>
          <p className="page__subtitle">
            {isEditing
              ? 'Update the details of this walk and save your changes.'
              : 'Record a walk with its type, time and an optional note.'}
          </p>
        </div>
      </div>

      {submitError && (
        <div className="banner banner--error" role="alert">
          <div className="banner__body">
            <p className="banner__title">Could not save</p>
            <p className="banner__text">{submitError}</p>
          </div>
        </div>
      )}

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="label">Activity name</label>
          <input
            ref={firstFieldRef}
            id="label"
            name="label"
            className={errorFor('label') ? 'input input--error' : 'input'}
            type="text"
            value={values.label}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Morning walk"
            aria-invalid={Boolean(errorFor('label'))}
            aria-describedby={errorFor('label') ? 'label-error' : undefined}
          />
          {errorFor('label') && <p className="field__error" id="label-error">{errorFor('label')}</p>}
        </div>

        <div className="form__row">
          <div className="field">
            <label className="field__label" htmlFor="steps">Steps</label>
            <input
              id="steps"
              name="steps"
              className={errorFor('steps') ? 'input input--error' : 'input'}
              type="number"
              value={values.steps}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 2400"
              aria-invalid={Boolean(errorFor('steps'))}
              aria-describedby={errorFor('steps') ? 'steps-error' : undefined}
            />
            {errorFor('steps') && <p className="field__error" id="steps-error">{errorFor('steps')}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              className={errorFor('type') ? 'input input--error' : 'input'}
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errorFor('type') && <p className="field__error">{errorFor('type')}</p>}
          </div>
        </div>

        <div className="form__row">
          <div className="field">
            <label className="field__label" htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              className={errorFor('date') ? 'input input--error' : 'input'}
              type="date"
              max={todayIso()}
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errorFor('date'))}
              aria-describedby={errorFor('date') ? 'date-error' : undefined}
            />
            {errorFor('date') && <p className="field__error" id="date-error">{errorFor('date')}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="time">Time</label>
            <input
              id="time"
              name="time"
              className={errorFor('time') ? 'input input--error' : 'input'}
              type="time"
              value={values.time}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errorFor('time'))}
              aria-describedby={errorFor('time') ? 'time-error' : undefined}
            />
            {errorFor('time') && <p className="field__error" id="time-error">{errorFor('time')}</p>}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="note">Note (optional)</label>
          <textarea
            id="note"
            name="note"
            className={errorFor('note') ? 'input input--error' : 'input'}
            rows="3"
            value={values.note}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="How did it go?"
            aria-invalid={Boolean(errorFor('note'))}
          />
          <p className={values.note.length > MAX_NOTE_LENGTH ? 'field__counter field__counter--over' : 'field__counter'}>
            {values.note.length} / {MAX_NOTE_LENGTH}
          </p>
          {errorFor('note') && <p className="field__error">{errorFor('note')}</p>}
        </div>

        <div className="form__actions">
          <button type="button" className="btn" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Add activity'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ActivityFormPage
