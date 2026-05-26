export function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export function validateBudgetBook(values) {
  if (!values.name.trim()) {
    return 'Vul minimaal een naam in.'
  }

  return ''
}

export function validateExpense(values) {
  if (!values.title.trim()) {
    return 'Vul een omschrijving in.'
  }

  if (!values.amount || Number(values.amount) <= 0) {
    return 'Vul een bedrag groter dan 0 in.'
  }

  if (!values.date) {
    return 'Vul een datum in.'
  }

  return ''
}
