const CACHE_NAME = 'taskflow-v1';
const ASSETS_TO_CACHE = [
    './', './index.html', './css/style.css', './js/helper.js', './js/db.js',
    './js/auth.js', './js/task.js', './js/activity.js', './js/ui.js', './js/app.js', './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((c) => { if (c !== CACHE_NAME) return caches.delete(c); }))));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                const acceptHeader = event.request.headers.get('accept');
                if (acceptHeader && acceptHeader.includes('text/html')) return caches.match('./index.html');
            });
        })
    );
});