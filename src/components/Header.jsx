/**
 * Header - the application banner shown at the top of every screen.
 *
 * It receives the current date and the user's name as props, which keeps the
 * component reusable: nothing inside it is hard-coded to one particular user.
 *
 * Demonstrates: props, destructuring, template literals in JSX.
 */

function Header({ userName = 'User', dateLabel = '' }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM11 21l1.5-5L10 14l1-5.5L8 10l-1 3m6.5-.5L16 15l1 6" />
          </svg>
        </span>
        <div>
          <h1 className="app-header__title">Daily Step Counter</h1>
          <p className="app-header__subtitle">Track every step towards your goal</p>
        </div>
      </div>

      <div className="app-header__meta">
        <p className="app-header__greeting">Hello, {userName}</p>
        <p className="app-header__date">{dateLabel}</p>
      </div>
    </header>
  )
}

export default Header
