import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from './hooks/useAuth'
import App from './App'

vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <main>Dashboard</main>,
}))

vi.mock('./pages/LoginPage', () => ({
  LoginPage: ({ loading }) => <main>{loading ? 'Laden' : 'Login'}</main>,
}))

describe('App', () => {
  it('toont de loginpagina zonder gebruiker', () => {
    useAuth.mockReturnValue({
      error: '',
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
    })

    render(<App />)

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('toont het dashboard met gebruiker', () => {
    useAuth.mockReturnValue({
      error: '',
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      user: { uid: 'user-1' },
    })

    render(<App />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
