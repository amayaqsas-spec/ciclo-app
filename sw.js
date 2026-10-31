// ============================================
// SW.JS - Service Worker con Forzado de Actualización Automática
// ============================================

const CACHE_VERSION = 'v5.80'; // ⚠️ CAMBIADO A v5.68 para forzar limpieza de caché viejo
const CACHE_NAME = 'ciclo-app-' + CACHE_VERSION;

const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './db.js',
    './auth.js',
    './app.js',
    './views/apariencia.js', // ✅ AGREGADO: Ahora se precachea y actualiza correctamente
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// ✅ INSTALACIÓN: Forzar activación inmediata
self.addEventListener('install', event => {
    console.log('[SW] 📦 Instalando versión:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando archivos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] ✅ Instalación completada, forzando activación...');
                return self.skipWaiting(); // Fuerza activación inmediata sin esperar
            })
            .catch(err => console.error('[SW] Error al cachear:', err))
    );
});

// ✅ ACTIVACIÓN: Borrar TODOS los caches viejos y tomar control
self.addEventListener('activate', event => {
    console.log('[SW] 🚀 Activando versión:', CACHE_VERSION);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 🗑️ Borrando cache viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] ✅ Tomando control de todas las pestañas...');
            return self.clients.claim(); // Toma control INMEDIATO de todas las pestañas abiertas
        })
    );
});

// ✅ FETCH: Estrategia Network-First con fallback a cache
self.addEventListener('fetch', event => {
    // No interceptar Firebase ni recursos externos
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('firestore') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    // Para navegación (HTML): siempre intentar la red primero
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Para otros recursos: cache-first
    event.respondWith(
        caches.match(event.request).then(response => 
            response || fetch(event.request).then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return res;
            })
        )
    );
});

// ✅ MENSAJE: Escuchar comando de actualización forzada desde el navegador
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] ⚡ Recibido SKIP_WAITING, activando...');
        self.skipWaiting();
    }
    if (event.data === 'FORCE_UPDATE') {
        console.log('[SW] 🔄 Forzando actualización completa...');
        self.skipWaiting().then(() => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        });
    }
});
