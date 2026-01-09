/**
 * Script pour créer le premier administrateur dans Supabase
 * 
 * Usage:
 *   1. Installez les dépendances : npm install @supabase/supabase-js bcryptjs
 *   2. Configurez les variables d'environnement ci-dessous
 *   3. Exécutez : node scripts/create-admin.js
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// ⚠️ REMPLACEZ CES VALEURS PAR LES VÔTRES
const SUPABASE_URL = 'https://wjpejsotrzovxvswlwkc.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGVqc290cnpvdnh2c3dsd2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU2MTA5OCwiZXhwIjoyMDgzMTM3MDk4fQ.BKeOCEPMr6NzhgXnl8KGImp0XBHUY29DEcTbWfGFyZQ'
const ADMIN_EMAIL = 'contacteccorp@gmail.com'
const ADMIN_PASSWORD = '@dmincare26**' // ⚠️ Changez ce mot de passe par un mot de passe fort
// Créer le client Supabase avec la service_role key (accès complet)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function createAdmin() {
  try {
    console.log('🔐 Création de l\'administrateur...')
    console.log('📧 Email:', ADMIN_EMAIL)
    
    // Générer le hash bcrypt du mot de passe
    console.log('🔒 Génération du hash bcrypt...')
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
    console.log('✅ Hash généré:', passwordHash.substring(0, 20) + '...')
    
    // Vérifier si l'admin existe déjà
    console.log('🔍 Vérification si l\'admin existe déjà...')
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', ADMIN_EMAIL)
      .single()
    
    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec cet email existe déjà')
      console.log('📝 Mise à jour du mot de passe...')
      
      const { data, error } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('email', ADMIN_EMAIL)
        .select()
      
      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message)
        process.exit(1)
      }
      
      console.log('✅ Mot de passe mis à jour avec succès!')
      console.log('📋 Détails de l\'admin:')
      console.log('   - ID:', data[0].id)
      console.log('   - Email:', data[0].email)
      console.log('   - 2FA activé:', data[0].two_factor_enabled || false)
    } else {
      // Créer le nouvel admin
      console.log('➕ Création du nouvel administrateur...')
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: ADMIN_EMAIL,
          password_hash: passwordHash,
          two_factor_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        console.error('❌ Erreur lors de la création:', error.message)
        console.error('💡 Vérifiez que:')
        console.error('   1. La table admin_users existe dans Supabase')
        console.error('   2. Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont correctes')
        console.error('   3. La service_role key a les permissions nécessaires')
        process.exit(1)
      }
      
      console.log('✅ Administrateur créé avec succès!')
      console.log('📋 Détails de l\'admin:')
      console.log('   - ID:', data[0].id)
      console.log('   - Email:', data[0].email)
      console.log('   - 2FA activé:', data[0].two_factor_enabled || false)
      console.log('   - Date de création:', data[0].created_at)
    }
    
    console.log('\n🎉 Opération terminée!')
    console.log('📝 Vous pouvez maintenant vous connecter à l\'interface admin avec:')
    console.log('   Email:', ADMIN_EMAIL)
    console.log('   Mot de passe:', ADMIN_PASSWORD)
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Vérifier que les variables sont configurées
if (SUPABASE_URL.includes('votre-projet-id') || SUPABASE_SERVICE_ROLE_KEY.includes('votre_service_role_key')) {
  console.error('❌ Erreur: Veuillez configurer les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans le script')
  console.error('💡 Instructions:')
  console.error('   1. Ouvrez le fichier scripts/create-admin.js')
  console.error('   2. Remplacez SUPABASE_URL par votre URL Supabase')
  console.error('   3. Remplacez SUPABASE_SERVICE_ROLE_KEY par votre service_role key')
  console.error('   4. Re-exécutez le script')
  process.exit(1)
}

// Exécuter le script
createAdmin()

