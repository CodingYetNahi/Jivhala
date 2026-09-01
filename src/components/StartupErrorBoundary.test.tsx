import { render, screen } from '@testing-library/react'
import { StartupErrorBoundary } from './StartupErrorBoundary'

function BrokenStartup(): never {
  throw new Error('private diagnostic')
}

describe('StartupErrorBoundary', () => {
  it('shows a safe, accessible recovery screen without diagnostic details', () => {
    render(
      <StartupErrorBoundary>
        <BrokenStartup />
      </StartupErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /could not start safely/i })).toBeInTheDocument()
    expect(screen.queryByText('private diagnostic')).not.toBeInTheDocument()
  })
})
