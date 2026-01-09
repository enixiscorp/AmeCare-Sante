# ⚡ Solution Rapide - Variables d'Environnement

## 🎯 Problème Identifié

Le fichier `.env` n'existe pas, c'est pour ça que vous voyez l'erreur "Supabase n'est pas configuré".

---

## ✅ Solution en 3 Étapes

### Étape 1 : Créer le fichier .env

**Option A : Via l'explorateur Windows**
1. Allez dans `C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante`
2. Clic droit > Nouveau > Document texte
3. Renommez-le en `.env` (supprimez l'extension `.txt`)
4. Windows vous demandera confirmation → Cliquez "Oui"

**Option B : Via VS Code**
1. Dans VS Code, créez un nouveau fichier
2. Nommez-le `.env`
3. Collez le contenu ci-dessous

### Étape 2 : Ajouter le contenu

Ouvrez le fichier `.env` et collez exactement ceci :

```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**⚠️ IMPORTANT** : Remplacez `votre_cle_anon_ici` par votre vraie clé anon Supabase.

### Étape 3 : Récupérer votre clé anon

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** (⚙️) > **API**
4. Copiez la clé **"anon public"** (commence par `eyJ...`)
5. Collez-la dans le fichier `.env` à la place de `votre_cle_anon_ici`

**Exemple final** :
```env
VITE_SUPABASE_URL=https://wjpejsotrzovxvswlwkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGVqc290cnpvdnh2c3dsd2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NjEwOTgsImV4cCI6MjA4MzEzNzA5OH0...
```

### Étape 4 : Redémarrer le serveur

**OBLIGATOIRE** : Après avoir créé/modifié le `.env`, redémarrez le serveur.

1. Arrêtez le serveur actuel : **Ctrl+C** dans le terminal
2. Redémarrez : `npm run dev`

---

## ✅ Vérification

1. Ouvrez votre application
2. L'erreur "Supabase n'est pas configuré" ne devrait plus apparaître
3. Essayez de vous connecter

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérification 1 : Emplacement du fichier
Le fichier `.env` doit être **à la racine** du projet :
```
C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante\.env
```

### Vérification 2 : Format du fichier
- ✅ Pas d'espaces avant/après le `=`
- ✅ Pas de guillemets autour des valeurs
- ✅ Les noms commencent par `VITE_`

### Vérification 3 : Redémarrage
- ✅ Le serveur a été complètement arrêté puis redémarré

### Vérification 4 : Console du navigateur
Ouvrez F12 > Console et tapez :
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```

Si vous voyez `undefined`, le fichier n'est pas lu correctement.

---

**Une fois ces étapes suivies, votre authentification devrait fonctionner !** 🎉
