// Gestion du stockage local des factures

const STORAGE_KEY = 'amecare_invoices'
const CURRENT_INVOICE_KEY = 'amecare_current_invoice'

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


