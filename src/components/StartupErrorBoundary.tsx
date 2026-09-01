import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

export class StartupErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch() {
    // The failure is intentionally not logged because errors may contain private details.
  }

  render() {
    if (this.state.failed) {
      return (
        <main id="main" className="center" aria-labelledby="startup-failure-title">
          <section className="notice" role="alert">
            <p className="brand-name">Jivhaalaa · जिव्हाळा</p>
            <h1 id="startup-failure-title">Jivhaalaa could not start safely</h1>
            <p>No private details were exposed. Reload the page to try again.</p>
            <button className="primary" type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
