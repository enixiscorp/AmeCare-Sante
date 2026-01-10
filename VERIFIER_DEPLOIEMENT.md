# ✅ Vérifier le Déploiement de l'Edge Function

## 🎯 Vous avez cliqué sur "Save" ?

Dans Supabase, après avoir cliqué sur **"Save"**, la fonction est généralement **automatiquement déployée**. Voici comment vérifier :

---

## ✅ Vérification Rapide

### 1. Vérifier le statut de la fonction

1. Dans la page de votre fonction `verify-password`
2. Cherchez un indicateur de statut :
   - **"Active"** ✅
   - **"Deployed"** ✅
   - **"Saved"** (peut nécessiter un déploiement manuel)
   - **"Draft"** (non déployée)

### 2. Chercher un bouton "Deploy" ou "Publish"

Après avoir cliqué sur "Save", cherchez :
- Un bouton **"Deploy"** ou **"Publish"** qui apparaît
- Un onglet **"Deploy"** dans la barre d'onglets
- Un menu déroulant avec l'option "Deploy"

### 3. Vérifier dans la liste des fonctions

1. Retournez à la liste des Edge Functions
2. Cherchez `verify-password` dans la liste
3. Vérifiez le statut affiché à côté

---

## 🚀 Si la fonction n'est pas déployée

### Option 1 : Utiliser l'onglet "Deploy"

1. Dans la page de votre fonction
2. Cherchez un onglet **"Deploy"** ou **"Versions"**
3. Cliquez dessus
4. Vous devriez voir un bouton **"Deploy"** ou **"Create deployment"**

### Option 2 : Utiliser le menu Actions

1. Dans la liste des fonctions
2. Cliquez sur les **trois points** (⋯) à côté de `verify-password`
3. Cherchez **"Deploy"** ou **"Publish"** dans le menu

### Option 3 : Vérifier les versions

1. Dans la page de votre fonction
2. Cherchez une section **"Versions"** ou **"Deployments"**
3. Si vous voyez une version en "Draft", cliquez sur **"Deploy"**

---

## 🧪 Tester la fonction

Même si vous ne voyez pas de bouton "Deploy", testez si la fonction fonctionne :

### Méthode 1 : Depuis l'interface Supabase

1. Dans la page de votre fonction `verify-password`
2. Cherchez un onglet **"Testing"**, **"Invoke"** ou **"Test"**
3. Cliquez dessus
4. Entrez ce JSON dans le champ de test :
   ```json
   {
     "email": "contacteccorp@gmail.com",
     "password": "@dmincare26**"
   }
   ```
5. Cliquez sur **"Invoke"** ou **"Test"**
6. Si vous recevez une réponse (même une erreur), la fonction est déployée ✅
7. Si vous recevez une erreur 404, la fonction n'est pas déployée ❌

### Méthode 2 : Depuis votre application

1. Rechargez votre application (F5)
2. Essayez de vous connecter
3. Ouvrez la console (F12)
4. Si vous voyez toujours l'erreur 404, la fonction n'est pas déployée
5. Si vous voyez une autre erreur (comme "Email ou mot de passe incorrect"), la fonction est déployée ✅

---

## 🔧 Si "Save" ne déploie pas automatiquement

### Solution 1 : Vérifier les secrets

Assurez-vous que les secrets sont bien configurés :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Sans ces secrets, la fonction peut ne pas se déployer.

### Solution 2 : Vérifier le code

Assurez-vous qu'il n'y a pas d'erreurs de syntaxe dans le code. Si Supabase détecte des erreurs, il peut ne pas déployer.

### Solution 3 : Utiliser Supabase CLI

Si l'interface web ne fonctionne pas, vous pouvez utiliser la CLI :

```cmd
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier le projet (remplacez wjpejsotrzovxvswlwkc par votre project-ref)
supabase link --project-ref wjpejsotrzovxvswlwkc

# Déployer la fonction
supabase functions deploy verify-password

# Configurer les secrets
supabase secrets set SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

---

## 📋 Checklist

Avant de considérer que c'est déployé :

- [ ] Le code est sauvegardé dans Supabase
- [ ] Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont configurés
- [ ] Le statut de la fonction est "Active" ou "Deployed"
- [ ] Le test dans Supabase fonctionne (retourne une réponse)
- [ ] L'application ne montre plus l'erreur 404

---

## 🎯 Prochaines Étapes

Une fois que vous avez confirmé que la fonction est déployée :

1. Rechargez votre application (F5)
2. Essayez de vous connecter
3. Si vous voyez "Email ou mot de passe incorrect" au lieu de 404, c'est bon signe !
4. Vérifiez que l'utilisateur existe dans Supabase (table `admin_users`)

---

**Dites-moi ce que vous voyez après avoir cliqué sur "Save" et testé la fonction !** 🚀
