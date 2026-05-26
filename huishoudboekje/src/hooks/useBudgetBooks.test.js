import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveBudgetBook,
  createBudgetBook,
  restoreBudgetBook,
  subscribeToActiveBudgetBooks,
  subscribeToArchivedBudgetBooks,
  updateBudgetBook,
} from '../services/budgetBookService'
import { useBudgetBooks } from './useBudgetBooks'

vi.mock('../services/budgetBookService', () => ({
  archiveBudgetBook: vi.fn(),
  createBudgetBook: vi.fn(),
  restoreBudgetBook: vi.fn(),
  subscribeToActiveBudgetBooks: vi.fn(),
  subscribeToArchivedBudgetBooks: vi.fn(),
  updateBudgetBook: vi.fn(),
}))

const user = { uid: 'user-1' }
const book = { id: 'book-1', name: 'Gezin', ownerId: 'user-1' }

describe('useBudgetBooks hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    subscribeToActiveBudgetBooks.mockReturnValue(vi.fn())
    subscribeToArchivedBudgetBooks.mockReturnValue(vi.fn())
  })

  it('abonneert op actieve boekjes', async () => {
    subscribeToActiveBudgetBooks.mockImplementation((ownerId, onChange) => {
      onChange([book])
      return vi.fn()
    })
    subscribeToArchivedBudgetBooks.mockImplementation((ownerId, onChange) => {
      onChange([])
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
    expect(subscribeToArchivedBudgetBooks).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('maakt een nieuw boekje aan', async () => {
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
    archiveBudgetBook.mockRejectedValue(new Error('Archiveren kapot.'))

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await result.current.archiveBook(book)
    })

    expect(result.current.error).toBe('Archiveren kapot.')
  })

  it('herstelt een eigen boekje uit het archief', async () => {
    restoreBudgetBook.mockResolvedValue()

    const { result } = renderHook(() => useBudgetBooks(user))

    await act(async () => {
      await result.current.restoreBook({ ...book, archived: true })
    })

    expect(restoreBudgetBook).toHaveBeenCalledWith({ ...book, archived: true })
  })
})
