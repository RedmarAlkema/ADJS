import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CategoryDropBoard } from './CategoryDropBoard'

const expenses = [
  {
    amount: 12,
    category: 'Boodschappen',
    id: 'expense-1',
  },
]

describe('CategoryDropBoard component', () => {
  it('toont categorieën met totalen', () => {
    render(
      <CategoryDropBoard
        disabled={false}
        expenses={expenses}
        onDropExpense={vi.fn()}
      />,
    )

    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    expect(screen.getByText('Wonen')).toBeInTheDocument()
  })

  it('roept de drop callback aan met uitgave en categorie', () => {
    const onDropExpense = vi.fn()
    const dataTransfer = {
      getData: vi.fn(() => 'expense-1'),
    }

    render(
      <CategoryDropBoard
        disabled={false}
        expenses={expenses}
        onDropExpense={onDropExpense}
      />,
    )

    fireEvent.drop(screen.getByText('Wonen').closest('.drop-card'), {
      dataTransfer,
    })

    expect(onDropExpense).toHaveBeenCalledWith(expenses[0], 'Wonen')
  })
})
