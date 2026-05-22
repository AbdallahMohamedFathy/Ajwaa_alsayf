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
const db   = firebase.firestore();

const ADMIN_EMAIL = 'ajwaaelsaif@admin.com';

/* ─── Auth State Cache ─── */
let _currentUser  = null;
let _authReady    = false;
const _readyCBs   = [];   // one-time "ready" callbacks

auth.onAuthStateChanged(async (fbUser) => {
  if (fbUser) {
    try {
      const doc = await db.collection('users').doc(fbUser.uid).get();
      _currentUser = doc.exists
        ? { uid: fbUser.uid, ...doc.data() }
        : { uid: fbUser.uid, email: fbUser.email, name: '', phone: '', role: 'customer' };
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
function isLoggedIn()     { return !!_currentUser; }
function isAdmin()        { return !!(_currentUser && (_currentUser.role === 'admin' || _currentUser.email?.toLowerCase() === ADMIN_EMAIL)); }

async function registerUser(name, email, phone, password) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const role  = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'customer';
    const data  = {
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      phone:     phone.trim(),
      role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(cred.user.uid).set(data);
    _currentUser = { uid: cred.user.uid, ...data };
    return { success: true };
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل مسبقاً',
      'auth/weak-password':        'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      'auth/invalid-email':        'البريد الإلكتروني غير صالح'
    };
    return { success: false, error: msgs[e.code] || 'حدث خطأ، يرجى المحاولة مرة أخرى' };
  }
}

async function loginUser(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    return { success: true };
  } catch {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }
}

async function logoutUser() {
  await auth.signOut();
  _currentUser = null;
  window.location.href = 'index.html';
}

/* ─── Firestore: Products ─── */
async function getProducts() {
  const snap = await db.collection('products').where('active', '==', true).orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function getAllProductsAdmin() {
  const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

async function addProduct(data) {
  return await db.collection('products').add({
    ...data,
    active:    true,
    rating:    data.rating    || 0,
    reviews:   data.reviews   || 0,
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
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
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
    status:    'pending',
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
    .where('code',   '==', code.toUpperCase())
    .where('active', '==', true)
    .get();
  if (snap.empty) return null;
  return { firestoreId: snap.docs[0].id, ...snap.docs[0].data() };
}

async function addCoupon(data) {
  return await db.collection('coupons').add({
    ...data,
    code:      data.code.toUpperCase(),
    active:    true,
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
  await db.collection('users').doc(uid).update(data);
  if (_currentUser?.uid === uid) _currentUser = { ..._currentUser, ...data };
}
