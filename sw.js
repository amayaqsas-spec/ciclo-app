// ============================================
// SW.JS - Service Worker con actualización forzada
// ============================================

const CACHE_NAME = 'ciclo-app-v2.0'; // ✅ Versión nueva para forzar actualización
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/db.js',
  '/auth.js'
];

// Instalación: limpiar cachés viejos inmediatamente
self.addEventListener('install', event => {
  console.log('[SW] Instalando nueva versión:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.skipWaiting(); // ✅ Fuerza activación inmediata
    })
  );
});

// Activación: tomar control de todas las pestañas inmediatamente
self.addEventListener('activate', event => {
  console.log('[SW] Activando nueva versión:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // ✅ Toma control inmediato
    })
  );
});

// Fetch: estrategia de red primero, luego caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, guardarla en caché
        if (response && response.status === 200 && response.type === 'basic') {
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