import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { I18nProvider } from './i18n/I18nProvider'
describe('authentication boundary', () => {
  it('does not render authenticated navigation without a genuine session', () => {
    render(
      <I18nProvider>
        <AuthProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AuthProvider>
      </I18nProvider>,
    )
    expect(
      screen.getByText('Google Sign-In is not configured for this test build.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })
})
