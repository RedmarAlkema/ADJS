import { expenseCategories } from '../utils/categories'
import { getCategoryTotals, getTotalExpenses } from '../utils/expenseTotals'
import { formatCurrency } from '../utils/formatters'

export function SummaryCards({ expenses }) {
  const total = getTotalExpenses(expenses)
  const categoryTotals = getCategoryTotals(expenses)
  const highestCategory = expenseCategories
    .map((category) => ({
      category,
      total: categoryTotals[category] ?? 0,
    }))
    .sort((first, second) => second.total - first.total)[0]

  return (
    <div className="summary-grid" aria-label="Samenvatting">
      <article>
        <span>Totaal uitgegeven</span>
        <strong>{formatCurrency(total)}</strong>
      </article>
      <article>
        <span>Aantal uitgaven</span>
        <strong>{expenses.length}</strong>
      </article>
      <article>
        <span>Grootste categorie</span>
        <strong>
          {highestCategory?.total > 0 ? highestCategory.category : 'Geen'}
        </strong>
      </article>
    </div>
  )
}
