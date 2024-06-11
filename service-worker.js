const CACHE_NAME = 'static-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/icon.jpg',
  // Ajoutez d'autres fichiers statiques à cacher ici
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la réponse réseau est bonne, mettre à jour le cache
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        } else {
          return networkResponse;
        }
      })
      .catch(() => {
        // Si le réseau échoue, retourner la réponse en cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request);
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'images/icons/icon-192x192.png',
    badge: 'images/icons/icon-192x192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

