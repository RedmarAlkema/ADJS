import { useAuth } from './hooks/useAuth'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import './App.css'

function App() {
  const { user, loading, error, loginAsGuest, loginWithEmail, logout, register } =
    useAuth()

  if (!user) {
    return (
      <LoginPage
        error={error}
        loading={loading}
        onGuestLogin={loginAsGuest}
        onLogin={loginWithEmail}
        onRegister={register}
      />
    )
  }

  return <DashboardPage user={user} onSignOut={logout} />
}

export default App
