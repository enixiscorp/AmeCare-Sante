import React, { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import Toast from './components/Toast'
import { generatePDF } from './utils/pdfGenerator'
import { saveInvoice, loadCurrentInvoice, getAllInvoices, loadInvoice, saveToHistory, getInvoiceHistory, isAdminMode, setAdminMode } from './utils/invoiceStorage'
import { installPWA, isPWAInstalled, canInstallPWA } from './utils/pwaInstall'
import { optimizeLogo } from './utils/imageResizer'
import { saveInvoiceToSupabase } from './utils/supabaseClient'

const initialInvoiceData = {
  // Header
  logo: null,
  structureName: 'AmeCare Santé',
  activity: '',
  phone: '',
  email: '',
  address: '',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  servicePeriod: '',
  
  // Client
  clientName: '',
  clientRef: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
  clientInsurance: '',
  
  // Services
  services: [
    {
      ref: '',
      designation: '',
      hours: 0,
      patientRef: '',
      unitPrice: 0,
      amount: 0
    }
  ],
  
  // Kilometers
  kilometers: {
    distance: 0,
    rate: 0,
    amount: 0
  },
  
  // Totals
  tvaRate: 20,
  currency: '€'
}

// Fonction pour générer le numéro de facture automatique
const generateInvoiceNumber = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  
  // Récupérer le dernier numéro depuis localStorage
  const lastNumberKey = `lastInvoiceNumber_${year}_${month}`
  const lastNumber = parseInt(localStorage.getItem(lastNumberKey) || '0', 10)
  const nextNumber = lastNumber + 1
  
  // Sauvegarder le nouveau numéro
  localStorage.setItem(lastNumberKey, nextNumber.toString())
  
  return `FAC-${year}-${month}-${String(nextNumber).padStart(3, '0')}`
}

// Fonction pour initialiser le numéro de facture au chargement
const getInitialInvoiceNumber = () => {
  // Si un numéro existe déjà dans le formulaire, ne pas le changer
  const savedNumber = localStorage.getItem('currentInvoiceNumber')
  if (savedNumber) {
    return savedNumber
  }
  return generateInvoiceNumber()
}

function App() {
  const [invoiceData, setInvoiceData] = useState(() => {
    // Charger la facture sauvegardée ou créer une nouvelle
    const saved = loadCurrentInvoice()
    if (saved) {
      // S'assurer que le nom de la structure est toujours "AmeCare Santé"
      return { 
        ...saved, 
        invoiceNumber: saved.invoiceNumber || getInitialInvoiceNumber(),
        structureName: 'AmeCare Santé'
      }
    }
    return {
      ...initialInvoiceData,
      invoiceNumber: getInitialInvoiceNumber()
    }
  })
  const [activeTab, setActiveTab] = useState('form')
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [savedInvoices, setSavedInvoices] = useState([])
  const [invoiceHistory, setInvoiceHistory] = useState([])
  const [showInvoiceList, setShowInvoiceList] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [adminMode, setAdminModeState] = useState(false)
  const [toast, setToast] = useState(null)
  const autoSaveInterval = useRef(null)

  // Vérifier le mode admin au chargement et gestion de l'accès secret
  useEffect(() => {
    setAdminModeState(isAdminMode())
    
    // Accès secret au mode admin : Ctrl+Shift+A (à maintenir pendant 3 secondes)
    let secretKeyTimer = null
    let secretKeyCombo = []
    
    const handleSecretKeyPress = (e) => {
      // Détecter Ctrl+Shift+A maintenu
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        secretKeyCombo.push(Date.now())
        
        // Vérifier si on a maintenu la combinaison pendant au moins 2 secondes
        if (secretKeyCombo.length >= 10) {
          const timeDiff = secretKeyCombo[secretKeyCombo.length - 1] - secretKeyCombo[0]
          if (timeDiff >= 2000 && !isAdminMode()) {
            // Activer le mode admin directement
            const password = prompt('Mode administrateur : Entrez le mot de passe')
            if (password === 'admin123' || password === 'AmeCare2024!' || password === 'AmeCareAdmin2024') {
              setAdminModeState(true)
              localStorage.setItem('amecare_admin_mode', 'true')
              setInvoiceHistory(getInvoiceHistory(true))
              setToast({
                message: 'Mode administrateur activé',
                type: 'success'
              })
            }
            secretKeyCombo = []
          }
        }
      } else {
        secretKeyCombo = []
      }
    }
    
    const handleSecretKeyUp = () => {
      secretKeyCombo = []
    }
    
    // Écouter les touches secrètes uniquement si pas déjà en mode admin
    if (!isAdminMode()) {
      window.addEventListener('keydown', handleSecretKeyPress)
      window.addEventListener('keyup', handleSecretKeyUp)
    }
    
    return () => {
      window.removeEventListener('keydown', handleSecretKeyPress)
      window.removeEventListener('keyup', handleSecretKeyUp)
      if (secretKeyTimer) clearTimeout(secretKeyTimer)
    }
  }, [])

  // Initialiser PWA et service worker
  useEffect(() => {
    if (canInstallPWA() && !isPWAInstalled()) {
      installPWA().catch(err => console.log('PWA non disponible:', err))
      
      // Détecter l'événement beforeinstallprompt
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowInstallPrompt(true)
      }
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  // Sauvegarde automatique toutes les 30 secondes
  useEffect(() => {
    autoSaveInterval.current = setInterval(() => {
      saveInvoice(invoiceData)
    }, 30000)

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current)
      }
    }
  }, [invoiceData])

  // Charger la liste des factures sauvegardées et l'historique
  useEffect(() => {
    setSavedInvoices(getAllInvoices())
    setInvoiceHistory(getInvoiceHistory(isAdminMode()))
  }, [adminMode])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleLoadInvoice = (invoiceNumber) => {
    const invoice = loadInvoice(invoiceNumber)
    if (invoice) {
      setInvoiceData({
        ...invoice,
        structureName: 'AmeCare Santé' // Forcer le nom à rester "AmeCare Santé"
      })
      setShowInvoiceList(false)
      setActiveTab('form')
    }
  }

  const handleSaveCurrent = () => {
    if (saveInvoice(invoiceData)) {
      setSavedInvoices(getAllInvoices())
      setToast({
        message: 'Facture sauvegardée avec succès !',
        type: 'success'
      })
    }
  }

  const handleToggleAdminMode = () => {
    // Désactiver le mode admin uniquement (activation via accès secret)
    if (setAdminMode(false)) {
      setAdminModeState(false)
      setInvoiceHistory(getInvoiceHistory(false))
      setShowHistory(false)
      setToast({
        message: 'Mode administrateur désactivé',
        type: 'info'
      })
    }
  }

  const handleLoadFromHistory = (invoiceNumber) => {
    const history = getInvoiceHistory(isAdminMode())
    const invoice = history.find(inv => inv.invoiceNumber === invoiceNumber)
    if (invoice) {
      setInvoiceData({
        ...invoice,
        structureName: 'AmeCare Santé'
      })
      setShowHistory(false)
      setActiveTab('form')
      setToast({
        message: 'Facture chargée depuis l\'historique',
        type: 'success'
      })
    }
  }

  const updateInvoiceData = useCallback((field, value) => {
    setInvoiceData(prev => {
      const newData = { ...prev }
      
      // Empêcher la modification du nom de la structure
      if (field === 'structureName') {
        newData.structureName = 'AmeCare Santé'
        return newData
      }
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        newData[parent] = { ...newData[parent], [child]: value }
      } else {
        newData[field] = value
      }
      
      // Auto-calculate service amounts
      if (field === 'services') {
        newData.services = value.map(service => ({
          ...service,
          amount: (service.hours || 0) * (service.unitPrice || 0)
        }))
      }
      
      // Auto-calculate kilometers amount
      if (field === 'kilometers.distance' || field === 'kilometers.rate') {
        const km = field === 'kilometers.distance' ? value : newData.kilometers.distance
        const rate = field === 'kilometers.rate' ? value : newData.kilometers.rate
        newData.kilometers.amount = (km || 0) * (rate || 0)
      }
      
      // Sauvegarder automatiquement
      saveInvoice(newData)
      
      return newData
    })
  }, [])

  const handleServiceChange = (index, field, value) => {
    const newServices = [...invoiceData.services]
    newServices[index] = {
      ...newServices[index],
      [field]: field === 'hours' || field === 'unitPrice' ? parseFloat(value) || 0 : value
    }
    newServices[index].amount = (newServices[index].hours || 0) * (newServices[index].unitPrice || 0)
    updateInvoiceData('services', newServices)
  }

  const addService = () => {
    updateInvoiceData('services', [
      ...invoiceData.services,
      {
        ref: '',
        designation: '',
        hours: 0,
        patientRef: '',
        unitPrice: 0,
        amount: 0
      }
    ])
  }

  const removeService = (index) => {
    if (invoiceData.services.length > 1) {
      updateInvoiceData('services', invoiceData.services.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const servicesTotal = invoiceData.services.reduce((sum, service) => sum + (service.amount || 0), 0)
    const kmTotal = invoiceData.kilometers.amount || 0
    const subtotalHT = servicesTotal + kmTotal
    const tvaAmount = (subtotalHT * (invoiceData.tvaRate || 0)) / 100
    const totalTTC = subtotalHT + tvaAmount

    return {
      servicesTotal,
      kmTotal,
      subtotalHT,
      tvaAmount,
      totalTTC
    }
  }

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
      // Générer un nouveau numéro de facture à la réinitialisation
      const newInvoiceNumber = generateInvoiceNumber()
      localStorage.setItem('currentInvoiceNumber', newInvoiceNumber)
      setInvoiceData({
        ...initialInvoiceData,
        invoiceNumber: newInvoiceNumber,
        structureName: 'AmeCare Santé' // S'assurer que le nom reste "AmeCare Santé"
      })
    }
  }

  // Générer un nouveau numéro de facture quand l'utilisateur télécharge le PDF
  const handleDownloadPDF = async () => {
    const totals = calculateTotals()
    generatePDF(invoiceData, totals)
    
    // Sauvegarder dans l'historique local persistant
    const historyData = {
      ...invoiceData,
      totals: totals,
      totalTTC: totals.totalTTC
    }
    saveToHistory(historyData)
    
    // Sauvegarder dans Supabase (backend)
    try {
      await saveInvoiceToSupabase(invoiceData, totals)
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error)
      // Ne pas bloquer l'utilisateur si Supabase échoue
    }
    
    // Rafraîchir l'historique
    setInvoiceHistory(getInvoiceHistory(isAdminMode()))
    
    // Afficher la notification de succès
    setToast({
      message: 'Facture générée et téléchargée avec succès !',
      type: 'success'
    })
    
    // Après téléchargement, générer un nouveau numéro pour la prochaine facture
    const newInvoiceNumber = generateInvoiceNumber()
    localStorage.setItem('currentInvoiceNumber', newInvoiceNumber)
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: newInvoiceNumber
    }))
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        // Vérifier que c'est une image
        if (!file.type.startsWith('image/')) {
          setToast({
            message: 'Veuillez sélectionner un fichier image',
            type: 'error'
          })
          return
        }

        // Optimiser et redimensionner l'image
        const optimizedImage = await optimizeLogo(file)
        updateInvoiceData('logo', optimizedImage)
        
        setToast({
          message: 'Logo optimisé et ajouté avec succès !',
          type: 'success'
        })
      } catch (error) {
        console.error('Erreur lors de l\'optimisation du logo:', error)
        setToast({
          message: 'Erreur lors de l\'ajout du logo. Veuillez réessayer.',
          type: 'error'
        })
      }
    }
  }

  const handlePreviewClick = () => {
    setActiveTab('preview')
    // Scroll en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totals = calculateTotals()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 AmeCare - Générateur de Facture</h1>
          <p>Créez vos factures professionnelles en quelques minutes</p>
        </div>
        {showInstallPrompt && !isPWAInstalled() && (
          <button className="install-pwa-btn" onClick={handleInstallPWA}>
            📲 Installer l'app
          </button>
        )}
        <div className="header-actions">
          <button className="save-btn" onClick={handleSaveCurrent} title="Sauvegarder">
            💾
          </button>
          <button className="list-btn" onClick={() => setShowInvoiceList(!showInvoiceList)} title="Mes factures">
            📋
          </button>
          <button className="history-btn" onClick={() => setShowHistory(!showHistory)} title="Historique">
            📚
          </button>
          {/* Boutons admin uniquement visibles en mode admin (accès secret uniquement) */}
          {adminMode && (
            <>
              <button className="admin-btn" onClick={() => setShowHistory(!showHistory)} title="Historique Admin - Toutes les factures">
                👑
              </button>
              <button className="admin-exit-btn" onClick={handleToggleAdminMode} title="Quitter le mode admin">
                🚪
              </button>
            </>
          )}
        </div>
      </header>

      {showInvoiceList && (
        <div className="invoice-list-overlay">
          <div className="invoice-list-modal">
            <div className="modal-header">
              <h2>Mes factures sauvegardées</h2>
              <button className="close-btn" onClick={() => setShowInvoiceList(false)}>✕</button>
            </div>
            <div className="invoice-list-content">
              {savedInvoices.length === 0 ? (
                <p className="empty-message">Aucune facture sauvegardée</p>
              ) : (
                <ul className="invoice-list">
                  {savedInvoices.map((invoice, index) => (
                    <li key={index} className="invoice-item">
                      <div className="invoice-item-info">
                        <strong>{invoice.invoiceNumber || 'Sans numéro'}</strong>
                        <span>{invoice.clientName || 'Client non renseigné'}</span>
                        <small>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('fr-FR') : ''}</small>
                      </div>
                      <button 
                        className="load-invoice-btn"
                        onClick={() => handleLoadInvoice(invoice.invoiceNumber)}
                      >
                        Charger
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="invoice-list-overlay">
          <div className="invoice-list-modal history-modal">
            <div className="modal-header">
              <h2>
                {adminMode ? '👑 Historique complet - Mode Administrateur' : '📚 Mon historique de factures'}
              </h2>
              <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="invoice-list-content">
              {invoiceHistory.length === 0 ? (
                <p className="empty-message">
                  {adminMode ? 'Aucune facture dans l\'historique global' : 'Aucune facture générée pour le moment'}
                </p>
              ) : (
                <>
                  {adminMode && (
                    <div className="history-info admin-info">
                      <strong>👑 Mode Administrateur</strong>
                      <p>{invoiceHistory.length} facture(s) générée(s) au total par tous les utilisateurs</p>
                    </div>
                  )}
                  <ul className="invoice-list">
                    {invoiceHistory.map((invoice, index) => (
                      <li key={index} className="invoice-item history-item">
                        <div className="invoice-item-info">
                          <strong>{invoice.invoiceNumber || 'Sans numéro'}</strong>
                          <span>{invoice.clientName || 'Client non renseigné'}</span>
                          <small>
                            {invoice.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </small>
                          {adminMode && invoice.userId && (
                            <small className="user-id">Utilisateur: {invoice.userId.substring(0, 8)}...</small>
                          )}
                        </div>
                        <button 
                          className="load-invoice-btn"
                          onClick={() => handleLoadFromHistory(invoice.invoiceNumber)}
                        >
                          Voir
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="app-tabs">
        <button
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          📝 Formulaire
        </button>
        <button
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Aperçu
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'form' ? (
          <InvoiceForm
            invoiceData={invoiceData}
            updateInvoiceData={updateInvoiceData}
            handleServiceChange={handleServiceChange}
            addService={addService}
            removeService={removeService}
            handleLogoUpload={handleLogoUpload}
            totals={totals}
            onPreviewClick={handlePreviewClick}
          />
        ) : (
          <InvoicePreview
            invoiceData={invoiceData}
            totals={totals}
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Notification Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  )
}

export default App

