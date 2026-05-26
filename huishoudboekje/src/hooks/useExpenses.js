import { useEffect, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
} from '../services/expenseService'

export function useExpenses(book, user) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(Boolean(book && user))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!book || !user) {
      return undefined
    }

    return subscribeToExpenses(
      book.id,
      user.uid,
      (nextExpenses) => {
        setExpenses(nextExpenses)
        setLoading(false)
      },
      (firebaseError) => {
        setError(firebaseError.message)
        setLoading(false)
      },
    )
  }, [book, user])

  async function addExpense(values) {
    setError('')

    if (!book || !user) {
      setError('Kies eerst een huishoudboekje.')
      return
    }

    await createExpense(book, user.uid, values)
  }

  async function removeExpense(expense) {
    setError('')

    if (expense.ownerId !== user.uid) {
      setError('Je kunt alleen je eigen uitgaven verwijderen.')
      return
    }

    await deleteExpense(expense)
  }

  return {
    expenses: book && user ? expenses : [],
    loading: Boolean(book && user) && loading,
    error,
    addExpense,
    removeExpense,
  }
}
