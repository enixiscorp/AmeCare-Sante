import supabase from './supabaseClient'

/**
 * Authentifie un utilisateur avec email et mot de passe
 * Utilise uniquement l'Edge Function Supabase (pas de bcrypt côté client)
 */
export const authenticateUser = async (email, password) => {
  try {
    // Vérifier si Supabase est configuré
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase n\'est pas configuré. Veuillez configurer les variables d\'environnement.',
      }
    }

    // Appeler l'Edge Function Supabase pour vérifier le mot de passe
    const { data: result, error: functionError } = await supabase.functions.invoke('verify-password', {
      body: { email, password },
    })

    if (functionError) {
      console.error('Erreur Edge Function:', functionError)
      
      // Détecter si c'est une erreur 404 (fonction non déployée)
      if (functionError.status === 404 || functionError.message?.includes('NOT_FOUND') || functionError.code === 'NOT_FOUND') {
        return {
          success: false,
          error: 'L\'Edge Function verify-password n\'est pas encore déployée. Veuillez la déployer dans Supabase (voir DEPLOY_EDGE_FUNCTION.md)',
          requires2FA: false,
          edgeFunctionNotDeployed: true,
        }
      }
      
      return {
        success: false,
        error: 'Erreur de connexion. Veuillez vérifier que l\'Edge Function verify-password est déployée et configurée correctement.',
        requires2FA: false,
      }
    }

    if (result && result.success) {
      // Vérifier si le 2FA est requis
      if (result.requires2FA && result.admin?.two_factor_enabled) {
        return {
          success: false,
          requires2FA: true,
          adminId: result.admin.id,
          admin: result.admin,
          error: 'Code d\'authentification à deux facteurs requis',
        }
      }

      // Connexion réussie sans 2FA
      return {
        success: true,
        userId: result.admin.id,
        email: result.admin.email,
        user: result.admin,
        requires2FA: false,
      }
    } else {
      return {
        success: false,
        error: result?.error || 'Email ou mot de passe incorrect',
        requires2FA: false,
      }
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    return {
      success: false,
      error: error.message || 'Erreur d\'authentification',
      requires2FA: false,
    }
  }
}

/**
 * Vérifie le code 2FA
 */
export const verify2FACode = async (adminId, code) => {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase n\'est pas configuré',
      }
    }

    // Récupérer l'utilisateur avec le secret 2FA
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single()

    if (error || !user || !user.two_factor_secret) {
      return {
        success: false,
        error: 'Utilisateur ou secret 2FA introuvable',
      }
    }

    // Vérifier le code 2FA
    const isValid = await verifyTOTPCode(user.two_factor_secret, code)

    if (!isValid) {
      return {
        success: false,
        error: 'Code 2FA invalide',
      }
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminId)

    // Retourner les informations de l'utilisateur (sans le hash)
    const { password_hash, ...userData } = user

    return {
      success: true,
      userId: user.id,
      email: user.email,
      user: userData,
    }
  } catch (error) {
    console.error('Erreur vérification 2FA:', error)
    return {
      success: false,
      error: error.message || 'Erreur de vérification 2FA',
    }
  }
}

/**
 * Vérifie un code TOTP (Time-based One-Time Password)
 * Compatible avec Google Authenticator
 */
const verifyTOTPCode = async (secretBase64, code) => {
  try {
    // Importer otplib pour vérifier le code TOTP
    const { authenticator } = await import('otplib')
    
    // Convertir le secret base64 en base32 (format requis par otplib)
    const secretBase32 = base64ToBase32(secretBase64)
    
    // Vérifier le code
    const isValid = authenticator.check(code, secretBase32)
    
    return isValid
  } catch (error) {
    console.error('Erreur vérification TOTP:', error)
    return false
  }
}

/**
 * Convertit un secret base64 en base32
 */
const base64ToBase32 = (secretBase64) => {
  try {
    const binaryString = atob(secretBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''
    let bits = 0
    let value = 0
    
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]
      bits += 8
      
      while (bits >= 5) {
        result += base32Chars[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }
    
    if (bits > 0) {
      result += base32Chars[(value << (5 - bits)) & 31]
    }
    
    while (result.length % 8 !== 0) {
      result += '='
    }
    
    return result
  } catch (error) {
    console.error('Erreur conversion base64 vers base32:', error)
    return secretBase64
  }
}

/**
 * Déconnecte l'utilisateur
 */
export const logout = () => {
  localStorage.removeItem('amecare_user_token')
  localStorage.removeItem('amecare_user_email')
  localStorage.removeItem('amecare_user_id')
  window.location.href = '/login'
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('amecare_user_token')
}

/**
 * Récupère l'email de l'utilisateur connecté
 */
export const getCurrentUserEmail = () => {
  return localStorage.getItem('amecare_user_email') || null
}

/**
 * Récupère l'ID de l'utilisateur connecté
 */
export const getCurrentUserId = () => {
  return localStorage.getItem('amecare_user_id') || null
}
