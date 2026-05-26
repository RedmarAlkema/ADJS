export function AppHeader({ user, onSignOut }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">ADWEB Huishoudboekje</p>
        <h1>Grip op je uitgaven</h1>
      </div>
      {user ? (
        <div className="user-menu" aria-label="Gebruiker">
          <span>{user.uid.slice(0, 8)}</span>
          <button type="button" className="ghost-button" onClick={onSignOut}>
            Uitloggen
          </button>
        </div>
      ) : null}
    </header>
  )
}
