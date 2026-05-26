import { useEffect, useState } from 'react'
import { signInAsGuest, signOut, subscribeToAuth } from '../services/authService'
import { getErrorMessage } from '../utils/validation'

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

  async function login() {
    setError('')

    try {
      await signInAsGuest()
    } catch (firebaseError) {
      setError(getErrorMessage(firebaseError, 'Inloggen is mislukt.'))
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
    login,
    logout,
  }
}
