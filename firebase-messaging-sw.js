self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch (e) {}
  const title = data.title || 'أجواء الصيف';
  const url   = data.link  || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body:             data.body || '',
      icon:             '/assets/images/logo.png',
      badge:            '/assets/images/logo.png',
      dir:              'rtl',
      lang:             'ar',
      vibrate:          [200, 100, 200],
      requireInteraction: true,
      data:             { url }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(url) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
