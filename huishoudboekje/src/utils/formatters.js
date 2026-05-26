export function formatCurrency(value) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatDate(date) {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function todayAsInputValue() {
  return new Date().toISOString().slice(0, 10)
}
