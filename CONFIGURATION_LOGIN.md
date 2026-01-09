# 🔐 Configuration de l'Authentification - Application Principale

## ✅ Ce qui a été fait

Une page de connexion complète a été ajoutée à l'application principale AmeCare avec :

### 🎯 Fonctionnalités

1. **Page de connexion sécurisée**
   - Interface moderne et professionnelle
   - Authentification par email et mot de passe
   - Validation des champs
   - Messages d'erreur clairs

2. **Protection des routes**
   - Toutes les routes de l'application sont protégées
   - Redirection automatique vers `/login` si non authentifié
   - Redirection automatique vers `/app` si déjà authentifié

3. **Authentification**
   - Utilise la table `admin_users` de Supabase
   - Support de l'Edge Function `verify-password` (recommandé)
   - Fallback pour le développement
   - Vérification automatique de l'authentification

4. **Sécurité**
   - Tokens stockés dans localStorage
   - Vérification périodique de l'authentification
   - Déconnexion sécurisée

---

## 🚀 Installation

### Étape 1 : Installer les dépendances

```bash
npm install
```

Cela installera automatiquement :
- `react-router-dom` : Pour le routage
- `bcryptjs` : Pour la vérification des mots de passe (fallback)

### Étape 2 : Vérifier la configuration Supabase

Assurez-vous que votre fichier `.env` à la racine du projet contient :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### Étape 3 : Déployer l'Edge Function (Recommandé)

Pour une sécurité maximale, déployez l'Edge Function `verify-password` :

1. Allez dans votre projet Supabase
2. Accédez à **Edge Functions**
3. Créez une nouvelle fonction : `verify-password`
4. Copiez le contenu de `supabase/functions/verify-password/index.ts`
5. Déployez la fonction

**Note** : L'application fonctionnera sans l'Edge Function en mode développement, mais il est fortement recommandé de la déployer pour la production.

---

## 📝 Utilisation

### Se connecter

1. Lancez l'application : `npm run dev`
2. Accédez à l'application : `http://localhost:5173`
3. Vous serez automatiquement redirigé vers `/login`
4. Connectez-vous avec :
   - **Email** : `contacteccorp@gmail.com` (ou un email de votre table `admin_users`)
   - **Mot de passe** : `@dmincare26**` (ou le mot de passe correspondant)

### Déconnexion

Cliquez sur l'icône 🚪 dans le header de l'application pour vous déconnecter.

---

## 🔧 Configuration des utilisateurs

### Créer un nouvel utilisateur

Utilisez le script `scripts/create-admin.js` pour créer un nouvel administrateur :

```bash
node scripts/create-admin.js
```

Ou créez directement dans Supabase via SQL :

```sql
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES (
  'nouvel-utilisateur@example.com',
  '$2a$10$VotreHashBcryptIci', -- Générer avec bcrypt
  false
);
```

### Générer un hash bcrypt

**Option 1 : Utiliser un outil en ligne**
- Allez sur [bcrypt-generator.com](https://bcrypt-generator.com/)
- Entrez votre mot de passe
- Sélectionnez 10 rounds
- Copiez le hash généré

**Option 2 : Utiliser Node.js**
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('votre-mot-de-passe', 10);
console.log(hash);
```

---

## 🔒 Sécurité

### Mode développement (sans Edge Function)

⚠️ **ATTENTION** : En mode développement sans Edge Function déployée, l'authentification utilise un fallback qui peut être moins sécurisé. 

**Recommandations** :
- ✅ Déployez toujours l'Edge Function en production
- ✅ Utilisez des mots de passe forts
- ✅ Activez le 2FA pour les comptes administrateurs
- ✅ Ne partagez jamais vos clés API

### Mode production (avec Edge Function)

✅ L'authentification est entièrement sécurisée via l'Edge Function Supabase qui :
- Vérifie les mots de passe avec bcrypt côté serveur
- Ne transmet jamais le hash du mot de passe au client
- Gère correctement les erreurs et les tentatives de connexion

---

## 📂 Structure des fichiers

```
src/
├── components/
│   ├── Login.jsx          # Composant de la page de connexion
│   └── Login.css          # Styles de la page de connexion
├── utils/
│   └── auth.js            # Fonctions d'authentification
├── AppRouter.jsx          # Router principal avec protection des routes
├── App.jsx                # Application principale (protégée)
└── main.jsx               # Point d'entrée (utilise AppRouter)
```

---

## 🐛 Dépannage

### L'application redirige toujours vers `/login`

**Solution** :
1. Vérifiez que vous êtes bien connecté (vérifiez `localStorage` dans la console)
2. Vérifiez que les variables d'environnement sont correctement configurées
3. Vérifiez que la table `admin_users` existe dans Supabase
4. Vérifiez les logs de la console pour les erreurs

### Erreur "Email ou mot de passe incorrect"

**Solutions** :
1. Vérifiez que l'utilisateur existe dans la table `admin_users`
2. Vérifiez que le hash du mot de passe est correct (utilisez bcrypt)
3. Si l'Edge Function n'est pas déployée, vérifiez que bcryptjs est installé
4. Vérifiez les logs de la console pour plus de détails

### Erreur "Supabase non configuré"

**Solution** :
1. Créez le fichier `.env` à la racine du projet
2. Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Redémarrez le serveur de développement

---

## ✨ Prochaines améliorations possibles

- [ ] Support de l'authentification à deux facteurs (2FA)
- [ ] Gestion des sessions avec expiration
- [ ] Récupération de mot de passe oublié
- [ ] Changement de mot de passe
- [ ] Gestion de plusieurs rôles utilisateurs
- [ ] Historique des connexions

---

**Configuration terminée ! Vous pouvez maintenant utiliser l'application avec une authentification sécurisée.** 🎉
