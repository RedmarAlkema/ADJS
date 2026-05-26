import { useState } from 'react'
import { expenseCategories } from '../utils/categories'
import { todayAsInputValue } from '../utils/formatters'

const initialValues = {
  title: '',
  amount: '',
  category: expenseCategories[0],
  date: todayAsInputValue(),
  note: '',
}

export function ExpenseForm({ disabled, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!values.title.trim()) {
      setError('Vul een omschrijving in.')
      return
    }

    if (!values.amount || Number(values.amount) <= 0) {
      setError('Vul een bedrag groter dan 0 in.')
      return
    }

    setSaving(true)

    try {
      await onSubmit(values)
      setValues({
        ...initialValues,
        date: todayAsInputValue(),
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Uitgave
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={updateField}
            placeholder="Lunch, huur, trein..."
            disabled={disabled}
          />
        </label>

        <label>
          Bedrag
          <input
            type="number"
            name="amount"
            value={values.amount}
            onChange={updateField}
            min="0"
            step="0.01"
            placeholder="0,00"
            disabled={disabled}
          />
        </label>

        <label>
          Categorie
          <select
            name="category"
            value={values.category}
            onChange={updateField}
            disabled={disabled}
          >
            {expenseCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          Datum
          <input
            type="date"
            name="date"
            value={values.date}
            onChange={updateField}
            disabled={disabled}
          />
        </label>
      </div>

      <label>
        Notitie
        <input
          type="text"
          name="note"
          value={values.note}
          onChange={updateField}
          placeholder="Optioneel"
          disabled={disabled}
        />
      </label>

      {error ? <p className="field-error">{error}</p> : null}

      <button type="submit" className="primary-button" disabled={disabled || saving}>
        {saving ? 'Toevoegen...' : 'Uitgave toevoegen'}
      </button>
    </form>
  )
}
