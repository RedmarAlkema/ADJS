import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BudgetBookForm } from './BudgetBookForm'

describe('BudgetBookForm component', () => {
  it('valideert dat een naam verplicht is', async () => {
    render(
      <BudgetBookForm
        selectedBook={null}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    expect(await screen.findByText('Vul minimaal een naam in.')).toBeInTheDocument()
  })

  it('stuurt ingevulde waarden door bij opslaan', async () => {
    const onSubmit = vi.fn().mockResolvedValue()

    render(
      <BudgetBookForm
        selectedBook={null}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Naam'), {
      target: { value: 'Gezin' },
    })
    fireEvent.change(screen.getByLabelText('Omschrijving'), {
      target: { value: 'Vaste lasten' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Gezin',
        description: 'Vaste lasten',
      })
    })
  })

  it('vult bestaande waarden en ondersteunt annuleren bij bewerken', () => {
    const onCancel = vi.fn()

    render(
      <BudgetBookForm
        selectedBook={{ id: 'book-1', name: 'Vakantie', description: 'Zomer' }}
        onCancel={onCancel}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Vakantie')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Zomer')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Annuleren' }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('toont een submit-fout zonder de invoer te wissen', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Opslaan mislukt.'))

    render(
      <BudgetBookForm
        selectedBook={null}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByLabelText('Naam'), {
      target: { value: 'Gezin' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    expect(await screen.findByText('Opslaan mislukt.')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Gezin')).toBeInTheDocument()
  })
})
