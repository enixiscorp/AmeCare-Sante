# Guide de Configuration Complète - AmeCare avec Supabase

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour configurer :
1. Supabase (base de données)
2. L'application principale (génération de factures)
3. L'interface admin (gestion et statistiques)

---

## ÉTAPE 1 : Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur **"New Project"**
4. Remplissez les informations :
   - **Name**: `AmeCare`
   - **Database Password**: Choisissez un mot de passe fort (notez-le !)
   - **Region**: Choisissez la région la plus proche (ex: `West Europe (Paris)`)
5. Cliquez sur **"Create new project"**
6. Attendez 2-3 minutes que le projet soit créé

### 1.2 Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️) > **API**
2. Copiez et notez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public** key : (clé publique, commence par `eyJ...`)
   - **service_role** key : (gardez-la secrète !)

### 1.3 Créer les tables

1. Dans Supabase, allez dans **SQL Editor** (📝)
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `SUPABASE_SETUP.md` (section SQL)
4. Exécutez les requêtes une par une ou toutes ensemble
5. Vérifiez que les tables sont créées dans **Table Editor**

### 1.4 Créer le premier administrateur

Dans **SQL Editor**, exécutez :

```sql
-- Créer le premier admin (mot de passe: admin123)
-- Le hash doit être généré avec bcrypt
-- Vous pouvez utiliser un outil en ligne ou le générer dans l'app admin

-- Pour l'instant, créez l'admin avec un hash temporaire
-- Vous pourrez changer le mot de passe depuis l'interface admin
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES ('admin@amecare.fr', '$2b$10$YourHashedPasswordHere', false);
```

**Note** : Le hash du mot de passe sera généré automatiquement lors de la première connexion ou via une Edge Function.

---

## ÉTAPE 2 : Configuration de l'application principale

### 2.1 Installer les dépendances

```bash
# À la racine du projet
npm install
```

### 2.2 Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

2. **Important** : Ajoutez `.env` dans `.gitignore` pour ne pas commiter vos clés

### 2.3 Tester la connexion

1. Lancez l'application :
```bash
npm run dev
```

2. Générez une facture test
3. Vérifiez dans Supabase > **Table Editor** > **invoices** que la facture apparaît

---

## ÉTAPE 3 : Configuration de l'interface Admin

### 3.1 Installer les dépendances

```bash
cd admin
npm install
```

### 3.2 Configurer les variables d'environnement

1. Créez un fichier `.env` dans le dossier `admin/` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### 3.3 Lancer l'interface admin

```bash
npm run dev
```

L'interface sera accessible sur : `http://localhost:5173` (ou le port affiché)

### 3.4 Première connexion

1. Allez sur la page de login
2. Email : `admin@amecare.fr`
3. Mot de passe : (celui que vous avez configuré)
4. Si 2FA est activé, entrez le code depuis Google Authenticator

---

## ÉTAPE 4 : Configuration de l'authentification 2FA

### 4.1 Activer 2FA pour un admin

1. Connectez-vous à l'interface admin
2. Allez dans les paramètres (à créer)
3. Activez l'authentification à deux facteurs
4. Scannez le QR Code avec Google Authenticator
5. Entrez le code de vérification

### 4.2 Utiliser Google Authenticator

1. Téléchargez **Google Authenticator** sur votre téléphone
2. Scannez le QR Code affiché
3. Utilisez le code à 6 chiffres pour vous connecter

---

## ÉTAPE 5 : Vérification et Tests

### 5.1 Vérifier que les données sont sauvegardées

1. Générez quelques factures depuis l'app principale
2. Connectez-vous à l'interface admin
3. Vérifiez dans **"Factures"** que toutes les factures apparaissent
4. Vérifiez les statistiques dans **"Statistiques"**

### 5.2 Tester les fonctionnalités admin

- ✅ Voir toutes les factures
- ✅ Filtrer par mois
- ✅ Rechercher par client/n° facture
- ✅ Voir les statistiques mensuelles
- ✅ Voir les top clients
- ✅ Télécharger les factures

---

## ÉTAPE 6 : Déploiement (Optionnel)

### 6.1 Déployer l'app principale

- **Vercel** : `vercel deploy`
- **Netlify** : Connectez votre repo GitHub
- **Autre** : Suivez les instructions de votre hébergeur

### 6.2 Déployer l'interface admin

- Même processus que l'app principale
- **Important** : Utilisez des variables d'environnement sécurisées
- L'URL admin peut être : `https://admin.amecare.fr` ou `https://amecare.fr/admin`

---

## 🔒 Sécurité

### Recommandations importantes

1. **Ne commitez jamais** les fichiers `.env`
2. **Activez RLS** (Row Level Security) dans Supabase pour la production
3. **Utilisez des mots de passe forts** pour les admins
4. **Activez 2FA** pour tous les comptes admin
5. **Limitez les accès** à l'interface admin (IP whitelist si possible)
6. **Configurez des backups** automatiques dans Supabase

---

## 🆘 Dépannage

### Les factures ne s'enregistrent pas dans Supabase

1. Vérifiez que les variables d'environnement sont correctes
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez dans Supabase > **Logs** > **API** pour voir les requêtes

### Impossible de se connecter à l'admin

1. Vérifiez que la table `admin_users` existe
2. Vérifiez que vous avez créé un utilisateur admin
3. Vérifiez les variables d'environnement dans `admin/.env`

### Erreurs de permissions Supabase

1. Allez dans **Settings** > **API** > **Row Level Security**
2. Vérifiez les politiques RLS
3. Pour le développement, vous pouvez désactiver temporairement RLS

---

## 📞 Support

Pour toute question, consultez :
- Documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
- Documentation React : [react.dev](https://react.dev)

---

## ✅ Checklist de configuration

- [ ] Projet Supabase créé
- [ ] Tables créées (invoices, admin_users, invoice_users, statistics_cache)
- [ ] Clés API récupérées
- [ ] Variables d'environnement configurées (app principale)
- [ ] Variables d'environnement configurées (interface admin)
- [ ] Premier admin créé
- [ ] Test de génération de facture réussi
- [ ] Test de connexion admin réussi
- [ ] 2FA configuré (optionnel mais recommandé)
- [ ] Statistiques fonctionnelles
- [ ] Déploiement effectué (si nécessaire)

