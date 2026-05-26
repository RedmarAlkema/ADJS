import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryCards } from './SummaryCards'

describe('SummaryCards component', () => {
  it('toont totaal, aantal en grootste categorie', () => {
    render(
      <SummaryCards
        expenses={[
          { amount: 32.5, category: 'Boodschappen' },
          { amount: 40, category: 'Wonen' },
          { amount: 12.5, category: 'Boodschappen' },
        ]}
      />,
    )

    expect(screen.getByText('Totaal uitgegeven')).toBeInTheDocument()
    expect(screen.getByText('Aantal uitgaven')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
  })

  it('toont Geen als er nog geen uitgaven zijn', () => {
    render(<SummaryCards expenses={[]} />)

    expect(screen.getByText('Geen')).toBeInTheDocument()
  })
})
