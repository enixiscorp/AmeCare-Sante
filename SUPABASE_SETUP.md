# Configuration Supabase pour AmeCare

## Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: AmeCare
   - **Database Password**: Choisissez un mot de passe fort (AmeCare#9Xv!2LqR7@)
   - **Region**: Choisissez la région la plus proche
5. Attendez que le projet soit créé (2-3 minutes)

## Étape 2 : Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (clé publique)
   - **service_role** key (gardez-la secrète, pour le backend uniquement)

## Étape 3 : Créer les tables dans Supabase

Allez dans **SQL Editor** dans votre projet Supabase et exécutez les requêtes suivantes :

### Table des factures

```sql
-- Table principale des factures
-- Utilise IF NOT EXISTS pour éviter les erreurs si la table existe déjà
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(255),
  client_address TEXT,
  structure_name VARCHAR(255) DEFAULT 'AmeCare Santé',
  invoice_date DATE NOT NULL,
  service_period VARCHAR(255),
  total_ht DECIMAL(10, 2) NOT NULL,
  total_tva DECIMAL(10, 2) DEFAULT 0,
  total_ttc DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT '€',
  payment_terms TEXT,
  payment_deadline VARCHAR(100),
  payment_methods VARCHAR(255),
  legal_mention TEXT,
  invoice_data JSONB NOT NULL, -- Stocke toutes les données de la facture
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides (créés seulement s'ils n'existent pas)
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Table des utilisateurs (pour tracking)

```sql
-- Table pour suivre les utilisateurs qui génèrent des factures
-- Utilise IF NOT EXISTS pour éviter les erreurs si la table existe déjà
CREATE TABLE IF NOT EXISTS invoice_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  first_invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_invoice_date TIMESTAMP WITH TIME ZONE,
  total_invoices INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index seulement s'ils n'existent pas déjà
CREATE INDEX IF NOT EXISTS idx_invoice_users_user_id ON invoice_users(user_id);
```

### Table des administrateurs

```sql
-- Table pour les administrateurs avec 2FA
-- Utilise IF NOT EXISTS pour éviter les erreurs si la table existe déjà
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  two_factor_secret VARCHAR(255), -- Secret pour Google Authenticator
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer le premier admin (mot de passe: admin123 - à changer après)
-- Le hash doit être généré avec bcrypt (voir le code d'authentification)
-- Utilise ON CONFLICT pour éviter les erreurs si l'admin existe déjà
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES ('admin@amecare.fr', '$2b$10$YourHashedPasswordHere', false)
ON CONFLICT (email) DO NOTHING;
```

### Table des statistiques (cache)

```sql
-- Table pour stocker les statistiques calculées
-- Utilise IF NOT EXISTS pour éviter les erreurs si la table existe déjà
CREATE TABLE IF NOT EXISTS statistics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type VARCHAR(50) NOT NULL,
  stat_period VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', etc.
  stat_data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stat_type, stat_period)
);
```

## Étape 4 : Configurer Row Level Security (RLS)

```sql
-- Désactiver RLS pour les tables (ou configurer selon vos besoins)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- OU configurer RLS pour la sécurité :
-- Seuls les admins peuvent lire toutes les factures
-- Les utilisateurs peuvent seulement voir leurs propres factures
```

## Étape 5 : Créer des fonctions utiles

```sql
-- Fonction pour obtenir les statistiques mensuelles
CREATE OR REPLACE FUNCTION get_monthly_statistics(year_param INTEGER, month_param INTEGER)
RETURNS TABLE (
  total_invoices BIGINT,
  total_revenue DECIMAL,
  unique_clients BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_invoices,
    COALESCE(SUM(total_ttc), 0) as total_revenue,
    COUNT(DISTINCT client_email)::BIGINT as unique_clients,
    COUNT(DISTINCT user_id)::BIGINT as unique_users
  FROM invoices
  WHERE EXTRACT(YEAR FROM created_at) = year_param
    AND EXTRACT(MONTH FROM created_at) = month_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les top clients
CREATE OR REPLACE FUNCTION get_top_clients(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  client_email VARCHAR,
  client_name VARCHAR,
  invoice_count BIGINT,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.client_email,
    i.client_name,
    COUNT(*)::BIGINT as invoice_count,
    COALESCE(SUM(i.total_ttc), 0) as total_amount
  FROM invoices i
  WHERE i.client_email IS NOT NULL
  GROUP BY i.client_email, i.client_name
  ORDER BY total_amount DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

## Étape 6 : Configuration dans l'application

1. Créez un fichier `.env` dans le dossier `admin/` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

2. Créez également un fichier `.env` dans le dossier racine de l'app principale :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

## Étape 7 : Tester la connexion

Une fois les tables créées, vous pouvez tester la connexion depuis l'interface admin.

## Notes importantes

- **Sécurité** : Ne commitez jamais les fichiers `.env` dans Git
- **Backup** : Configurez des backups automatiques dans Supabase
- **RLS** : Activez Row Level Security pour la production
- **Rate Limiting** : Configurez des limites de taux dans Supabase pour éviter les abus

