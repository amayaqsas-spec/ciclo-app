// ============================================
// SW.JS - Service Worker con actualización automática
// ============================================

const CACHE_NAME = 'ciclo-cache-v2.1.0'; // ✅ Cambia este número de versión cuando hagas actualizaciones
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/auth.js',
    '/db.js',
    '/manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './views/home.js',
    './views/avisos.js',
    './views/notas.js',
    './views/tiempo-extra.js',
    './views/servicios-busqueda.js',
    './views/reservas-busqueda.js',
    './views/espejo.js',
    './views/rol.js',
    './views/bd.js',
    './views/app.js',
    './views/instalacion.js',
    './views/registro/linea.js',
    './views/registro/terminal.js',
    './views/registro/turno.js',
    './views/registro/semana.js',
    './views/registro/reservas.js',
    './views/registro/servicios.js',
    './views/registro/espejo.js'
];

// ✅ INSTALACIÓN - Cachea los archivos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache abierto:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('🔄 Forzando activación inmediata');
                return self.skipWaiting(); // ✅ Fuerza la activación del nuevo SW
            })
    );
});

// ✅ ACTIVACIÓN - Limpia cachés viejos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activado y listo');
            return self.clients.claim(); // ✅ Toma control inmediato de todas las pestañas
        })
    );
});

// ✅ FETCH - Estrategia: Network First (prioriza red, fallback a caché)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, la guarda en caché
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, usa el caché
                return caches.match(event.request);
            })
    );
});

// ✅ Mensaje para forzar actualización desde el cliente
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});