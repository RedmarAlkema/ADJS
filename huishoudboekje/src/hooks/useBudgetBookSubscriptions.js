import { useEffect, useState } from 'react'
import {
  subscribeToActiveBudgetBooks,
  subscribeToArchivedBudgetBooks,
  subscribeToBudgetBooksByIds,
} from '../services/budgetBookService'
import { subscribeToParticipantLinks } from '../services/participantService'
import { getErrorMessage } from '../utils/validation'

function mergeBooks(firstBooks, secondBooks) {
  return [...firstBooks, ...secondBooks]
    .filter(
      (book, index, books) =>
        books.findIndex((candidate) => candidate.id === book.id) === index,
    )
    .sort((first, second) => second.createdAt - first.createdAt)
}

export function useBudgetBookSubscriptions(user) {
  const [budgetBooks, setBudgetBooks] = useState([])
  const [archivedBooks, setArchivedBooks] = useState([])
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      return undefined
    }

    let ownedActiveBooks = []
    let sharedActiveBooks = []
    let ownedArchivedBooks = []
    let sharedArchivedBooks = []
    let unsubscribeSharedActiveBooks = () => {}
    let unsubscribeSharedArchivedBooks = () => {}
    const loaded = {
      ownedActive: false,
      ownedArchive: false,
      sharedActive: !user.email,
      sharedArchive: !user.email,
    }

    function finishLoading() {
      if (Object.values(loaded).every(Boolean)) {
        setLoading(false)
      }
    }

    function updateActiveBooks() {
      setBudgetBooks(mergeBooks(ownedActiveBooks, sharedActiveBooks))
    }

    function updateArchivedBooks() {
      setArchivedBooks(mergeBooks(ownedArchivedBooks, sharedArchivedBooks))
    }

    const unsubscribeActiveBooks = subscribeToActiveBudgetBooks(
      user.uid,
      (books) => {
        ownedActiveBooks = books
        loaded.ownedActive = true
        updateActiveBooks()
        finishLoading()
      },
      (firebaseError) => {
        setError(
          getErrorMessage(
            firebaseError,
            'Huishoudboekjes laden is mislukt.',
          ),
        )
        setLoading(false)
      },
    )

    const unsubscribeArchivedBooks = subscribeToArchivedBudgetBooks(
      user.uid,
      (books) => {
        ownedArchivedBooks = books
        loaded.ownedArchive = true
        updateArchivedBooks()
        finishLoading()
      },
      (firebaseError) => {
        setError(getErrorMessage(firebaseError, 'Archief laden is mislukt.'))
        setLoading(false)
      },
    )

    const unsubscribeParticipantLinks = user.email
      ? subscribeToParticipantLinks(
          user.email,
          (links) => {
            const bookIds = links.map((link) => link.budgetBookId)

            unsubscribeSharedActiveBooks()
            unsubscribeSharedArchivedBooks()

            unsubscribeSharedActiveBooks = subscribeToBudgetBooksByIds(
              bookIds,
              false,
              (books) => {
                sharedActiveBooks = books
                loaded.sharedActive = true
                updateActiveBooks()
                finishLoading()
              },
              (firebaseError) => {
                setError(
                  getErrorMessage(
                    firebaseError,
                    'Gedeelde huishoudboekjes laden is mislukt.',
                  ),
                )
                setLoading(false)
              },
            )

            unsubscribeSharedArchivedBooks = subscribeToBudgetBooksByIds(
              bookIds,
              true,
              (books) => {
                sharedArchivedBooks = books
                loaded.sharedArchive = true
                updateArchivedBooks()
                finishLoading()
              },
              (firebaseError) => {
                setError(
                  getErrorMessage(
                    firebaseError,
                    'Gedeeld archief laden is mislukt.',
                  ),
                )
                setLoading(false)
              },
            )
          },
          (firebaseError) => {
            setError(
              getErrorMessage(firebaseError, 'Deelnemers laden is mislukt.'),
            )
            setLoading(false)
          },
        )
      : null

    return () => {
      unsubscribeActiveBooks()
      unsubscribeArchivedBooks()
      unsubscribeParticipantLinks?.()
      unsubscribeSharedActiveBooks()
      unsubscribeSharedArchivedBooks()
    }
  }, [user])

  return {
    archivedBooks: user ? archivedBooks : [],
    budgetBooks: user ? budgetBooks : [],
    error,
    loading: Boolean(user) && loading,
    setError,
  }
}
