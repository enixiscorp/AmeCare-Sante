# 🚀 Instructions Finales - Déployer l'Edge Function

## ✅ Code Corrigé

J'ai corrigé le code pour résoudre l'erreur "Worker is not defined". Voici ce que vous devez faire :

---

## 📋 Étapes pour Corriger et Déployer

### Étape 1 : Ouvrir votre fonction dans Supabase

1. Allez dans **Edge Functions** dans Supabase
2. Cliquez sur votre fonction `verify-password`

### Étape 2 : Remplacer le code

1. **Sélectionnez tout le code** dans l'éditeur (Ctrl+A)
2. **Supprimez-le** (Delete)
3. **Ouvrez le fichier** `supabase/functions/verify-password/index.ts` dans votre éditeur local
4. **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)
5. **Collez-le** dans l'éditeur Supabase (Ctrl+V)

### Étape 3 : Vérifier les secrets

Assurez-vous que ces secrets sont configurés :
- `SUPABASE_URL` = `https://wjpejsotrzovxvswlwkc.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = votre clé service_role

### Étape 4 : Sauvegarder

1. Cliquez sur **"Save"** en bas de l'éditeur

### Étape 5 : Déployer

Après avoir cliqué sur "Save", cherchez :

1. **Un bouton "Deploy function"** ou **"Deploy"** qui apparaît en bas de l'éditeur
2. **OU** un onglet **"Deploy"** dans les onglets en haut
3. **OU** un menu **"Actions"** avec l'option "Deploy"

Cliquez sur **"Deploy"** ou **"Deploy function"**.

### Étape 6 : Tester

1. Allez dans l'onglet **"Test"** ou **"Testing"**
2. Entrez ce JSON :
   ```json
   {
     "email": "contacteccorp@gmail.com",
     "password": "@dmincare26**"
   }
   ```
3. Cliquez sur **"Send Request"** ou **"Invoke"**
4. Vous devriez maintenant recevoir une réponse (pas d'erreur 500)

---

## 🔍 Si vous ne trouvez pas le bouton "Deploy"

### Option 1 : Vérifier le statut

Après "Save", regardez si le statut change :
- Si vous voyez **"Active"** ou **"Deployed"** → C'est déjà déployé !
- Si vous voyez **"Draft"** ou **"Saved"** → Il faut déployer

### Option 2 : Utiliser la CLI

Si l'interface ne fonctionne pas, utilisez la ligne de commande :

```cmd
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref wjpejsotrzovxvswlwkc

# Déployer la fonction
supabase functions deploy verify-password

# Configurer les secrets
supabase secrets set SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

---

## ✅ Code Complet à Copier

Voici le code complet corrigé (déjà dans le fichier `supabase/functions/verify-password/index.ts`) :

```typescript
// Edge Function Supabase pour vérifier le mot de passe admin
// Compatible avec Supabase Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { compare as bcryptCompare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email et mot de passe requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer l'admin
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier le mot de passe avec bcrypt
    const isValid = await bcryptCompare(password, admin.password_hash)

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Retourner les informations admin (sans le hash)
    const { password_hash, ...adminData } = admin

    return new Response(
      JSON.stringify({ 
        success: true, 
        admin: adminData,
        requires2FA: admin.two_factor_enabled 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Erreur dans verify-password:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🎯 Résumé

1. ✅ Code corrigé (utilise `Deno.serve` au lieu de `serve`)
2. ⏳ **À FAIRE** : Copier le nouveau code dans Supabase
3. ⏳ **À FAIRE** : Cliquer sur "Save" puis "Deploy function"
4. ⏳ **À FAIRE** : Tester à nouveau

**Une fois déployé avec le code corrigé, l'erreur "Worker is not defined" devrait disparaître !** 🎉
