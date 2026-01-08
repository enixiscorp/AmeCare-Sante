/**
 * Redimensionne et compresse une image pour le logo
 * @param {File} file - Le fichier image
 * @param {number} maxWidth - Largeur maximale en pixels (défaut: 400)
 * @param {number} maxHeight - Hauteur maximale en pixels (défaut: 200)
 * @param {number} quality - Qualité de compression 0-1 (défaut: 0.9)
 * @returns {Promise<string>} - Promise qui résout en base64 de l'image redimensionnée
 */
export const resizeImage = (file, maxWidth = 400, maxHeight = 200, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Créer un canvas pour redimensionner
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        
        // Améliorer la qualité du redimensionnement
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir en base64 avec compression
        const resizedBase64 = canvas.toDataURL('image/png', quality)
        resolve(resizedBase64)
      }
      
      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Optimise une image pour le logo (redimensionne et convertit en PNG transparent)
 * @param {File} file - Le fichier image
 * @returns {Promise<string>} - Promise qui résout en base64 de l'image optimisée
 */
export const optimizeLogo = async (file) => {
  try {
    // Redimensionner avec des dimensions adaptées pour le logo sur facture
    // Format recommandé : 300x150px max pour une bonne qualité
    return await resizeImage(file, 300, 150, 0.92)
  } catch (error) {
    console.error('Erreur lors de l\'optimisation du logo:', error)
    throw error
  }
}







