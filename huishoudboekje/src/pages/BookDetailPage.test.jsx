import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExpenses } from '../hooks/useExpenses'
import { useParticipants } from '../hooks/useParticipants'
import { BookDetailPage } from './BookDetailPage'

vi.mock('../hooks/useExpenses', () => ({
  useExpenses: vi.fn(),
}))

vi.mock('../hooks/useParticipants', () => ({
  useParticipants: vi.fn(),
}))

const book = {
  id: 'book-1',
  name: 'Gezin',
  description: 'Maandelijkse kosten',
  ownerId: 'user-1',
  participantEmails: [],
}

describe('BookDetailPage page', () => {
  beforeEach(() => {
    useParticipants.mockReturnValue({
      error: '',
      participants: [],
    })
  })

  it('vraagt om een boekje als er geen selectie is', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
      changeExpenseCategory: vi.fn(),
      error: '',
      expenses: [],
      loading: false,
      removeExpense: vi.fn(),
    })

    render(<BookDetailPage book={null} user={{ uid: 'user-1' }} />)

    expect(screen.getByText('Selecteer een huishoudboekje.')).toBeInTheDocument()
  })

  it('toont boekgegevens en filtert uitgaven per categorie', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
      changeExpenseCategory: vi.fn(),
      error: '',
      expenses: [
        {
          id: 'expense-1',
          title: 'Lunch',
          category: 'Eten',
          amount: 12,
          date: '2026-05-26',
          note: '',
        },
        {
          id: 'expense-2',
          title: 'Huur',
          category: 'Wonen',
          amount: 700,
          date: '2026-05-01',
          note: '',
        },
      ],
      loading: false,
      removeExpense: vi.fn(),
    })

    render(<BookDetailPage book={book} user={{ uid: 'user-1' }} />)

    expect(screen.getByRole('heading', { name: 'Gezin' })).toBeInTheDocument()
    fireEvent.change(screen.getAllByLabelText('Categorie').at(-1), {
      target: { value: 'Wonen' },
    })

    expect(screen.queryByText('Lunch')).not.toBeInTheDocument()
    expect(screen.getByText('Huur')).toBeInTheDocument()
  })

  it('toont loading en foutmelding uit de hook', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
      changeExpenseCategory: vi.fn(),
      error: 'Uitgaven laden is mislukt.',
      expenses: [],
      loading: true,
      removeExpense: vi.fn(),
    })

    render(<BookDetailPage book={book} user={{ uid: 'user-1' }} />)

    expect(screen.getByText('Uitgaven laden is mislukt.')).toBeInTheDocument()
    expect(screen.getByText('Uitgaven laden...')).toBeInTheDocument()
  })

  it('verbergt de inhoud van een gearchiveerd boekje', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
      changeExpenseCategory: vi.fn(),
      error: '',
      expenses: [
        {
          id: 'expense-1',
          title: 'Verborgen uitgave',
          category: 'Wonen',
          amount: 700,
          date: '2026-05-01',
          note: '',
        },
      ],
      loading: false,
      removeExpense: vi.fn(),
    })

    render(
      <BookDetailPage
        book={{ ...book, archived: true }}
        user={{ uid: 'user-1' }}
      />,
    )

    expect(
      screen.getByText(/De inhoud is volledig verborgen/),
    ).toBeInTheDocument()
    expect(screen.queryByText('Verborgen uitgave')).not.toBeInTheDocument()
    expect(screen.queryByText('Uitgaven')).not.toBeInTheDocument()
  })
})
