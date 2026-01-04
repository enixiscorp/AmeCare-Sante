// Gestion du stockage local des factures avec historique persistant

const STORAGE_KEY = 'amecare_invoices'
const HISTORY_KEY = 'amecare_invoice_history' // Historique de toutes les factures générées
const CURRENT_INVOICE_KEY = 'amecare_current_invoice'
const USER_ID_KEY = 'amecare_user_id' // ID unique de l'utilisateur
const ADMIN_KEY = 'amecare_admin_mode' // Mode administrateur

// Générer un ID utilisateur unique s'il n'existe pas
const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

// Vérifier si on est en mode admin (peut être activé manuellement)
export const isAdminMode = () => {
  return localStorage.getItem(ADMIN_KEY) === 'true'
}

// Activer/désactiver le mode admin (pour l'administrateur)
export const setAdminMode = (enabled) => {
  if (enabled) {
    // Demander confirmation avant d'activer le mode admin
    const password = prompt('Mode administrateur : Entrez le mot de passe (admin123 par défaut)')
    if (password === 'admin123' || password === 'AmeCare2024!') {
      localStorage.setItem(ADMIN_KEY, 'true')
      return true
    } else {
      alert('Mot de passe incorrect')
      return false
    }
  } else {
    localStorage.removeItem(ADMIN_KEY)
    return true
  }
}

export const saveInvoice = (invoiceData) => {
  try {
    // Sauvegarder la facture actuelle
    localStorage.setItem(CURRENT_INVOICE_KEY, JSON.stringify(invoiceData))
    
    // Récupérer toutes les factures sauvegardées
    const invoices = getAllInvoices()
    
    // Ajouter ou mettre à jour la facture
    const existingIndex = invoices.findIndex(
      inv => inv.invoiceNumber === invoiceData.invoiceNumber
    )
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoiceData
    } else {
      invoices.push({
        ...invoiceData,
        savedAt: new Date().toISOString()
      })
    }
    
    // Trier par date de sauvegarde (plus récent en premier)
    invoices.sort((a, b) => {
      const dateA = new Date(a.savedAt || 0)
      const dateB = new Date(b.savedAt || 0)
      return dateB - dateA
    })
    
    // Garder seulement les 50 dernières factures pour ne pas surcharger
    const limitedInvoices = invoices.slice(0, 50)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedInvoices))
    return true
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return false
  }
}

// Sauvegarder dans l'historique quand le PDF est généré (persiste même après cache clear)
export const saveToHistory = (invoiceData) => {
  try {
    const userId = getUserId()
    // Récupérer toutes les factures de l'historique (admin mode)
    const data = localStorage.getItem(HISTORY_KEY)
    const history = data ? JSON.parse(data) : []
    
    // Créer une entrée d'historique avec métadonnées
    // Utiliser totalTTC si disponible (depuis totals calculés), sinon calculer
    const totalTTC = invoiceData.totalTTC || (
      invoiceData.totals?.totalTTC || 
      ((invoiceData.services?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0) + 
       (invoiceData.kilometers?.amount || 0)) * (1 + (invoiceData.tvaRate || 0) / 100)
    )
    
    const historyEntry = {
      ...invoiceData,
      userId: userId,
      generatedAt: new Date().toISOString(),
      invoiceNumber: invoiceData.invoiceNumber || 'N/A',
      clientName: invoiceData.clientName || 'Non renseigné',
      totalTTC: totalTTC
    }
    
    // Vérifier si la facture existe déjà dans l'historique
    const existingIndex = history.findIndex(
      inv => inv.invoiceNumber === invoiceData.invoiceNumber && inv.userId === userId
    )
    
    if (existingIndex >= 0) {
      history[existingIndex] = historyEntry
    } else {
      history.push(historyEntry)
    }
    
    // Trier par date de génération (plus récent en premier)
    history.sort((a, b) => {
      const dateA = new Date(a.generatedAt || 0)
      const dateB = new Date(b.generatedAt || 0)
      return dateB - dateA
    })
    
    // Stocker dans localStorage (dans un objet séparé pour l'historique)
    // Pour plus de persistance, on peut aussi stocker dans IndexedDB
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    
    return true
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans l\'historique:', error)
    return false
  }
}

// Récupérer l'historique des factures (toutes ou filtrées par utilisateur)
export const getInvoiceHistory = (allUsers = false) => {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    const history = data ? JSON.parse(data) : []
    
    if (allUsers && isAdminMode()) {
      // Mode admin : retourner toutes les factures
      return history
    } else {
      // Mode utilisateur : retourner seulement ses factures
      const userId = getUserId()
      return history.filter(inv => inv.userId === userId)
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
    return []
  }
}

export const loadCurrentInvoice = () => {
  try {
    const data = localStorage.getItem(CURRENT_INVOICE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    return null
  }
}

export const getAllInvoices = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error)
    return []
  }
}

export const loadInvoice = (invoiceNumber) => {
  try {
    const invoices = getAllInvoices()
    return invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null
  } catch (error) {
    console.error('Erreur lors du chargement de la facture:', error)
    return null
  }
}

export const deleteInvoice = (invoiceNumber) => {
  try {
    const invoices = getAllInvoices()
    const filtered = invoices.filter(inv => inv.invoiceNumber !== invoiceNumber)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return false
  }
}

export const autoSave = (invoiceData) => {
  // Sauvegarde automatique toutes les 30 secondes
  saveInvoice(invoiceData)
}


