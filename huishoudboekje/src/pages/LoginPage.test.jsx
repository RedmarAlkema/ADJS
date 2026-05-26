import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage page', () => {
  it('toont uitleg en start de login-flow', () => {
    const onLogin = vi.fn()

    render(<LoginPage error="" loading={false} onLogin={onLogin} />)

    expect(screen.getByText('Huishoudboekje')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start als gast' }))

    expect(onLogin).toHaveBeenCalled()
  })

  it('toont laadstatus en foutmelding', () => {
    render(
      <LoginPage
        error="Inloggen is mislukt."
        loading={true}
        onLogin={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Laden...' })).toBeDisabled()
    expect(screen.getByText('Inloggen is mislukt.')).toBeInTheDocument()
  })
})
