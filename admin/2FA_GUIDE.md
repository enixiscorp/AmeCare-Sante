# Guide d'authentification à deux facteurs (2FA)

Ce guide explique comment fonctionne le système d'authentification à deux facteurs avec génération de QR Code pour l'interface admin AmeCare.

## 📚 Bibliothèques utilisées

Le projet utilise trois bibliothèques principales pour le 2FA :

1. **`qrcode`** : Génère physiquement l'image du QR Code
2. **`otpauth`** : Crée le format spécial pour l'authentification à deux facteurs (2FA)
3. **`otplib`** : Utilitaires pour la génération et vérification des codes TOTP

## 🔄 Processus étape par étape

### Étape A : Génération du secret TOTP

Quand un administrateur active le 2FA, un secret unique est généré :

```typescript
const secret = generateTOTPSecret()
```

**Ce qui se passe** :
- Un secret aléatoire de **20 bytes** est créé
- Ce secret est encodé en **base64** pour être stocké dans la base de données
- C'est une "clé secrète" unique pour chaque utilisateur
- Le secret est stocké dans la table `admin_users` (champ `two_factor_secret`)

### Étape B : Création de l'URI TOTP

Le secret est converti en URI TOTP au format standard :

```typescript
const uri = generateTOTPUri(secret, email, 'AmeCare Santé')
```

**Ce qui se passe** :
- Le secret base64 est converti en **base32** (format requis par Google Authenticator)
- Un URI spécial est créé avec ce format : `otpauth://totp/AmeCare Santé:email@example.com?secret=...&issuer=AmeCare Santé`
- Cet URI contient toutes les infos nécessaires :
  - L'émetteur : `AmeCare Santé`
  - L'email de l'utilisateur
  - Le secret encodé en base32

**Exemple d'URI généré** :
```
otpauth://totp/AmeCare%20Sant%C3%A9:admin@amecare.fr?secret=JBSWY3DPEHPK3PXP&issuer=AmeCare%20Sant%C3%A9&algorithm=SHA1&digits=6&period=30
```

### Étape C : Génération du QR Code

L'URI est transformé en image QR Code :

```typescript
const qrCode = await generateQRCode(uri)
```

**Ce qui se passe** :
- La bibliothèque `qrcode` prend l'URI et le transforme en image QR Code
- `toDataURL()` génère une image au format **Data URL** (base64)
- Cette image peut être directement affichée dans une balise `<img>`
- Le QR Code est affiché dans un dialogue modal

## 🎯 Affichage dans l'interface

Dans le composant `Enable2FADialog`, après la génération du QR Code :

```tsx
<img
  src={qrCode}
  alt="QR Code TOTP"
  className="w-48 h-48 sm:w-64 sm:h-64"
/>
```

**Processus utilisateur** :
1. L'administrateur clique sur "Activer le 2FA" dans les paramètres
2. Un dialogue modal s'ouvre avec le QR Code affiché
3. L'utilisateur scanne le QR Code avec Google Authenticator
4. Si le scan ne fonctionne pas, le secret peut être copié manuellement
5. L'utilisateur entre le code à 6 chiffres depuis Google Authenticator
6. Le code est vérifié et le 2FA est activé si valide

## 🔒 Pourquoi ce système ?

**Sécurité renforcée** :
- Chaque admin a un secret unique
- Google Authenticator génère un code à 6 chiffres qui change toutes les 30 secondes
- Ce code est basé sur le secret + l'heure actuelle (TOTP - Time-based One-Time Password)
- Même si quelqu'un vole le mot de passe, il ne peut pas se connecter sans le code 2FA

**Standards reconnus** :
- Utilise le standard **TOTP** (RFC 6238)
- Compatible avec Google Authenticator, Microsoft Authenticator, Authy, etc.
- Format URI standardisé (`otpauth://`)

## 🔄 Flux complet

1. **Admin va dans Paramètres** → Clique sur "Activer le 2FA"
2. **Système génère le secret** → Secret de 20 bytes, encodé en base64
3. **Secret converti en URI TOTP** → Format `otpauth://totp/...`
4. **URI transformé en QR Code** → Image Data URL (base64)
5. **QR Code affiché** → L'utilisateur le scanne avec Google Authenticator
6. **Code de vérification** → L'utilisateur entre le code à 6 chiffres
7. **2FA activé** → Le secret est sauvegardé dans la base de données
8. **Connexions futures** → L'utilisateur doit entrer le code 2FA à chaque connexion

## 📱 Utilisation de Google Authenticator

### Installation

1. Téléchargez **Google Authenticator** sur votre téléphone :
   - iOS : [App Store](https://apps.apple.com/app/google-authenticator/id388497605)
   - Android : [Google Play](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

2. Ouvrez l'application

3. Scannez le QR Code affiché dans l'interface admin

4. Un compte "AmeCare Santé" apparaît dans l'application avec un code à 6 chiffres

5. Le code change automatiquement toutes les 30 secondes

### À la connexion

1. Entrez votre email et mot de passe
2. Si le 2FA est activé, un champ apparaît pour le code 2FA
3. Ouvrez Google Authenticator
4. Entrez le code à 6 chiffres affiché
5. Cliquez sur "Se connecter"

## 🔧 Configuration technique

### Stockage du secret

Le secret est stocké dans la table `admin_users` :
- **Champ** : `two_factor_secret` (VARCHAR)
- **Format** : Base64 (ex: `dGVzdCBzZWNyZXQgc3RyaW5nIGZvciAyZmE=`)
- **Longueur** : Variable (environ 28 caractères base64 pour 20 bytes)

### Vérification du code

Lors de la connexion, le code 2FA est vérifié :
1. Le secret base64 est récupéré depuis la base de données
2. Il est converti en base32
3. Un code TOTP est généré avec `otpauth` basé sur l'heure actuelle
4. Le code saisi par l'utilisateur est comparé avec le code généré
5. Une fenêtre de ±30 secondes est acceptée (paramètre `window: 1`)

### Désactivation du 2FA

L'administrateur peut désactiver le 2FA à tout moment :
1. Aller dans Paramètres
2. Cliquer sur "Désactiver le 2FA"
3. Confirmer l'action
4. Le secret est supprimé de la base de données et `two_factor_enabled` passe à `false`

## ⚠️ Sécurité et bonnes pratiques

1. **Ne partagez jamais votre secret** : Le secret doit rester confidentiel
2. **Sauvegardez vos codes de récupération** : Si vous perdez votre téléphone, vous devrez contacter l'administrateur système
3. **Activez le 2FA immédiatement** : Ne laissez pas votre compte sans 2FA en production
4. **Vérifiez régulièrement** : Assurez-vous que le 2FA est toujours activé
5. **Code de récupération** : Considérez l'ajout d'un système de codes de récupération pour les cas d'urgence

## 📝 Code source

Les fonctions principales sont dans :
- `admin/src/lib/twoFactorAuth.ts` : Fonctions utilitaires pour le 2FA
- `admin/src/components/Enable2FADialog.tsx` : Composant pour activer le 2FA
- `admin/src/pages/Settings.tsx` : Page des paramètres avec gestion du 2FA
- `admin/src/lib/auth.ts` : Vérification du code 2FA lors de la connexion

## 🆘 Dépannage

### Le QR Code ne s'affiche pas

- Vérifiez que les dépendances sont installées : `npm install qrcode otpauth`
- Vérifiez la console du navigateur pour les erreurs
- Réessayez de générer le QR Code

### Le scan ne fonctionne pas

- Vérifiez que la caméra de votre téléphone fonctionne
- Assurez-vous que le QR Code est bien visible et non flou
- Essayez de copier le secret manuellement et de l'ajouter dans Google Authenticator

### Le code 2FA est invalide

- Vérifiez que l'heure de votre téléphone est correcte (TOTP est basé sur l'heure)
- Attendez que le code change (toutes les 30 secondes)
- Réessayez avec un nouveau code

### Impossible de se connecter après activation du 2FA

- Vérifiez que vous avez bien scanné le QR Code avec Google Authenticator
- Vérifiez que le compte "AmeCare Santé" apparaît dans Google Authenticator
- Vérifiez que vous entrez le bon code à 6 chiffres
- Contactez l'administrateur système si le problème persiste

---

**Système de sécurité robuste utilisant des standards reconnus (TOTP) et des bibliothèques éprouvées pour protéger les comptes administrateurs.**







