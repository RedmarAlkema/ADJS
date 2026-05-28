import { expenseCategories } from '../utils/categories'
import { getCategoryTotals } from '../utils/expenseTotals'
import { formatCurrency } from '../utils/formatters'

export function CategoryDropBoard({ disabled, expenses, onDropExpense }) {
  const totals = getCategoryTotals(expenses)

  function handleDrop(event, category) {
    event.preventDefault()

    const expenseId = event.dataTransfer.getData('text/plain')
    const expense = expenses.find((candidate) => candidate.id === expenseId)

    if (expense && !disabled) {
      onDropExpense(expense, category)
    }
  }

  return (
    <section className="category-drop-board" aria-labelledby="drop-title">
      <div className="section-heading compact-heading">
        <h2 id="drop-title">Categorieën</h2>
      </div>
      <div className="category-drop-grid">
        {expenseCategories.map((category) => (
          <div
            key={category}
            className={disabled ? 'drop-card disabled' : 'drop-card'}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, category)}
          >
            <strong>{category}</strong>
            <span>{formatCurrency(totals[category] ?? 0)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
