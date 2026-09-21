const CACHE_NAME = 'ciclo-v2';
const assetsToCache = [
    '/',
    './index.html',
    './manifest.json',
    './styles.css',
    './db.js',
    './auth.js',
    './app.js',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Instalar Service Worker y cachear archivos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache abierto');
                return cache.addAll(assetsToCache);
            })
            .catch((err) => console.error('❌ Error al cachear:', err))
    );
    self.skipWaiting();
});

// Activar Service Worker y limpiar cachés viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});