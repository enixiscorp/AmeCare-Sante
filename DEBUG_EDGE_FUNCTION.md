# 🔍 Déboguer l'Erreur "Worker is not defined"

## 🎯 Diagnostic

L'erreur "Worker is not defined" avec le code 500 signifie que :
- ✅ La fonction est déployée (sinon ce serait 404)
- ❌ Il y a une erreur dans le code lors de l'exécution

---

## 📋 Étapes de Diagnostic

### 1. Vérifier les Logs Supabase

1. Dans Supabase, allez dans votre fonction `verify-password`
2. Cherchez un onglet **"Logs"**, **"Function Logs"** ou **"Invocations"**
3. Cliquez dessus
4. Regardez les erreurs détaillées

**Cela vous donnera l'erreur exacte** qui cause le problème.

### 2. Tester avec un code minimal

Pour isoler le problème, testez d'abord avec un code très simple :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Fonction test',
        email: email 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Si ce code fonctionne**, alors le problème vient de bcrypt ou de Supabase client.

### 3. Ajouter bcrypt progressivement

Une fois le code minimal fonctionnel, ajoutez bcrypt étape par étape :

**Étape 1** : Importer bcrypt seulement
```typescript
const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
console.log('bcrypt importé:', bcrypt)
```

**Étape 2** : Tester la fonction compare
```typescript
const testHash = '$2a$10$test'
const testPassword = 'test'
const result = await bcrypt.compare(testPassword, testHash)
console.log('Test bcrypt:', result)
```

---

## 🔧 Solutions Possibles

### Solution 1 : Utiliser une version différente de bcrypt

Essayez cette version :
```typescript
const bcrypt = await import('https://deno.land/x/bcryptjs@v0.4.0/mod.ts')
```

### Solution 2 : Vérifier la version de Deno

Supabase utilise une version spécifique de Deno. Vérifiez dans les logs quelle version est utilisée.

### Solution 3 : Utiliser une bibliothèque alternative

Si bcrypt ne fonctionne pas, vous pouvez utiliser une autre bibliothèque de hash compatible.

---

## 📝 Code de Test Complet

Copiez ce code dans Supabase pour tester étape par étape :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Test 1: Vérifier que les données arrivent
    console.log('Email reçu:', email)
    console.log('Password reçu:', password ? 'oui' : 'non')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test 2: Récupérer l'admin
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    console.log('Admin trouvé:', admin ? 'oui' : 'non')
    console.log('Erreur Supabase:', error)

    if (error || !admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test 3: Importer bcrypt
    console.log('Tentative d\'import bcrypt...')
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
    console.log('bcrypt importé avec succès')

    // Test 4: Comparer le mot de passe
    console.log('Tentative de comparaison...')
    const isValid = await bcrypt.compare(password, admin.password_hash)
    console.log('Résultat comparaison:', isValid)

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
    console.error('ERREUR COMPLÈTE:', error)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur serveur',
        type: error.constructor.name,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

Ce code avec les `console.log` vous aidera à identifier exactement où se produit l'erreur.

---

## ✅ Prochaines Étapes

1. **Copiez le code de test** dans Supabase
2. **Déployez-le**
3. **Testez** et regardez les **logs** dans Supabase
4. **Dites-moi** ce que vous voyez dans les logs

Cela nous aidera à identifier le problème exact ! 🔍
