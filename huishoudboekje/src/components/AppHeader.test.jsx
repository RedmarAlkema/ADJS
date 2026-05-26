import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from './AppHeader'

describe('AppHeader component', () => {
  it('toont de titel zonder gebruikersmenu als er geen user is', () => {
    render(<AppHeader user={null} onSignOut={vi.fn()} />)

    expect(screen.getByText('Grip op je uitgaven')).toBeInTheDocument()
    expect(screen.queryByLabelText('Gebruiker')).not.toBeInTheDocument()
  })

  it('toont de gebruiker en kan uitloggen', () => {
    const onSignOut = vi.fn()

    render(
      <AppHeader
        user={{ uid: '1234567890abcdef' }}
        onSignOut={onSignOut}
      />,
    )

    expect(screen.getByText('12345678')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Uitloggen' }))

    expect(onSignOut).toHaveBeenCalled()
  })
})
