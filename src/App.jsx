import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import { useSteps } from './context/stepContext.js'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import NavBar from './components/NavBar.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { LoadingState } from './components/StatePanels.jsx'

// The dashboard is the landing route, so it is bundled with the initial load.
import DashboardPage from './pages/DashboardPage.jsx'

/**
 * Code splitting: the remaining routes are loaded only when the user navigates
 * to them. Vite emits each as its own chunk, so the first page a visitor sees
 * does not carry the form, the history screen and the about page with it.
 */
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'))
const ActivityFormPage = lazy(() => import('./pages/ActivityFormPage.jsx'))
const GoalsPage = lazy(() => import('./pages/GoalsPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

/**
 * App - the application shell and route table.
 *
 * The layout around the routes (header, navigation, footer) is rendered once
 * and stays mounted as the user moves between pages; only the routed area
 * changes. The ErrorBoundary sits inside the shell so that a crash on one page
 * leaves the navigation usable.
 *
 * Demonstrates: React Router routes including a dynamic segment and a wildcard,
 * React.lazy with Suspense, error boundaries, useContext.
 */

function App() {
  const { settings } = useSteps()

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return (
    <div className="app">
      <Header userName={settings.userName} dateLabel={dateLabel} />
      <NavBar />

      <main className="app__main">
        <ErrorBoundary>
          {/* Shown while a lazily loaded route chunk is being fetched. */}
          <Suspense fallback={<LoadingState message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/activity/new" element={<ActivityFormPage />} />
              <Route path="/activity/:id/edit" element={<ActivityFormPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Catch-all: anything unmatched lands here. */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer subject="Advanced Web Technologies" phase="Mini Project Phase II" />
    </div>
  )
}

export default App
