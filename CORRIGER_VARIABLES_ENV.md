# 🔧 Corriger le Problème des Variables d'Environnement

## 🔍 Diagnostic du Problème

L'erreur "Supabase n'est pas configuré" signifie que les variables d'environnement ne sont pas chargées correctement.

---

## ✅ Solution Étape par Étape

### Étape 1 : Vérifier que le fichier .env existe

1. Allez dans le dossier racine du projet : `C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante`
2. Vérifiez qu'il existe un fichier nommé **`.env`** (sans extension, commençant par un point)
3. Si le fichier n'existe pas, créez-le

**Important** : Le fichier doit être à la **racine** du projet, pas dans un sous-dossier.

### Étape 2 : Vérifier le contenu du fichier .env

Ouvrez le fichier `.env` et vérifiez qu'il contient exactement ceci (sans guillemets, sans espaces avant/après) :

```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**Points importants** :
- ✅ Pas d'espaces avant ou après le `=`
- ✅ Pas de guillemets autour des valeurs
- ✅ Les noms doivent commencer par `VITE_` (obligatoire pour Vite)
- ✅ Pas de ligne vide au début
- ✅ Pas de commentaires avec `#` sur les mêmes lignes

### Étape 3 : Récupérer vos vraies valeurs Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) > **API**
4. Copiez :
   - **Project URL** → C'est votre `VITE_SUPABASE_URL`
   - **anon public** key → C'est votre `VITE_SUPABASE_ANON_KEY`

### Étape 4 : Créer/Mettre à jour le fichier .env

1. Créez ou ouvrez le fichier `.env` à la racine du projet
2. Collez exactement ce format (remplacez par vos vraies valeurs) :

```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemple avec de vraies valeurs** :
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.ExempleCleLongue
```

3. **Enregistrez** le fichier (Ctrl+S)

### Étape 5 : Vérifier le format du fichier

**❌ MAUVAIS** (ne fonctionnera pas) :
```env
VITE_SUPABASE_URL = https://...
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_URL=https://... # commentaire
SUPABASE_URL=https://... (manque VITE_)
```

**✅ BON** (fonctionnera) :
```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 6 : Redémarrer le serveur de développement

**IMPORTANT** : Après avoir créé ou modifié le fichier `.env`, vous DEVEZ redémarrer le serveur.

1. **Arrêtez** le serveur actuel :
   - Dans le terminal, appuyez sur `Ctrl+C`
   - Attendez que le serveur s'arrête complètement

2. **Redémarrez** le serveur :
   ```cmd
   npm run dev
   ```

3. **Vérifiez** que le serveur démarre sans erreur

### Étape 7 : Vérifier dans la console du navigateur

1. Ouvrez votre application dans le navigateur
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Tapez cette commande pour vérifier :
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
   ```

**Résultats attendus** :
- ✅ Si vous voyez vos valeurs → Les variables sont chargées correctement
- ❌ Si vous voyez `undefined` → Le fichier .env n'est pas lu correctement

---

## 🐛 Dépannage Avancé

### Problème : Le fichier .env n'est toujours pas lu

**Solution 1 : Vérifier l'emplacement**
- Le fichier `.env` doit être à la **racine** du projet
- Pas dans `src/`, pas dans `admin/`, mais directement dans `AmeCare-Sante/`

**Solution 2 : Vérifier le nom du fichier**
- Le fichier doit s'appeler exactement `.env` (avec le point au début)
- Pas `.env.txt`, pas `env`, pas `.env.local` (pour l'instant)

**Solution 3 : Vérifier les permissions**
- Assurez-vous que le fichier n'est pas en lecture seule
- Clic droit > Propriétés > Décochez "Lecture seule" si nécessaire

**Solution 4 : Vérifier les caractères spéciaux**
- Assurez-vous qu'il n'y a pas de caractères invisibles
- Recréez le fichier si nécessaire

### Problème : Les variables sont undefined dans la console

**Solution** :
1. Vérifiez que vous avez bien redémarré le serveur
2. Vérifiez que les noms commencent par `VITE_`
3. Vérifiez qu'il n'y a pas d'espaces dans les noms ou valeurs
4. Essayez de créer un nouveau fichier `.env` et recopiez les valeurs

### Problème : Le serveur ne démarre pas

**Solution** :
1. Vérifiez qu'il n'y a pas d'erreurs de syntaxe dans le `.env`
2. Vérifiez que Node.js est bien installé : `node --version`
3. Réinstallez les dépendances : `npm install`

---

## ✅ Checklist de Vérification

Avant de considérer que tout est corrigé, vérifiez :

- [ ] Le fichier `.env` existe à la racine du projet
- [ ] Le fichier contient `VITE_SUPABASE_URL` (avec VITE_)
- [ ] Le fichier contient `VITE_SUPABASE_ANON_KEY` (avec VITE_)
- [ ] Pas d'espaces avant/après le `=`
- [ ] Pas de guillemets autour des valeurs
- [ ] Les valeurs sont correctes (URL et clé anon de Supabase)
- [ ] Le serveur a été redémarré après modification du `.env`
- [ ] La console du navigateur affiche les valeurs (pas `undefined`)

---

## 🎯 Test Final

Une fois tout configuré :

1. Redémarrez le serveur : `npm run dev`
2. Ouvrez l'application dans le navigateur
3. Essayez de vous connecter
4. L'erreur "Supabase n'est pas configuré" ne devrait plus apparaître

Si l'erreur persiste, vérifiez la console du navigateur (F12) pour voir les erreurs détaillées.

---

**Une fois corrigé, votre authentification devrait fonctionner !** 🎉
