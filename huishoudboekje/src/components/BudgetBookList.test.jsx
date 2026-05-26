import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BudgetBookList } from './BudgetBookList'

const books = [
  {
    id: 'book-1',
    name: 'Gezin',
    description: 'Maandelijkse kosten',
  },
  {
    id: 'book-2',
    name: 'Vakantie',
    description: '',
  },
]

describe('BudgetBookList component', () => {
  it('toont een lege staat zonder boekjes', () => {
    render(
      <BudgetBookList
        budgetBooks={[]}
        selectedBook={null}
        onArchive={vi.fn()}
        onEdit={vi.fn()}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('Maak je eerste huishoudboekje aan.')).toBeInTheDocument()
  })

  it('toont boekjes en hun actieve status', () => {
    render(
      <BudgetBookList
        budgetBooks={books}
        selectedBook={books[0]}
        onArchive={vi.fn()}
        onEdit={vi.fn()}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('2 actief')).toBeInTheDocument()
    expect(screen.getByText('Gezin')).toBeInTheDocument()
    expect(screen.getByText('Geen omschrijving')).toBeInTheDocument()
  })

  it('roept callbacks aan voor selecteren, bewerken en archiveren', () => {
    const onArchive = vi.fn()
    const onEdit = vi.fn()
    const onSelect = vi.fn()

    render(
      <BudgetBookList
        budgetBooks={books}
        selectedBook={books[0]}
        onArchive={onArchive}
        onEdit={onEdit}
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Gezin/ }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Bewerk' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Archiveer' })[0])

    expect(onSelect).toHaveBeenCalledWith(books[0])
    expect(onEdit).toHaveBeenCalledWith(books[0])
    expect(onArchive).toHaveBeenCalledWith(books[0])
  })
})
