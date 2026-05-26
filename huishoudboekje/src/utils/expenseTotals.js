export function getTotalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function getCategoryTotals(expenses) {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount
    return totals
  }, {})
}
