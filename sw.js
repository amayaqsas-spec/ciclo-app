// ============================================
// SW.JS - Service Worker compatible con PWA
// ============================================

const CACHE_NAME = 'ciclo-app-v3.0';

// Instalación
self.addEventListener('install', event => {
  console.log('[SW] Instalando:', CACHE_NAME);
  self.skipWaiting(); // Activa inmediatamente
});

// Activación: limpiar cachés viejos
self.addEventListener('activate', event => {
  console.log('[SW] Activando:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando caché viejo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim(); // Toma control de todas las pestañas
    })
  );
});

// Fetch: estrategia de red primero, luego caché
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, guardarla en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar caché
        return caches.match(event.request);
      })
  );
});