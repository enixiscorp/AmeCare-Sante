# Scripts utilitaires

Ce dossier contient des scripts utilitaires pour faciliter la configuration et la maintenance de l'application AmeCare.

## 📋 Scripts disponibles

### `create-admin.js`

Script pour créer ou mettre à jour le premier administrateur dans Supabase.

#### Prérequis

1. Node.js v16 ou supérieur installé
2. Les dépendances suivantes installées :
   ```bash
   npm install @supabase/supabase-js bcryptjs
   ```

#### Configuration

1. Ouvrez le fichier `scripts/create-admin.js`
2. Remplacez les valeurs suivantes :
   - `SUPABASE_URL` : Votre URL Supabase (ex: `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` : Votre service_role key (trouvable dans Supabase > Settings > API)
   - `ADMIN_EMAIL` : Email de l'administrateur (par défaut : `admin@amecare.fr`)
   - `ADMIN_PASSWORD` : Mot de passe de l'administrateur (par défaut : `admin123`)

#### Utilisation

```bash
# À la racine du projet
node scripts/create-admin.js
```

#### Ce que fait le script

1. ✅ Vérifie si un administrateur avec l'email spécifié existe déjà
2. ✅ Génère un hash bcrypt du mot de passe
3. ✅ Crée un nouvel administrateur ou met à jour le mot de passe existant
4. ✅ Affiche les détails de l'administrateur créé/mis à jour
5. ✅ Affiche des messages d'erreur détaillés en cas de problème

#### Exemple de sortie

```
🔐 Création de l'administrateur...
📧 Email: admin@amecare.fr
🔒 Génération du hash bcrypt...
✅ Hash généré: $2a$10$N9qo8uLOickg...
🔍 Vérification si l'admin existe déjà...
➕ Création du nouvel administrateur...
✅ Administrateur créé avec succès!
📋 Détails de l'admin:
   - ID: 12345678-1234-1234-1234-123456789abc
   - Email: admin@amecare.fr
   - 2FA activé: false
   - Date de création: 2024-01-15T10:30:00.000Z

🎉 Opération terminée!
📝 Vous pouvez maintenant vous connecter à l'interface admin avec:
   Email: admin@amecare.fr
   Mot de passe: admin123

⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!
```

#### Dépannage

**Erreur : "Veuillez configurer les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"**
- Solution : Ouvrez le script et remplacez les valeurs par défaut par vos vraies valeurs Supabase

**Erreur : "relation admin_users does not exist"**
- Solution : Exécutez d'abord le script SQL de création des tables (voir `SUPABASE_SETUP.md`)

**Erreur : "permission denied"**
- Solution : Vérifiez que vous utilisez la **service_role key** (et non la anon key) pour avoir les permissions nécessaires

**Erreur : "Cannot find module '@supabase/supabase-js'"**
- Solution : Installez les dépendances : `npm install @supabase/supabase-js bcryptjs`

## 🔒 Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS le fichier `create-admin.js` avec vos vraies clés API
- Utilisez un mot de passe fort pour l'administrateur
- Changez le mot de passe après la première connexion
- Gardez votre service_role key secrète (ne la partagez jamais)

## 📝 Notes

- Le script vérifie automatiquement si l'admin existe déjà et met à jour son mot de passe si nécessaire
- Le hash bcrypt est généré avec 10 rounds (recommandé)
- Le script est idempotent : vous pouvez l'exécuter plusieurs fois sans problème

