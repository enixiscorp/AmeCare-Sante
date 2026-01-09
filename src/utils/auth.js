import supabase from './supabaseClient'

/**
 * Authentifie un utilisateur avec email et mot de passe
 * Utilise la table admin_users de Supabase pour l'authentification
 */
export const authenticateUser = async (email, password) => {
  try {
    // Vérifier si Supabase est configuré
    if (!supabase) {
      // Fallback : authentification locale simple (pour développement)
      console.warn('Supabase non configuré - utilisation du mode développement')
      
      // Authentification de développement avec des comptes hardcodés
      const devAccounts = {
        'contacteccorp@gmail.com': '@dmincare26**',
        'admin@amecare.fr': 'admin123',
      }
      
      if (devAccounts[email] === password) {
        return {
          success: true,
          userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: email,
        }
      } else {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect',
        }
      }
    }

    // Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect',
      }
    }

    // Vérifier le mot de passe avec bcrypt
    // Note: Pour utiliser bcrypt dans le navigateur, nous devons utiliser une version web
    // ou appeler l'Edge Function Supabase
    
    // Option 1: Appeler l'Edge Function Supabase (recommandé)
    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('verify-password', {
        body: { email, password },
      })

      if (functionError) {
        throw functionError
      }

      if (result && result.success) {
        return {
          success: true,
          userId: user.id,
          email: user.email,
          user: result.admin,
        }
      } else {
        return {
          success: false,
          error: result?.error || 'Email ou mot de passe incorrect',
        }
      }
    } catch (functionError) {
      // Si l'Edge Function n'est pas disponible, utiliser un fallback simple
      // Note: En production, il est STRONGLY recommandé d'utiliser l'Edge Function
      console.warn('Edge Function non disponible. Pour une sécurité maximale, déployez l\'Edge Function verify-password.', functionError)
      
      // Pour le développement : authentification basique (NON SÉCURISÉE)
      // ATTENTION: Ne pas utiliser en production sans Edge Function
      // Comparaison simple pour le développement uniquement
      
      // Essayer d'utiliser bcryptjs si disponible (peut ne pas fonctionner dans tous les navigateurs)
      try {
        const bcryptjs = await import('bcryptjs/dist/bcrypt')
        const bcrypt = bcryptjs.default || bcryptjs
        
        if (bcrypt && typeof bcrypt.compareSync === 'function') {
          const isValidPassword = bcrypt.compareSync(password, user.password_hash)
          
          if (!isValidPassword) {
            return {
              success: false,
              error: 'Email ou mot de passe incorrect',
            }
          }
        } else {
          // Fallback : accepter n'importe quel mot de passe si bcrypt n'est pas disponible
          // ⚠️ ATTENTION : Ceci est uniquement pour le développement
          console.warn('⚠️ bcrypt non disponible - mode développement non sécurisé activé')
          return {
            success: false,
            error: 'Authentification non disponible. Veuillez déployer l\'Edge Function verify-password pour utiliser l\'application.',
          }
        }
      } catch (bcryptError) {
        console.error('Erreur avec bcrypt:', bcryptError)
        return {
          success: false,
          error: 'Authentification non disponible. Veuillez déployer l\'Edge Function verify-password ou configurer bcrypt correctement.',
        }
      }

      // Mettre à jour la dernière connexion
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // Retourner les informations de l'utilisateur (sans le hash)
      const { password_hash, ...userData } = user
      
      return {
        success: true,
        userId: user.id,
        email: user.email,
        user: userData,
      }
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    return {
      success: false,
      error: error.message || 'Erreur d\'authentification',
    }
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
