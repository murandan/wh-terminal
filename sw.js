const CACHE_NAME = 'pos-cache-v4'; // При каждом серьезном обновлении меняйте тут цифру (v3, v4...)

const urlsToCache = [
    './pos2.html',
    './manifest.json',
    './icon.png'
];

// Установка и форсированный запуск
self.addEventListener('install', event => {
    self.skipWaiting(); // Заставляет новую версию работать сразу
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Уборщик: удаляет старый кэш
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Стираем всё, кроме текущей версии
                    }
                })
            );
        }).then(() => self.clients.claim()) // Мгновенно берем контроль над открытыми страницами
    );
});

// Выдача файлов
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
