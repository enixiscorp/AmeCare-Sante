import React from 'react'
import './InvoicePreview.css'

const InvoicePreview = ({ invoiceData, totals, onDownloadPDF, onReset }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="invoice-preview-container">
      <div className="preview-actions">
        <button onClick={onDownloadPDF} className="btn-download">
          📥 Télécharger la facture (PDF)
        </button>
        <button onClick={onReset} className="btn-reset">
          🔄 Réinitialiser
        </button>
      </div>

      <div className="invoice-preview" id="invoice-preview">
        {/* Header */}
        <div className="invoice-header">
          <div className="header-left">
            {invoiceData.logo && (
              <img src={invoiceData.logo} alt="Logo" className="invoice-logo" />
            )}
            <div>
              <h1 className="structure-name">{invoiceData.structureName || 'AmeCare Santé'}</h1>
              {invoiceData.activity && <p className="activity">{invoiceData.activity}</p>}
              <div className="contact-info">
                {invoiceData.phone && <p>Tel: {invoiceData.phone}</p>}
                {invoiceData.email && <p>Email: {invoiceData.email}</p>}
                {invoiceData.address && <p>Adresse: {invoiceData.address}</p>}
              </div>
            </div>
          </div>
          <div className="header-right">
            <h2 className="invoice-title">FACTURE</h2>
            <div className="invoice-details">
              <p><strong>N° Facture:</strong> {invoiceData.invoiceNumber || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(invoiceData.invoiceDate)}</p>
              {invoiceData.servicePeriod && (
                <p><strong>Période:</strong> {invoiceData.servicePeriod}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client Section */}
        <div className="invoice-client">
          <h3>Facturé à:</h3>
          <div className="client-details-grid">
            <div className="client-column-left">
              <p><strong>{invoiceData.clientName || 'Nom du client'}</strong></p>
              {invoiceData.clientRef && <p><strong>Réf. patient:</strong> {invoiceData.clientRef}</p>}
              {invoiceData.clientAddress && <p><strong>Adresse:</strong> {invoiceData.clientAddress}</p>}
            </div>
            <div className="client-column-right">
              {invoiceData.clientPhone && <p><strong>Téléphone:</strong> {invoiceData.clientPhone}</p>}
              {invoiceData.clientEmail && <p><strong>Email:</strong> {invoiceData.clientEmail}</p>}
              {invoiceData.clientInsurance && <p><strong>Assurance:</strong> {invoiceData.clientInsurance}</p>}
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="invoice-services">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Réf</th>
                <th>Désignation</th>
                <th>Unités</th>
                <th>Réf patient</th>
                <th>P.U</th>
                <th className="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.services.map((service, index) => (
                (service.designation || service.ref || service.hours > 0 || service.unitPrice > 0) && (
                  <tr key={index}>
                    <td>{service.ref || '-'}</td>
                    <td>{service.designation || '-'}</td>
                    <td className="text-center">{service.hours || 0}</td>
                    <td>{service.patientRef || '-'}</td>
                    <td className="text-right">{service.unitPrice?.toFixed(2) || '0.00'} {invoiceData.currency}</td>
                    <td className="text-right">{service.amount?.toFixed(2) || '0.00'} {invoiceData.currency}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {/* Kilometers */}
        {(invoiceData.kilometers.distance > 0 || invoiceData.kilometers.rate > 0) && (
          <div className="invoice-kilometers">
            <h3>Frais kilométriques</h3>
            <div className="kilometers-details">
              <p>
                {invoiceData.kilometers.distance} km × {invoiceData.kilometers.rate.toFixed(2)} {invoiceData.currency}/km
              </p>
              <p className="amount">
                <strong>{invoiceData.kilometers.amount.toFixed(2)} {invoiceData.currency}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="invoice-totals">
          <div className="totals-table">
            <div className="total-row">
              <span>Total prestations HT:</span>
              <span>{totals.servicesTotal.toFixed(2)} {invoiceData.currency}</span>
            </div>
            {(invoiceData.kilometers.distance > 0 || invoiceData.kilometers.rate > 0) && (
              <div className="total-row">
                <span>Total frais kilométriques:</span>
                <span>{totals.kmTotal.toFixed(2)} {invoiceData.currency}</span>
              </div>
            )}
            <div className="total-row subtotal">
              <span>Sous-total HT:</span>
              <span><strong>{totals.subtotalHT.toFixed(2)} {invoiceData.currency}</strong></span>
            </div>
            {invoiceData.tvaRate > 0 && (
              <>
                <div className="total-row">
                  <span>TVA ({invoiceData.tvaRate}%):</span>
                  <span>{totals.tvaAmount.toFixed(2)} {invoiceData.currency}</span>
                </div>
              </>
            )}
            <div className="total-row grand-total">
              <span>Total TTC:</span>
              <span><strong>{totals.totalTTC.toFixed(2)} {invoiceData.currency}</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          {invoiceData.paymentTerms && (
            <div className="footer-section">
              <h4>Conditions de paiement:</h4>
              <p>{invoiceData.paymentTerms}</p>
            </div>
          )}
          {invoiceData.paymentDeadline && (
            <div className="footer-section">
              <h4>Délai de paiement:</h4>
              <p>{invoiceData.paymentDeadline}</p>
            </div>
          )}
          {invoiceData.paymentMethods && (
            <div className="footer-section">
              <h4>Moyens de paiement acceptés:</h4>
              <p>{invoiceData.paymentMethods}</p>
            </div>
          )}
          {invoiceData.legalMention && (
            <div className="footer-section">
              <p className="legal-mention">{invoiceData.legalMention}</p>
            </div>
          )}
          <div className="footer-section slogan">
            <p className="company-slogan">La Qualité de votre Santé, notre Priorité</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePreview

