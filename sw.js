// ============================================
// SW.JS - Service Worker Optimizado para iOS
// ============================================

const CACHE_NAME = 'ciclo-app-v3.1';

const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './db.js',
    './auth.js',
    './app.js',
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// ✅ Instalación ligera
self.addEventListener('install', event => {
    console.log('[SW] Instalando:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// ✅ Activación: limpiar caches viejos
self.addEventListener('activate', event => {
    console.log('[SW] Activando:', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(names => 
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        ).then(() => self.clients.claim())
    );
});

// ✅ Fetch: Estrategia Network-First (mejor para iOS)
self.addEventListener('fetch', event => {
    // NO interceptar Firebase ni requests externos
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('firestore') ||
        event.request.url.includes('gstatic')) {
        return;
    }

    // Solo cachear navegación (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Para assets estáticos: cache-first
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