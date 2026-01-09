import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import App from './App'
import { isAuthenticated, logout } from './utils/auth'

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      setAuthenticated(authStatus)
      setChecking(false)
    }

    checkAuth()
    
    // Vérifier périodiquement l'authentification (toutes les 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Vérification de l'authentification...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Composant pour la route de login
const LoginRoute = ({ onLogin }) => {
  const navigate = useNavigate()

  useEffect(() => {
    // Si déjà authentifié, rediriger vers l'application
    if (isAuthenticated()) {
      navigate('/app', { replace: true })
    }
  }, [navigate])

  const handleLogin = () => {
    onLogin()
    navigate('/app', { replace: true })
  }

  if (isAuthenticated()) {
    return <Navigate to="/app" replace />
  }

  return <Login onLogin={handleLogin} />
}

function AppRouter() {
  const [isAuth, setIsAuth] = useState(isAuthenticated())

  useEffect(() => {
    // Écouter les changements d'authentification
    const checkAuth = () => {
      setIsAuth(isAuthenticated())
    }

    // Vérifier au chargement
    checkAuth()

    // Écouter le storage pour les changements depuis d'autres onglets
    window.addEventListener('storage', checkAuth)
    
    // Vérifier périodiquement
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      clearInterval(interval)
    }
  }, [])

  const handleLogin = () => {
    setIsAuth(true)
  }

  const handleLogout = () => {
    logout()
    setIsAuth(false)
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginRoute onLogin={handleLogin} />} 
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <App onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuth ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  )
}

export default AppRouter
