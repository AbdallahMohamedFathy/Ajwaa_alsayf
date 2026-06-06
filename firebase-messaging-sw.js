importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDfoxXbaDWQr6JTvM4gaWqUmSg6yDZcSGY",
  authDomain: "ajwaaelsaif.firebaseapp.com",
  projectId: "ajwaaelsaif",
  storageBucket: "ajwaaelsaif.firebasestorage.app",
  messagingSenderId: "572441276044",
  appId: "1:572441276044:web:6c4addfb432ed6e01b15a9"
});

const messaging = firebase.messaging();

// Firebase handler — called for background messages when Firebase SDK decodes the push
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'أجواء الصيف';
  const url = payload.fcmOptions?.link || payload.data?.link || '/';
  _notifShownByFirebase = true;
  return self.registration.showNotification(title, {
    body: payload.notification?.body || '',
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url }
  });
});

// Fallback — handles push directly in case Firebase SDK doesn't fire onBackgroundMessage
let _notifShownByFirebase = false;
self.addEventListener('push', (event) => {
  _notifShownByFirebase = false;
  // Give Firebase SDK 300ms to handle it first
  event.waitUntil(
    new Promise(resolve => setTimeout(resolve, 300)).then(() => {
      if (_notifShownByFirebase) return; // Firebase already handled it
      try {
        const data = event.data?.json() || {};
        const notif = data.notification || {};
        const title = notif.title || 'أجواء الصيف';
        const url = data.fcmOptions?.link || data.data?.link || '/';
        return self.registration.showNotification(title, {
          body: notif.body || '',
          icon: '/assets/images/logo.png',
          badge: '/assets/images/logo.png',
          dir: 'rtl',
          lang: 'ar',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          data: { url }
        });
      } catch (e) {
        return self.registration.showNotification('أجواء الصيف', {
          body: 'لديك إشعار جديد',
          icon: '/assets/images/logo.png',
          dir: 'rtl'
        });
      }
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
