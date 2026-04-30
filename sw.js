const CACHE_NAME = 'pos-cache-v2';
// Указываем, какие файлы нужно скачать на телефон для оффлайн работы
const urlsToCache = [
    './pos2.html',
    './manifest.json',
    './icon.png'
];

// Установка: скачиваем файлы в кэш
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Перехват запросов: отдаем файлы из кэша, если нет интернета
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
