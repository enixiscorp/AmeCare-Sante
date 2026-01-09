# ⚡ Déployer l'Edge Function - Guide Rapide

## 🎯 Vous voyez l'erreur 404 NOT_FOUND ?

Cela signifie que l'Edge Function `verify-password` n'est pas encore déployée dans Supabase. Voici comment la déployer rapidement :

---

## 🚀 Déploiement en 5 Minutes

### Étape 1 : Ouvrir Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous
3. Sélectionnez votre projet **AmeCare**

### Étape 2 : Accéder aux Edge Functions

1. Dans le menu de gauche, cliquez sur **"Edge Functions"** (ou **"Functions"**)
2. Si vous ne voyez pas ce menu, cherchez dans **"Project Settings"** ou utilisez la barre de recherche

### Étape 3 : Créer la fonction

1. Cliquez sur **"Create a new function"** ou **"New Function"** ou **"+"**
2. Nom de la fonction : **`verify-password`** (exactement, avec le tiret)
3. Cliquez sur **"Create"** ou **"Create function"**

### Étape 4 : Copier le code

1. Ouvrez le fichier `supabase/functions/verify-password/index.ts` dans votre éditeur
2. **Sélectionnez tout** (Ctrl+A)
3. **Copiez** (Ctrl+C)

### Étape 5 : Coller dans Supabase

1. Dans l'éditeur de code de Supabase, **supprimez tout le code par défaut**
2. **Collez votre code** (Ctrl+V)
3. Vérifiez que le code est bien collé (il devrait commencer par `// Edge Function Supabase...`)

### Étape 6 : Configurer les secrets

1. Dans la page de la fonction, cherchez **"Settings"**, **"Secrets"** ou **"Environment Variables"**
2. Ajoutez ces deux secrets :

   **Secret 1** :
   - Nom : `SUPABASE_URL`
   - Valeur : `https://wjpejsotrzovxvswlwkc.supabase.co`

   **Secret 2** :
   - Nom : `SUPABASE_SERVICE_ROLE_KEY`
   - Valeur : Votre clé service_role (trouvez-la dans Settings > API > service_role key)

3. Cliquez sur **"Save"** ou **"Add"** pour chaque secret

### Étape 7 : Déployer

1. Cliquez sur le bouton **"Deploy"**, **"Save and Deploy"** ou **"Publish"**
2. Attendez quelques secondes
3. Vous devriez voir un message de succès

### Étape 8 : Tester

1. Revenez à votre application
2. Rechargez la page (F5)
3. Essayez de vous connecter
4. L'erreur 404 ne devrait plus apparaître

---

## 📋 Code Complet à Copier

Si vous avez besoin du code complet, voici ce que vous devez coller dans Supabase :

```typescript
// Edge Function Supabase pour vérifier le mot de passe admin
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { compare as bcryptCompare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const isValid = await bcryptCompare(password, admin.password_hash)

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

## ✅ Vérification

Une fois déployé, vous devriez :

1. ✅ Voir la fonction `verify-password` dans la liste des Edge Functions
2. ✅ Voir le statut "Active" ou "Deployed"
3. ✅ Pouvoir vous connecter sans erreur 404

---

## 🐛 Si vous avez des problèmes

### Je ne trouve pas "Edge Functions" dans le menu

**Solution** : 
- Cherchez dans **"Project Settings"** > **"Edge Functions"**
- Ou utilisez la barre de recherche en haut
- Ou allez directement sur : `https://supabase.com/dashboard/project/[votre-project-id]/functions`

### Je ne trouve pas où ajouter les secrets

**Solution** :
- Cliquez sur votre fonction `verify-password`
- Cherchez un onglet **"Settings"** ou **"Configuration"**
- Ou cherchez **"Environment Variables"** ou **"Secrets"**

### La fonction ne se déploie pas

**Solution** :
- Vérifiez qu'il n'y a pas d'erreurs de syntaxe dans le code
- Vérifiez que tous les imports sont corrects
- Vérifiez les logs de déploiement dans Supabase

---

**Une fois déployée, votre authentification fonctionnera !** 🎉
