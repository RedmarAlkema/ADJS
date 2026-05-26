import { formatCurrency, formatDate } from '../utils/formatters'

export function ExpenseList({ expenses, onDelete, readOnly = false }) {
  if (expenses.length === 0) {
    return <p className="empty-state">Nog geen uitgaven in dit boekje.</p>
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <div>
            <strong>{expense.title}</strong>
            <span>
              {expense.category} · {formatDate(expense.date)}
            </span>
            {expense.note ? <small>{expense.note}</small> : null}
          </div>
          <div className="expense-amount">
            <strong>{formatCurrency(expense.amount)}</strong>
            {readOnly ? null : (
              <button
                type="button"
                className="ghost-button"
                onClick={() => onDelete(expense)}
              >
                Verwijder
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
