import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signInAsGuest, signOut, subscribeToAuth } from './authService'

const authMocks = vi.hoisted(() => ({
  firebaseSignOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: authMocks.onAuthStateChanged,
  signInAnonymously: authMocks.signInAnonymously,
  signOut: authMocks.firebaseSignOut,
}))

vi.mock('./firebase', () => ({
  auth: { name: 'auth' },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op auth wijzigingen', () => {
    const callback = vi.fn()

    subscribeToAuth(callback)

    expect(authMocks.onAuthStateChanged).toHaveBeenCalledWith(
      { name: 'auth' },
      callback,
    )
  })

  it('logt anoniem in', () => {
    signInAsGuest()

    expect(authMocks.signInAnonymously).toHaveBeenCalledWith({ name: 'auth' })
  })

  it('logt uit', () => {
    signOut()

    expect(authMocks.firebaseSignOut).toHaveBeenCalledWith({ name: 'auth' })
  })
})
