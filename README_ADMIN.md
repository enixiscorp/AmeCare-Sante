# 🎯 Interface Admin AmeCare - Guide Complet

## 📦 Structure du Projet

```
AmeCare-Sante/
├── src/                    # Application principale (génération factures)
├── admin/                   # Interface d'administration
│   ├── src/
│   │   ├── pages/          # Pages (Login, Dashboard, Invoices, Statistics)
│   │   ├── components/     # Composants réutilisables
│   │   └── lib/            # Utilitaires (Supabase, Auth)
│   └── package.json
├── supabase/
│   └── functions/          # Edge Functions Supabase
└── SUPABASE_SETUP.md      # Instructions SQL pour Supabase
```

## 🚀 Démarrage Rapide

### 1. Configuration Supabase (5 minutes)

1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Récupérer les clés** dans Settings > API
3. **Exécuter les requêtes SQL** du fichier `SUPABASE_SETUP.md`
4. **Créer le premier admin** (voir `CREATE_ADMIN.md`)

### 2. Application Principale

```bash
# Installer les dépendances
npm install

# Configurer .env
echo "VITE_SUPABASE_URL=votre_url" > .env
echo "VITE_SUPABASE_ANON_KEY=votre_cle" >> .env

# Lancer
npm run dev
```

### 3. Interface Admin

```bash
# Aller dans le dossier admin
cd admin

# Installer les dépendances
npm install

# Configurer .env
echo "VITE_SUPABASE_URL=votre_url" > .env
echo "VITE_SUPABASE_ANON_KEY=votre_cle" >> .env

# Lancer
npm run dev
```

L'interface admin sera accessible sur : `http://localhost:5173`

## 🔐 Authentification Admin

### Connexion
- **Email** : `admin@amecare.fr` (ou celui que vous avez créé)
- **Mot de passe** : Celui configuré dans Supabase
- **2FA** : Code depuis Google Authenticator (si activé)

### Activer 2FA
1. Connectez-vous à l'interface admin
2. Allez dans les paramètres (à implémenter)
3. Activez 2FA
4. Scannez le QR Code avec Google Authenticator
5. Utilisez le code à 6 chiffres pour les prochaines connexions

## 📊 Fonctionnalités Admin

### Dashboard
- Vue d'ensemble des statistiques
- Total factures générées
- Revenus totaux
- Clients uniques
- Factures du jour
- Liste des 10 dernières factures

### Gestion des Factures
- Liste complète de toutes les factures
- Recherche par numéro, client, email
- Filtre par mois
- Téléchargement des factures
- Voir les détails complets

### Statistiques
- Graphiques mensuels (factures, revenus)
- Top 10 clients
- Répartition des revenus
- Évolution dans le temps

## 🔗 Lien d'Accès Admin

Une fois déployé, l'interface admin sera accessible à :
- **Développement** : `http://localhost:5173`
- **Production** : `https://votre-domaine.com/admin` ou `https://admin.votre-domaine.com`

## 📝 Notes Importantes

1. **Sécurité** : Ne partagez jamais les clés Supabase
2. **Backup** : Configurez des backups automatiques dans Supabase
3. **2FA** : Recommandé pour tous les comptes admin
4. **RLS** : Activez Row Level Security en production

## 🆘 Support

Consultez `SETUP_GUIDE.md` pour un guide détaillé étape par étape.

