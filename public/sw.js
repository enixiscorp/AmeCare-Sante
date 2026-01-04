const CACHE_NAME = 'amecare-invoice-v1'

// Installation du service worker
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker installé - Cache créé')
        // Cache dynamique - pas besoin de liste statique avec Vite
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]).catch(err => {
          console.log('Certains fichiers ne sont pas encore disponibles:', err)
        })
      })
  )
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      ).then(() => {
        return self.clients.claim()
      })
    })
  )
})

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Stratégie Network First avec fallback au cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Cloner la réponse pour la mettre en cache
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Si le réseau échoue, retourner depuis le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Si rien dans le cache, retourner une réponse de base pour l'index
          if (event.request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
      })
  )
})

