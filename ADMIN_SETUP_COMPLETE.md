# ✅ Configuration Complète de l'Interface Admin AmeCare

## 🎉 Ce qui a été configuré

Votre interface d'administration est maintenant prête avec :

### ✅ Page de connexion sécurisée
- Authentification par email et mot de passe
- Support de l'authentification à deux facteurs (2FA)
- Vérification des identifiants via Edge Function Supabase (avec fallback)

### ✅ Dashboard Super Admin
- Vue d'ensemble des factures générées
- Statistiques en temps réel :
  - Total des factures
  - Revenus totaux
  - Clients uniques
  - Factures générées aujourd'hui
- Liste des 10 dernières factures avec détails

### ✅ Gestion des factures
- Liste complète de toutes les factures
- Recherche par numéro, client, email
- Filtrage par mois
- Affichage des détails : client, email, date, montant, utilisateur

### ✅ Statistiques détaillées
- Graphiques des factures par mois
- Évolution des revenus
- Top 10 des clients
- Répartition des revenus

### ✅ Paramètres de sécurité
- Gestion du compte administrateur
- Activation/désactivation du 2FA
- Configuration Google Authenticator

---

## 🚀 Démarrage

### Étape 1 : Configurer les variables d'environnement

**Important** : Vous devez créer un fichier `.env` dans le dossier `admin/` avec vos identifiants Supabase.

1. Créez le fichier `admin/.env` :

```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

2. **Où trouver la clé anon** :
   - Allez sur votre projet Supabase : https://supabase.com/dashboard
   - Accédez à **Settings** (⚙️) > **API**
   - Copiez la clé **anon public** (commence par `eyJ...`)

### Étape 2 : Installer les dépendances

```bash
cd admin
npm install
```

### Étape 3 : Lancer l'interface admin

```bash
npm run dev
```

L'interface sera accessible sur : `http://localhost:5174` (ou un autre port si 5174 est occupé)

### Étape 4 : Se connecter

1. Ouvrez votre navigateur sur l'URL affichée
2. Connectez-vous avec :
   - **Email** : `contacteccorp@gmail.com`
   - **Mot de passe** : `@dmincare26**`

---

## 🔐 Authentification

### Connexion standard
L'authentification fonctionne en deux étapes :
1. **Edge Function Supabase** : Vérification sécurisée du mot de passe (recommandé)
2. **Fallback** : Vérification locale si l'Edge Function n'est pas disponible

### Authentification à deux facteurs (2FA)

Pour activer le 2FA :

1. Connectez-vous à l'interface admin
2. Allez dans **Paramètres** (icône ⚙️ dans la barre latérale)
3. Cliquez sur **"Activer le 2FA"**
4. Scannez le QR Code avec Google Authenticator
5. Entrez le code de vérification à 6 chiffres
6. Le 2FA sera activé pour votre compte

**Important** : Une fois le 2FA activé, vous devrez entrer le code à chaque connexion.

---

## 📊 Utilisation du Dashboard

### Vue d'ensemble
Le dashboard affiche :
- **Total factures** : Nombre total de factures générées
- **Revenus totaux** : Somme de toutes les factures en €
- **Clients uniques** : Nombre de clients distincts
- **Aujourd'hui** : Nombre de factures générées aujourd'hui

### Dernières factures
Tableau des 10 dernières factures avec :
- Numéro de facture
- Nom du client
- Email du client
- Date de la facture
- Montant TTC
- ID utilisateur (auteur)
- Bouton pour voir les détails

### Navigation
- **Tableau de bord** : Vue d'ensemble
- **Factures** : Liste complète avec recherche et filtres
- **Statistiques** : Graphiques et analyses
- **Paramètres** : Configuration du compte et sécurité

---

## 🔧 Déploiement de l'Edge Function (Optionnel mais recommandé)

Pour une sécurité optimale, déployez l'Edge Function `verify-password` dans Supabase :

1. Allez dans votre projet Supabase
2. Accédez à **Edge Functions**
3. Créez une nouvelle fonction : `verify-password`
4. Copiez le contenu du fichier `supabase/functions/verify-password/index.ts`
5. Déployez la fonction

**Note** : L'application fonctionnera sans l'Edge Function grâce au fallback, mais il est recommandé de la déployer pour une sécurité maximale.

---

## 📝 Notes importantes

### Sécurité
- ⚠️ **Ne commitez JAMAIS** le fichier `.env` dans Git
- ⚠️ Changez le mot de passe par défaut après la première connexion
- ✅ Activez le 2FA pour une sécurité renforcée
- ✅ Utilisez un mot de passe fort (minimum 12 caractères)

### Base de données
- Les factures sont automatiquement récupérées depuis Supabase
- Les statistiques sont calculées en temps réel
- Les données sont filtrées et triées côté client

### Support
- En cas d'erreur, vérifiez :
  1. Les variables d'environnement dans `.env`
  2. La connexion à Supabase
  3. L'existence des tables dans Supabase (`invoices`, `admin_users`)
  4. Les logs de la console du navigateur (F12)

---

## 🎯 Prochaines étapes possibles

- [ ] Activer le 2FA pour votre compte
- [ ] Déployer l'Edge Function `verify-password`
- [ ] Configurer les politiques RLS (Row Level Security) dans Supabase
- [ ] Personnaliser le dashboard selon vos besoins
- [ ] Exporter les factures en CSV/PDF
- [ ] Ajouter des filtres supplémentaires (par client, par montant, etc.)

---

## ✨ Fonctionnalités disponibles

### ✅ Implémentées
- ✅ Page de connexion avec email/mot de passe
- ✅ Dashboard avec statistiques
- ✅ Liste complète des factures
- ✅ Recherche et filtres
- ✅ Statistiques détaillées avec graphiques
- ✅ Gestion du 2FA
- ✅ Navigation intuitive
- ✅ Interface responsive

### 🔄 Améliorations futures possibles
- Export des données (CSV, PDF)
- Notifications en temps réel
- Gestion multi-administrateurs
- Historique des actions
- Rapports personnalisés
- Intégration avec d'autres services

---

**Configuration terminée ! Vous pouvez maintenant accéder à votre interface d'administration.** 🎉
