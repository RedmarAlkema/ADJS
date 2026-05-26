import { Alert } from '../components/Alert'

export function LoginPage({ error, loading, onLogin }) {
  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="eyebrow">Huishoudboekje</p>
        <h1>Beheer boekjes en uitgaven realtime</h1>
        <p>
          Log in als gast om veilig met je eigen Firebase-data te werken. Elk
          boekje wordt gekoppeld aan jouw gebruiker.
        </p>
        <button
          type="button"
          className="primary-button"
          disabled={loading}
          onClick={onLogin}
        >
          {loading ? 'Laden...' : 'Start als gast'}
        </button>
        <Alert>{error}</Alert>
      </section>
    </main>
  )
}
