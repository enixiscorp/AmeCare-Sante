import React, { useState, useCallback } from 'react'
import './App.css'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import { generatePDF } from './utils/pdfGenerator'

const initialInvoiceData = {
  // Header
  logo: null,
  structureName: '',
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
  const [invoiceData, setInvoiceData] = useState({
    ...initialInvoiceData,
    invoiceNumber: getInitialInvoiceNumber()
  })
  const [activeTab, setActiveTab] = useState('form')

  const updateInvoiceData = useCallback((field, value) => {
    setInvoiceData(prev => {
      const newData = { ...prev }
      
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
        invoiceNumber: newInvoiceNumber
      })
    }
  }

  // Générer un nouveau numéro de facture quand l'utilisateur télécharge le PDF
  const handleDownloadPDF = () => {
    const totals = calculateTotals()
    generatePDF(invoiceData, totals)
    
    // Après téléchargement, générer un nouveau numéro pour la prochaine facture
    const newInvoiceNumber = generateInvoiceNumber()
    localStorage.setItem('currentInvoiceNumber', newInvoiceNumber)
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: newInvoiceNumber
    }))
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateInvoiceData('logo', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 AmeCare - Générateur de Facture</h1>
        <p>Créez vos factures professionnelles en quelques minutes</p>
      </header>

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
    </div>
  )
}

export default App

