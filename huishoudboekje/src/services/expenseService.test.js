import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpenseCategory,
} from './expenseService'

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  deleteDoc: vi.fn(),
  doc: vi.fn((db, collectionName, id) => ({ collectionName, db, id })),
  onSnapshot: vi.fn(),
  query: vi.fn((...parts) => ({ parts })),
  serverTimestamp: vi.fn(() => 'server-time'),
  updateDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
}))

vi.mock('firebase/firestore', () => firestoreMocks)

vi.mock('./firebase', () => ({
  db: { name: 'db' },
}))

function createDocumentSnapshot(id, data) {
  return {
    data: () => data,
    id,
  }
}

describe('expenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op uitgaven en sorteert nieuwste datum eerst', () => {
    const onChange = vi.fn()
    const onError = vi.fn()

    firestoreMocks.onSnapshot.mockImplementation((query, next) => {
      next({
        docs: [
          createDocumentSnapshot('old', {
            amount: '8',
            budgetBookId: 'book-1',
            category: 'Vervoer',
            createdAt: null,
            date: '2026-05-01',
            note: undefined,
            ownerId: 'user-1',
            title: 'Trein',
          }),
          createDocumentSnapshot('new', {
            amount: '12.50',
            budgetBookId: 'book-1',
            category: 'Eten',
            createdAt: { toDate: () => new Date('2026-05-26') },
            date: '2026-05-26',
            note: 'Met school',
            ownerId: 'user-1',
            title: 'Lunch',
          }),
        ],
      })
    })

    subscribeToExpenses('book-1', onChange, onError)

    expect(firestoreMocks.where).toHaveBeenCalledWith(
      'budgetBookId',
      '==',
      'book-1',
    )
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ amount: 12.5, id: 'new', title: 'Lunch' }),
      expect.objectContaining({ amount: 8, id: 'old', note: '' }),
    ])
    expect(firestoreMocks.onSnapshot).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
      onError,
    )
  })

  it('maakt een uitgave aan met opgeschoonde invoer', () => {
    createExpense({ id: 'book-1' }, 'user-1', {
      amount: '12.50',
      category: 'Eten',
      date: '2026-05-26',
      note: '  Met school  ',
      title: '  Lunch  ',
    })

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(expect.any(Object), {
      amount: 12.5,
      budgetBookId: 'book-1',
      category: 'Eten',
      createdAt: 'server-time',
      date: '2026-05-26',
      note: 'Met school',
      ownerId: 'user-1',
      title: 'Lunch',
    })
  })

  it('verwijdert een uitgave', () => {
    deleteExpense({ id: 'expense-1' })

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith({
      collectionName: 'expenses',
      db: { name: 'db' },
      id: 'expense-1',
    })
  })

  it('past de categorie van een uitgave aan', () => {
    updateExpenseCategory({ id: 'expense-1' }, 'Wonen')

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { collectionName: 'expenses', db: { name: 'db' }, id: 'expense-1' },
      { category: 'Wonen' },
    )
  })
})
