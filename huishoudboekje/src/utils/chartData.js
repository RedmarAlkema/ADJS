export function getDailyExpenseTotals(expenses) {
  return Object.entries(
    expenses.reduce((totals, expense) => {
      totals[expense.date] = (totals[expense.date] ?? 0) + expense.amount
      return totals
    }, {}),
  )
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, total]) => ({ label: date, total }))
}

export function getCategoryExpenseTotals(expenses) {
  return Object.entries(
    expenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount
      return totals
    }, {}),
  )
    .sort(([, firstTotal], [, secondTotal]) => secondTotal - firstTotal)
    .map(([category, total]) => ({ label: category, total }))
}
