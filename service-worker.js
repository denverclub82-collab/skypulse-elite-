const CACHE_NAME = 'skypulse-v3';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];

// Установка и кэширование
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

// Стратегия Cache-First с Fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

// 📩 Обработка Push-уведомлений
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'SkyPulse Alert', body: 'Изменения в прогнозе погоды!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
      tag: 'skypulse-alert',
      renotify: true,
      actions: [{ action: 'open', title: 'Открыть' }, { action: 'close', title: 'Закрыть' }]
    })
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'open') {
    e.waitUntil(clients.matchAll({ type: 'window' }).then(cls => {
      const open = cls.find(c => c.url.includes('/'));
      return open ? open.focus() : clients.openWindow('/');
    }));
  }
});
