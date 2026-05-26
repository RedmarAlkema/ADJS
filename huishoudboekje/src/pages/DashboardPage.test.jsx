import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useBudgetBooks } from '../hooks/useBudgetBooks'
import { DashboardPage } from './DashboardPage'

vi.mock('../hooks/useBudgetBooks', () => ({
  useBudgetBooks: vi.fn(),
}))

vi.mock('./BookDetailPage', () => ({
  BookDetailPage: ({ book }) => (
    <section data-testid="book-detail">{book?.name ?? 'Geen boek'}</section>
  ),
}))

const books = [
  {
    id: 'book-1',
    name: 'Gezin',
    description: 'Maandelijkse kosten',
    ownerId: 'user-1',
  },
  {
    id: 'book-2',
    name: 'Vakantie',
    description: '',
    ownerId: 'user-1',
  },
]
const archivedBooks = [
  {
    id: 'book-3',
    name: 'Oud boekje',
    description: 'Gearchiveerd',
    ownerId: 'user-1',
    archived: true,
  },
]

function mockBudgetBooks(overrides = {}) {
  useBudgetBooks.mockReturnValue({
    archiveBook: vi.fn(),
    archivedBooks: [],
    budgetBooks: books,
    error: '',
    loading: false,
    restoreBook: vi.fn(),
    saveBudgetBook: vi.fn(),
    ...overrides,
  })
}

describe('DashboardPage page', () => {
  it('toont de eerste beschikbare boekselectie', () => {
    mockBudgetBooks()

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    expect(screen.getByTestId('book-detail')).toHaveTextContent('Gezin')
  })

  it('kan een boek selecteren en archiveren', async () => {
    const archiveBook = vi.fn().mockResolvedValue()
    mockBudgetBooks({ archiveBook })

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Vakantie/ }))
    expect(screen.getByTestId('book-detail')).toHaveTextContent('Vakantie')

    fireEvent.click(screen.getAllByRole('button', { name: 'Archiveer' })[1])

    await waitFor(() => {
      expect(archiveBook).toHaveBeenCalledWith(books[1])
    })
  })

  it('toont loading en foutmelding voor huishoudboekjes', () => {
    mockBudgetBooks({
      archivedBooks: [],
      budgetBooks: [],
      error: 'Huishoudboekjes laden is mislukt.',
      loading: true,
    })

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    expect(screen.getByText('Huishoudboekjes laden...')).toBeInTheDocument()
    expect(
      screen.getByText('Huishoudboekjes laden is mislukt.'),
    ).toBeInTheDocument()
  })

  it('slaat een nieuw boekje op en selecteert het resultaat', async () => {
    const saveBudgetBook = vi.fn().mockResolvedValue('book-2')
    mockBudgetBooks({ saveBudgetBook })

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Naam'), {
      target: { value: 'Vakantie' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await waitFor(() => {
      expect(saveBudgetBook).toHaveBeenCalledWith(
        { description: '', name: 'Vakantie' },
        null,
      )
      expect(screen.getByTestId('book-detail')).toHaveTextContent('Vakantie')
    })
  })

  it('zet een boekje in bewerkmodus en kan annuleren', () => {
    mockBudgetBooks()

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Bewerk' })[0])
    expect(screen.getByDisplayValue('Gezin')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Annuleren' }))

    expect(screen.getByLabelText('Naam')).toHaveValue('')
  })

  it('toont een archiveerfout uit de actie', async () => {
    mockBudgetBooks({
      archiveBook: vi.fn().mockRejectedValue(new Error('Archiveren mislukt.')),
    })

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Archiveer' })[0])

    expect(await screen.findByText('Archiveren mislukt.')).toBeInTheDocument()
  })

  it('toont het archief en kan een boekje herstellen', async () => {
    const restoreBook = vi.fn().mockResolvedValue()
    mockBudgetBooks({ archivedBooks, restoreBook })

    render(<DashboardPage user={{ uid: 'user-1' }} onSignOut={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Archief' }))

    expect(screen.getByText('1 gearchiveerd')).toBeInTheDocument()
    expect(screen.getByTestId('book-detail')).toHaveTextContent('Oud boekje')

    fireEvent.click(screen.getByRole('button', { name: 'Herstel' }))

    await waitFor(() => {
      expect(restoreBook).toHaveBeenCalledWith(archivedBooks[0])
    })
  })
})
