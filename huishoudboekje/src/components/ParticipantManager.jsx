import { useState } from 'react'
import { getErrorMessage } from '../utils/validation'

export function ParticipantManager({
  book,
  disabled,
  onAddParticipant,
  participants = [],
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vul een e-mailadres in.')
      return
    }

    setSaving(true)

    try {
      await onAddParticipant(book, email)
      setEmail('')
    } catch (submitError) {
      setError(
        getErrorMessage(submitError, 'Deelnemer toevoegen is mislukt.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="participants-panel" aria-labelledby="participants-title">
      <div className="section-heading compact-heading">
        <h2 id="participants-title">Deelnemers</h2>
        <span>{participants.length} gedeeld</span>
      </div>

      {participants.length > 0 ? (
        <ul className="participant-list">
          {participants.map((participant) => (
            <li key={participant.email}>{participant.email}</li>
          ))}
        </ul>
      ) : (
        <p className="muted-text">Nog geen deelnemers toegevoegd.</p>
      )}

      <form className="participant-form" onSubmit={handleSubmit}>
        <label>
          E-mailadres deelnemer
          <input
            type="email"
            name="participantEmail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="deelnemer@example.com"
            disabled={disabled || saving}
          />
        </label>

        {error ? <p className="field-error">{error}</p> : null}

        <button
          type="submit"
          className="ghost-button"
          disabled={disabled || saving}
        >
          {saving ? 'Toevoegen...' : 'Deelnemer toevoegen'}
        </button>
      </form>
    </section>
  )
}
