import { useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { CategoryDropBoard } from '../components/CategoryDropBoard'
import { ExpenseCharts } from '../components/ExpenseCharts'
import { ExpenseForm } from '../components/ExpenseForm'
import { ExpenseList } from '../components/ExpenseList'
import { ParticipantManager } from '../components/ParticipantManager'
import { SummaryCards } from '../components/SummaryCards'
import { useExpenses } from '../hooks/useExpenses'
import { useParticipants } from '../hooks/useParticipants'
import { expenseCategories } from '../utils/categories'

export function BookDetailPage({ book, user, onAddParticipant }) {
  const [categoryFilter, setCategoryFilter] = useState('Alle')
  const {
    expenses,
    loading,
    error,
    addExpense,
    removeExpense,
    changeExpenseCategory,
  } = useExpenses(book?.archived ? null : book, user)
  const isOwner = book?.ownerId === user?.uid
  const canManageExpenses = isOwner && !book?.archived
  const { error: participantsError, participants } = useParticipants(book, user)

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

  if (book.archived) {
    return (
      <section className="panel detail-panel" aria-labelledby="detail-title">
        <div className="section-heading">
          <div>
            <h2 id="detail-title">{book.name}</h2>
            <p>{book.description || 'Geen omschrijving toegevoegd.'}</p>
          </div>
        </div>

        <p className="archive-notice">
          Dit huishoudboekje staat in het archief. De inhoud is volledig
          verborgen totdat het boekje wordt hersteld.
        </p>
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
      <ExpenseCharts expenses={expenses} />
      <CategoryDropBoard
        disabled={!canManageExpenses}
        expenses={expenses}
        onDropExpense={changeExpenseCategory}
      />
      <Alert>{error || participantsError}</Alert>

      {isOwner && !book.archived ? (
        <ParticipantManager
          book={book}
          disabled={loading}
          onAddParticipant={onAddParticipant}
          participants={participants}
        />
      ) : null}

      {!canManageExpenses ? (
        <p className="archive-notice">
          Dit huishoudboekje is met jou gedeeld en is alleen-lezen.
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
          readOnly={!canManageExpenses}
        />
      )}
    </section>
  )
}
