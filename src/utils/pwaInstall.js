export const installPWA = async () => {
  // Vérifier si le navigateur supporte PWA
  if ('serviceWorker' in navigator) {
    try {
      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker enregistré avec succès:', registration.scope)
      
      return registration
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du service worker:', error)
      throw error
    }
  } else {
    throw new Error('Les service workers ne sont pas supportés par ce navigateur')
  }
}

export const isPWAInstalled = () => {
  // Vérifier si l'app est en mode standalone (PWA installée)
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://')
}

export const canInstallPWA = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window
}








