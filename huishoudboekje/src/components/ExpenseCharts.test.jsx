import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExpenseCharts } from './ExpenseCharts'

describe('ExpenseCharts component', () => {
  it('toont een lege staat zonder uitgaven', () => {
    render(<ExpenseCharts expenses={[]} />)

    expect(
      screen.getByText('Voeg uitgaven toe om grafieken te zien.'),
    ).toBeInTheDocument()
  })

  it('toont een lijn- en staafdiagram met labels', () => {
    render(
      <ExpenseCharts
        expenses={[
          { amount: 12.5, category: 'Boodschappen', date: '2026-05-26' },
          { amount: 40, category: 'Wonen', date: '2026-06-01' },
        ]}
      />,
    )

    expect(screen.getByLabelText('Lijngrafiek per dag')).toBeInTheDocument()
    expect(screen.getByLabelText('Staafdiagram per categorie')).toBeInTheDocument()
    expect(screen.getByText('2026-05-26')).toBeInTheDocument()
    expect(screen.getByText('Wonen')).toBeInTheDocument()
  })
})
