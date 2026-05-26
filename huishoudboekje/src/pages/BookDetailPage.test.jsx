import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useExpenses } from '../hooks/useExpenses'
import { BookDetailPage } from './BookDetailPage'

vi.mock('../hooks/useExpenses', () => ({
  useExpenses: vi.fn(),
}))

const book = {
  id: 'book-1',
  name: 'Gezin',
  description: 'Maandelijkse kosten',
}

describe('BookDetailPage page', () => {
  it('vraagt om een boekje als er geen selectie is', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
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
    fireEvent.change(screen.getAllByLabelText('Categorie')[1], {
      target: { value: 'Wonen' },
    })

    expect(screen.queryByText('Lunch')).not.toBeInTheDocument()
    expect(screen.getByText('Huur')).toBeInTheDocument()
  })

  it('toont loading en foutmelding uit de hook', () => {
    useExpenses.mockReturnValue({
      addExpense: vi.fn(),
      error: 'Uitgaven laden is mislukt.',
      expenses: [],
      loading: true,
      removeExpense: vi.fn(),
    })

    render(<BookDetailPage book={book} user={{ uid: 'user-1' }} />)

    expect(screen.getByText('Uitgaven laden is mislukt.')).toBeInTheDocument()
    expect(screen.getByText('Uitgaven laden...')).toBeInTheDocument()
  })
})
