// Fonctions pour appeler les Edge Functions Supabase

import { supabase } from './supabase'

export const verifyAdminPassword = async (email: string, password: string) => {
  try {
    // Appeler l'Edge Function Supabase
    const { data, error } = await supabase.functions.invoke('verify-password', {
      body: { email, password },
    })

    if (error) {
      // Si l'Edge Function n'est pas disponible, retourner une erreur pour déclencher le fallback
      throw error
    }
    
    // Si data contient success: false, retourner l'erreur
    if (data && !data.success) {
      return data // Retourner l'objet avec success: false et error
    }
    
    return data
  } catch (error: any) {
    // Re-lancer l'erreur pour que le fallback puisse être déclenché
    throw error
  }
}







