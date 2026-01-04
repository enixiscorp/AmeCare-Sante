import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generatePDF = (invoiceData, totals) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10, fontStyle = 'normal') => {
    doc.setFontSize(fontSize)
    doc.setFont(undefined, fontStyle)
    const lines = doc.splitTextToSize(text || '', maxWidth)
    doc.text(lines, x, y)
    return y + lines.length * (fontSize * 0.4)
  }

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Header - Logo and Company Info
  let logoHeight = 0
  const logoWidth = 45
  const logoMaxHeight = 35
  
  if (invoiceData.logo) {
    try {
      doc.addImage(invoiceData.logo, 'PNG', margin, yPosition, logoWidth, logoMaxHeight)
      logoHeight = logoMaxHeight
    } catch (e) {
      console.error('Error loading logo:', e)
    }
  }

  // Structure name and details (left side)
  let headerY = yPosition
  const headerX = invoiceData.logo ? margin + logoWidth + 8 : margin
  const headerInfoWidth = contentWidth - (invoiceData.logo ? logoWidth + 8 : 0) - 80 // Reserve space for right side

  headerY = addText(
    invoiceData.structureName || 'AmeCare Santé',
    headerX,
    headerY,
    headerInfoWidth,
    14,
    'bold'
  )

  if (invoiceData.activity) {
    headerY = addText(invoiceData.activity, headerX, headerY + 2, headerInfoWidth, 9, 'normal')
  }

  if (invoiceData.phone || invoiceData.email || invoiceData.address) {
    headerY += 2
    if (invoiceData.phone) {
      headerY = addText(`Tel: ${invoiceData.phone}`, headerX, headerY, headerInfoWidth, 8)
    }
    if (invoiceData.email) {
      headerY = addText(`Email: ${invoiceData.email}`, headerX, headerY + 2.5, headerInfoWidth, 8)
    }
    if (invoiceData.address) {
      headerY = addText(`Adresse: ${invoiceData.address}`, headerX, headerY + 2.5, headerInfoWidth, 8)
    }
  }

  // Invoice title and details (right aligned)
  let invoiceDetailsY = yPosition
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(37, 99, 235) // Primary color
  doc.text('FACTURE', pageWidth - margin, invoiceDetailsY, { align: 'right' })
  
  invoiceDetailsY += 8
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')

  doc.text(`N° Facture: ${invoiceData.invoiceNumber || 'N/A'}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  invoiceDetailsY += 4
  doc.text(`Date: ${formatDate(invoiceData.invoiceDate)}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  if (invoiceData.servicePeriod) {
    invoiceDetailsY += 4
    doc.text(`Période: ${invoiceData.servicePeriod}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  }

  // Draw line under header
  const headerBottom = Math.max(headerY + 5, invoiceDetailsY + 5, yPosition + logoHeight + 3)
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(margin, headerBottom, pageWidth - margin, headerBottom)
  yPosition = headerBottom + 8

  // Client section - Two columns layout
  const clientBoxHeight = 28
  doc.setDrawColor(37, 99, 235)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPosition, contentWidth, clientBoxHeight, 2, 2, 'FD')
  
  yPosition += 6
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Facturé à:', margin + 3, yPosition)
  
  yPosition += 6
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  
  // Left column
  let clientLeftY = yPosition
  const clientLeftX = margin + 3
  const clientColumnWidth = (contentWidth - 10) / 2
  
  clientLeftY = addText(
    invoiceData.clientName || 'Nom du client',
    clientLeftX,
    clientLeftY,
    clientColumnWidth,
    9,
    'bold'
  )

  if (invoiceData.clientRef) {
    clientLeftY = addText(`Réf. patient: ${invoiceData.clientRef}`, clientLeftX, clientLeftY + 2, clientColumnWidth, 8)
  }
  if (invoiceData.clientAddress) {
    clientLeftY = addText(`Adresse: ${invoiceData.clientAddress}`, clientLeftX, clientLeftY + 2, clientColumnWidth, 8)
  }

  // Right column
  let clientRightY = yPosition
  const clientRightX = margin + contentWidth / 2 + 2
  
  if (invoiceData.clientPhone) {
    clientRightY = addText(`Téléphone: ${invoiceData.clientPhone}`, clientRightX, clientRightY, clientColumnWidth, 8)
  }
  if (invoiceData.clientEmail) {
    clientRightY = addText(`Email: ${invoiceData.clientEmail}`, clientRightX, clientRightY + 2, clientColumnWidth, 8)
  }
  if (invoiceData.clientInsurance) {
    clientRightY = addText(`Assurance: ${invoiceData.clientInsurance}`, clientRightX, clientRightY + 2, clientColumnWidth, 8)
  }

  yPosition += Math.max(clientLeftY - yPosition, clientRightY - yPosition) + 8

  // Services table - Optimized for A4
  const servicesData = invoiceData.services
    .filter(service => service.designation || service.ref || service.hours > 0 || service.unitPrice > 0)
    .map(service => [
      service.ref || '-',
      service.designation || '-',
      (service.hours || 0).toString(),
      service.patientRef || '-',
      `${(service.unitPrice || 0).toFixed(2)} ${invoiceData.currency}`,
      `${(service.amount || 0).toFixed(2)} ${invoiceData.currency}`
    ])

  doc.autoTable({
    startY: yPosition,
    head: [['Réf', 'Désignation', 'Unités', 'Réf patient', 'P.U', 'Montant']],
    body: servicesData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
      5: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'wrap'
  })

  yPosition = doc.lastAutoTable.finalY + 8

  // Kilometers section
  if (invoiceData.kilometers.distance > 0 || invoiceData.kilometers.rate > 0) {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, yPosition, contentWidth, 18, 2, 2, 'FD')
    
    yPosition += 6
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('Frais kilométriques', margin + 3, yPosition)
    
    yPosition += 6
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    const kmText = `${invoiceData.kilometers.distance} km × ${invoiceData.kilometers.rate.toFixed(2)} ${invoiceData.currency}/km`
    doc.text(kmText, margin + 3, yPosition)
    
    doc.text(
      `${invoiceData.kilometers.amount.toFixed(2)} ${invoiceData.currency}`,
      pageWidth - margin - 3,
      yPosition,
      { align: 'right' }
    )
    
    yPosition += 12
  }

  // Totals section
  const totalsY = yPosition
  const totalsWidth = 100
  const totalsX = pageWidth - margin - totalsWidth

  doc.setFontSize(10)
  
  yPosition = totalsY
  doc.text('Total prestations HT:', totalsX, yPosition)
  doc.text(
    `${totals.servicesTotal.toFixed(2)} ${invoiceData.currency}`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )

  if (invoiceData.kilometers.distance > 0 || invoiceData.kilometers.rate > 0) {
    yPosition += 6
    doc.text('Total frais kilométriques:', totalsX, yPosition)
    doc.text(
      `${totals.kmTotal.toFixed(2)} ${invoiceData.currency}`,
      pageWidth - margin,
      yPosition,
      { align: 'right' }
    )
  }

  yPosition += 6
  doc.setDrawColor(200, 200, 200)
  doc.line(totalsX, yPosition, pageWidth - margin, yPosition)

  yPosition += 6
  doc.setFont(undefined, 'bold')
  doc.text('Sous-total HT:', totalsX, yPosition)
  doc.text(
    `${totals.subtotalHT.toFixed(2)} ${invoiceData.currency}`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )

  if (invoiceData.tvaRate > 0) {
    yPosition += 6
    doc.setFont(undefined, 'normal')
    doc.text(`TVA (${invoiceData.tvaRate}%):`, totalsX, yPosition)
    doc.text(
      `${totals.tvaAmount.toFixed(2)} ${invoiceData.currency}`,
      pageWidth - margin,
      yPosition,
      { align: 'right' }
    )
  }

  yPosition += 8
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.line(totalsX, yPosition, pageWidth - margin, yPosition)

  yPosition += 6
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text('Total TTC:', totalsX, yPosition)
  doc.text(
    `${totals.totalTTC.toFixed(2)} ${invoiceData.currency}`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )

  doc.setTextColor(0, 0, 0)
  yPosition += 15

  // Footer - Optimized layout
  const footerStartY = Math.min(260, yPosition + 5)
  const footerMaxY = 285 // Maximum position before bottom margin
  
  // Draw separator line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, footerStartY, pageWidth - margin, footerStartY)

  let footerY = footerStartY + 6
  const footerFontSize = 8
  const footerColumnWidth = contentWidth / 2 - 3

  // Left column - Payment information
  let footerLeftY = footerY
  if (invoiceData.paymentTerms) {
    doc.setFontSize(footerFontSize)
    doc.setFont(undefined, 'bold')
    doc.text('Conditions:', margin, footerLeftY)
    footerLeftY += 4
    doc.setFont(undefined, 'normal')
    footerLeftY = addText(invoiceData.paymentTerms, margin, footerLeftY, footerColumnWidth, footerFontSize)
    footerLeftY += 3
  }

  if (invoiceData.paymentDeadline) {
    doc.setFont(undefined, 'bold')
    doc.text('Délai:', margin, footerLeftY)
    footerLeftY += 4
    doc.setFont(undefined, 'normal')
    doc.text(invoiceData.paymentDeadline, margin, footerLeftY)
    footerLeftY += 6
  }

  // Right column - Payment methods and legal
  let footerRightY = footerY
  if (invoiceData.paymentMethods) {
    doc.setFontSize(footerFontSize)
    doc.setFont(undefined, 'bold')
    doc.text('Moyens de paiement:', margin + contentWidth / 2 + 3, footerRightY)
    footerRightY += 4
    doc.setFont(undefined, 'normal')
    footerRightY = addText(invoiceData.paymentMethods, margin + contentWidth / 2 + 3, footerRightY, footerColumnWidth, footerFontSize)
    footerRightY += 3
  }

  if (invoiceData.legalMention) {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(100, 100, 100)
    footerRightY = addText(invoiceData.legalMention, margin + contentWidth / 2 + 3, footerRightY, footerColumnWidth, footerFontSize - 0.5)
  }

  // Company slogan - centered
  const sloganY = Math.max(footerLeftY, footerRightY) + 5
  if (sloganY < footerMaxY) {
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    doc.line(margin, sloganY - 2, pageWidth - margin, sloganY - 2)
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'italic')
    doc.setTextColor(37, 99, 235) // Primary color
    const sloganText = 'La Qualité de votre Santé, notre Priorité'
    doc.text(sloganText, pageWidth / 2, sloganY + 3, { align: 'center' })
  }

  // Ensure content fits on one page - if not, adjust
  const pageHeight = doc.internal.pageSize.height
  if (yPosition > pageHeight - 40) {
    console.warn('Le contenu dépasse la page A4, certaines parties peuvent être tronquées')
  }

  // Save PDF
  const fileName = `Facture_${invoiceData.invoiceNumber || 'N/A'}_${formatDate(invoiceData.invoiceDate).replace(/\//g, '-')}.pdf`
  doc.save(fileName)
}

