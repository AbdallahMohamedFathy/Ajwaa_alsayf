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

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'أجواء الصيف';
  self.registration.showNotification(title, {
    body: payload.notification?.body || '',
    icon: '/assets/images/logo.png',
    badge: '/assets/images/logo.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200]
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/profile.html'));
});
