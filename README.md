# 🏥 AmeCare - Générateur de Facture

Application web front-end pour générer des factures professionnelles pour les prestations de soins à domicile. Aucun backend requis.

## ✨ Fonctionnalités

- ✅ Formulaire dynamique complet
- ✅ Upload et affichage de logo
- ✅ Calcul automatique des prestations et frais kilométriques
- ✅ Gestion dynamique des lignes de prestations (ajout/suppression)
- ✅ Calcul automatique de la TVA
- ✅ Aperçu en temps réel de la facture
- ✅ Export PDF professionnel (format A4)
- ✅ Design responsive (mobile & desktop)
- ✅ Devises configurables (€, $, £)
- ✅ Numérotation de facture personnalisable

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer l'application en mode développement :
```bash
npm run dev
```

3. Ouvrir votre navigateur à l'adresse affichée (généralement http://localhost:5173)

## 📦 Build pour production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

## 🎯 Utilisation

1. **Onglet Formulaire** :
   - Renseignez les informations de votre structure
   - Téléchargez votre logo (optionnel)
   - Renseignez les informations du client/patient
   - Ajoutez vos prestations (lignes multiples possibles)
   - Configurez les frais kilométriques
   - Ajustez la TVA si nécessaire

2. **Onglet Aperçu** :
   - Visualisez votre facture avant export
   - Téléchargez le PDF
   - Réinitialisez le formulaire si besoin

## 📋 Structure de la facture

### Header
- Logo (optionnel)
- Nom de la structure
- Activité
- Coordonnées (téléphone, email, adresse)
- N° de facture
- Date
- Période de prestation

### Client / Patient
- Nom & prénom
- Référence patient
- Adresse
- Coordonnées
- Assurance (optionnel)

### Prestations
Tableau avec :
- Référence
- Désignation
- Unités (heures)
- Référence patient
- Prix unitaire
- Montant (calculé automatiquement)

### Frais kilométriques
- Nombre de kilomètres
- Coût par kilomètre
- Montant total (calculé automatiquement)

### Totaux
- Total prestations HT
- Total frais kilométriques
- Sous-total HT
- TVA (%)
- Total TTC

### Footer
- Conditions de paiement
- Délai de paiement
- Moyens de paiement
- Mentions légales

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool et serveur de développement
- **jsPDF** - Génération de PDF
- **jsPDF-autotable** - Tables dans les PDF
- **CSS3** - Styling responsive

## 📱 Compatibilité

- ✅ Chrome/Edge (dernières versions)
- ✅ Firefox (dernières versions)
- ✅ Safari (dernières versions)
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 📝 Notes

- Aucune donnée n'est stockée (application 100% côté client)
- Les PDF sont générés localement dans le navigateur
- Tous les calculs sont effectués en temps réel
- Compatible avec tous les navigateurs modernes

## 📄 Licence

Voir le fichier LICENSE pour plus d'informations.

## 🆘 Support

Pour toute question ou problème, veuillez créer une issue sur le repository.

