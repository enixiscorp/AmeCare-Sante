import React, { useState, useEffect } from 'react'
import './Login.css'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { authenticateUser, verify2FACode } = await import('../utils/auth')
      
      if (requires2FA && twoFactorCode) {
        // Vérifier le code 2FA
        const result = await verify2FACode(adminData.id, twoFactorCode)
        
        if (result.success) {
          // Sauvegarder l'authentification
          localStorage.setItem('amecare_user_token', 'authenticated')
          localStorage.setItem('amecare_user_email', result.email)
          localStorage.setItem('amecare_user_id', result.userId)
          
          onLogin()
        } else {
          setError(result.error || 'Code d\'authentification invalide')
        }
      } else {
        // Première étape : vérifier email et mot de passe
        const result = await authenticateUser(email, password)

        if (result.requires2FA) {
          // Le 2FA est requis
          setRequires2FA(true)
          setAdminData(result.admin)
          setError('')
        } else if (result.success) {
          // Connexion réussie sans 2FA
          localStorage.setItem('amecare_user_token', 'authenticated')
          localStorage.setItem('amecare_user_email', email)
          localStorage.setItem('amecare_user_id', result.userId)
          
          onLogin()
        } else {
          setError(result.error || 'Email ou mot de passe incorrect')
        }
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
              required={!requires2FA}
              disabled={loading || requires2FA}
              autoComplete="current-password"
            />
          </div>

          {requires2FA && (
            <div className="form-group two-factor-group">
              <label htmlFor="twoFactorCode">🔐 Code d'authentification à deux facteurs</label>
              <p className="two-factor-info">
                Ouvrez Google Authenticator et entrez le code à 6 chiffres
              </p>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
                autoComplete="off"
                className="two-factor-input"
                autoFocus
              />
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setAdminData(null)
                }}
                disabled={loading}
              >
                ← Retour
              </button>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading 
              ? 'Vérification...' 
              : requires2FA 
                ? 'Vérifier le code 2FA' 
                : 'Se connecter'}
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
