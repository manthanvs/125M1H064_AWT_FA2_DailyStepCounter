import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useSteps } from '../context/stepContext.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import useDebounce from '../hooks/useDebounce.js'

import SearchFilterBar from '../components/SearchFilterBar.jsx'
import ActivityList from '../components/ActivityList.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatCard from '../components/StatCard.jsx'
import { LoadingState, ErrorState, OfflineNotice } from '../components/StatePanels.jsx'

import { applyFilters, emptyCriteria, availableTypes } from '../utils/activityFilters.js'
import { formatNumber, calculateDistance } from '../utils/metrics.js'

/**
 * HistoryPage - the full activity record with search, filtering and sorting.
 *
 * The search term is held in state so typing stays responsive, but the value
 * that drives filtering is debounced by 250 ms. Filtering itself runs inside a
 * useMemo keyed on the activity list and the criteria, so it re-runs only when
 * one of those actually changes - not when the delete dialog opens, and not on
 * every keystroke.
 *
 * Demonstrates: useState, useMemo, useCallback, a custom hook (useDebounce),
 * search, filtering, sorting, delete with confirmation.
 */

function HistoryPage() {
  useDocumentTitle('History')

  const { activities, status, error, offline, reload, deleteActivity } = useSteps()

  const [criteria, setCriteria] = useState(emptyCriteria)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  // Wait until typing pauses before filtering the list.
  const debouncedSearch = useDebounce(criteria.search, 250)

  const types = useMemo(() => availableTypes(activities), [activities])

  const filtered = useMemo(
    () => applyFilters(activities, { ...criteria, search: debouncedSearch }),
    [activities, criteria, debouncedSearch]
  )

  /** Totals for whatever the current filter has selected. */
  const totals = useMemo(() => {
    const steps = filtered.reduce((sum, item) => sum + item.steps, 0)
    const days = new Set(filtered.map((item) => item.date)).size
    return {
      steps,
      days,
      distance: calculateDistance(steps),
      average: days > 0 ? Math.round(steps / days) : 0
    }
  }, [filtered])

  const handleClear = useCallback(() => setCriteria(emptyCriteria()), [])
  const handleAskDelete = useCallback((activity) => setPendingDelete(activity), [])

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setBusy(true)
    setActionError('')
    try {
      await deleteActivity(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setActionError(err.message ?? 'Could not delete that entry.')
    } finally {
      setBusy(false)
    }
  }, [pendingDelete, deleteActivity])

  if (status === 'loading' || status === 'idle') return <LoadingState />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="page">
      {offline && <OfflineNotice />}

      <div className="page__header">
        <div>
          <h1 className="page__title">Activity history</h1>
          <p className="page__subtitle">
            Every walk you have recorded - {formatNumber(activities.length)} entries in total
          </p>
        </div>
        <Link to="/activity/new" className="btn btn--primary">Add activity</Link>
      </div>

      {actionError && (
        <div className="banner banner--error" role="alert">
          <div className="banner__body">
            <p className="banner__title">That did not work</p>
            <p className="banner__text">{actionError}</p>
          </div>
        </div>
      )}

      <SearchFilterBar
        criteria={criteria}
        types={types}
        onChange={setCriteria}
        onClear={handleClear}
        resultCount={filtered.length}
        totalCount={activities.length}
      />

      {/* Totals describe the filtered selection, not the whole record. */}
      <section className="stats-grid" aria-label="Totals for the current selection">
        <StatCard label="Entries" value={formatNumber(filtered.length)} icon="chart" />
        <StatCard label="Steps" value={formatNumber(totals.steps)} icon="walk" />
        <StatCard label="Distance" value={totals.distance} unit="km" icon="map" />
        <StatCard label="Average/day" value={formatNumber(totals.average)} icon="target" />
      </section>

      <ActivityList
        activities={filtered}
        onDelete={handleAskDelete}
        showDate
        showTotal={false}
        title="Results"
        emptyTitle="No activities match these filters"
        emptyText="Try a different search term, widen the date range, or clear the filters."
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this activity?"
        message={pendingDelete
          ? `"${pendingDelete.label}" (${pendingDelete.steps.toLocaleString('en-IN')} steps) will be permanently removed.`
          : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        busy={busy}
      />
    </div>
  )
}

export default HistoryPage
