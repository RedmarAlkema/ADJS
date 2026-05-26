import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signInAsGuest, signOut, subscribeToAuth } from '../services/authService'
import { useAuth } from './useAuth'

vi.mock('../services/authService', () => ({
  signInAsGuest: vi.fn(),
  signOut: vi.fn(),
  subscribeToAuth: vi.fn(),
}))

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('luistert naar auth-state en zet de gebruiker', async () => {
    subscribeToAuth.mockImplementation((callback) => {
      callback({ uid: 'user-1' })
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual({ uid: 'user-1' })
    })
  })

  it('kan inloggen en uitloggen', async () => {
    subscribeToAuth.mockReturnValue(vi.fn())
    signInAsGuest.mockResolvedValue()
    signOut.mockResolvedValue()

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login()
      await result.current.logout()
    })

    expect(signInAsGuest).toHaveBeenCalled()
    expect(signOut).toHaveBeenCalled()
  })

  it('toont een fout als inloggen mislukt', async () => {
    subscribeToAuth.mockReturnValue(vi.fn())
    signInAsGuest.mockRejectedValue(new Error('Geen toegang.'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login()
    })

    expect(result.current.error).toBe('Geen toegang.')
  })
})
