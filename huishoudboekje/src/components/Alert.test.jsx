import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

describe('Alert component', () => {
  it('toont geen melding zonder inhoud', () => {
    const { container } = render(<Alert />)

    expect(container).toBeEmptyDOMElement()
  })

  it('toont een foutmelding met alert styling', () => {
    render(<Alert>Er ging iets mis.</Alert>)

    expect(screen.getByText('Er ging iets mis.')).toHaveClass('alert')
  })
})
