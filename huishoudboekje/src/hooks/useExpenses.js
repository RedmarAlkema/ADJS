import { useEffect, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpenseCategory,
} from '../services/expenseService'
import { expenseCategories } from '../utils/categories'
import { getErrorMessage, validateExpense } from '../utils/validation'

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
      (nextExpenses) => {
        setExpenses(nextExpenses)
        setLoading(false)
      },
      (firebaseError) => {
        setError(getErrorMessage(firebaseError, 'Uitgaven laden is mislukt.'))
        setLoading(false)
      },
    )
  }, [book, user])

  async function addExpense(values) {
    setError('')

    if (!book || !user) {
      const message = 'Kies eerst een huishoudboekje.'
      setError(message)
      throw new Error(message)
    }

    const validationError = validateExpense(values)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    try {
      await createExpense(book, user.uid, values)
    } catch (firebaseError) {
      const message = getErrorMessage(
        firebaseError,
        'Uitgave opslaan is mislukt.',
      )
      setError(message)
      throw new Error(message, { cause: firebaseError })
    }
  }

  async function removeExpense(expense) {
    setError('')

    if (!user || expense.ownerId !== user.uid) {
      const message = 'Je kunt alleen je eigen uitgaven verwijderen.'
      setError(message)
      return
    }

    try {
      await deleteExpense(expense)
    } catch (firebaseError) {
      setError(
        getErrorMessage(firebaseError, 'Uitgave verwijderen is mislukt.'),
      )
    }
  }

  async function changeExpenseCategory(expense, category) {
    setError('')

    if (!user || expense.ownerId !== user.uid) {
      setError('Je kunt alleen je eigen uitgaven aanpassen.')
      return
    }

    if (!expenseCategories.includes(category)) {
      setError('Kies een geldige categorie.')
      return
    }

    try {
      await updateExpenseCategory(expense, category)
    } catch (firebaseError) {
      setError(
        getErrorMessage(firebaseError, 'Categorie aanpassen is mislukt.'),
      )
    }
  }

  return {
    expenses: book && user ? expenses : [],
    loading: Boolean(book && user) && loading,
    error,
    addExpense,
    removeExpense,
    changeExpenseCategory,
  }
}
