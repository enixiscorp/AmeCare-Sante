import React from 'react'
import './InvoiceForm.css'

const InvoiceForm = ({
  invoiceData,
  updateInvoiceData,
  handleServiceChange,
  addService,
  removeService,
  handleLogoUpload,
  totals,
  onPreviewClick
}) => {
  return (
    <div className="invoice-form">
      {/* Header Section */}
      <section className="form-section">
        <h2>📋 Informations de la structure</h2>
        <div className="form-grid">
          <div className="form-group logo-upload">
            <label>Logo</label>
            <div className="logo-preview-container">
              {invoiceData.logo ? (
                <img src={invoiceData.logo} alt="Logo" className="logo-preview" />
              ) : (
                <div className="logo-placeholder">Aucun logo</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file-input"
              />
              <button
                type="button"
                onClick={() => updateInvoiceData('logo', null)}
                className="remove-logo-btn"
                disabled={!invoiceData.logo}
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Nom de la structure *</label>
            <input
              type="text"
              value={invoiceData.structureName || 'AmeCare Santé'}
              readOnly
              className="readonly-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Activité</label>
            <input
              type="text"
              value={invoiceData.activity}
              onChange={(e) => updateInvoiceData('activity', e.target.value)}
              placeholder="Soins à domicile"
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              value={invoiceData.phone}
              onChange={(e) => updateInvoiceData('phone', e.target.value)}
              placeholder="01 23 45 67 89"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={invoiceData.email}
              onChange={(e) => updateInvoiceData('email', e.target.value)}
              placeholder="contact@amecare.fr"
            />
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>
            <textarea
              value={invoiceData.address}
              onChange={(e) => updateInvoiceData('address', e.target.value)}
              placeholder="123 Rue Example, 75000 Paris"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>N° Facture * <span style={{fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b'}}>(généré automatiquement)</span></label>
            <input
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => updateInvoiceData('invoiceNumber', e.target.value)}
              placeholder="FAC-2024-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => updateInvoiceData('invoiceDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Période de prestation</label>
            <input
              type="text"
              value={invoiceData.servicePeriod}
              onChange={(e) => updateInvoiceData('servicePeriod', e.target.value)}
              placeholder="Du 01/01/2024 au 31/01/2024"
            />
          </div>
        </div>
      </section>

      {/* Client Section */}
      <section className="form-section">
        <h2>👤 Informations client / patient</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nom & Prénom *</label>
            <input
              type="text"
              value={invoiceData.clientName}
              onChange={(e) => updateInvoiceData('clientName', e.target.value)}
              placeholder="Dupont Jean"
              required
            />
          </div>

          <div className="form-group">
            <label>Référence patient</label>
            <input
              type="text"
              value={invoiceData.clientRef}
              onChange={(e) => updateInvoiceData('clientRef', e.target.value)}
              placeholder="REF-12345"
            />
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>
            <textarea
              value={invoiceData.clientAddress}
              onChange={(e) => updateInvoiceData('clientAddress', e.target.value)}
              placeholder="123 Rue Client, 75000 Paris"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              value={invoiceData.clientPhone}
              onChange={(e) => updateInvoiceData('clientPhone', e.target.value)}
              placeholder="01 23 45 67 89"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={invoiceData.clientEmail}
              onChange={(e) => updateInvoiceData('clientEmail', e.target.value)}
              placeholder="client@example.com"
            />
          </div>

          <div className="form-group full-width">
            <label>Assurance (optionnel)</label>
            <input
              type="text"
              value={invoiceData.clientInsurance}
              onChange={(e) => updateInvoiceData('clientInsurance', e.target.value)}
              placeholder="CPAM - Sécurité Sociale"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="form-section">
        <div className="section-header">
          <h2>💼 Prestations</h2>
          <button type="button" onClick={addService} className="btn-add">
            + Ajouter une ligne
          </button>
        </div>
        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Réf</th>
                <th>Désignation</th>
                <th>Unitiés (heures)</th>
                <th>Réf patient</th>
                <th>P.U</th>
                <th>Montant</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.services.map((service, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={service.ref}
                      onChange={(e) => handleServiceChange(index, 'ref', e.target.value)}
                      placeholder="REF-001"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={service.designation}
                      onChange={(e) => handleServiceChange(index, 'designation', e.target.value)}
                      placeholder="Soin infirmier"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={service.hours || ''}
                      onChange={(e) => handleServiceChange(index, 'hours', e.target.value)}
                      placeholder="0"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={service.patientRef}
                      onChange={(e) => handleServiceChange(index, 'patientRef', e.target.value)}
                      placeholder="PAT-001"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={service.unitPrice || ''}
                      onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="table-input"
                    />
                  </td>
                  <td>
                    <span className="amount-display">
                      {service.amount.toFixed(2)} {invoiceData.currency}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="btn-remove"
                      disabled={invoiceData.services.length === 1}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="total-label">Total prestations HT</td>
                <td className="total-value">
                  {totals.servicesTotal.toFixed(2)} {invoiceData.currency}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Kilometers Section */}
      <section className="form-section">
        <h2>🚗 Frais kilométriques</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre de kilomètres *</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={invoiceData.kilometers.distance || ''}
              onChange={(e) => updateInvoiceData('kilometers.distance', parseFloat(e.target.value) || 0)}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Coût par kilomètre ({invoiceData.currency}) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoiceData.kilometers.rate || ''}
              onChange={(e) => updateInvoiceData('kilometers.rate', parseFloat(e.target.value) || 0)}
              placeholder="0.50"
              required
            />
          </div>

          <div className="form-group">
            <label>Montant kilométrique</label>
            <div className="calculated-field">
              {invoiceData.kilometers.amount.toFixed(2)} {invoiceData.currency}
            </div>
          </div>
        </div>
      </section>

      {/* Totals Section */}
      <section className="form-section">
        <h2>💰 Totaux et TVA</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>TVA (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={invoiceData.tvaRate || 0}
              onChange={(e) => updateInvoiceData('tvaRate', parseFloat(e.target.value) || 0)}
              placeholder="20"
            />
          </div>

          <div className="form-group">
            <label>Devise</label>
            <select
              value={invoiceData.currency}
              onChange={(e) => updateInvoiceData('currency', e.target.value)}
            >
              <option value="€">€ (EUR)</option>
              <option value="$">$ (USD)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
        </div>

        <div className="totals-display">
          <div className="total-row">
            <span>Total prestations HT:</span>
            <strong>{totals.servicesTotal.toFixed(2)} {invoiceData.currency}</strong>
          </div>
          <div className="total-row">
            <span>Total frais kilométriques:</span>
            <strong>{totals.kmTotal.toFixed(2)} {invoiceData.currency}</strong>
          </div>
          <div className="total-row subtotal">
            <span>Sous-total HT:</span>
            <strong>{totals.subtotalHT.toFixed(2)} {invoiceData.currency}</strong>
          </div>
          <div className="total-row">
            <span>TVA ({invoiceData.tvaRate}%):</span>
            <strong>{totals.tvaAmount.toFixed(2)} {invoiceData.currency}</strong>
          </div>
          <div className="total-row grand-total">
            <span>Total TTC:</span>
            <strong>{totals.totalTTC.toFixed(2)} {invoiceData.currency}</strong>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="form-section">
        <h2>📄 Informations de pied de page</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Conditions de paiement</label>
            <textarea
              value={invoiceData.paymentTerms || ''}
              onChange={(e) => updateInvoiceData('paymentTerms', e.target.value)}
              placeholder="Paiement à réception de facture. Virement bancaire accepté."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Délai de paiement</label>
            <select
              value={invoiceData.paymentDeadline || ''}
              onChange={(e) => updateInvoiceData('paymentDeadline', e.target.value)}
            >
              <option value="">Sélectionner un délai</option>
              <option value="À réception">À réception</option>
              <option value="7 jours">7 jours</option>
              <option value="14 jours">14 jours</option>
              <option value="21 jours">21 jours</option>
              <option value="30 jours">30 jours</option>
              <option value="45 jours">45 jours</option>
              <option value="60 jours">60 jours</option>
              <option value="90 jours">90 jours</option>
            </select>
          </div>

          <div className="form-group">
            <label>Moyens de paiement acceptés</label>
            <select
              value={invoiceData.paymentMethods || ''}
              onChange={(e) => updateInvoiceData('paymentMethods', e.target.value)}
            >
              <option value="">Sélectionner un moyen de paiement</option>
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
              <option value="Carte cadeau">Carte cadeau</option>
              <option value="Ticket Restaurant">Ticket Restaurant</option>
              <option value="Cartes (Visa, Mastercard, Amex, UnionPay)">Cartes (Visa, Mastercard, Amex, UnionPay)</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Portefeuilles électroniques (PayPal, Apple Pay, Google Pay)">Portefeuilles électroniques (PayPal, Apple Pay, Google Pay)</option>
              <option value="Cryptomonnaies">Cryptomonnaies</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Mention légale</label>
            <textarea
              value={invoiceData.legalMention || ''}
              onChange={(e) => updateInvoiceData('legalMention', e.target.value)}
              placeholder="TVA non applicable, art. 293 B du CGI"
              rows="2"
            />
          </div>
        </div>
      </section>

      {/* Bouton Aperçu en bas du formulaire */}
      <div className="form-footer-actions">
        <button 
          type="button"
          className="btn-preview-large"
          onClick={onPreviewClick}
        >
          👁️ Voir l'aperçu de la facture
        </button>
      </div>
    </div>
  )
}

export default InvoiceForm

