import { useAuth } from './hooks/useAuth'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import './App.css'

function App() {
  const { user, loading, error, login, logout } = useAuth()

  if (!user) {
    return <LoginPage error={error} loading={loading} onLogin={login} />
  }

  return <DashboardPage user={user} onSignOut={logout} />
}

export default App
