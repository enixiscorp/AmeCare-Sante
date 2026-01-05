# 🚀 Guide de Démarrage Rapide - AmeCare avec Supabase

## Étape 1 : Configuration Supabase (10 minutes)

### 1.1 Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur **"New Project"**
3. Remplissez :
   - **Name** : `AmeCare`
   - **Database Password** : (notez-le bien !)
   - **Region** : Choisissez la plus proche
4. Attendez 2-3 minutes

### 1.2 Récupérer les clés

Dans **Settings** > **API**, copiez :
- **Project URL**
- **anon public** key

### 1.3 Créer les tables

**Option A : Via SQL Editor (Recommandé)**

1. Allez dans **SQL Editor**
2. Copiez-collez le SQL du fichier `SUPABASE_SETUP.md`
3. Exécutez toutes les requêtes

**Option B : Via l'outil MCP (si disponible)**

Les tables peuvent être créées automatiquement via les outils MCP Supabase.

### 1.4 Créer le premier admin

Exécutez dans **SQL Editor** :

```sql
-- Remplacez le hash par un hash bcrypt valide pour votre mot de passe
-- Utilisez : https://bcrypt-generator.com/ ou Node.js
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES (
  'admin@amecare.fr',
  '$2a$10$VotreHashBcryptIci', -- Générer avec bcrypt
  false
);
```

---

## Étape 2 : Configurer l'Application Principale

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
EOF

# 3. Lancer l'application
npm run dev
```

Testez en générant une facture. Vérifiez dans Supabase > **Table Editor** > **invoices** qu'elle apparaît.

---

## Étape 3 : Configurer l'Interface Admin

```bash
# 1. Aller dans le dossier admin
cd admin

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cat > .env << EOF
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
EOF

# 4. Lancer l'interface admin
npm run dev
```

L'interface sera sur `http://localhost:5173`

### Première connexion

1. Email : `admin@amecare.fr`
2. Mot de passe : Celui que vous avez configuré
3. Si 2FA activé : Code depuis Google Authenticator

---

## ✅ Vérification

1. ✅ Factures s'enregistrent dans Supabase
2. ✅ Interface admin accessible
3. ✅ Connexion admin fonctionne
4. ✅ Statistiques s'affichent
5. ✅ Liste des factures visible

---

## 🔗 URLs Importantes

- **App principale** : `http://localhost:5173` (ou port affiché)
- **Interface admin** : `http://localhost:5173` (dans le dossier admin)
- **Supabase Dashboard** : Votre projet sur supabase.com

---

## 📚 Documentation Complète

- **Configuration détaillée** : `SETUP_GUIDE.md`
- **SQL Supabase** : `SUPABASE_SETUP.md`
- **Créer admin** : `CREATE_ADMIN.md`
- **Interface admin** : `README_ADMIN.md`

