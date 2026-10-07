import { Component } from 'react'

/**
 * ErrorBoundary - catches rendering errors anywhere below it in the tree and
 * shows a recovery screen instead of letting React unmount the whole app.
 *
 * This is the one component in the project written as a class. Error
 * boundaries rely on the lifecycle methods getDerivedStateFromError and
 * componentDidCatch, and React provides no hook equivalent, so a class is
 * still required here.
 *
 * Note that this catches errors thrown during rendering. Failed network
 * requests are handled separately, in the API layer and the context reducer,
 * because a rejected promise is not a rendering error.
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /** Runs when a child throws; the return value becomes the new state. */
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  /** Runs after the error is caught - the place to log it. */
  componentDidCatch(error, errorInfo) {
    console.error('Rendering error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card state-panel" role="alert">
          <h2 className="state-panel__title">Something went wrong on this screen</h2>
          <p className="state-panel__text">
            The rest of the application is still running. You can try this screen again, or move to
            another section using the navigation above.
          </p>
          {this.state.error?.message && (
            <p className="state-panel__detail">{this.state.error.message}</p>
          )}
          <button type="button" className="btn btn--primary" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
