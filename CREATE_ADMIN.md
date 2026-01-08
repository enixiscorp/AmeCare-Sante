# Créer le premier administrateur

## Méthode 1 : Via SQL dans Supabase

1. Allez dans **SQL Editor** dans Supabase
2. Exécutez cette requête (remplacez le hash par un hash bcrypt valide) :

```sql
-- Générer un hash bcrypt pour le mot de passe "admin123"
-- Utilisez un outil en ligne comme : https://bcrypt-generator.com/
-- Ou utilisez Node.js :

-- Dans Node.js :
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);
-- console.log(hash);

INSERT INTO admin_users (email, password_hash, two_factor_enabled)
VALUES (
  'admin@amecare.fr',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash pour "admin123"
  false
);
```

## Méthode 2 : Via l'interface admin (à créer)

Une fois l'interface admin fonctionnelle, vous pourrez créer des admins depuis l'interface.

## Méthode 3 : Script Node.js

Créez un fichier `create-admin.js` :

```javascript
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'VOTRE_SUPABASE_URL';
const supabaseKey = 'VOTRE_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@amecare.fr';
  const password = 'admin123';
  const hash = bcrypt.hashSync(password, 10);

  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email,
      password_hash: hash,
      two_factor_enabled: false
    });

  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('Admin créé avec succès!');
  }
}

createAdmin();
```

Puis exécutez : `node create-admin.js`







