import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveBudgetBook,
  createBudgetBook,
  restoreBudgetBook,
  subscribeToActiveBudgetBooks,
  subscribeToArchivedBudgetBooks,
  updateBudgetBook,
} from './budgetBookService'

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  doc: vi.fn((db, collectionName, id) => ({ collectionName, db, id })),
  documentId: vi.fn(() => '__name__'),
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

describe('budgetBookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op actieve boekjes en sorteert nieuwste eerst', () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    const olderDate = new Date('2026-05-01')
    const newerDate = new Date('2026-05-26')

    firestoreMocks.onSnapshot.mockImplementation((query, next) => {
      next({
        docs: [
          createDocumentSnapshot('old', {
            archived: false,
            createdAt: { toDate: () => olderDate },
            description: undefined,
            name: 'Oud',
            ownerId: 'user-1',
            updatedAt: { toDate: () => olderDate },
          }),
          createDocumentSnapshot('new', {
            archived: false,
            createdAt: { toDate: () => newerDate },
            description: 'Nieuwste boek',
            name: 'Nieuw',
            ownerId: 'user-1',
            updatedAt: { toDate: () => newerDate },
          }),
        ],
      })
    })

    subscribeToActiveBudgetBooks('user-1', onChange, onError)

    expect(firestoreMocks.where).toHaveBeenCalledWith('ownerId', '==', 'user-1')
    expect(firestoreMocks.where).toHaveBeenCalledWith('archived', '==', false)
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'new', name: 'Nieuw' }),
      expect.objectContaining({ description: '', id: 'old', name: 'Oud' }),
    ])
    expect(firestoreMocks.onSnapshot).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
      onError,
    )
  })

  it('maakt een boekje aan met opgeschoonde invoer', () => {
    createBudgetBook('user-1', {
      description: '  Maandelijkse kosten  ',
      name: '  Gezin  ',
    })

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(expect.any(Object), {
      archived: false,
      createdAt: 'server-time',
      description: 'Maandelijkse kosten',
      name: 'Gezin',
      ownerId: 'user-1',
      updatedAt: 'server-time',
    })
  })

  it('abonneert op gearchiveerde boekjes', () => {
    const onChange = vi.fn()
    const onError = vi.fn()

    firestoreMocks.onSnapshot.mockImplementation((query, next) => {
      next({ docs: [] })
    })

    subscribeToArchivedBudgetBooks('user-1', onChange, onError)

    expect(firestoreMocks.where).toHaveBeenCalledWith('archived', '==', true)
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('werkt een bestaand boekje bij', () => {
    updateBudgetBook(
      { id: 'book-1' },
      { description: '  Nieuw  ', name: '  Gezin  ' },
    )

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { collectionName: 'budgetBooks', db: { name: 'db' }, id: 'book-1' },
      {
        description: 'Nieuw',
        name: 'Gezin',
        updatedAt: 'server-time',
      },
    )
  })

  it('archiveert een boekje', () => {
    archiveBudgetBook({ id: 'book-1' })

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { collectionName: 'budgetBooks', db: { name: 'db' }, id: 'book-1' },
      {
        archived: true,
        updatedAt: 'server-time',
      },
    )
  })

  it('herstelt een boekje', () => {
    restoreBudgetBook({ id: 'book-1' })

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { collectionName: 'budgetBooks', db: { name: 'db' }, id: 'book-1' },
      {
        archived: false,
        updatedAt: 'server-time',
      },
    )
  })

})
