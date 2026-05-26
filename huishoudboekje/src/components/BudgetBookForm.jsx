import { useState } from 'react'
import { getErrorMessage, validateBudgetBook } from '../utils/validation'

const initialValues = {
  name: '',
  description: '',
}

export function BudgetBookForm({ selectedBook, onCancel, onSubmit }) {
  const [values, setValues] = useState(
    selectedBook
      ? {
          name: selectedBook.name,
          description: selectedBook.description,
        }
      : initialValues,
  )
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

    const validationError = validateBudgetBook(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      await onSubmit(values)
      setValues(initialValues)
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'Huishoudboekje opslaan is mislukt.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <h2>{selectedBook ? 'Huishoudboekje aanpassen' : 'Nieuw boekje'}</h2>
        {selectedBook ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Annuleren
          </button>
        ) : null}
      </div>

      <label>
        Naam
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={updateField}
          placeholder="Bijvoorbeeld: Gezin"
          maxLength="60"
        />
      </label>

      <label>
        Omschrijving
        <textarea
          name="description"
          value={values.description}
          onChange={updateField}
          placeholder="Waar gebruik je dit boekje voor?"
          rows="4"
          maxLength="220"
        />
      </label>

      {error ? <p className="field-error">{error}</p> : null}

      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? 'Opslaan...' : 'Opslaan'}
      </button>
    </form>
  )
}
