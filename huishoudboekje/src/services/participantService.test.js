import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addBudgetBookParticipant,
  normalizeParticipantEmail,
  subscribeToBudgetBookParticipants,
  subscribeToParticipantLinks,
} from './participantService'

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((db, ...path) => ({ db, path })),
  collectionGroup: vi.fn((db, name) => ({ db, name })),
  doc: vi.fn((db, ...path) => ({ db, path })),
  onSnapshot: vi.fn(),
  query: vi.fn((...parts) => ({ parts })),
  serverTimestamp: vi.fn(() => 'server-time'),
  setDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
}))

vi.mock('firebase/firestore', () => firestoreMocks)

vi.mock('./firebase', () => ({
  db: { name: 'db' },
}))

function participantSnapshot(email = 'deelnemer@example.com') {
  return {
    docs: [
      {
        data: () => ({
          budgetBookId: 'book-1',
          email,
          ownerId: 'owner-1',
        }),
      },
    ],
  }
}

describe('participantService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normaliseert e-mailadressen', () => {
    expect(normalizeParticipantEmail(' Deelnemer@Example.com ')).toBe(
      'deelnemer@example.com',
    )
  })

  it('abonneert op deelnemer-links voor een e-mailadres', () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    firestoreMocks.onSnapshot.mockImplementation((query, next) => {
      next(participantSnapshot())
    })

    subscribeToParticipantLinks(' Deelnemer@Example.com ', onChange, onError)

    expect(firestoreMocks.collectionGroup).toHaveBeenCalledWith(
      { name: 'db' },
      'participants',
    )
    expect(firestoreMocks.where).toHaveBeenCalledWith(
      'email',
      '==',
      'deelnemer@example.com',
    )
    expect(onChange).toHaveBeenCalledWith([
      {
        budgetBookId: 'book-1',
        email: 'deelnemer@example.com',
        ownerId: 'owner-1',
      },
    ])
  })

  it('abonneert op deelnemers van een boekje', () => {
    const onChange = vi.fn()
    firestoreMocks.onSnapshot.mockImplementation((query, next) => {
      next(participantSnapshot())
    })

    subscribeToBudgetBookParticipants('book-1', onChange, vi.fn())

    expect(firestoreMocks.collection).toHaveBeenCalledWith(
      { name: 'db' },
      'budgetBooks',
      'book-1',
      'participants',
    )
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ email: 'deelnemer@example.com' }),
    ])
  })

  it('voegt een deelnemer toe aan een boekje', () => {
    addBudgetBookParticipant(
      { id: 'book-1', ownerId: 'owner-1' },
      ' Deelnemer@Example.com ',
    )

    expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
      {
        db: { name: 'db' },
        path: ['budgetBooks', 'book-1', 'participants', 'deelnemer@example.com'],
      },
      {
        budgetBookId: 'book-1',
        createdAt: 'server-time',
        email: 'deelnemer@example.com',
        ownerId: 'owner-1',
      },
    )
  })
})
