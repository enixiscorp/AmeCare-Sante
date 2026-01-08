// Fonctions pour appeler les Edge Functions Supabase

import { supabase } from './supabase'

export const verifyAdminPassword = async (email: string, password: string) => {
  try {
    // Appeler l'Edge Function Supabase
    const { data, error } = await supabase.functions.invoke('verify-password', {
      body: { email, password },
    })

    if (error) throw error
    return data
  } catch (error: any) {
    throw new Error(error.message || 'Erreur de vérification')
  }
}







