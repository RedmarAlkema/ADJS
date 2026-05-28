import { useEffect, useState } from 'react'
import { subscribeToBudgetBookParticipants } from '../services/participantService'
import { getErrorMessage } from '../utils/validation'

export function useParticipants(book, user) {
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!book || !user || book.ownerId !== user.uid) {
      return undefined
    }

    return subscribeToBudgetBookParticipants(
      book.id,
      setParticipants,
      (firebaseError) => {
        setError(getErrorMessage(firebaseError, 'Deelnemers laden is mislukt.'))
      },
    )
  }, [book, user])

  return {
    error,
    participants,
  }
}
