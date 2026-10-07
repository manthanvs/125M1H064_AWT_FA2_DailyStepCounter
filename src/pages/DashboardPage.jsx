import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useSteps } from '../context/stepContext.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

import GoalProgress from '../components/GoalProgress.jsx'
import StatsGrid from '../components/StatsGrid.jsx'
import WeeklyChart from '../components/WeeklyChart.jsx'
import WeeklySummary from '../components/WeeklySummary.jsx'
import ActivityList from '../components/ActivityList.jsx'
import AchievementBanner from '../components/AchievementBanner.jsx'
import QuickAddButtons from '../components/QuickAddButtons.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { LoadingState, ErrorState, OfflineNotice } from '../components/StatePanels.jsx'

import { buildDailySummary, formatLongDate } from '../utils/metrics.js'
import {
  buildWeeklyHistory, activitiesForDate, totalsByDate
} from '../utils/activityFilters.js'
import { QUICK_ADD_OPTIONS, STAT_DEFINITIONS } from '../data/sampleData.js'
import { todayIso } from '../utils/dates.js'

/**
 * DashboardPage - the daily summary screen.
 *
 * Reads everything from StepContext and derives the rest. Four separate
 * calculations are wrapped in useMemo because each walks the full activity
 * list, and none of them need to run again when unrelated state - the delete
 * dialog, for instance - changes.
 *
 * Demonstrates: useContext, useMemo, useCallback, useState, derived state.
 */

function DashboardPage() {
  useDocumentTitle('Dashboard')

  const {
    activities, settings, status, error, offline,
    reload, addActivity, deleteActivity
  } = useSteps()

  const [pendingDelete, setPendingDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  /**
   * Which day the dashboard describes. Normally today - but if today has no
   * entries yet, showing the most recent day with activity is more useful than
   * showing an empty screen. The heading states which day it is either way.
   */
  const focusDate = useMemo(() => {
    const today = todayIso()
    const totals = totalsByDate(activities)
    if (totals[today]) return today
    const dates = Object.keys(totals).sort()
    return dates.length > 0 ? dates[dates.length - 1] : today
  }, [activities])

  const isToday = focusDate === todayIso()

  const dayActivities = useMemo(
    () => activitiesForDate(activities, focusDate),
    [activities, focusDate]
  )

  const summary = useMemo(() => {
    const steps = dayActivities.reduce((sum, item) => sum + item.steps, 0)
    return buildDailySummary(steps, settings.dailyGoal)
  }, [dayActivities, settings.dailyGoal])

  const weeklyHistory = useMemo(
    () => buildWeeklyHistory(activities, focusDate),
    [activities, focusDate]
  )

  /**
   * Log a preset amount. Wrapped in useCallback so QuickAddButtons receives the
   * same function reference between renders.
   */
  const handleQuickAdd = useCallback(async (amount) => {
    setActionError('')
    const now = new Date()
    try {
      await addActivity({
        label: 'Quick add',
        steps: amount,
        date: todayIso(),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        type: 'Walk',
        note: ''
      })
    } catch (err) {
      setActionError(err.message ?? 'Could not save that entry.')
    }
  }, [addActivity])

  /** Stable reference so the memoised ActivityItem rows are not invalidated. */
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

  // ----- Loading and error screens ----------------------------------------
  if (status === 'loading' || status === 'idle') return <LoadingState />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="page">
      {offline && <OfflineNotice />}

      <div className="page__header">
        <div>
          <h1 className="page__title">{isToday ? 'Today' : 'Latest recorded day'}</h1>
          <p className="page__subtitle">{formatLongDate(focusDate)}</p>
        </div>
        <Link to="/activity/new" className="btn btn--primary">Add activity</Link>
      </div>

      {actionError && (
        <div className="banner banner--error" role="alert">
          <div className="banner__body">
            <p className="banner__title">That did not save</p>
            <p className="banner__text">{actionError}</p>
          </div>
        </div>
      )}

      <AchievementBanner
        goalReached={summary.goalReached}
        steps={summary.steps}
        goal={summary.goal}
      />

      <div className="layout">
        <div className="layout__primary">
          <GoalProgress
            steps={summary.steps}
            goal={summary.goal}
            progress={summary.progress}
            goalReached={summary.goalReached}
          />

          <StatsGrid definitions={STAT_DEFINITIONS} summary={summary} />

          <section className="card">
            <h2 className="card__title">Quick add</h2>
            <p className="muted quick-add__intro">
              Log a common walk in one press, or use the full form to record the type, time and a note.
            </p>
            <QuickAddButtons options={QUICK_ADD_OPTIONS} onAddSteps={handleQuickAdd} />
          </section>
        </div>

        <aside className="layout__secondary">
          <WeeklyChart history={weeklyHistory} goal={settings.dailyGoal} />
          <WeeklySummary history={weeklyHistory} goal={settings.dailyGoal} />
          <ActivityList
            activities={dayActivities}
            onDelete={handleAskDelete}
            title={isToday ? "Today's activity" : 'Activity that day'}
            emptyText="Use quick add above, or the full form, to record your first walk."
          />
        </aside>
      </div>

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

export default DashboardPage
