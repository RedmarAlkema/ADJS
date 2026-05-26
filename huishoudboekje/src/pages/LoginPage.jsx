import { useState } from 'react'
import { Alert } from '../components/Alert'
import { getErrorMessage, validateEmailLogin } from '../utils/validation'

const initialValues = {
  email: '',
  password: '',
}

export function LoginPage({
  error,
  loading,
  onGuestLogin,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState('login')
  const [values, setValues] = useState(initialValues)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const validationError = validateEmailLogin(values)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'register') {
        await onRegister(values)
      } else {
        await onLogin(values)
      }
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Inloggen is mislukt.'))
    } finally {
      setSubmitting(false)
    }
  }

  const busy = loading || submitting

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="eyebrow">Huishoudboekje</p>
        <h1>Beheer boekjes en uitgaven realtime</h1>
        <p>
          Log in met e-mail of start als gast. Elk boekje wordt gekoppeld aan
          jouw Firebase-gebruiker.
        </p>

        <div className="auth-tabs" aria-label="Authenticatie keuze">
          <button
            type="button"
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => setMode('login')}
          >
            Inloggen
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'selected' : ''}
            onClick={() => setMode('register')}
          >
            Account maken
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            E-mailadres
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={updateField}
              placeholder="naam@example.com"
              autoComplete="email"
              disabled={busy}
            />
          </label>

          <label>
            Wachtwoord
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={updateField}
              placeholder="Minimaal 6 tekens"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              disabled={busy}
            />
          </label>

          {formError ? <p className="field-error">{formError}</p> : null}

          <button type="submit" className="primary-button" disabled={busy}>
            {busy
              ? 'Laden...'
              : mode === 'register'
                ? 'Account maken'
                : 'Inloggen'}
          </button>
        </form>

        <div className="auth-divider">
          <span>of</span>
        </div>

        <button
          type="button"
          className="ghost-button guest-login-button"
          disabled={busy}
          onClick={onGuestLogin}
        >
          Start als gast
        </button>
        <Alert>{error}</Alert>
      </section>
    </main>
  )
}
