import { describe, expect, it } from 'vitest'
import { getCategoryTotals, getTotalExpenses } from './expenseTotals'

describe('expense totals', () => {
  it('berekent het totaal van alle uitgaven', () => {
    const expenses = [
      { amount: 12.5, category: 'Boodschappen' },
      { amount: 40, category: 'Wonen' },
      { amount: 7.25, category: 'Boodschappen' },
    ]

    expect(getTotalExpenses(expenses)).toBe(59.75)
  })

  it('groepeert totalen per categorie', () => {
    const expenses = [
      { amount: 12.5, category: 'Boodschappen' },
      { amount: 40, category: 'Wonen' },
      { amount: 7.25, category: 'Boodschappen' },
    ]

    expect(getCategoryTotals(expenses)).toEqual({
      Boodschappen: 19.75,
      Wonen: 40,
    })
  })
})
