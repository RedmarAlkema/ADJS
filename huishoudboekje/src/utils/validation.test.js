import { describe, expect, it } from 'vitest'
import {
  getErrorMessage,
  validateBudgetBook,
  validateExpense,
} from './validation'

describe('validation', () => {
  it('keurt een huishoudboekje zonder naam af', () => {
    expect(validateBudgetBook({ name: '   ' })).toBe(
      'Vul minimaal een naam in.',
    )
  })

  it('accepteert een huishoudboekje met naam', () => {
    expect(validateBudgetBook({ name: 'Gezin' })).toBe('')
  })

  it('keurt een uitgave zonder omschrijving af', () => {
    expect(
      validateExpense({
        title: '',
        amount: '12.50',
        date: '2026-05-26',
      }),
    ).toBe('Vul een omschrijving in.')
  })

  it('keurt een uitgave zonder positief bedrag af', () => {
    expect(
      validateExpense({
        title: 'Lunch',
        amount: '0',
        date: '2026-05-26',
      }),
    ).toBe('Vul een bedrag groter dan 0 in.')
  })

  it('keurt een uitgave zonder datum af', () => {
    expect(
      validateExpense({
        title: 'Lunch',
        amount: '12.50',
        date: '',
      }),
    ).toBe('Vul een datum in.')
  })

  it('accepteert een geldige uitgave', () => {
    expect(
      validateExpense({
        title: 'Lunch',
        amount: '12.50',
        date: '2026-05-26',
      }),
    ).toBe('')
  })

  it('gebruikt een fallback als een fout geen message heeft', () => {
    expect(getErrorMessage('kapot', 'Er ging iets mis.')).toBe(
      'Er ging iets mis.',
    )
  })
})
