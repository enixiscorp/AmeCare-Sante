# 🔐 Authentification avec 2FA (Google Authenticator)

## ✅ Configuration terminée

Votre application utilise maintenant une authentification sécurisée avec :
- ✅ **Email + Mot de passe** (vérifié via Edge Function Supabase)
- ✅ **Authentification à deux facteurs (2FA)** avec Google Authenticator
- ✅ **Pas de bcrypt côté client** - tout se fait via l'Edge Function Supabase

---

## 🚀 Comment ça fonctionne

### Étape 1 : Connexion Email + Mot de passe

1. L'utilisateur entre son **email** et son **mot de passe**
2. L'application appelle l'**Edge Function Supabase** `verify-password`
3. L'Edge Function vérifie le mot de passe avec bcrypt (côté serveur)
4. Si le mot de passe est correct ET que le 2FA est activé, l'application demande le code 2FA

### Étape 2 : Code 2FA (si activé)

1. L'utilisateur ouvre **Google Authenticator** (ou une autre app compatible)
2. Il entre le **code à 6 chiffres** affiché dans l'application
3. L'application vérifie le code avec le secret TOTP stocké dans Supabase
4. Si le code est valide, l'utilisateur est connecté

---

## 📋 Prérequis

### 1. Déployer l'Edge Function Supabase

**IMPORTANT** : L'Edge Function `verify-password` est **OBLIGATOIRE** pour que l'authentification fonctionne.

1. Allez dans votre projet Supabase
2. Accédez à **Edge Functions**
3. Créez une nouvelle fonction : `verify-password`
4. Copiez le contenu de `supabase/functions/verify-password/index.ts`
5. Déployez la fonction

### 2. Installer les dépendances

```bash
npm install react-router-dom otplib qrcode
```

### 3. Configurer les variables d'environnement

Assurez-vous que votre fichier `.env` contient :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

---

## 👤 Créer un utilisateur avec 2FA

### Option 1 : Via le script create-admin.js

Le script crée un utilisateur sans 2FA par défaut. Pour activer le 2FA :

1. Connectez-vous à l'interface admin (`admin/`)
2. Allez dans **Paramètres**
3. Cliquez sur **"Activer le 2FA"**
4. Scannez le QR Code avec Google Authenticator
5. Entrez le code de vérification

### Option 2 : Via SQL (sans 2FA initialement)

```sql
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES (
  'utilisateur@example.com',
  '$2a$10$VotreHashBcryptIci', -- Générer avec bcrypt
  false -- Le 2FA sera activé plus tard via l'interface
);
```

---

## 🔑 Activer le 2FA pour un utilisateur

### Via l'interface admin

1. Connectez-vous à l'interface admin : `http://localhost:5174`
2. Allez dans **Paramètres** (⚙️)
3. Cliquez sur **"Activer le 2FA"**
4. Scannez le QR Code avec Google Authenticator
5. Entrez le code de vérification à 6 chiffres
6. Le 2FA sera activé

### Via SQL (avancé)

Pour activer le 2FA manuellement, vous devez :
1. Générer un secret TOTP
2. Créer un QR Code
3. Le scanner avec Google Authenticator
4. Mettre à jour la base de données

**Recommandation** : Utilisez l'interface admin pour activer le 2FA, c'est plus simple et plus sûr.

---

## 📱 Utiliser Google Authenticator

### Installation

1. Téléchargez **Google Authenticator** sur votre téléphone :
   - [iOS](https://apps.apple.com/app/google-authenticator/id388497605)
   - [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

### Scanner le QR Code

1. Ouvrez Google Authenticator
2. Appuyez sur **"+"** ou **"Ajouter un compte"**
3. Sélectionnez **"Scanner un code QR"**
4. Scannez le QR Code affiché dans l'interface admin
5. Un code à 6 chiffres apparaîtra dans l'application

### Utiliser le code

1. Lors de la connexion, après avoir entré votre email et mot de passe
2. Si le 2FA est activé, vous verrez un champ pour le code 2FA
3. Ouvrez Google Authenticator
4. Entrez le code à 6 chiffres affiché (il change toutes les 30 secondes)

---

## 🔧 Dépannage

### Erreur "Edge Function non disponible"

**Solution** :
1. Vérifiez que l'Edge Function `verify-password` est déployée dans Supabase
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez les logs de l'Edge Function dans Supabase

### Erreur "Code 2FA invalide"

**Solutions** :
1. Vérifiez que l'heure de votre téléphone est correcte (TOTP dépend de l'heure)
2. Assurez-vous d'entrer le code dans les 30 secondes
3. Vérifiez que vous utilisez le bon compte dans Google Authenticator
4. Réessayez avec un nouveau code (ils changent toutes les 30 secondes)

### Le QR Code ne s'affiche pas

**Solutions** :
1. Vérifiez que `qrcode` est installé : `npm install qrcode`
2. Vérifiez la console du navigateur pour les erreurs
3. Assurez-vous d'utiliser un navigateur moderne (Chrome, Firefox, Safari, Edge)

### L'authentification ne fonctionne pas

**Vérifications** :
1. ✅ L'Edge Function `verify-password` est déployée
2. ✅ Les variables d'environnement sont configurées
3. ✅ L'utilisateur existe dans la table `admin_users`
4. ✅ Le hash du mot de passe est correct (généré avec bcrypt)
5. ✅ Le 2FA est correctement configuré (si activé)

---

## 🔒 Sécurité

### Avantages de cette approche

✅ **Pas de bcrypt côté client** - Tout se fait côté serveur via l'Edge Function
✅ **2FA avec Google Authenticator** - Standard de l'industrie
✅ **Codes TOTP** - Changent toutes les 30 secondes
✅ **Secret stocké de manière sécurisée** - Dans Supabase, jamais exposé au client

### Bonnes pratiques

- ✅ Activez le 2FA pour tous les comptes importants
- ✅ Gardez votre téléphone sécurisé (code PIN, biométrie)
- ✅ Ne partagez jamais votre secret 2FA
- ✅ Utilisez des mots de passe forts
- ✅ Déployez toujours l'Edge Function en production

---

## 📂 Fichiers modifiés

- ✅ `src/components/Login.jsx` - Page de connexion avec support 2FA
- ✅ `src/components/Login.css` - Styles pour le 2FA
- ✅ `src/utils/auth.js` - Authentification sans bcrypt côté client
- ✅ `src/AppRouter.jsx` - Routage avec protection
- ✅ `package.json` - Dépendances (otplib, qrcode au lieu de bcryptjs)

---

## 🎯 Prochaines étapes

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Déployer l'Edge Function** :
   - Allez dans Supabase > Edge Functions
   - Créez `verify-password`
   - Copiez le code de `supabase/functions/verify-password/index.ts`

3. **Tester la connexion** :
   - Lancez l'application : `npm run dev`
   - Accédez à `http://localhost:5173`
   - Connectez-vous avec email + mot de passe
   - Si le 2FA est activé, entrez le code depuis Google Authenticator

---

**Configuration terminée ! Votre application utilise maintenant une authentification sécurisée avec 2FA.** 🎉
