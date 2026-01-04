import React, { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import Toast from './components/Toast'
import { generatePDF } from './utils/pdfGenerator'
import { saveInvoice, loadCurrentInvoice, getAllInvoices, loadInvoice } from './utils/invoiceStorage'
import { installPWA, isPWAInstalled, canInstallPWA } from './utils/pwaInstall'
import { optimizeLogo } from './utils/imageResizer'

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
  const [showInvoiceList, setShowInvoiceList] = useState(false)
  const [toast, setToast] = useState(null)
  const autoSaveInterval = useRef(null)

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

  // Charger la liste des factures sauvegardées
  useEffect(() => {
    setSavedInvoices(getAllInvoices())
  }, [])

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
      alert('Facture sauvegardée avec succès !')
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
  const handleDownloadPDF = () => {
    const totals = calculateTotals()
    generatePDF(invoiceData, totals)
    
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

