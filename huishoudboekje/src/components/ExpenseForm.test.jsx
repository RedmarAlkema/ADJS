import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExpenseForm } from './ExpenseForm'

describe('ExpenseForm component', () => {
  it('valideert dat een omschrijving verplicht is', async () => {
    render(<ExpenseForm disabled={false} onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Uitgave toevoegen' }))

    expect(await screen.findByText('Vul een omschrijving in.')).toBeInTheDocument()
  })

  it('valideert dat het bedrag positief is', async () => {
    render(<ExpenseForm disabled={false} onSubmit={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Uitgave'), {
      target: { value: 'Lunch' },
    })
    fireEvent.change(screen.getByLabelText('Bedrag'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Uitgave toevoegen' }))

    expect(
      await screen.findByText('Vul een bedrag groter dan 0 in.'),
    ).toBeInTheDocument()
  })

  it('stuurt ingevulde waarden door bij toevoegen', async () => {
    const onSubmit = vi.fn().mockResolvedValue()

    render(<ExpenseForm disabled={false} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Uitgave'), {
      target: { value: 'Lunch' },
    })
    fireEvent.change(screen.getByLabelText('Bedrag'), {
      target: { value: '12.50' },
    })
    fireEvent.change(screen.getByLabelText('Notitie'), {
      target: { value: 'Met school' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Uitgave toevoegen' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Lunch',
          amount: '12.50',
          note: 'Met school',
        }),
      )
    })
  })

  it('toont een submit-fout zonder het formulier te resetten', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Opslaan mislukt.'))

    render(<ExpenseForm disabled={false} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Uitgave'), {
      target: { value: 'Lunch' },
    })
    fireEvent.change(screen.getByLabelText('Bedrag'), {
      target: { value: '12.50' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Uitgave toevoegen' }))

    expect(await screen.findByText('Opslaan mislukt.')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Lunch')).toBeInTheDocument()
  })
})
