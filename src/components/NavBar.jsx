import { NavLink } from 'react-router-dom'

/**
 * NavBar - the primary navigation for the routed application.
 *
 * NavLink is used rather than Link because it automatically supplies an
 * `isActive` flag, which is what highlights the current section without the
 * component needing to read the location itself.
 *
 * Demonstrates: React Router navigation, active link styling.
 */

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/history', label: 'History' },
  { to: '/activity/new', label: 'Add activity' },
  { to: '/goals', label: 'Goals' },
  { to: '/about', label: 'About' }
]

function NavBar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <ul className="navbar__list">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'navbar__link navbar__link--active' : 'navbar__link')}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar
