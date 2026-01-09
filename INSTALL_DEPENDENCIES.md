# 📦 Installation des Dépendances - Résolution du Problème PowerShell

## ❌ Problème

Vous rencontrez cette erreur :
```
npm : Impossible de charger le fichier C:\Program Files\nodejs\npm.ps1, car l'exécution de scripts est désactivée sur ce système.
```

C'est un problème de politique d'exécution PowerShell sur Windows.

---

## ✅ Solutions

### Solution 1 : Utiliser CMD au lieu de PowerShell (RECOMMANDÉ - Plus simple)

1. Ouvrez **Invite de commandes (CMD)** au lieu de PowerShell :
   - Appuyez sur `Windows + R`
   - Tapez `cmd` et appuyez sur Entrée
   - OU cherchez "Invite de commandes" dans le menu Démarrer

2. Naviguez vers votre projet :
   ```cmd
   cd C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante
   ```

3. Installez les dépendances :
   ```cmd
   npm install react-router-dom otplib qrcode
   ```

**Avantage** : Pas besoin de modifier les politiques système.

---

### Solution 2 : Changer la politique d'exécution PowerShell (Temporaire)

1. Ouvrez **PowerShell en tant qu'administrateur** :
   - Clic droit sur PowerShell
   - Sélectionnez "Exécuter en tant qu'administrateur"

2. Exécutez cette commande :
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. Confirmez avec `Y` (Oui)

4. Fermez et rouvrez PowerShell normalement

5. Installez les dépendances :
   ```powershell
   npm install react-router-dom otplib qrcode
   ```

**Note** : Cette solution change la politique uniquement pour votre utilisateur actuel.

---

### Solution 3 : Changer la politique d'exécution PowerShell (Permanente - Administrateur requis)

1. Ouvrez **PowerShell en tant qu'administrateur**

2. Exécutez :
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
   ```

3. Confirmez avec `Y`

4. Redémarrez PowerShell

**Note** : Cette solution change la politique pour tous les utilisateurs (nécessite les droits administrateur).

---

### Solution 4 : Utiliser npx directement

Si npm ne fonctionne pas, essayez avec npx :

```cmd
npx --yes npm install react-router-dom otplib qrcode
```

---

### Solution 5 : Utiliser yarn (Alternative)

Si vous avez yarn installé :

```cmd
yarn add react-router-dom otplib qrcode
```

---

## 🎯 Recommandation

**Utilisez la Solution 1 (CMD)** - C'est la plus simple et ne nécessite aucune modification système.

---

## ✅ Vérification

Après l'installation, vérifiez que les packages sont bien installés :

```cmd
npm list react-router-dom otplib qrcode
```

Vous devriez voir les versions installées.

---

## 📝 Commandes complètes pour l'installation

Une fois que npm fonctionne, exécutez ces commandes dans l'ordre :

```cmd
# 1. Aller dans le dossier du projet
cd C:\Users\CYRILLE\Documents\GitHub\AmeCare-Sante

# 2. Installer les dépendances pour l'application principale
npm install react-router-dom otplib qrcode

# 3. (Optionnel) Si vous voulez aussi installer les dépendances de l'interface admin
cd admin
npm install
cd ..
```

---

## 🐛 Si le problème persiste

1. **Vérifiez que Node.js est bien installé** :
   ```cmd
   node --version
   npm --version
   ```

2. **Réinstallez Node.js** si nécessaire :
   - Téléchargez depuis [nodejs.org](https://nodejs.org/)
   - Installez la version LTS
   - Redémarrez votre terminal

3. **Utilisez un autre terminal** :
   - Git Bash
   - Windows Terminal
   - VS Code Terminal (intégré)

---

**Une fois les dépendances installées, vous pourrez lancer l'application avec `npm run dev`** 🚀
