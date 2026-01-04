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

  // Header
  let logoHeight = 0
  if (invoiceData.logo) {
    try {
      // Try to extract image dimensions from base64 or use default
      const imgWidth = 50
      const imgHeight = 30
      doc.addImage(invoiceData.logo, 'PNG', margin, yPosition, imgWidth, imgHeight)
      logoHeight = imgHeight
    } catch (e) {
      console.error('Error loading logo:', e)
    }
  }

  // Structure name and details
  let headerY = invoiceData.logo ? yPosition + logoHeight / 4 : yPosition
  const headerX = invoiceData.logo ? margin + 60 : margin

  headerY = addText(
    invoiceData.structureName || 'Nom de la structure',
    headerX,
    headerY,
    contentWidth - 60,
    16,
    'bold'
  )

  if (invoiceData.activity) {
    headerY = addText(invoiceData.activity, headerX, headerY + 3, contentWidth - 60, 10)
  }

  if (invoiceData.phone || invoiceData.email || invoiceData.address) {
    headerY += 3
    if (invoiceData.phone) {
      headerY = addText(`Tel: ${invoiceData.phone}`, headerX, headerY, contentWidth - 60, 9)
    }
    if (invoiceData.email) {
      headerY = addText(`Email: ${invoiceData.email}`, headerX, headerY + 3, contentWidth - 60, 9)
    }
    if (invoiceData.address) {
      headerY = addText(`Adresse: ${invoiceData.address}`, headerX, headerY + 3, contentWidth - 60, 9)
    }
  }

  // Invoice title and details (right aligned)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  let invoiceDetailsY = yPosition
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(37, 99, 235) // Primary color
  doc.text('FACTURE', pageWidth - margin, invoiceDetailsY, { align: 'right' })
  
  invoiceDetailsY += 10
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)

  doc.text(`N° Facture: ${invoiceData.invoiceNumber || 'N/A'}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  invoiceDetailsY += 5
  doc.text(`Date: ${formatDate(invoiceData.invoiceDate)}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  if (invoiceData.servicePeriod) {
    invoiceDetailsY += 5
    doc.text(`Période: ${invoiceData.servicePeriod}`, pageWidth - margin, invoiceDetailsY, { align: 'right' })
  }

  yPosition = Math.max(headerY, invoiceDetailsY) + 15

  // Client section
  doc.setDrawColor(37, 99, 235)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'FD')
  
  yPosition += 8
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Facturé à:', margin + 5, yPosition)
  
  yPosition += 7
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  yPosition = addText(
    invoiceData.clientName || 'Nom du client',
    margin + 5,
    yPosition,
    contentWidth - 10,
    10,
    'bold'
  )

  if (invoiceData.clientRef) {
    yPosition = addText(`Réf. patient: ${invoiceData.clientRef}`, margin + 5, yPosition + 3, contentWidth - 10, 9)
  }
  if (invoiceData.clientAddress) {
    yPosition = addText(invoiceData.clientAddress, margin + 5, yPosition + 3, contentWidth - 10, 9)
  }
  if (invoiceData.clientPhone) {
    yPosition = addText(`Tel: ${invoiceData.clientPhone}`, margin + 5, yPosition + 3, contentWidth - 10, 9)
  }
  if (invoiceData.clientEmail) {
    yPosition = addText(`Email: ${invoiceData.clientEmail}`, margin + 5, yPosition + 3, contentWidth - 10, 9)
  }
  if (invoiceData.clientInsurance) {
    yPosition = addText(`Assurance: ${invoiceData.clientInsurance}`, margin + 5, yPosition + 3, contentWidth - 10, 9)
  }

  yPosition += 20

  // Services table
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
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      2: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    },
    margin: { left: margin, right: margin }
  })

  yPosition = doc.lastAutoTable.finalY + 10

  // Kilometers section
  if (invoiceData.kilometers.distance > 0 || invoiceData.kilometers.rate > 0) {
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'FD')
    
    yPosition += 7
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Frais kilométriques', margin + 5, yPosition)
    
    yPosition += 7
    doc.setFont(undefined, 'normal')
    const kmText = `${invoiceData.kilometers.distance} km × ${invoiceData.kilometers.rate.toFixed(2)} ${invoiceData.currency}/km`
    doc.text(kmText, margin + 5, yPosition)
    
    doc.text(
      `${invoiceData.kilometers.amount.toFixed(2)} ${invoiceData.currency}`,
      pageWidth - margin - 5,
      yPosition,
      { align: 'right' }
    )
    
    yPosition += 15
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
  yPosition += 20

  // Footer
  const footerY = 260
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, footerY, pageWidth - margin, footerY)

  yPosition = footerY + 10

  if (invoiceData.paymentTerms) {
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('Conditions de paiement:', margin, yPosition)
    yPosition += 5
    doc.setFont(undefined, 'normal')
    yPosition = addText(invoiceData.paymentTerms, margin, yPosition, contentWidth, 9)
    yPosition += 5
  }

  if (invoiceData.paymentDeadline) {
    doc.setFont(undefined, 'bold')
    doc.text('Délai de paiement:', margin, yPosition)
    yPosition += 5
    doc.setFont(undefined, 'normal')
    doc.text(invoiceData.paymentDeadline, margin, yPosition)
    yPosition += 8
  }

  if (invoiceData.paymentMethods) {
    doc.setFont(undefined, 'bold')
    doc.text('Moyens de paiement acceptés:', margin, yPosition)
    yPosition += 5
    doc.setFont(undefined, 'normal')
    doc.text(invoiceData.paymentMethods, margin, yPosition)
    yPosition += 8
  }

  if (invoiceData.legalMention) {
    doc.setFont(undefined, 'italic')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    yPosition = addText(invoiceData.legalMention, margin, yPosition, contentWidth, 8)
  }

  // Save PDF
  const fileName = `Facture_${invoiceData.invoiceNumber || 'N/A'}_${formatDate(invoiceData.invoiceDate).replace(/\//g, '-')}.pdf`
  doc.save(fileName)
}

