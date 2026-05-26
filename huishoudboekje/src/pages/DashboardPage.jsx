import { useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { AppHeader } from '../components/AppHeader'
import { BudgetBookForm } from '../components/BudgetBookForm'
import { BudgetBookList } from '../components/BudgetBookList'
import { useBudgetBooks } from '../hooks/useBudgetBooks'
import { BookDetailPage } from './BookDetailPage'

export function DashboardPage({ user, onSignOut }) {
  const [selectedBookId, setSelectedBookId] = useState('')
  const [editingBook, setEditingBook] = useState(null)
  const [actionError, setActionError] = useState('')
  const { budgetBooks, loading, error, saveBudgetBook, archiveBook } =
    useBudgetBooks(user)

  const selectedBook = useMemo(
    () => budgetBooks.find((book) => book.id === selectedBookId) ?? null,
    [budgetBooks, selectedBookId],
  )
  const visibleBook = selectedBook ?? budgetBooks[0] ?? null

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

  return (
    <div className="app-shell">
      <AppHeader user={user} onSignOut={onSignOut} />

      <main className="dashboard-grid">
        <aside className="sidebar">
          <BudgetBookForm
            key={editingBook?.id ?? 'new-budget-book'}
            selectedBook={editingBook}
            onCancel={() => setEditingBook(null)}
            onSubmit={handleSaveBudgetBook}
          />

          <Alert>{error || actionError}</Alert>

          {loading ? (
            <section className="panel">
              <p className="empty-state">Huishoudboekjes laden...</p>
            </section>
          ) : (
            <BudgetBookList
              budgetBooks={budgetBooks}
              selectedBook={visibleBook}
              onArchive={handleArchive}
              onEdit={setEditingBook}
              onSelect={(book) => setSelectedBookId(book.id)}
            />
          )}
        </aside>

        <BookDetailPage book={visibleBook} user={user} />
      </main>
    </div>
  )
}
