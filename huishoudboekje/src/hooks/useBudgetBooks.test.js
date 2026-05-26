import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveBudgetBook,
  createBudgetBook,
  subscribeToActiveBudgetBooks,
  updateBudgetBook,
} from '../services/budgetBookService'
import { useBudgetBooks } from './useBudgetBooks'

vi.mock('../services/budgetBookService', () => ({
  archiveBudgetBook: vi.fn(),
  createBudgetBook: vi.fn(),
  subscribeToActiveBudgetBooks: vi.fn(),
  updateBudgetBook: vi.fn(),
}))

const user = { uid: 'user-1' }
const book = { id: 'book-1', name: 'Gezin', ownerId: 'user-1' }

describe('useBudgetBooks hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op actieve boekjes', async () => {
    subscribeToActiveBudgetBooks.mockImplementation((ownerId, onChange) => {
      onChange([book])
      return vi.fn()
    })

    const { result } = renderHook(() => useBudgetBooks(user))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.budgetBooks).toEqual([book])
    })
    expect(subscribeToActiveBudgetBooks).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('maakt een nieuw boekje aan', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    createBudgetBook.mockResolvedValue({ id: 'book-2' })

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await expect(
        result.current.saveBudgetBook({ name: 'Vakantie', description: '' }),
      ).resolves.toBe('book-2')
    })

    expect(createBudgetBook).toHaveBeenCalledWith('user-1', {
      name: 'Vakantie',
      description: '',
    })
  })

  it('werkt een eigen boekje bij', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    updateBudgetBook.mockResolvedValue()

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await expect(
        result.current.saveBudgetBook(
          { name: 'Gezin nieuw', description: '' },
          book,
        ),
      ).resolves.toBe('book-1')
    })

    expect(updateBudgetBook).toHaveBeenCalled()
  })

  it('weigert aanpassen van een boekje van iemand anders', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await expect(
        result.current.saveBudgetBook(
          { name: 'Ander boek', description: '' },
          { ...book, ownerId: 'user-2' },
        ),
      ).rejects.toThrow('Je kunt alleen eigen huishoudboekjes aanpassen.')
    })
  })

  it('archiveert een eigen boekje', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    archiveBudgetBook.mockResolvedValue()

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await result.current.archiveBook(book)
    })

    expect(archiveBudgetBook).toHaveBeenCalledWith(book)
  })

  it('toont laadfout vanuit de subscription', async () => {
    subscribeToActiveBudgetBooks.mockImplementation((ownerId, onChange, onError) => {
      onError(new Error('Geen boekjes.'))
      return vi.fn()
    })

    const { result } = renderHook(() => useBudgetBooks(user))

    await waitFor(() => {
      expect(result.current.error).toBe('Geen boekjes.')
      expect(result.current.loading).toBe(false)
    })
  })

  it('weigert opslaan zonder gebruiker', async () => {
    const { result } = renderHook(() => useBudgetBooks(null))

    await act(async () => {
      await expect(
        result.current.saveBudgetBook({ name: 'Gezin', description: '' }),
      ).rejects.toThrow('Je moet ingelogd zijn')
    })
  })

  it('toont create- en update-fouten', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    createBudgetBook.mockRejectedValueOnce(new Error('Create kapot.'))
    updateBudgetBook.mockRejectedValueOnce(new Error('Update kapot.'))

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await expect(
        result.current.saveBudgetBook({ name: 'Gezin', description: '' }),
      ).rejects.toThrow('Create kapot.')
      await expect(
        result.current.saveBudgetBook(
          { name: 'Gezin', description: '' },
          book,
        ),
      ).rejects.toThrow('Update kapot.')
    })
  })

  it('weigert archiveren van andermans boekje', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await result.current.archiveBook({ ...book, ownerId: 'user-2' })
    })

    expect(result.current.error).toBe(
      'Je kunt alleen eigen huishoudboekjes archiveren.',
    )
    expect(archiveBudgetBook).not.toHaveBeenCalled()
  })

  it('toont archiveerfouten', async () => {
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    archiveBudgetBook.mockRejectedValue(new Error('Archiveren kapot.'))

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await result.current.archiveBook(book)
    })

    expect(result.current.error).toBe('Archiveren kapot.')
  })
})
