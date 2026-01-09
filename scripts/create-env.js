/**
 * Script pour créer le fichier .env
 * Usage: node scripts/create-env.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

// Contenu par défaut du fichier .env
const envContent = `# Configuration Supabase pour AmeCare
# ⚠️ IMPORTANT : Ne commitez JAMAIS ce fichier dans Git !

# URL de votre projet Supabase
# Trouvez cette valeur dans : Supabase Dashboard > Settings > API > Project URL
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co

# Clé publique anon de votre projet Supabase
# Trouvez cette valeur dans : Supabase Dashboard > Settings > API > anon public key
# ⚠️ REMPLACEZ la valeur ci-dessous par votre vraie clé anon
VITE_SUPABASE_ANON_KEY=REMPLACEZ_PAR_VOTRE_CLE_ANON_ICI
`

try {
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.')
    console.log('📁 Emplacement:', envPath)
    console.log('💡 Si vous voulez le recréer, supprimez-le d\'abord.')
    process.exit(0)
  }

  // Créer le fichier .env
  fs.writeFileSync(envPath, envContent, 'utf8')
  
  console.log('✅ Fichier .env créé avec succès!')
  console.log('📁 Emplacement:', envPath)
  console.log('')
  console.log('⚠️  IMPORTANT :')
  console.log('   1. Ouvrez le fichier .env')
  console.log('   2. Remplacez REMPLACEZ_PAR_VOTRE_CLE_ANON_ICI par votre vraie clé anon Supabase')
  console.log('   3. Redémarrez le serveur (npm run dev)')
  console.log('')
  console.log('📝 Pour trouver votre clé anon :')
  console.log('   - Allez sur https://supabase.com/dashboard')
  console.log('   - Sélectionnez votre projet')
  console.log('   - Settings > API > anon public key')
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message)
  console.error('💡 Essayez de créer le fichier manuellement :')
  console.error('   1. Créez un fichier nommé .env à la racine du projet')
  console.error('   2. Copiez le contenu de .env.example')
  process.exit(1)
}
