// ============================================
// SW.JS - Service Worker con Force Update
// ============================================

const CACHE_NAME = 'ciclo-app-v3.0'; // ✅ Cambia este número de versión cada vez que haya actualización importante

const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './db.js',
    './auth.js',
    './app.js',
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './views/home.js',
    './views/mi-rol.js',
    './views/avisos.js',
    './views/notas.js',
    './views/tiempo-extra.js',
    './views/servicios-busqueda.js',
    './views/reservas-busqueda.js',
    './views/espejo.js',
    './views/bd.js',
    './views/instalacion.js',
    './views/app.js',
    './views/registro/linea.js',
    './views/registro/terminal.js',
    './views/registro/turno.js',
    './views/registro/semana.js',
    './views/registro/reservas.js',
    './views/registro/servicios.js',
    './views/registro/numero-semana.js',
    './views/registro/rol-semanal.js',
    './views/registro/espejo.js'
];

// ✅ INSTALACIÓN: Forzar actualización del Service Worker
self.addEventListener('install', event => {
    console.log(' [SW] Instalando nueva versión:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 [SW] Cacheando archivos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ [SW] Instalación completada, saltando al estado waiting');
                return self.skipWaiting(); // ✅ Fuerza la activación inmediata
            })
    );
});

// ✅ ACTIVACIÓN: Limpiar caches viejos
self.addEventListener('activate', event => {
    console.log(' [SW] Activando nueva versión:', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ [SW] Eliminando cache viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ [SW] Activación completada');
            return self.clients.claim(); // ✅ Toma control inmediato de todas las pestañas
        })
    );
});

// ✅ FETCH: Estrategia cache-first con network fallback
self.addEventListener('fetch', event => {
    // No cachear requests de Firebase
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('googleapis') ||
        event.request.url.includes('firestore')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }
                
                // Si no está en cache, hacer fetch de la red
                return fetch(event.request).then(response => {
                    // Verificar que la respuesta sea válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clonar la respuesta para guardarla en cache
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// ✅ MESSAGE: Escuchar mensajes de actualización desde la app
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        console.log(' [SW] Skip waiting recibido, activando...');
        self.skipWaiting();
    }
});