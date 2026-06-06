/* ═══════════════════════════════════════
   أجواء الصيف - Firebase Configuration
   ═══════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyDfoxXbaDWQr6JTvM4gaWqUmSg6yDZcSGY",
  authDomain: "ajwaaelsaif.firebaseapp.com",
  projectId: "ajwaaelsaif",
  storageBucket: "ajwaaelsaif.firebasestorage.app",
  messagingSenderId: "572441276044",
  appId: "1:572441276044:web:6c4addfb432ed6e01b15a9",
  measurementId: "G-MJ88597H59"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAIL = 'ajwaaelsaif@admin.com';

/* ─── Auth State Cache ─── */
let _currentUser = null;
let _authReady = false;
const _readyCBs = [];   // one-time "ready" callbacks

auth.onAuthStateChanged(async (fbUser) => {
  if (fbUser) {
    // Fast path for admin — skip Firestore read, fire callbacks immediately
    if (fbUser.email?.toLowerCase() === ADMIN_EMAIL) {
      _currentUser = { uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || '', phone: '', role: 'admin' };
      if (!_authReady) {
        _authReady = true;
        _readyCBs.forEach(cb => cb(_currentUser));
        _readyCBs.length = 0;
      }
      // Load full profile in background (non-blocking)
      db.collection('users').doc(fbUser.uid).get()
        .then(doc => { if (doc.exists) _currentUser = { uid: fbUser.uid, ...doc.data() }; })
        .catch(() => {});
      return;
    }

    try {
      const docRef = db.collection('users').doc(fbUser.uid);
      const doc = await docRef.get();
      if (doc.exists) {
        _currentUser = { uid: fbUser.uid, ...doc.data() };
      } else {
        const fallback = { uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || '', phone: '', role: 'customer', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
        await docRef.set(fallback);
        _currentUser = fallback;
      }
    } catch {
      _currentUser = { uid: fbUser.uid, email: fbUser.email, name: '', phone: '', role: 'customer' };
    }
  } else {
    _currentUser = null;
  }

  if (!_authReady) {
    _authReady = true;
    _readyCBs.forEach(cb => cb(_currentUser));
    _readyCBs.length = 0;
  }
});

function onAuthReady(cb) {
  if (_authReady) cb(_currentUser);
  else _readyCBs.push(cb);
}

/* ─── Auth Helpers ─── */
function getCurrentUser() { return _currentUser; }
function isLoggedIn() { return !!_currentUser; }
function isAdmin() { return !!(_currentUser && (_currentUser.role === 'admin' || _currentUser.email?.toLowerCase() === ADMIN_EMAIL)); }

async function registerUser(name, email, phone, password) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'customer';
    const data = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(cred.user.uid).set(data);
    _currentUser = { uid: cred.user.uid, ...data };
    return { success: true };
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل مسبقاً',
      'auth/weak-password': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      'auth/invalid-email': 'البريد الإلكتروني غير صالح',
      'auth/operation-not-allowed': 'يرجى تفعيل Email/Password في Firebase Console',
      'auth/network-request-failed': 'تحقق من الاتصال بالإنترنت'
    };
    console.error('Firebase register error:', e.code, e.message);
    return { success: false, error: msgs[e.code] || 'حدث خطأ: ' + e.code };
  }
}

async function loginUser(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch (e) {
    console.error('Firebase login error:', e.code, e.message);
    if (e.code === 'auth/operation-not-allowed')
      return { success: false, error: 'يرجى تفعيل Email/Password في Firebase Console' };
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }
}

async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await auth.signInWithPopup(provider);
    const fbUser = cred.user;
    const docRef = db.collection('users').doc(fbUser.uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      const role = fbUser.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'customer';
      const data = {
        name: fbUser.displayName || '',
        email: fbUser.email?.toLowerCase() || '',
        phone: '',
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await docRef.set(data);
      _currentUser = { uid: fbUser.uid, ...data };
    } else {
      _currentUser = { uid: fbUser.uid, ...doc.data() };
    }
    return { success: true };
  } catch (e) {
    console.error('Google sign-in error:', e.code, e.message);
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')
      return { success: false, error: null };
    if (e.code === 'auth/popup-blocked')
      return { success: false, error: 'تم حظر النافذة المنبثقة، يرجى السماح بها من إعدادات المتصفح' };
    if (e.code === 'auth/unauthorized-domain')
      return { success: false, error: 'يرجى إضافة هذا الدومين في Firebase Console ← Authentication ← Settings ← Authorized domains' };
    if (e.code === 'auth/operation-not-allowed')
      return { success: false, error: 'يرجى تفعيل Google Sign-In في Firebase Console' };
    return { success: false, error: 'حدث خطأ: ' + (e.code || e.message) };
  }
}

async function logoutUser() {
  await auth.signOut();
  _currentUser = null;
  window.location.href = 'index.html';
}

/* ─── Firestore: Products ─── */
async function getProducts() {
  const snap = await db.collection('products').get();
  return snap.docs
    .map(d => ({ firestoreId: d.id, ...d.data() }))
    .filter(p => p.active !== false)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function getAllProductsAdmin() {
  const snap = await db.collection('products').get();
  return snap.docs
    .map(d => ({ firestoreId: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function addProduct(data) {
  return await db.collection('products').add({
    ...data,
    active: true,
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    numId: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function updateProduct(firestoreId, data) {
  return await db.collection('products').doc(firestoreId).update(data);
}

async function deleteProduct(firestoreId) {
  return await db.collection('products').doc(firestoreId).delete();
}

/* ─── Firestore: Orders ─── */
async function createOrder(data) {
  return await db.collection('orders').add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function getOrders() {
  const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function getUserOrders(uid) {
  const snap = await db.collection('orders')
    .where('userId', '==', uid)
    .get();
  return snap.docs
    .map(d => ({ firestoreId: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function updateOrderStatus(firestoreId, status) {
  return await db.collection('orders').doc(firestoreId).update({
    status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/* ─── Firestore: Bookings ─── */
async function createBooking(data) {
  return await db.collection('bookings').add({
    ...data,
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function getBookings() {
  const snap = await db.collection('bookings').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function updateBookingStatus(firestoreId, status) {
  return await db.collection('bookings').doc(firestoreId).update({ status });
}

/* ─── Firestore: Coupons ─── */
async function getCoupons() {
  const snap = await db.collection('coupons').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function getCouponByCode(code) {
  const snap = await db.collection('coupons')
    .where('code', '==', code.toUpperCase())
    .where('active', '==', true)
    .get();
  if (snap.empty) return null;
  return { firestoreId: snap.docs[0].id, ...snap.docs[0].data() };
}

async function addCoupon(data) {
  return await db.collection('coupons').add({
    ...data,
    code: data.code.toUpperCase(),
    active: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function toggleCoupon(firestoreId, active) {
  return await db.collection('coupons').doc(firestoreId).update({ active });
}

async function deleteCoupon(firestoreId) {
  return await db.collection('coupons').doc(firestoreId).delete();
}

/* ─── Firestore: Users ─── */
async function getAllUsers() {
  const snap = await db.collection('users').where('role', '==', 'customer').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function updateUserProfile(uid, data) {
  await db.collection('users').doc(uid).set(data, { merge: true });
  if (_currentUser?.uid === uid) _currentUser = { ..._currentUser, ...data };
}

/* ─── Firestore: Portfolio ─── */
async function getPortfolioItems() {
  const snap = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}
async function getActivePortfolioItems() {
  const snap = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })).filter(i => i.active !== false);
}
async function createPortfolioItem(data) {
  return await db.collection('portfolio').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}
async function updatePortfolioItem(firestoreId, data) {
  return await db.collection('portfolio').doc(firestoreId).update(data);
}
async function deletePortfolioItem(firestoreId) {
  return await db.collection('portfolio').doc(firestoreId).delete();
}

/* ─── Firestore: Before & After ─── */
async function getBeforeAfterItems() {
  const snap = await db.collection('before_after').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}
async function createBeforeAfterItem(data) {
  return await db.collection('before_after').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}
async function updateBeforeAfterItem(firestoreId, data) {
  return await db.collection('before_after').doc(firestoreId).update(data);
}
async function deleteBeforeAfterItem(firestoreId) {
  return await db.collection('before_after').doc(firestoreId).delete();
}

/* ─── Push Notifications (FCM) ─── */
const VAPID_KEY = 'BJ0_KieYj20EnVcinHW-024szIQrvulQ1v2F3BU3PCn5oBYIBQtEeH5USsSMrfyKCuFG3svyxbQ49KuMC5hTUow';

async function _initFCMToken() {
  if (!_currentUser || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = firebase.messaging();
    const token = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (token) {
      await db.collection('users').doc(_currentUser.uid).update({ fcmToken: token });
      if (isAdmin()) {
        await db.collection('settings').doc('admin').set({ fcmToken: token }, { merge: true });
      }
    }
    messaging.onMessage((payload) => {
      const title = payload.notification?.title || 'أجواء الصيف';
      const body  = payload.notification?.body  || '';
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/assets/images/logo.png', dir: 'rtl' });
      }
    });
  } catch (e) {
    console.error('[FCM] error:', e.code, e.message, e);
  }
}

async function notifyAdmin(title, body) {
  try {
    const snap = await db.collection('settings').doc('admin').get();
    const token = snap.data()?.fcmToken;
    if (!token) return;
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, title, body })
    });
  } catch (e) {
    console.log('Admin notify failed:', e.message);
  }
}

async function requestPushPermission() {
  if (!('Notification' in window) || !_currentUser) return;
  if (Notification.permission === 'denied') return;
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
  }
  await _initFCMToken();
}
