import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useSteps } from '../context/stepContext.js'
import { BASE_URL } from '../services/api.js'

/**
 * AboutPage - what the project is, how it is built, and where each concept
 * from the syllabus is implemented.
 *
 * Demonstrates: routing to a static page, useContext for the connection status.
 */

const PHASE_ONE = [
  ['JSX and functional components', 'All components in src/components'],
  ['Props', 'StatCard, Header, Footer, ActivityItem'],
  ['State (useState)', 'Form values, filter criteria, dialog state'],
  ['Event handling', 'onClick, onChange, onSubmit, onBlur'],
  ['Conditional rendering', 'Banners, empty states, field errors'],
  ['Lists and keys', 'Activity lists, statistic tiles, chart bars'],
  ['Responsive UI', 'CSS Grid and Flexbox with four breakpoints']
]

const PHASE_TWO = [
  ['React Hooks', 'useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer'],
  ['Custom hooks', 'useLocalStorage, useDebounce, useDocumentTitle'],
  ['Routing', 'React Router with six routes, active links and a 404 page'],
  ['Forms and validation', 'Field-level rules with blur and submit validation'],
  ['API integration', 'JSON Server REST API through a single service layer'],
  ['CRUD operations', 'Create, read, update and delete on activity records'],
  ['Search and filter', 'Debounced search, type filter, date range and sorting'],
  ['Error handling', 'Error boundary, API error type, loading and error states'],
  ['Performance', 'React.memo, useMemo, useCallback, lazy-loaded routes'],
  ['Testing', 'Vitest and React Testing Library']
]

function AboutPage() {
  useDocumentTitle('About')
  const { offline, activities } = useSteps()

  return (
    <div className="page page--narrow">
      <div className="page__header">
        <div>
          <h1 className="page__title">About this project</h1>
          <p className="page__subtitle">Daily Step Counter Interface - Mini Project, Phase II</p>
        </div>
      </div>

      <section className="card">
        <h2 className="card__title">What it does</h2>
        <p className="about__text">
          The Daily Step Counter records the walking you do during a day, measures it against a
          personal goal, and converts it into distance, calories and active minutes. It keeps a
          full history that can be searched and filtered, and every entry can be added, edited or
          deleted.
        </p>
        <p className="about__text">
          It exists because walking is the easiest activity to do and the easiest to lose track of.
          It happens in small scattered bursts that nobody counts, so a day that felt active often
          is not. Mainstream fitness applications answer that question but demand an account, an
          internet connection and a great deal of attention. This one answers only that question.
        </p>
      </section>

      <section className="card">
        <h2 className="card__title">Project details</h2>
        <dl className="about__list">
          <div className="about__row"><dt>Student</dt><dd>Sankpal Manthan Vijay</dd></div>
          <div className="about__row"><dt>PRN</dt><dd>125M1H064</dd></div>
          <div className="about__row"><dt>Class</dt><dd>SYMCA, Semester III, A.Y. 2026-27</dd></div>
          <div className="about__row"><dt>Subject</dt><dd>Advanced Web Technologies</dd></div>
          <div className="about__row"><dt>Course owner</dt><dd>Dr. Avinash Chormale</dd></div>
          <div className="about__row"><dt>Stack</dt><dd>React 19, React Router 7, Vite 7, JSON Server, Vitest</dd></div>
          <div className="about__row">
            <dt>Data source</dt>
            <dd>{offline ? 'Browser storage (API unreachable)' : BASE_URL}</dd>
          </div>
          <div className="about__row"><dt>Records loaded</dt><dd>{activities.length}</dd></div>
        </dl>
      </section>

      <section className="card">
        <h2 className="card__title">Phase I - core implementation</h2>
        <table className="about__table">
          <tbody>
            {PHASE_ONE.map(([concept, where]) => (
              <tr key={concept}>
                <th scope="row">{concept}</th>
                <td>{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="card__title">Phase II - advanced features</h2>
        <table className="about__table">
          <tbody>
            {PHASE_TWO.map(([concept, where]) => (
              <tr key={concept}>
                <th scope="row">{concept}</th>
                <td>{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="about__back">
        <Link to="/" className="btn btn--primary">Back to dashboard</Link>
      </p>
    </div>
  )
}

export default AboutPage
