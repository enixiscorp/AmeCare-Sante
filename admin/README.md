# AmeCare Admin - Interface d'administration

Interface d'administration pour gérer les factures générées sur AmeCare.

## Technologies

- **Vite** - Build tool
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants UI
- **Supabase** - Backend et base de données
- **Recharts** - Graphiques et statistiques

## Installation

1. Installer les dépendances :
```bash
cd admin
npm install
```

2. Configurer Supabase :
- Créer un fichier `.env` à partir de `.env.example`
- Remplir les variables d'environnement Supabase

3. Lancer en développement :
```bash
npm run dev
```

## Configuration Supabase

Voir le fichier `SUPABASE_SETUP.md` à la racine du projet pour les instructions détaillées.

## Accès

L'interface admin est accessible à l'adresse : `http://localhost:5173/admin` (ou le port configuré)

## Authentification

- Email et mot de passe requis
- Authentification à double facteur (2FA) avec Google Authenticator
- Session sécurisée avec Supabase







