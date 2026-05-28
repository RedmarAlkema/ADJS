import {
  archiveBudgetBook,
  createBudgetBook,
  restoreBudgetBook,
  updateBudgetBook,
} from '../services/budgetBookService'
import { addBudgetBookParticipant } from '../services/participantService'
import { getErrorMessage, validateBudgetBook } from '../utils/validation'
import { useBudgetBookSubscriptions } from './useBudgetBookSubscriptions'

export function useBudgetBooks(user) {
  const { archivedBooks, budgetBooks, error, loading, setError } =
    useBudgetBookSubscriptions(user)

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

  async function addParticipant(book, email) {
    setError('')

    if (!user || book.ownerId !== user.uid) {
      const message = 'Alleen de eigenaar kan deelnemers toevoegen.'
      setError(message)
      throw new Error(message)
    }

    if (!email.trim()) {
      const message = 'Vul een e-mailadres in.'
      setError(message)
      throw new Error(message)
    }

    try {
      await addBudgetBookParticipant(book, email)
    } catch (firebaseError) {
      const message = getErrorMessage(
        firebaseError,
        'Deelnemer toevoegen is mislukt.',
      )
      setError(message)
      throw new Error(message, { cause: firebaseError })
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
    addParticipant,
  }
}
