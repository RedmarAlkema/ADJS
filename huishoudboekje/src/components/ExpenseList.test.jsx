import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExpenseList } from './ExpenseList'

describe('ExpenseList component', () => {
  it('toont een lege staat zonder uitgaven', () => {
    render(<ExpenseList expenses={[]} onDelete={vi.fn()} />)

    expect(
      screen.getByText('Nog geen uitgaven in dit boekje.'),
    ).toBeInTheDocument()
  })

  it('toont uitgaven en geeft de gekozen uitgave terug bij verwijderen', () => {
    const expense = {
      id: 'expense-1',
      title: 'Lunch',
      category: 'Eten',
      amount: 12.5,
      date: '2026-05-26',
      note: 'Met school',
    }
    const onDelete = vi.fn()

    render(<ExpenseList expenses={[expense]} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verwijder' }))

    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('Met school')).toBeInTheDocument()
    expect(onDelete).toHaveBeenCalledWith(expense)
  })

  it('laat de notitie weg als een uitgave geen notitie heeft', () => {
    render(
      <ExpenseList
        expenses={[
          {
            id: 'expense-1',
            title: 'Trein',
            category: 'Vervoer',
            amount: 6,
            date: '2026-05-26',
            note: '',
          },
        ]}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Trein')).toBeInTheDocument()
    expect(screen.queryByText('Met school')).not.toBeInTheDocument()
  })
})
