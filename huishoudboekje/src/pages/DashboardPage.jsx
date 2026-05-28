import { useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { AppHeader } from '../components/AppHeader'
import { BudgetBookForm } from '../components/BudgetBookForm'
import { BudgetBookList } from '../components/BudgetBookList'
import { useBudgetBooks } from '../hooks/useBudgetBooks'
import { BookDetailPage } from './BookDetailPage'

export function DashboardPage({ user, onSignOut }) {
  const [bookView, setBookView] = useState('active')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [editingBook, setEditingBook] = useState(null)
  const [actionError, setActionError] = useState('')
  const {
    archivedBooks,
    budgetBooks,
    loading,
    error,
    saveBudgetBook,
    archiveBook,
    restoreBook,
    addParticipant,
  } = useBudgetBooks(user)
  const visibleBooks = bookView === 'archive' ? archivedBooks : budgetBooks

  const selectedBook = useMemo(
    () => visibleBooks.find((book) => book.id === selectedBookId) ?? null,
    [visibleBooks, selectedBookId],
  )
  const visibleBook = selectedBook ?? visibleBooks[0] ?? null

  async function handleSaveBudgetBook(values) {
    setActionError('')
    const savedBookId = await saveBudgetBook(values, editingBook)
    setEditingBook(null)

    if (savedBookId) {
      setSelectedBookId(savedBookId)
    }
  }

  async function handleArchive(book) {
    setActionError('')

    try {
      await archiveBook(book)

      if (book.id === selectedBookId) {
        setSelectedBookId('')
      }
    } catch (archiveError) {
      setActionError(archiveError.message)
    }
  }

  async function handleRestore(book) {
    setActionError('')

    try {
      await restoreBook(book)

      if (book.id === selectedBookId) {
        setSelectedBookId('')
      }
    } catch (restoreError) {
      setActionError(restoreError.message)
    }
  }

  function handleViewChange(nextView) {
    setBookView(nextView)
    setSelectedBookId('')
    setEditingBook(null)
    setActionError('')
  }

  return (
    <div className="app-shell">
      <AppHeader user={user} onSignOut={onSignOut} />

      <main className="dashboard-grid">
        <aside className="sidebar">
          {bookView === 'active' ? (
            <BudgetBookForm
              key={editingBook?.id ?? 'new-budget-book'}
              selectedBook={editingBook}
              onCancel={() => setEditingBook(null)}
              onSubmit={handleSaveBudgetBook}
            />
          ) : null}

          <div className="panel view-tabs" aria-label="Boekjes weergave">
            <button
              type="button"
              className={bookView === 'active' ? 'selected' : ''}
              onClick={() => handleViewChange('active')}
            >
              Actief
            </button>
            <button
              type="button"
              className={bookView === 'archive' ? 'selected' : ''}
              onClick={() => handleViewChange('archive')}
            >
              Archief
            </button>
          </div>

          <Alert>{error || actionError}</Alert>

          {loading ? (
            <section className="panel">
              <p className="empty-state">Huishoudboekjes laden...</p>
            </section>
          ) : (
            <BudgetBookList
              budgetBooks={visibleBooks}
              countLabel={bookView === 'archive' ? 'gearchiveerd' : 'actief'}
              currentUserId={user.uid}
              emptyMessage={
                bookView === 'archive'
                  ? 'Je archief is leeg.'
                  : 'Maak je eerste huishoudboekje aan.'
              }
              isArchive={bookView === 'archive'}
              selectedBook={visibleBook}
              onArchive={handleArchive}
              onEdit={setEditingBook}
              onRestore={handleRestore}
              onSelect={(book) => setSelectedBookId(book.id)}
              title={bookView === 'archive' ? 'Archief' : 'Huishoudboekjes'}
            />
          )}
        </aside>

        <BookDetailPage
          book={visibleBook}
          user={user}
          onAddParticipant={addParticipant}
        />
      </main>
    </div>
  )
}
