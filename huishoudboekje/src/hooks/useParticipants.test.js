import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { subscribeToBudgetBookParticipants } from '../services/participantService'
import { useParticipants } from './useParticipants'

vi.mock('../services/participantService', () => ({
  subscribeToBudgetBookParticipants: vi.fn(),
}))

const book = {
  id: 'book-1',
  ownerId: 'user-1',
}

const user = {
  uid: 'user-1',
}

describe('useParticipants hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('abonneert op deelnemers voor de eigenaar', async () => {
    const participants = [{ email: 'deelnemer@example.com' }]
    subscribeToBudgetBookParticipants.mockImplementation((bookId, onChange) => {
      onChange(participants)
      return vi.fn()
    })

    const { result } = renderHook(() => useParticipants(book, user))

    await waitFor(() => {
      expect(result.current.participants).toEqual(participants)
    })
    expect(subscribeToBudgetBookParticipants).toHaveBeenCalledWith(
      'book-1',
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('abonneert niet voor een deelnemer zonder eigenaarrechten', () => {
    renderHook(() => useParticipants(book, { uid: 'user-2' }))

    expect(subscribeToBudgetBookParticipants).not.toHaveBeenCalled()
  })

  it('toont een laadfout', async () => {
    subscribeToBudgetBookParticipants.mockImplementation(
      (bookId, onChange, onError) => {
        onError(new Error('Geen toegang.'))
        return vi.fn()
      },
    )

    const { result } = renderHook(() => useParticipants(book, user))

    await waitFor(() => {
      expect(result.current.error).toBe('Geen toegang.')
    })
  })
})
