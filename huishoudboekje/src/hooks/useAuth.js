import { useEffect, useState } from 'react'
import {
  registerWithEmail,
  signInAsGuest,
  signInWithEmail,
  signOut,
  subscribeToAuth,
} from '../services/authService'
import { getErrorMessage, validateEmailLogin } from '../utils/validation'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeToAuth((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  async function loginAsGuest() {
    setError('')

    try {
      await signInAsGuest()
    } catch (firebaseError) {
      setError(getErrorMessage(firebaseError, 'Inloggen is mislukt.'))
    }
  }

  async function loginWithEmail(values) {
    setError('')

    const validationError = validateEmailLogin(values)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    try {
      await signInWithEmail(values.email.trim(), values.password)
    } catch (firebaseError) {
      const message = getErrorMessage(firebaseError, 'Inloggen is mislukt.')
      setError(message)
      throw new Error(message, { cause: firebaseError })
    }
  }

  async function register(values) {
    setError('')

    const validationError = validateEmailLogin(values)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    try {
      await registerWithEmail(values.email.trim(), values.password)
    } catch (firebaseError) {
      const message = getErrorMessage(firebaseError, 'Account maken is mislukt.')
      setError(message)
      throw new Error(message, { cause: firebaseError })
    }
  }

  async function logout() {
    setError('')

    try {
      await signOut()
    } catch (firebaseError) {
      setError(getErrorMessage(firebaseError, 'Uitloggen is mislukt.'))
    }
  }

  return {
    user,
    loading,
    error,
    loginAsGuest,
    loginWithEmail,
    logout,
    register,
  }
}
