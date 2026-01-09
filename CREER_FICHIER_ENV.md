# 📝 Créer le Fichier .env - Guide Rapide

## ✅ J'ai créé le fichier .env pour vous !

Le fichier `.env` a été créé à la racine de votre projet avec la structure correcte.

---

## 🔧 Étape Suivante : Ajouter Votre Clé Anon

### 1. Ouvrir le fichier .env

Le fichier se trouve ici : `C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante\.env`

### 2. Récupérer votre clé anon Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) > **API**
4. Trouvez la section **"Project API keys"**
5. Copiez la clé **"anon public"** (elle commence par `eyJ...`)

### 3. Modifier le fichier .env

Ouvrez le fichier `.env` et remplacez cette ligne :

```
VITE_SUPABASE_ANON_KEY=REMPLACEZ_PAR_VOTRE_CLE_ANON_ICI
```

Par :

```
VITE_SUPABASE_ANON_KEY=votre_vraie_cle_anon_ici
```

**Exemple** :
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGVqc290cnpvdnh2c3dsd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NjEwOTgsImV4cCI6MjA4MzEzNzA5OH0...
```

### 4. Enregistrer le fichier

Appuyez sur **Ctrl+S** pour enregistrer.

### 5. Redémarrer le serveur

**IMPORTANT** : Vous devez redémarrer le serveur pour que les changements soient pris en compte.

1. Dans votre terminal, arrêtez le serveur avec **Ctrl+C**
2. Redémarrez-le avec :
   ```cmd
   npm run dev
   ```

### 6. Tester

1. Ouvrez votre application dans le navigateur
2. L'erreur "Supabase n'est pas configuré" ne devrait plus apparaître
3. Essayez de vous connecter

---

## ✅ Vérification

Pour vérifier que tout fonctionne, ouvrez la console du navigateur (F12) et tapez :

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

Vous devriez voir :
- Votre URL Supabase (pas `undefined`)
- Votre clé anon (pas `undefined`)

---

## 🎯 Résumé

1. ✅ Fichier `.env` créé
2. ⏳ **À FAIRE** : Ajouter votre clé anon Supabase
3. ⏳ **À FAIRE** : Redémarrer le serveur
4. ⏳ **À FAIRE** : Tester la connexion

---

**Une fois la clé anon ajoutée et le serveur redémarré, tout devrait fonctionner !** 🚀
