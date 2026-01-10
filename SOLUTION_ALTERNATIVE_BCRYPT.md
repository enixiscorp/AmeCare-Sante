# 🔧 Solution Alternative - Problème bcrypt

## 🎯 Si l'erreur "Worker is not defined" persiste

Le problème peut venir de la bibliothèque bcrypt. Voici une solution alternative qui utilise une approche différente :

---

## 📋 Code Alternative (Sans bcrypt dans l'Edge Function)

Si bcrypt continue à poser problème, vous pouvez utiliser cette approche :

### Option 1 : Utiliser une autre bibliothèque bcrypt

Remplacez l'import bcrypt par :

```typescript
import { compare } from 'https://deno.land/x/bcryptjs@v0.4.0/mod.ts'
```

### Option 2 : Code avec gestion d'erreur améliorée

Voici le code complet avec une meilleure gestion d'erreur :

```typescript
// Edge Function Supabase pour vérifier le mot de passe admin
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

    // Vérifier le mot de passe avec bcrypt
    try {
      const bcryptModule = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
      const isValid = await bcryptModule.compare(password, admin.password_hash)
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email ou mot de passe incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (bcryptError: any) {
      console.error('Erreur bcrypt:', bcryptError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de vérification du mot de passe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

## 🔍 Vérifier les Logs

Pour voir l'erreur exacte :

1. Dans Supabase, allez dans votre fonction `verify-password`
2. Cherchez un onglet **"Logs"** ou **"Function Logs"**
3. Regardez les erreurs détaillées

Cela vous aidera à identifier le problème exact avec bcrypt.

---

**Essayez le code ci-dessus et dites-moi ce que vous voyez dans les logs !** 🔍
