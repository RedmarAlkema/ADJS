import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ParticipantManager } from './ParticipantManager'

const book = {
  id: 'book-1',
}
const participants = [{ email: 'deelnemer@example.com' }]

describe('ParticipantManager component', () => {
  it('toont bestaande deelnemers', () => {
    render(
      <ParticipantManager
        book={book}
        disabled={false}
        onAddParticipant={vi.fn()}
        participants={participants}
      />,
    )

    expect(screen.getByText('deelnemer@example.com')).toBeInTheDocument()
    expect(screen.getByText('1 gedeeld')).toBeInTheDocument()
  })

  it('valideert dat een e-mailadres verplicht is', async () => {
    render(
      <ParticipantManager
        book={{ ...book, participantEmails: [] }}
        disabled={false}
        onAddParticipant={vi.fn()}
        participants={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Deelnemer toevoegen' }))

    expect(await screen.findByText('Vul een e-mailadres in.')).toBeInTheDocument()
  })

  it('voegt een deelnemer toe', async () => {
    const onAddParticipant = vi.fn().mockResolvedValue()

    render(
      <ParticipantManager
        book={book}
        disabled={false}
        onAddParticipant={onAddParticipant}
        participants={participants}
      />,
    )

    fireEvent.change(screen.getByLabelText('E-mailadres deelnemer'), {
      target: { value: 'nieuw@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Deelnemer toevoegen' }))

    await waitFor(() => {
      expect(onAddParticipant).toHaveBeenCalledWith(book, 'nieuw@example.com')
    })
  })
})
