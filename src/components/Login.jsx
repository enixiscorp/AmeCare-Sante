import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Utiliser la même authentification que l'interface admin
      const { authenticateUser } = await import('../utils/auth')
      const result = await authenticateUser(email, password)

      if (result.success) {
        // Sauvegarder l'authentification
        localStorage.setItem('amecare_user_token', 'authenticated')
        localStorage.setItem('amecare_user_email', email)
        localStorage.setItem('amecare_user_id', result.userId)
        
        onLogin()
      } else {
        setError(result.error || 'Email ou mot de passe incorrect')
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🏥</span>
          </div>
          <h1>AmeCare Santé</h1>
          <p>Générateur de Facture</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">📧 Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-info">
            Accès sécurisé à la plateforme AmeCare
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
