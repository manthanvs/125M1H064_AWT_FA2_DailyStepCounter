import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { StepProvider } from './context/StepProvider.jsx'
import './styles/index.css'

/**
 * Application entry point.
 *
 * Provider order matters. BrowserRouter is outermost so that every component,
 * including the ones inside StepProvider, can use routing hooks. StepProvider
 * sits inside it and makes the activity data available to every route.
 *
 * `basename` is read from Vite's BASE_URL so the same build works both at a
 * domain root (Vercel, Netlify) and in a sub-path (GitHub Pages).
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StepProvider>
        <App />
      </StepProvider>
    </BrowserRouter>
  </StrictMode>
)
