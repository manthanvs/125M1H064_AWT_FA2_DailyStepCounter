// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import StatCard from '../components/StatCard.jsx'
import AchievementBanner from '../components/AchievementBanner.jsx'
import ActivityList from '../components/ActivityList.jsx'
import GoalSelector from '../components/GoalSelector.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

/**
 * Component tests with React Testing Library.
 *
 * These assert what the user can see and do - visible text, roles, and the
 * effect of clicking - rather than internal state. That means a component can
 * be refactored freely and the tests still hold, as long as the behaviour is
 * unchanged.
 */

/** Components containing <Link> need a router around them to render. */
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('StatCard', () => {
  it('shows the value and its label', () => {
    render(<StatCard label="Distance" value={6.44} unit="km" icon="map" />)
    expect(screen.getByText('6.44')).toBeInTheDocument()
    expect(screen.getByText('Distance')).toBeInTheDocument()
    expect(screen.getByText('km')).toBeInTheDocument()
  })

  it('omits the unit when none is supplied', () => {
    const { container } = render(<StatCard label="Entries" value={12} />)
    expect(container.querySelector('.stat-card__unit')).toBeNull()
  })

  it('applies the highlight style only when asked', () => {
    const { container, rerender } = render(<StatCard label="To go" value={0} highlight />)
    expect(container.querySelector('.stat-card--highlight')).not.toBeNull()

    rerender(<StatCard label="To go" value={500} />)
    expect(container.querySelector('.stat-card--highlight')).toBeNull()
  })
})

describe('AchievementBanner - conditional rendering', () => {
  it('renders nothing at all while the goal has not been reached', () => {
    const { container } = render(
      <AchievementBanner goalReached={false} steps={8450} goal={10000} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('congratulates the user once the goal is reached', () => {
    render(<AchievementBanner goalReached steps={10450} goal={10000} />)
    expect(screen.getByText(/daily goal achieved/i)).toBeInTheDocument()
  })

  it('reports how many steps were walked beyond the goal', () => {
    render(<AchievementBanner goalReached steps={10450} goal={10000} />)
    expect(screen.getByText(/450 steps beyond/i)).toBeInTheDocument()
  })

  it('uses different wording when the goal is met exactly', () => {
    render(<AchievementBanner goalReached steps={10000} goal={10000} />)
    expect(screen.getByText(/exactly/i)).toBeInTheDocument()
  })
})

describe('ActivityList', () => {
  const activities = [
    { id: '1', label: 'Morning walk', steps: 3200, date: '2026-08-28', time: '07:15', type: 'Walk', note: '' },
    { id: '2', label: 'Evening jog', steps: 2300, date: '2026-08-28', time: '18:45', type: 'Jog', note: 'Good pace.' }
  ]

  it('renders one row per activity', () => {
    renderWithRouter(<ActivityList activities={activities} onDelete={() => {}} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Morning walk')).toBeInTheDocument()
    expect(screen.getByText('Evening jog')).toBeInTheDocument()
  })

  it('shows the total steps for the list', () => {
    renderWithRouter(<ActivityList activities={activities} onDelete={() => {}} />)
    expect(screen.getByText('5,500 steps')).toBeInTheDocument()
  })

  it('shows an empty state instead of a list when there is nothing to show', () => {
    renderWithRouter(<ActivityList activities={[]} onDelete={() => {}} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(/no sessions logged yet/i)).toBeInTheDocument()
  })

  it('calls onDelete with the activity when its delete button is pressed', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    renderWithRouter(<ActivityList activities={activities} onDelete={onDelete} />)

    await user.click(screen.getByLabelText('Delete Morning walk'))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(activities[0])
  })

  it('links each row to its own edit page', () => {
    renderWithRouter(<ActivityList activities={activities} onDelete={() => {}} />)
    expect(screen.getByLabelText('Edit Morning walk')).toHaveAttribute('href', '/activity/1/edit')
  })

  it('shows the note only for activities that have one', () => {
    const { container } = renderWithRouter(
      <ActivityList activities={activities} onDelete={() => {}} />
    )
    expect(container.querySelectorAll('.activity-item__note')).toHaveLength(1)
  })
})

describe('GoalSelector', () => {
  it('marks only the selected goal as pressed', () => {
    render(<GoalSelector presets={[6000, 8000, 10000]} goal={8000} onChangeGoal={() => {}} />)
    expect(screen.getByRole('button', { name: '8,000' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '6,000' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the chosen goal to its parent', async () => {
    const onChangeGoal = vi.fn()
    const user = userEvent.setup()
    render(<GoalSelector presets={[6000, 8000, 10000]} goal={8000} onChangeGoal={onChangeGoal} />)

    await user.click(screen.getByRole('button', { name: '10,000' }))

    expect(onChangeGoal).toHaveBeenCalledWith(10000)
  })
})

describe('ConfirmDialog', () => {
  const props = {
    title: 'Delete this activity?',
    message: 'It will be permanently removed.',
    onConfirm: () => {},
    onCancel: () => {}
  }

  it('renders nothing while closed', () => {
    const { container } = render(<ConfirmDialog open={false} {...props} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the title and message when open', () => {
    render(<ConfirmDialog open {...props} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete this activity?')).toBeInTheDocument()
  })

  it('confirms only when the confirm button is pressed', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog open {...props} onConfirm={onConfirm} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancels when Escape is pressed', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog open {...props} onCancel={onCancel} />)

    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables both buttons while the delete is in flight', () => {
    render(<ConfirmDialog open {...props} busy />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
  })
})
