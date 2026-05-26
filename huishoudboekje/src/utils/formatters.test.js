import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate } from './formatters'

describe('formatters', () => {
  it('formatteert bedragen als euro', () => {
    expect(formatCurrency(12.5)).toBe('€ 12,50')
  })

  it('formatteert datums voor Nederlandse gebruikers', () => {
    expect(formatDate('2026-05-26')).toContain('2026')
  })

  it('geeft een lege tekst terug zonder datum', () => {
    expect(formatDate('')).toBe('')
  })
})
