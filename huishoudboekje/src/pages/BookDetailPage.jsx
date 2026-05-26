import { useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseList } from '../components/ExpenseList'
import { SummaryCards } from '../components/SummaryCards'
import { useExpenses } from '../hooks/useExpenses'
import { expenseCategories } from '../utils/categories'

export function BookDetailPage({ book, user }) {
  const [categoryFilter, setCategoryFilter] = useState('Alle')
  const { expenses, loading, error, addExpense, removeExpense } = useExpenses(
    book,
    user,
  )

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'Alle') {
      return expenses
    }

    return expenses.filter((expense) => expense.category === categoryFilter)
  }, [categoryFilter, expenses])

  if (!book) {
    return (
      <section className="panel detail-panel">
        <p className="empty-state">Selecteer een huishoudboekje.</p>
      </section>
    )
  }

  return (
    <section className="panel detail-panel" aria-labelledby="detail-title">
      <div className="section-heading">
        <div>
          <h2 id="detail-title">{book.name}</h2>
          <p>{book.description || 'Geen omschrijving toegevoegd.'}</p>
        </div>
      </div>

      <SummaryCards expenses={expenses} />
      <Alert>{error}</Alert>

      {book.archived ? (
        <p className="archive-notice">
          Dit huishoudboekje staat in het archief en is alleen-lezen.
        </p>
      ) : (
        <ExpenseForm disabled={loading} onSubmit={addExpense} />
      )}

      <div className="section-heading compact-heading">
        <h2>Uitgaven</h2>
        <label className="inline-filter">
          Categorie
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option>Alle</option>
            {expenseCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="empty-state">Uitgaven laden...</p>
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          onDelete={removeExpense}
          readOnly={book.archived}
        />
      )}
    </section>
  )
}
