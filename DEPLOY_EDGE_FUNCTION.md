# 🚀 Guide de Déploiement de l'Edge Function Supabase

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer l'Edge Function `verify-password` dans votre projet Supabase.

---

## ✅ Prérequis

1. ✅ Un compte Supabase actif
2. ✅ Le projet Supabase créé
3. ✅ Supabase CLI installé (optionnel mais recommandé)
4. ✅ Le fichier `supabase/functions/verify-password/index.ts` prêt

---

## 🎯 Méthode 1 : Via l'Interface Web Supabase (RECOMMANDÉ - Plus simple)

### Étape 1 : Accéder aux Edge Functions

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **AmeCare**
4. Dans le menu de gauche, cliquez sur **"Edge Functions"** (ou **"Functions"**)

### Étape 2 : Créer une nouvelle fonction

1. Cliquez sur le bouton **"Create a new function"** ou **"New Function"**
2. Donnez un nom à votre fonction : **`verify-password`**
3. Cliquez sur **"Create function"**

### Étape 3 : Copier le code

1. Ouvrez le fichier `supabase/functions/verify-password/index.ts` dans votre éditeur
2. **Copiez tout le contenu** du fichier (Ctrl+A puis Ctrl+C)

### Étape 4 : Coller le code dans Supabase

1. Dans l'éditeur de code de Supabase, **supprimez tout le code par défaut**
2. **Collez le code** que vous avez copié (Ctrl+V)
3. Le code devrait ressembler à ceci :

```typescript
// Edge Function Supabase pour vérifier le mot de passe admin
// À déployer dans Supabase > Edge Functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { compare as bcryptCompare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // ... reste du code
})
```

### Étape 5 : Configurer les secrets (Variables d'environnement)

1. Dans la page de la fonction, allez dans l'onglet **"Settings"** ou **"Secrets"**
2. Ajoutez ces variables d'environnement :
   - **`SUPABASE_URL`** : Votre URL Supabase (ex: `https://xxxxx.supabase.co`)
   - **`SUPABASE_SERVICE_ROLE_KEY`** : Votre clé service_role (⚠️ gardez-la secrète !)

   **Où trouver ces valeurs** :
   - Allez dans **Settings** > **API**
   - **Project URL** = `SUPABASE_URL`
   - **service_role** key = `SUPABASE_SERVICE_ROLE_KEY`

3. Cliquez sur **"Save"** ou **"Add secret"** pour chaque variable

### Étape 6 : Déployer la fonction

1. Cliquez sur le bouton **"Deploy"** ou **"Save and Deploy"**
2. Attendez quelques secondes que le déploiement se termine
3. Vous devriez voir un message de succès : **"Function deployed successfully"**

### Étape 7 : Tester la fonction

1. Dans l'interface de la fonction, allez dans l'onglet **"Testing"** ou **"Invoke"**
2. Vous pouvez tester avec un JSON :
   ```json
   {
     "email": "contacteccorp@gmail.com",
     "password": "@dmincare26**"
   }
   ```
3. Cliquez sur **"Invoke"** ou **"Test"**
4. Vous devriez recevoir une réponse avec `success: true` ou `success: false`

---

## 🎯 Méthode 2 : Via Supabase CLI (Pour développeurs avancés)

### Étape 1 : Installer Supabase CLI

**Sur Windows** :
```cmd
# Via npm
npm install -g supabase

# Ou via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Vérifier l'installation** :
```cmd
supabase --version
```

### Étape 2 : Se connecter à Supabase

```cmd
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier.

### Étape 3 : Lier votre projet

```cmd
cd C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante
supabase link --project-ref votre-project-ref
```

**Où trouver le project-ref** :
- Dans l'URL de votre projet Supabase : `https://xxxxx.supabase.co`
- Le `xxxxx` est votre project-ref

### Étape 4 : Déployer la fonction

```cmd
supabase functions deploy verify-password
```

### Étape 5 : Configurer les secrets

```cmd
supabase secrets set SUPABASE_URL=https://votre-projet.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

---

## 🔍 Vérifier que la fonction est déployée

### Méthode 1 : Via l'interface Supabase

1. Allez dans **Edge Functions**
2. Vous devriez voir `verify-password` dans la liste
3. Le statut devrait être **"Active"** ou **"Deployed"**

### Méthode 2 : Tester depuis votre application

1. Lancez votre application : `npm run dev`
2. Essayez de vous connecter
3. Si la fonction est bien déployée, l'authentification devrait fonctionner
4. Si vous voyez une erreur, vérifiez la console du navigateur (F12)

---

## 🐛 Dépannage

### Erreur : "Function not found"

**Solution** :
- Vérifiez que le nom de la fonction est exactement `verify-password`
- Vérifiez que la fonction est bien déployée dans Supabase

### Erreur : "Missing environment variables"

**Solution** :
- Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont bien configurés
- Vérifiez que les noms des variables sont exactement corrects (sensible à la casse)

### Erreur : "bcrypt module not found"

**Solution** :
- Vérifiez que l'import est correct : `import { compare as bcryptCompare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'`
- Cette URL devrait fonctionner directement dans Deno (runtime de Supabase Edge Functions)

### Erreur : "CORS error"

**Solution** :
- Vérifiez que les headers CORS sont bien présents dans le code
- Vérifiez que l'origine de votre application est autorisée

### La fonction ne répond pas

**Solutions** :
1. Vérifiez les logs de la fonction dans Supabase > Edge Functions > Logs
2. Vérifiez que la fonction est bien active
3. Vérifiez que vous utilisez la bonne URL pour appeler la fonction

---

## 📝 Code complet de la fonction

Assurez-vous que votre fonction contient ce code :

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

## ✅ Checklist de déploiement

Avant de considérer que tout est prêt, vérifiez :

- [ ] La fonction `verify-password` est créée dans Supabase
- [ ] Le code est copié et collé correctement
- [ ] Les variables d'environnement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurées
- [ ] La fonction est déployée (statut "Active")
- [ ] La fonction répond correctement aux tests
- [ ] L'application peut appeler la fonction sans erreur

---

## 🎉 Une fois déployé

Votre authentification devrait maintenant fonctionner :

1. ✅ Email + mot de passe vérifiés via l'Edge Function
2. ✅ 2FA activé si configuré
3. ✅ Connexion sécurisée sans bcrypt côté client

**Testez en lançant votre application et en vous connectant !** 🚀
