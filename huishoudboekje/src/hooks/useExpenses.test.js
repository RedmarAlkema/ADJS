import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpenseCategory,
} from '../services/expenseService'
import { useExpenses } from './useExpenses'

vi.mock('../services/expenseService', () => ({
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
  subscribeToExpenses: vi.fn(),
  updateExpenseCategory: vi.fn(),
}))

const book = { id: 'book-1' }
const user = { uid: 'user-1' }
const expense = {
  id: 'expense-1',
  title: 'Lunch',
  amount: 12,
  ownerId: 'user-1',
}

describe('useExpenses hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op uitgaven voor boek en gebruiker', async () => {
    subscribeToExpenses.mockImplementation((bookId, onChange) => {
      onChange([expense])
      return vi.fn()
    })

    const { result } = renderHook(() => useExpenses(book, user))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.expenses).toEqual([expense])
    })
  })

  it('maakt een geldige uitgave aan', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())
    createExpense.mockResolvedValue()

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await result.current.addExpense({
        title: 'Lunch',
        amount: '12',
        date: '2026-05-26',
      })
    })

    expect(createExpense).toHaveBeenCalledWith(book, 'user-1', {
      title: 'Lunch',
      amount: '12',
      date: '2026-05-26',
    })
  })

  it('weigert een ongeldige uitgave', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await expect(
        result.current.addExpense({
          title: '',
          amount: '12',
          date: '2026-05-26',
        }),
      ).rejects.toThrow('Vul een omschrijving in.')
    })
  })

  it('verwijdert een eigen uitgave', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())
    deleteExpense.mockResolvedValue()

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await result.current.removeExpense(expense)
    })

    expect(deleteExpense).toHaveBeenCalledWith(expense)
  })

  it('weigert verwijderen van een uitgave van iemand anders', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await result.current.removeExpense({ ...expense, ownerId: 'user-2' })
    })

    expect(result.current.error).toBe('Je kunt alleen je eigen uitgaven verwijderen.')
    expect(deleteExpense).not.toHaveBeenCalled()
  })

  it('toont laadfout vanuit de subscription', async () => {
    subscribeToExpenses.mockImplementation((bookId, onChange, onError) => {
      onError(new Error('Geen uitgaven.'))
      return vi.fn()
    })

    const { result } = renderHook(() => useExpenses(book, user))

    await waitFor(() => {
      expect(result.current.error).toBe('Geen uitgaven.')
      expect(result.current.loading).toBe(false)
    })
  })

  it('weigert toevoegen zonder boekje', async () => {
    const { result } = renderHook(() => useExpenses(null, user))

    await act(async () => {
      await expect(
        result.current.addExpense({
          amount: '12',
          date: '2026-05-26',
          title: 'Lunch',
        }),
      ).rejects.toThrow('Kies eerst een huishoudboekje.')
    })
  })

  it('toont create- en delete-fouten', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())
    createExpense.mockRejectedValueOnce(new Error('Create kapot.'))
    deleteExpense.mockRejectedValueOnce(new Error('Delete kapot.'))

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await expect(
        result.current.addExpense({
          amount: '12',
          date: '2026-05-26',
          title: 'Lunch',
        }),
      ).rejects.toThrow('Create kapot.')
      await result.current.removeExpense(expense)
    })

    expect(result.current.error).toBe('Delete kapot.')
  })

  it('past een categorie aan via drag-and-drop actie', async () => {
    subscribeToExpenses.mockReturnValue(vi.fn())
    updateExpenseCategory.mockResolvedValue()

    const { result } = renderHook(() => useExpenses(book, user))

    await act(async () => {
      await result.current.changeExpenseCategory(expense, 'Wonen')
    })

    expect(updateExpenseCategory).toHaveBeenCalledWith(expense, 'Wonen')
  })
})
