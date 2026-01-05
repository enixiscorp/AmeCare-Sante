-- Script SQL IDEMPOTENT pour Supabase
-- Peut être exécuté plusieurs fois sans erreur
-- Utilisez ce script si vous obtenez des erreurs "relation already exists"

-- ========================================
-- TABLE DES FACTURES
-- ========================================

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
  invoice_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- ========================================
-- TABLE DES UTILISATEURS
-- ========================================

CREATE TABLE IF NOT EXISTS invoice_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  first_invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_invoice_date TIMESTAMP WITH TIME ZONE,
  total_invoices INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_users_user_id ON invoice_users(user_id);

-- ========================================
-- TABLE DES ADMINISTRATEURS
-- ========================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE DES STATISTIQUES (CACHE)
-- ========================================

CREATE TABLE IF NOT EXISTS statistics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type VARCHAR(50) NOT NULL,
  stat_period VARCHAR(50) NOT NULL,
  stat_data JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stat_type, stat_period)
);

-- ========================================
-- FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger s'il existe et le recréer
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

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

-- ========================================
-- CRÉATION DU PREMIER ADMIN
-- ========================================

-- Créer le premier admin (si n'existe pas déjà)
-- IMPORTANT: Remplacez le hash par un hash bcrypt valide
-- Utilisez: https://bcrypt-generator.com/ ou Node.js
INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES ('admin@amecare.fr', '$2b$10$YourHashedPasswordHere', false)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Désactiver RLS pour le développement
-- À activer en production pour plus de sécurité
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE statistics_cache DISABLE ROW LEVEL SECURITY;

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Script exécuté avec succès !';
  RAISE NOTICE '✅ Tables créées/vérifiées';
  RAISE NOTICE '✅ Index créés/vérifiés';
  RAISE NOTICE '✅ Fonctions créées/vérifiées';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '   1. Remplacez le hash du mot de passe admin';
  RAISE NOTICE '   2. Configurez les variables d''environnement';
  RAISE NOTICE '   3. Testez la connexion depuis l''interface admin';
END $$;

