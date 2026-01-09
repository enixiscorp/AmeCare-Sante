import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Messages de débogage (uniquement en développement)
if (import.meta.env.DEV) {
  console.log('🔍 Variables d\'environnement Supabase:')
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ Définie' : '❌ Non définie')
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Définie (masquée)' : '❌ Non définie')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERREUR: Variables d\'environnement Supabase manquantes!')
    console.error('💡 Solution:')
    console.error('   1. Créez un fichier .env à la racine du projet')
    console.error('   2. Ajoutez: VITE_SUPABASE_URL=https://votre-projet.supabase.co')
    console.error('   3. Ajoutez: VITE_SUPABASE_ANON_KEY=votre_cle_anon')
    console.error('   4. Redémarrez le serveur (npm run dev)')
    console.error('   5. Ou exécutez: node scripts/create-env.js')
  }
}

// Créer le client Supabase seulement si les variables sont définies
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    if (import.meta.env.DEV) {
      console.log('✅ Client Supabase créé avec succès')
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du client Supabase:', error)
  }
} else {
  if (import.meta.env.DEV) {
    console.warn('⚠️  Client Supabase non créé - variables d\'environnement manquantes')
  }
}

// Fonction pour sauvegarder une facture dans Supabase
export const saveInvoiceToSupabase = async (invoiceData, totals) => {
  if (!supabase) {
    console.warn('Supabase non configuré - les factures ne seront pas sauvegardées en ligne')
    return false
  }

  try {
    // Récupérer ou créer l'ID utilisateur
    let userId = localStorage.getItem('amecare_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('amecare_user_id', userId)
    }

    // Préparer les données pour Supabase
    const invoiceRecord = {
      invoice_number: invoiceData.invoiceNumber,
      user_id: userId,
      client_name: invoiceData.clientName || null,
      client_email: invoiceData.clientEmail || null,
      client_phone: invoiceData.clientPhone || null,
      client_address: invoiceData.clientAddress || null,
      structure_name: invoiceData.structureName || 'AmeCare Santé',
      invoice_date: invoiceData.invoiceDate,
      service_period: invoiceData.servicePeriod || null,
      total_ht: totals.subtotalHT,
      total_tva: totals.tvaAmount,
      total_ttc: totals.totalTTC,
      currency: invoiceData.currency || '€',
      payment_terms: invoiceData.paymentTerms || null,
      payment_deadline: invoiceData.paymentDeadline || null,
      payment_methods: invoiceData.paymentMethods || null,
      legal_mention: invoiceData.legalMention || null,
      invoice_data: invoiceData, // Stocker toutes les données en JSONB
    }

    // Insérer ou mettre à jour la facture
    const { data, error } = await supabase
      .from('invoices')
      .upsert(invoiceRecord, {
        onConflict: 'invoice_number',
      })
      .select()

    if (error) {
      console.error('Erreur Supabase:', error)
      return false
    }

    // Mettre à jour les statistiques utilisateur
    await updateUserStats(userId)

    return true
  } catch (error) {
    console.error('Erreur lors de la sauvegarde Supabase:', error)
    return false
  }
}

// Mettre à jour les statistiques de l'utilisateur
const updateUserStats = async (userId) => {
  if (!supabase) return

  try {
    // Vérifier si l'utilisateur existe
    const { data: existingUser } = await supabase
      .from('invoice_users')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingUser) {
      // Mettre à jour
      await supabase
        .from('invoice_users')
        .update({
          last_invoice_date: new Date().toISOString(),
          total_invoices: (existingUser.total_invoices || 0) + 1,
        })
        .eq('user_id', userId)
    } else {
      // Créer
      await supabase
        .from('invoice_users')
        .insert({
          user_id: userId,
          first_invoice_date: new Date().toISOString(),
          last_invoice_date: new Date().toISOString(),
          total_invoices: 1,
        })
    }
  } catch (error) {
    console.error('Erreur mise à jour stats utilisateur:', error)
  }
}

export default supabase







