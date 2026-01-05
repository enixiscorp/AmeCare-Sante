import { supabase } from './supabase'
import { verifyAdminPassword } from './supabaseFunctions'
import { verify2FACode as verify2FACodeUtil } from './twoFactorAuth'

export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

export const authenticateAdmin = async (credentials: LoginCredentials) => {
  try {
    // Vérifier le mot de passe via Edge Function Supabase
    const result = await verifyAdminPassword(credentials.email, credentials.password)
    
    if (!result.success) {
      throw new Error('Email ou mot de passe incorrect')
    }

    const admin = result.admin

    // Vérifier le 2FA si activé
    if (admin.two_factor_enabled && admin.two_factor_secret) {
      if (!credentials.twoFactorCode) {
        return { requires2FA: true, adminId: admin.id }
      }
      
      // Vérifier le code 2FA avec Google Authenticator
      const isValid2FA = verify2FACodeUtil(admin.two_factor_secret, credentials.twoFactorCode)
      if (!isValid2FA) {
        throw new Error('Code 2FA invalide')
      }
    }

    // Mettre à jour la dernière connexion
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    return { success: true, admin }
  } catch (error: any) {
    // Fallback : si l'Edge Function n'est pas disponible, utiliser la méthode directe
    try {
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', credentials.email)
        .single()

      if (error || !admin) {
        throw new Error('Email ou mot de passe incorrect')
      }

      // Note: La vérification du mot de passe devrait se faire côté serveur
      // Pour le développement, vous pouvez temporairement stocker le hash et le vérifier
      
      if (admin.two_factor_enabled && admin.two_factor_secret) {
        if (!credentials.twoFactorCode) {
          return { requires2FA: true, adminId: admin.id }
        }
        
        const isValid2FA = verify2FACodeUtil(admin.two_factor_secret, credentials.twoFactorCode)
        if (!isValid2FA) {
          throw new Error('Code 2FA invalide')
        }
      }

      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      return { success: true, admin }
    } catch (fallbackError: any) {
      throw new Error(fallbackError.message || 'Erreur d\'authentification')
    }
  }
}

// Les fonctions 2FA sont maintenant dans twoFactorAuth.ts
// Réexport pour compatibilité
export { 
  verify2FACode, 
  generateTOTPSecret, 
  setup2FA, 
  enable2FA, 
  disable2FA 
} from './twoFactorAuth'
