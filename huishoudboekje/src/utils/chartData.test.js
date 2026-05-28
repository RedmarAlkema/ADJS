import { describe, expect, it } from 'vitest'
import { getCategoryExpenseTotals, getDailyExpenseTotals } from './chartData'

const expenses = [
  { amount: 12.5, category: 'Boodschappen', date: '2026-05-26' },
  { amount: 40, category: 'Wonen', date: '2026-05-01' },
  { amount: 7.5, category: 'Boodschappen', date: '2026-06-02' },
]

describe('chart data', () => {
  it('groepeert uitgaven per dag op volgorde', () => {
    expect(getDailyExpenseTotals(expenses)).toEqual([
      { label: '2026-05-01', total: 40 },
      { label: '2026-05-26', total: 12.5 },
      { label: '2026-06-02', total: 7.5 },
    ])
  })

  it('groepeert uitgaven per categorie van hoog naar laag', () => {
    expect(getCategoryExpenseTotals(expenses)).toEqual([
      { label: 'Wonen', total: 40 },
      { label: 'Boodschappen', total: 20 },
    ])
  })
})
