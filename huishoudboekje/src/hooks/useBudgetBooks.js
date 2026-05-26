import { useEffect, useState } from 'react'
import {
  archiveBudgetBook,
  createBudgetBook,
  subscribeToActiveBudgetBooks,
  updateBudgetBook,
} from '../services/budgetBookService'

export function useBudgetBooks(user) {
  const [budgetBooks, setBudgetBooks] = useState([])
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      return undefined
    }

    return subscribeToActiveBudgetBooks(
      user.uid,
      (books) => {
        setBudgetBooks(books)
        setLoading(false)
      },
      (firebaseError) => {
        setError(firebaseError.message)
        setLoading(false)
      },
    )
  }, [user])

  async function saveBudgetBook(values, selectedBook) {
    setError('')

    if (!user) {
      setError('Je moet ingelogd zijn om een huishoudboekje op te slaan.')
      return null
    }

    if (selectedBook) {
      if (selectedBook.ownerId !== user.uid) {
        setError('Je kunt alleen eigen huishoudboekjes aanpassen.')
        return null
      }

      await updateBudgetBook(selectedBook, values)
      return selectedBook.id
    }

    const createdBook = await createBudgetBook(user.uid, values)
    return createdBook.id
  }

  async function archiveBook(book) {
    setError('')

    if (book.ownerId !== user.uid) {
      setError('Je kunt alleen eigen huishoudboekjes archiveren.')
      return
    }

    await archiveBudgetBook(book)
  }

  return {
    budgetBooks: user ? budgetBooks : [],
    loading: Boolean(user) && loading,
    error,
    saveBudgetBook,
    archiveBook,
  }
}
