import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  registerWithEmail,
  signInAsGuest,
  signInWithEmail,
  signOut,
  subscribeToAuth,
} from '../services/authService'
import { useAuth } from './useAuth'

vi.mock('../services/authService', () => ({
  registerWithEmail: vi.fn(),
  signInAsGuest: vi.fn(),
  signInWithEmail: vi.fn(),
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
    signInWithEmail.mockResolvedValue()
    registerWithEmail.mockResolvedValue()
    signOut.mockResolvedValue()

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.loginAsGuest()
      await result.current.loginWithEmail({
        email: ' test@example.com ',
        password: 'geheim123',
      })
      await result.current.register({
        email: ' nieuw@example.com ',
        password: 'geheim123',
      })
      await result.current.logout()
    })

    expect(signInAsGuest).toHaveBeenCalled()
    expect(signInWithEmail).toHaveBeenCalledWith(
      'test@example.com',
      'geheim123',
    )
    expect(registerWithEmail).toHaveBeenCalledWith(
      'nieuw@example.com',
      'geheim123',
    )
    expect(signOut).toHaveBeenCalled()
  })

  it('toont een fout als inloggen mislukt', async () => {
    subscribeToAuth.mockReturnValue(vi.fn())
    signInAsGuest.mockRejectedValue(new Error('Geen toegang.'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.loginAsGuest()
    })

    expect(result.current.error).toBe('Geen toegang.')
  })

  it('valideert e-mail login invoer', async () => {
    subscribeToAuth.mockReturnValue(vi.fn())

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await expect(
        result.current.loginWithEmail({ email: '', password: 'geheim123' }),
      ).rejects.toThrow('Vul je e-mailadres in.')
    })
  })

  it('toont een fout als registreren mislukt', async () => {
    subscribeToAuth.mockReturnValue(vi.fn())
    registerWithEmail.mockRejectedValue(new Error('E-mail bestaat al.'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await expect(
        result.current.register({
          email: 'test@example.com',
          password: 'geheim123',
        }),
      ).rejects.toThrow('E-mail bestaat al.')
    })

    expect(result.current.error).toBe('E-mail bestaat al.')
  })
})
