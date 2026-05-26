import { useEffect, useState } from 'react'
import {
  archiveBudgetBook,
  createBudgetBook,
  subscribeToActiveBudgetBooks,
  subscribeToArchivedBudgetBooks,
  restoreBudgetBook,
  updateBudgetBook,
} from '../services/budgetBookService'
import { getErrorMessage, validateBudgetBook } from '../utils/validation'

export function useBudgetBooks(user) {
  const [budgetBooks, setBudgetBooks] = useState([])
  const [archivedBooks, setArchivedBooks] = useState([])
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      return undefined
    }

    let activeLoaded = false
    let archiveLoaded = false

    function finishLoading() {
      if (activeLoaded && archiveLoaded) {
        setLoading(false)
      }
    }

    const unsubscribeActiveBooks = subscribeToActiveBudgetBooks(
      user.uid,
      (books) => {
        setBudgetBooks(books)
        activeLoaded = true
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
        setArchivedBooks(books)
        archiveLoaded = true
        finishLoading()
      },
      (firebaseError) => {
        setError(
          getErrorMessage(firebaseError, 'Archief laden is mislukt.'),
        )
        setLoading(false)
      },
    )

    return () => {
      unsubscribeActiveBooks()
      unsubscribeArchivedBooks()
    }
  }, [user])

  async function saveBudgetBook(values, selectedBook) {
    setError('')

    if (!user) {
      const message = 'Je moet ingelogd zijn om een huishoudboekje op te slaan.'
      setError(message)
      throw new Error(message)
    }

    const validationError = validateBudgetBook(values)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    if (selectedBook) {
      if (selectedBook.ownerId !== user.uid) {
        const message = 'Je kunt alleen eigen huishoudboekjes aanpassen.'
        setError(message)
        throw new Error(message)
      }

      try {
        await updateBudgetBook(selectedBook, values)
      } catch (firebaseError) {
        const message = getErrorMessage(
          firebaseError,
          'Huishoudboekje aanpassen is mislukt.',
        )
        setError(message)
        throw new Error(message, { cause: firebaseError })
      }

      return selectedBook.id
    }

    try {
      const createdBook = await createBudgetBook(user.uid, values)
      return createdBook.id
    } catch (firebaseError) {
      const message = getErrorMessage(
        firebaseError,
        'Huishoudboekje aanmaken is mislukt.',
      )
      setError(message)
      throw new Error(message, { cause: firebaseError })
    }
  }

  async function archiveBook(book) {
    setError('')

    if (!user || book.ownerId !== user.uid) {
      setError('Je kunt alleen eigen huishoudboekjes archiveren.')
      return
    }

    try {
      await archiveBudgetBook(book)
    } catch (firebaseError) {
      setError(
        getErrorMessage(firebaseError, 'Huishoudboekje archiveren is mislukt.'),
      )
    }
  }

  async function restoreBook(book) {
    setError('')

    if (!user || book.ownerId !== user.uid) {
      setError('Je kunt alleen eigen huishoudboekjes herstellen.')
      return
    }

    try {
      await restoreBudgetBook(book)
    } catch (firebaseError) {
      setError(
        getErrorMessage(firebaseError, 'Huishoudboekje herstellen is mislukt.'),
      )
    }
  }

  return {
    budgetBooks: user ? budgetBooks : [],
    archivedBooks: user ? archivedBooks : [],
    loading: Boolean(user) && loading,
    error,
    saveBudgetBook,
    archiveBook,
    restoreBook,
  }
}
