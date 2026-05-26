import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  registerWithEmail,
  signInAsGuest,
  signInWithEmail,
  signOut,
  subscribeToAuth,
} from './authService'

const authMocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  firebaseSignOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: authMocks.createUserWithEmailAndPassword,
  onAuthStateChanged: authMocks.onAuthStateChanged,
  signInAnonymously: authMocks.signInAnonymously,
  signInWithEmailAndPassword: authMocks.signInWithEmailAndPassword,
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

  it('logt in met e-mail en wachtwoord', () => {
    signInWithEmail('test@example.com', 'geheim123')

    expect(authMocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      { name: 'auth' },
      'test@example.com',
      'geheim123',
    )
  })

  it('maakt een account met e-mail en wachtwoord', () => {
    registerWithEmail('test@example.com', 'geheim123')

    expect(authMocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { name: 'auth' },
      'test@example.com',
      'geheim123',
    )
  })

  it('logt uit', () => {
    signOut()

    expect(authMocks.firebaseSignOut).toHaveBeenCalledWith({ name: 'auth' })
  })
})
