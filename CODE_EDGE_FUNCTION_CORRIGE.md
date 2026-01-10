# ✅ Code Edge Function Corrigé

## 🔧 Correction de l'erreur "Worker is not defined"

L'erreur venait de l'utilisation de l'ancienne API Deno. Voici le code corrigé à utiliser :

---

## 📋 Code Complet Corrigé

Copiez ce code dans votre Edge Function Supabase :

```typescript
// Edge Function Supabase pour vérifier le mot de passe admin
// Compatible avec la nouvelle API Supabase Edge Functions

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
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

## 🔄 Étapes pour Corriger

### 1. Ouvrir l'éditeur de la fonction

1. Dans Supabase, allez dans **Edge Functions**
2. Cliquez sur votre fonction `verify-password`

### 2. Remplacer le code

1. **Sélectionnez tout le code** dans l'éditeur (Ctrl+A)
2. **Supprimez-le** (Delete)
3. **Copiez le code corrigé** ci-dessus
4. **Collez-le** dans l'éditeur (Ctrl+V)

### 3. Sauvegarder et déployer

1. Cliquez sur **"Save"**
2. Cherchez le bouton **"Deploy function"** ou **"Deploy"** en bas de l'éditeur
3. Cliquez dessus pour déployer

### 4. Tester à nouveau

1. Allez dans l'onglet **"Test"** ou **"Testing"**
2. Testez avec :
   ```json
   {
     "email": "contacteccorp@gmail.com",
     "password": "@dmincare26**"
   }
   ```
3. Vous devriez maintenant recevoir une réponse (pas d'erreur 500)

---

## ✅ Changements Effectués

1. ✅ Remplacement de `serve` par `Deno.serve` (nouvelle API)
2. ✅ Mise à jour des imports pour utiliser JSR (JavaScript Registry)
3. ✅ Ajout du type definition pour l'Edge Runtime

---

**Une fois le code corrigé et redéployé, l'erreur "Worker is not defined" devrait disparaître !** 🎉
