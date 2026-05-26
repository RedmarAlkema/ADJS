import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

describe('LoginPage page', () => {
  it('toont uitleg en start de gast-login-flow', () => {
    const onGuestLogin = vi.fn()

    render(
      <LoginPage
        error=""
        loading={false}
        onGuestLogin={onGuestLogin}
        onLogin={vi.fn()}
        onRegister={vi.fn()}
      />,
    )

    expect(screen.getByText('Huishoudboekje')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start als gast' }))

    expect(onGuestLogin).toHaveBeenCalled()
  })

  it('logt in met e-mail en wachtwoord', async () => {
    const onLogin = vi.fn().mockResolvedValue()

    render(
      <LoginPage
        error=""
        loading={false}
        onGuestLogin={vi.fn()}
        onLogin={onLogin}
        onRegister={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('E-mailadres'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Wachtwoord'), {
      target: { value: 'geheim123' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Inloggen' })[1])

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'geheim123',
      })
    })
  })

  it('maakt een account vanuit de registermodus', async () => {
    const onRegister = vi.fn().mockResolvedValue()

    render(
      <LoginPage
        error=""
        loading={false}
        onGuestLogin={vi.fn()}
        onLogin={vi.fn()}
        onRegister={onRegister}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Account maken' }))
    fireEvent.change(screen.getByLabelText('E-mailadres'), {
      target: { value: 'nieuw@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Wachtwoord'), {
      target: { value: 'geheim123' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Account maken' })[1])

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith({
        email: 'nieuw@example.com',
        password: 'geheim123',
      })
    })
  })

  it('valideert e-mail login invoer', async () => {
    render(
      <LoginPage
        error=""
        loading={false}
        onGuestLogin={vi.fn()}
        onLogin={vi.fn()}
        onRegister={vi.fn()}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Inloggen' })[1])

    expect(await screen.findByText('Vul je e-mailadres in.')).toBeInTheDocument()
  })

  it('toont laadstatus en foutmelding', () => {
    render(
      <LoginPage
        error="Inloggen is mislukt."
        loading={true}
        onGuestLogin={vi.fn()}
        onLogin={vi.fn()}
        onRegister={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Laden...' })).toBeDisabled()
    expect(screen.getByText('Inloggen is mislukt.')).toBeInTheDocument()
  })
})
