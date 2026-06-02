/* ═══════════════════════════════════════
   أجواء الصيف - Main JavaScript
   ═══════════════════════════════════════ */

// ═══ Products Data (static fallback — replaced by Firestore on load) ═══
let productsData = [
  { id: 1, name: 'تكييف كاريير انفرتر 1.5 حصان بارد', brand: 'Carrier', hp: '1.5', price: 22999, oldPrice: 27500, discount: 16, rating: 4.8, reviews: 124, image: 'assets/images/product-1.png', inverter: true, badge: 'الأكثر مبيعاً' },
  { id: 2, name: 'تكييف شارب انفرتر 1.5 حصان بارد ساخن', brand: 'Sharp', hp: '1.5', price: 21500, oldPrice: 25000, discount: 14, rating: 4.7, reviews: 98, image: 'assets/images/product-2.png', inverter: true, badge: 'خصم' },
  { id: 3, name: 'تكييف ال جي دوال كول 2.25 حصان', brand: 'LG', hp: '2.25', price: 32999, oldPrice: 38000, discount: 13, rating: 4.9, reviews: 67, image: 'assets/images/product-3.png', inverter: true, badge: 'جديد' },
  { id: 4, name: 'تكييف تورنيدو 1.5 حصان بارد', brand: 'Tornado', hp: '1.5', price: 15999, oldPrice: 18500, discount: 14, rating: 4.5, reviews: 203, image: 'assets/images/product-4.png', inverter: false, badge: 'خصم' },
  { id: 5, name: 'تكييف فريش 1.5 حصان بروفيشنال', brand: 'Fresh', hp: '1.5', price: 14500, oldPrice: 17000, discount: 15, rating: 4.4, reviews: 156, image: 'assets/images/product-1.png', inverter: false, badge: '' },
  { id: 6, name: 'تكييف ميديا انفرتر 3 حصان', brand: 'Midea', hp: '3', price: 42000, oldPrice: 48000, discount: 12, rating: 4.6, reviews: 45, image: 'assets/images/product-2.png', inverter: true, badge: 'جديد' },
  { id: 7, name: 'تكييف كاريير 2.25 حصان بارد ساخن', brand: 'Carrier', hp: '2.25', price: 29999, oldPrice: 34000, discount: 12, rating: 4.8, reviews: 89, image: 'assets/images/product-3.png', inverter: false, badge: '' },
  { id: 8, name: 'تكييف شارب 3 حصان انفرتر بلازما', brand: 'Sharp', hp: '3', price: 45000, oldPrice: 52000, discount: 13, rating: 4.9, reviews: 34, image: 'assets/images/product-4.png', inverter: true, badge: 'premium' },
];

// ═══ Load Products from Firestore ═══
async function loadProductsFromFirestore() {
  if (typeof db === 'undefined') return;
  try {
    const items = await getProducts();
    if (!items || items.length === 0) return;
    productsData = items.map((d, i) => ({
      id:         d.numId || (1000 + i),
      firestoreId: d.firestoreId,
      name:       d.name || '',
      brand:      d.brand || '',
      hp:         String(d.hp || '1.5'),
      price:      Number(d.price) || 0,
      oldPrice:   Number(d.oldPrice) || 0,
      discount:   Number(d.discount) || 0,
      rating:     Number(d.rating) || 4.5,
      reviews:    Number(d.reviews) || 0,
      image:      d.image || 'assets/images/product-1.png',
      inverter:   Boolean(d.inverter),
      badge:      d.badge || '',
    }));
    // Re-render wherever products are shown
    if (document.getElementById('featured-products')) {
      renderProducts('featured-products', productsData.slice(0, 4));
    }
    if (typeof filterProducts === 'function' && document.getElementById('all-products')) {
      filterProducts();
    }
  } catch (e) {
    console.warn('تعذر تحميل المنتجات من Firestore:', e);
  }
}

// ═══ Cart State ═══
let cart = JSON.parse(localStorage.getItem('ajwaa_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('ajwaa_wishlist')) || [];

// ═══ DOM Ready ═══
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initNavbar();
  initParticles();
  initCountdown();
  initCartUI();
  updateCartBadge();
  initChatbot();
  initScrollTop();
  
  // Business Platform Upgrades Initializers
  initMobileBottomNav();
  initBeforeAfterSliders();
  initCompareSystem();
  initQuickViewModal();
  initBookingSystemUpgrades();
  initRecentlyViewed();
  initSaaSAdminInterface();
  // Load products from Firestore (replaces static data)
  loadProductsFromFirestore();
  loadTestimonials();

  // Auth-dependent navbar (waits for Firebase)
  onAuthReady(() => updateNavbarAuth());

  // AOS Init
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }
});

// ═══ Loading Screen ═══
function initLoading() {
  const loader = document.querySelector('.loading-screen');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), 600);
    });
  }
}

// ═══ Navbar ═══
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.navbar-menu');
  const overlay = document.querySelector('.menu-overlay');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu
  function openMenu() {
    menu?.classList.add('active');
    overlay?.classList.add('active');
    if (menu) menu.style.right = '0';
  }
  function closeMenu() {
    menu?.classList.remove('active');
    overlay?.classList.remove('active');
    if (menu) menu.style.right = '-100%';
  }

  toggle?.addEventListener('click', () => {
    menu?.classList.contains('active') ? closeMenu() : openMenu();
  });
  overlay?.addEventListener('click', closeMenu);

  // Close menu on link click
  menu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Active link
  const links = document.querySelectorAll('.navbar-menu a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });
}

// ═══ Particles ═══
function initParticles() {
  const container = document.querySelector('.particles-container');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*8+6}s;
      animation-delay:${Math.random()*5}s;
    `;
    container.appendChild(p);
  }
}

// ═══ Countdown ═══
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const end = new Date();
  end.setDate(end.getDate() + 7);

  function update() {
    const diff = end - new Date();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown-item"><div class="number">${d}</div><div class="label">يوم</div></div>
      <div class="countdown-item"><div class="number">${h}</div><div class="label">ساعة</div></div>
      <div class="countdown-item"><div class="number">${m}</div><div class="label">دقيقة</div></div>
      <div class="countdown-item"><div class="number">${s}</div><div class="label">ثانية</div></div>
    `;
  }
  update();
  setInterval(update, 1000);
}

// ═══ Cart Functions ═══
function addToCart(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`تم إضافة "${product.name}" إلى السلة`);
  renderCartItems();
}

// ─── Card Qty Selector ───
function cardQtyPlus(productId, btn) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const wrap = document.getElementById(`cardQty-${productId}`);
  const numEl = document.getElementById(`cqNum-${productId}`);
  const existing = cart.find(i => i.id === productId);

  if (existing) {
    existing.qty++;
    if (numEl) numEl.textContent = existing.qty;
  } else {
    cart.push({ ...product, qty: 1 });
    if (wrap) wrap.classList.add('expanded');
    if (numEl) numEl.textContent = 1;
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
  flyToCart(btn, productId);
}

function cardQtyMinus(productId) {
  const wrap = document.getElementById(`cardQty-${productId}`);
  const numEl = document.getElementById(`cqNum-${productId}`);
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty--;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
    if (wrap) wrap.classList.remove('expanded');
    if (numEl) numEl.textContent = 1;
  } else {
    if (numEl) numEl.textContent = item.qty;
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
}

// ─── Fly-to-Cart Animation ───
function flyToCart(fromBtn, productId) {
  const product = productsData.find(p => p.id === productId);
  const cartIcon = document.querySelector('.cart-icon');
  if (!cartIcon || !product) return;

  // Use product image as the flying element
  const imgEl = document.getElementById(`pImg-${productId}`);
  const srcRect = imgEl ? imgEl.getBoundingClientRect() : fromBtn.getBoundingClientRect();
  const destRect = cartIcon.getBoundingClientRect();

  const size = Math.min(srcRect.width, srcRect.height, 80);
  const startX = srcRect.left + srcRect.width / 2 - size / 2;
  const startY = srcRect.top + srcRect.height / 2 - size / 2;
  const endX = destRect.left + destRect.width / 2 - size / 2;
  const endY = destRect.top + destRect.height / 2 - size / 2;

  const particle = document.createElement('div');
  particle.className = 'fly-particle';
  particle.style.cssText = `left:${startX}px;top:${startY}px;width:${size}px;height:${size}px;`;
  particle.innerHTML = `<img src="${product.image}" alt="">`;
  document.body.appendChild(particle);

  const dx = endX - startX;
  const dy = endY - startY;
  // arc midpoint: go up 80px above the straight line
  const arcY = dy / 2 - 80;

  particle.animate([
    { transform: 'translate(0,0) scale(1)',              opacity: 1    },
    { transform: `translate(${dx*0.5}px,${arcY}px) scale(0.55)`, opacity: 0.85, offset: 0.45 },
    { transform: `translate(${dx}px,${dy}px) scale(0.15)`, opacity: 0  }
  ], {
    duration: 750,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards'
  }).onfinish = () => {
    particle.remove();
    // Bounce cart badge
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.classList.remove('cart-pop');
      void badge.offsetWidth;
      badge.classList.add('cart-pop');
      badge.addEventListener('animationend', () => badge.classList.remove('cart-pop'), { once: true });
    }
  };
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem('ajwaa_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  badges.forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function getCartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

// ═══ Cart Drawer ═══
function initCartUI() {
  const cartBtn = document.querySelector('.cart-icon');
  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-drawer-overlay');
  const closeBtn = document.querySelector('.cart-drawer-close');

  cartBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    drawer?.classList.add('active');
    overlay?.classList.add('active');
    renderCartItems();
  });

  [overlay, closeBtn].forEach(el => {
    el?.addEventListener('click', () => {
      drawer?.classList.remove('active');
      overlay?.classList.remove('active');
    });
  });
}

function renderCartItems() {
  const container = document.querySelector('.cart-drawer-items');
  const totalEl = document.querySelector('.cart-total-price');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--gray-400);"><i class="fas fa-shopping-cart" style="font-size:2.5rem;margin-bottom:12px;display:block;"></i><p>السلة فارغة</p></div>`;
    if (totalEl) totalEl.textContent = '0 ريال';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="price">${item.price.toLocaleString()} ريال</div>
        <div class="qty-control" style="margin-top:6px;display:inline-flex;transform:scale(0.85);transform-origin:right;">
          <button onclick="updateCartQty(${item.id},-1)">-</button>
          <input type="text" value="${item.qty}" readonly>
          <button onclick="updateCartQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = getCartTotal().toLocaleString() + ' ريال';
}

// ═══ Wishlist ═══
function toggleWishlist(productId) {
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem('ajwaa_wishlist', JSON.stringify(wishlist));
  document.querySelectorAll(`.product-wishlist[data-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('active');
    btn.innerHTML = wishlist.includes(productId) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  });
}

// ═══ Product Card HTML ═══
function createProductCard(product) {
  const isWished = wishlist.includes(product.id);
  const cartItem = cart.find(i => i.id === product.id);
  const currentQty = cartItem ? cartItem.qty : 0;
  return `
    <div class="product-card" data-aos="fade-up">
      <div class="product-image">
        ${product.badge ? `<span class="product-badge ${product.badge === 'جديد' ? 'new' : ''}">${product.badge}</span>` : ''}
        <button class="product-wishlist ${isWished ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist(${product.id})">
          <i class="${isWished ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <a href="product-details.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" id="pImg-${product.id}"></a>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name"><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</div>
          <span class="count">(${product.reviews})</span>
        </div>
        <div class="product-price-row">
          <div class="product-price">
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()}</span>` : ''}
            ${product.price.toLocaleString()} <span class="currency">ريال</span>
          </div>
          <div class="card-qty-wrap ${currentQty > 0 ? 'expanded' : ''}" id="cardQty-${product.id}">
            <button class="cq-btn cq-minus" onclick="cardQtyMinus(${product.id})">
              <i class="fas fa-minus"></i>
            </button>
            <span class="cq-num" id="cqNum-${product.id}">${currentQty > 0 ? currentQty : 1}</span>
            <button class="cq-btn cq-plus" onclick="cardQtyPlus(${product.id}, this)">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═══ Render Products ═══
function renderProducts(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = products.map(createProductCard).join('');
}

// ═══ Toast ═══
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);font-size:1.2rem;"></i><span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ═══ Scroll to Top ═══
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn?.classList.add('show');
    else btn?.classList.remove('show');
  });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ═══ Chatbot ═══
function initChatbot() {
  const toggle = document.querySelector('.chatbot-toggle');
  const window_ = document.querySelector('.chatbot-window');
  const close = document.querySelector('.chatbot-close');
  const input = document.querySelector('.chatbot-input input');
  const sendBtn = document.querySelector('.chatbot-input button');
  const messages = document.querySelector('.chatbot-messages');

  toggle?.addEventListener('click', () => {
    window_?.classList.toggle('active');
    if (window_?.classList.contains('active') && messages?.children.length === 0) {
      addBotMessage('أهلاً بك في أجواء الصيف! 🌬️❄️ كيف يمكنني مساعدتك؟');
    }
  });

  close?.addEventListener('click', () => window_?.classList.remove('active'));

  const send = () => {
    const text = input?.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    showTyping();
    setTimeout(() => {
      removeTyping();
      const reply = getBotReply(text);
      addBotMessage(reply);
    }, 1200);
  };

  sendBtn?.addEventListener('click', send);
  input?.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });

  // Quick actions
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      addUserMessage(text);
      showTyping();
      setTimeout(() => {
        removeTyping();
        addBotMessage(getBotReply(text));
      }, 1000);
    });
  });
}

function addBotMessage(text) {
  const messages = document.querySelector('.chatbot-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.innerHTML = `<div class="msg-avatar"><i class="fas fa-snowflake"></i></div><div class="msg-bubble">${text}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addUserMessage(text) {
  const messages = document.querySelector('.chatbot-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'chat-message user';
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.querySelector('.chatbot-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'chat-message bot typing-msg';
  div.innerHTML = `<div class="msg-avatar"><i class="fas fa-snowflake"></i></div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  document.querySelector('.typing-msg')?.remove();
}

function getBotReply(text) {
  const t = text.toLowerCase();
  if (t.includes('سعر') || t.includes('كام') || t.includes('ثمن')) return 'أسعارنا تنافسية وتبدأ من 22,999 ريال للتكييف 1.5 حصان. يمكنك تصفح <a href="products.html" style="color:var(--primary-light);">جميع المنتجات</a> لمعرفة الأسعار 💰';
  if (t.includes('صيانة') || t.includes('تصليح') || t.includes('عطل')) return 'يمكنك حجز صيانة من <a href="booking.html" style="color:var(--primary-light);">صفحة حجز الصيانة</a>. فريقنا متاح لخدمتك 🔧';
  if (t.includes('تركيب')) return 'نوفر خدمة التركيب الاحترافي مع ضمان. <a href="services.html" style="color:var(--primary-light);">تعرف على خدماتنا</a> ⚙️';
  if (t.includes('تبريد') || t.includes('تجميد') || t.includes('غرف')) return 'متخصصون في تصميم وتنفيذ غرف التبريد والتجميد للمطاعم والمستودعات بأعلى كفاءة. <a href="booking.html" style="color:var(--primary-light);">اطلب معاينة الآن</a> ❄️';
  if (t.includes('نحاس') || t.includes('مواسير')) return 'نقدم خدمة تمديد مواسير النحاس بأعلى جودة لضمان كفاءة التبريد وعدم التسريب. 🔧';
  if (t.includes('فريون') || t.includes('شحن')) return 'خدمة شحن الفريون متاحة. احجز موعد من <a href="booking.html" style="color:var(--primary-light);">هنا</a> ❄️';
  if (t.includes('واتس') || t.includes('تواصل')) return 'يمكنك التواصل معنا عبر واتساب على الرقم <a href="https://wa.me/966530656834" style="color:var(--primary-light);">0530656834</a> 📱';
  if (t.includes('عرض') || t.includes('خصم')) return 'لدينا عروض مميزة بخصومات رائعة! تصفح <a href="products.html" style="color:var(--primary-light);">العروض الآن</a> 🔥';
  if (t.includes('أفضل') || t.includes('انصح') || t.includes('مناسب')) return 'لغرفة عادية: تكييف 1.5 حصان<br>لغرفة كبيرة: تكييف 2.25 حصان<br>لصالة كبيرة: تكييف 3 حصان<br>أنصح بتكييفات الانفرتر لتوفير الكهرباء 💡';
  return 'شكراً لتواصلك! يمكنني مساعدتك في: اختيار تكييف مناسب، حجز صيانة، أو الإجابة عن أسئلتك. كيف يمكنني مساعدتك؟ 😊';
}

// ═══ Render Featured Products on Home ═══
if (document.getElementById('featured-products')) {
  renderProducts('featured-products', productsData.slice(0, 4));
}

// ═══ Navbar Auth UI (data comes from firebase-config.js) ═══
function updateNavbarAuth() {
  const user = getCurrentUser();

  // Desktop: navbarAuth container (exists on some pages)
  const container = document.getElementById('navbarAuth');
  if (container) {
    if (user) {
      const firstName = user.name ? user.name.split(' ')[0] : 'حسابي';
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
          <a href="profile.html" class="btn btn-primary btn-sm" style="gap:6px;">
            <i class="fas fa-user-circle"></i><span>${firstName}</span>
          </a>
          <button onclick="logoutUser()" class="btn btn-outline btn-sm" style="padding:8px 12px;" title="تسجيل الخروج">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm"><i class="fas fa-user"></i> دخول</a>`;
    }
  }

  // Mobile: inject small icon button next to cart in navbar-actions
  let mobileBtn = document.getElementById('navMobileAuth');
  if (!mobileBtn) {
    const actions = document.querySelector('.navbar-actions');
    if (actions) {
      mobileBtn = document.createElement('a');
      mobileBtn.id = 'navMobileAuth';
      mobileBtn.style.cssText = 'display:none;width:38px;height:38px;border-radius:50%;background:var(--primary);color:#fff;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;';
      const cartIcon = actions.querySelector('.cart-icon');
      if (cartIcon) actions.insertBefore(mobileBtn, cartIcon);
      else actions.prepend(mobileBtn);
    }
  }
  if (mobileBtn) {
    mobileBtn.href = user ? 'profile.html' : 'login.html';
    if (user) {
      const firstName = user.name ? user.name.split(' ')[0] : 'حسابي';
      mobileBtn.innerHTML = `<i class="fas fa-user-circle"></i><span style="font-size:0.7rem;font-weight:700;margin-right:4px;font-family:Cairo,sans-serif;">${firstName}</span>`;
      mobileBtn.style.cssText = 'display:none;align-items:center;gap:4px;background:var(--primary);color:#fff;padding:6px 12px;border-radius:20px;font-size:0.95rem;flex-shrink:0;text-decoration:none;white-space:nowrap;';
    } else {
      mobileBtn.innerHTML = `<i class="fas fa-user"></i>`;
      mobileBtn.style.cssText = 'display:none;width:38px;height:38px;border-radius:50%;background:var(--primary);color:#fff;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;text-decoration:none;';
    }
    mobileBtn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
  }
}

window.addEventListener('resize', () => {
  const btn = document.getElementById('navMobileAuth');
  if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
});


function filterWork(category, btn) {
  document.querySelectorAll('.work-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.work-card').forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.style.display = match ? '' : 'none';
    if (match) card.style.animation = 'fadeInUp 0.4s ease';
  });
}

function getStatusLabel(status) {
  const map = {
    pending: { label: 'قيد المراجعة', color: 'var(--warning)' },
    confirmed: { label: 'تم التأكيد', color: 'var(--primary)' },
    shipping: { label: 'جارٍ التوصيل', color: '#f97316' },
    delivered: { label: 'تم التوصيل', color: 'var(--success)' },
    cancelled: { label: 'ملغي', color: 'var(--danger)' }
  };
  return map[status] || map.pending;
}

/* ═══════════════════════════════════════
   أجواء الصيف - Business Platform Upgrades Code
   ═══════════════════════════════════════ */

// 1. Mobile Bottom Nav Bar & Sticky CTA
function initMobileBottomNav() {
  const bottomBar = document.createElement('div');
  bottomBar.className = 'mobile-bottom-nav';
  bottomBar.innerHTML = `
    <a href="index.html" class="mobile-bottom-nav-item ${window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'active' : ''}">
      <i class="fas fa-home"></i>
      <span>الرئيسية</span>
    </a>
    <a href="products.html" class="mobile-bottom-nav-item ${window.location.pathname.endsWith('products.html') ? 'active' : ''}">
      <i class="fas fa-shopping-bag"></i>
      <span>المتجر</span>
    </a>
    <a href="#" class="mobile-bottom-nav-item emergency-nav-item" onclick="triggerEmergencyCTA(event)">
      <i class="fas fa-bolt"></i>
      <span>طوارئ</span>
    </a>
    <a href="booking.html" class="mobile-bottom-nav-item ${window.location.pathname.endsWith('booking.html') ? 'active' : ''}">
      <i class="fas fa-calendar-check"></i>
      <span>حجز صيانة</span>
    </a>
    <a href="services.html" class="mobile-bottom-nav-item ${window.location.pathname.endsWith('services.html') ? 'active' : ''}">
      <i class="fas fa-tools"></i>
      <span>الخدمات</span>
    </a>
  `;
  document.body.appendChild(bottomBar);

  // Add the Floating emergency button for Desktop as well
  const emergencyFloat = document.createElement('a');
  emergencyFloat.href = '#';
  emergencyFloat.className = 'emergency-fixed-btn';
  emergencyFloat.onclick = function(e) { triggerEmergencyCTA(e); };
  emergencyFloat.innerHTML = `<i class="fas fa-phone-alt"></i><span>صيانة فورية الآن 🚨</span>`;
  document.body.appendChild(emergencyFloat);

  // Add dynamic coupon code to copy anywhere
  const couponContainer = document.querySelector('.coupon-copy-btn');
  if (couponContainer) {
    couponContainer.addEventListener('click', () => {
      const codeText = document.querySelector('.coupon-code').textContent.trim();
      navigator.clipboard.writeText(codeText).then(() => {
        showToast('تم نسخ كوبون الخصم: ' + codeText + ' 🏷️');
      });
    });
  }
}

// Trigger Emergency Options Modal
function triggerEmergencyCTA(e) {
  if (e) e.preventDefault();
  let overlay = document.querySelector('.emergency-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'emergency-modal-overlay';
    overlay.innerHTML = `
      <div class="emergency-modal-card">
        <div class="emergency-modal-header">
          <button class="emergency-close-btn" onclick="closeEmergencyCTA()"><i class="fas fa-times"></i></button>
          <h3><i class="fas fa-shield-alt"></i> صيانة فورية وطوارئ</h3>
          <p>خدمة طوارئ سريعة على مدار 24 ساعة بالرياض</p>
        </div>
        <div class="emergency-modal-body">
          <a href="https://wa.me/966530656834?text=أحتاج%20صيانة%20عاجلة%20لتكييف" target="_blank" class="emergency-option-card whatsapp-opt">
            <div class="opt-icon"><i class="fab fa-whatsapp"></i></div>
            <div class="opt-info">
              <h4>تواصل سريع عبر واتساب</h4>
              <p>متصلون الآن - استجابة خلال 5 دقائق</p>
            </div>
          </a>
          <a href="tel:0530656834" class="emergency-option-card call-opt">
            <div class="opt-icon"><i class="fas fa-phone-alt"></i></div>
            <div class="opt-info">
              <h4>اتصال هاتفي مباشر</h4>
              <p>تحدث مع مهندس الصيانة فوراً</p>
            </div>
          </a>
          <div class="emergency-option-card form-opt" onclick="closeEmergencyCTA(); window.location.href='booking.html?emergency=true';">
            <div class="opt-icon"><i class="fas fa-calendar-plus"></i></div>
            <div class="opt-info">
              <h4>نموذج صيانة سريع</h4>
              <p>احجز فني صيانة طوارئ خلال ساعة</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}

function closeEmergencyCTA() {
  document.querySelector('.emergency-modal-overlay')?.classList.remove('active');
}

// 2. Before / After Sliders logic
function initBeforeAfterSliders() {
  const container = document.querySelector('.comparison-slider-container');
  if (!container) return;

  const handle = container.querySelector('.comparison-handle');
  const imgAfter = container.querySelector('.comparison-img-after');

  let isInteracting = false;
  let autoPos = 0.5;
  let dir = 1;
  const speed = 0.0035;

  function move(pos) {
    if (pos < 0) pos = 0;
    if (pos > 1) pos = 1;
    handle.style.left = pos * 100 + '%';
    imgAfter.style.clipPath = `polygon(0 0, ${pos * 100}% 0, ${pos * 100}% 100%, 0 100%)`;
  }

  function autoAnimate() {
    if (!isInteracting) {
      autoPos += speed * dir;
      if (autoPos > 0.85) { dir = -1; }
      if (autoPos < 0.15) { dir = 1; }
      move(autoPos);
    }
    requestAnimationFrame(autoAnimate);
  }

  container.addEventListener('mousemove', (e) => {
    isInteracting = true;
    const rect = container.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    autoPos = pos; // sync position
    move(pos);
  });
  
  container.addEventListener('mouseleave', () => {
    isInteracting = false;
  });

  container.addEventListener('touchmove', (e) => {
    isInteracting = true;
    if (e.touches && e.touches[0]) {
      const rect = container.getBoundingClientRect();
      let pos = (e.touches[0].clientX - rect.left) / rect.width;
      autoPos = pos;
      move(pos);
    }
  }, { passive: true });
  
  container.addEventListener('touchend', () => {
    isInteracting = false;
  });

  autoAnimate();
}

// 3. E-commerce Upgrades: Comparison Engine
let compareList = JSON.parse(localStorage.getItem('ajwaa_compare')) || [];

function initCompareSystem() {
  renderCompareFloatBar();
  
  // Inject compare button to all rendered product cards dynamically
  document.querySelectorAll('.product-card').forEach(card => {
    const id = parseInt(card.querySelector('.product-wishlist')?.dataset.id);
    if (id && !card.querySelector('.btn-compare-card')) {
      const btn = document.createElement('button');
      btn.className = `btn-compare-card ${compareList.includes(id) ? 'active' : ''}`;
      btn.innerHTML = `<i class="fas fa-exchange-alt"></i>`;
      btn.title = 'قارن المنتج';
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(id);
      };
      card.querySelector('.product-image').appendChild(btn);
    }
  });
}

function toggleCompare(id) {
  const idx = compareList.indexOf(id);
  if (idx > -1) {
    compareList.splice(idx, 1);
    showToast('تمت إزالة المنتج من المقارنة');
  } else {
    if (compareList.length >= 3) {
      showToast('يمكنك مقارنة 3 منتجات بحد أقصى ⚠️');
      return;
    }
    compareList.push(id);
    showToast('تمت إضافة المنتج للمقارنة');
  }
  localStorage.setItem('ajwaa_compare', JSON.stringify(compareList));
  
  // Update UI states
  document.querySelectorAll(`.btn-compare-card`).forEach(btn => {
    const btnId = parseInt(btn.parentElement.querySelector('.product-wishlist')?.dataset.id);
    if (btnId === id) {
      btn.classList.toggle('active', compareList.includes(id));
    }
  });

  renderCompareFloatBar();
}

function removeCompareItem(id) {
  compareList = compareList.filter(item => item !== id);
  localStorage.setItem('ajwaa_compare', JSON.stringify(compareList));
  document.querySelectorAll(`.btn-compare-card`).forEach(btn => {
    const btnId = parseInt(btn.parentElement.querySelector('.product-wishlist')?.dataset.id);
    if (btnId === id) btn.classList.remove('active');
  });
  renderCompareFloatBar();
}

function renderCompareFloatBar() {
  let bar = document.querySelector('.compare-float-bar');
  if (compareList.length === 0 || window.location.pathname.includes('product-details')) {
    bar?.classList.remove('active');
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'compare-float-bar';
    document.body.appendChild(bar);
  }

  const itemsHTML = compareList.map(id => {
    const prod = productsData.find(p => p.id === id);
    if (!prod) return '';
    return `
      <div class="compare-tray-thumb">
        <img src="${prod.image}" alt="">
        <div class="compare-tray-remove" onclick="removeCompareItem(${id})"><i class="fas fa-times"></i></div>
      </div>
    `;
  }).join('');

  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="font-size:0.8rem;font-weight:700;color:var(--gray-700);">المقارنة (${compareList.length}/3)</div>
      <div class="compare-tray-items">${itemsHTML}</div>
      <button class="btn btn-primary btn-sm" onclick="showCompareModal()" style="padding:6px 14px;border-radius:6px;font-size:0.78rem;">قارن الآن</button>
    </div>
  `;
  bar.classList.add('active');
}

function showCompareModal() {
  let modal = document.querySelector('#compareModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'compareModal';
    document.body.appendChild(modal);
  }

  const items = compareList.map(id => productsData.find(p => p.id === id)).filter(Boolean);
  if (!items.length) return;

  const headers = items.map(p => `
    <th>
      <div class="compare-product-header">
        <img src="${p.image}" alt="">
        <h4>${p.name}</h4>
        <div style="font-weight:800;color:var(--primary);margin-bottom:6px;">${p.price.toLocaleString()} ر.س</div>
        <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id}); document.getElementById('compareModal').classList.remove('active');" style="padding:4px 10px;font-size:0.7rem;border-radius:6px;width:100%;">أضف للسلة</button>
      </div>
    </th>
  `).join('');

  const brandRow = items.map(p => `<td>${p.brand}</td>`).join('');
  const capacityRow = items.map(p => `<td>${p.hp} حصان</td>`).join('');
  const inverterRow = items.map(p => `<td>${p.inverter ? 'انفرتر موفر للطاقة ⚡' : 'تكييف قياسي عالي الكفاءة'}</td>`).join('');
  const warrantyRow = items.map(p => `<td>5 سنوات ضمان شامل</td>`).join('');
  const ratingRow = items.map(p => `<td>⭐ ${p.rating} (${p.reviews} تقييم)</td>`).join('');

  modal.innerHTML = `
    <div class="modal compare-modal-card">
      <div class="modal-header">
        <h3><i class="fas fa-exchange-alt"></i> مقارنة مواصفات التكييفات</h3>
        <button onclick="document.getElementById('compareModal').classList.remove('active')" style="background:none;font-size:1.2rem;color:var(--gray-500);"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body" style="padding:14px;overflow-x:auto;">
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:140px;background:var(--white);">الخصائص</th>
              ${headers}
            </tr>
          </thead>
          <tbody>
            <tr><td class="product-col">الماركة</td>${brandRow}</tr>
            <tr><td class="product-col">القدرة بالحصان</td>${capacityRow}</tr>
            <tr><td class="product-col">تقنية توفير الكهرباء</td>${inverterRow}</tr>
            <tr><td class="product-col">فترة الضمان</td>${warrantyRow}</tr>
            <tr><td class="product-col">تقييم العملاء</td>${ratingRow}</tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

// 4. E-commerce Upgrades: Premium Quick View Modal
function initQuickViewModal() {
  window.showQuickView = function(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    let qvModal = document.querySelector('#quickViewModal');
    if (!qvModal) {
      qvModal = document.createElement('div');
      qvModal.className = 'modal-overlay';
      qvModal.id = 'quickViewModal';
      document.body.appendChild(qvModal);
    }

    const tamaraSplit = Math.round(product.price / 4);

    qvModal.innerHTML = `
      <div class="modal" style="max-width:700px;width:95%;">
        <div class="modal-header">
          <h3><i class="fas fa-eye"></i> نظرة سريعة للمنتج</h3>
          <button onclick="closeQuickViewModal()" style="background:none;font-size:1.2rem;color:var(--gray-500);"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="qv-modal-grid">
            <div style="background:linear-gradient(135deg,#f0f8ff,#e8f4fd);border-radius:12px;padding:20px;display:flex;align-items:center;justify-content:center;height:240px;">
              <img src="${product.image}" alt="" style="max-height:100%;max-width:100%;object-fit:contain;">
            </div>
            <div>
              <span style="font-size:0.75rem;color:var(--primary);font-weight:700;text-transform:uppercase;">${product.brand}</span>
              <h2 style="font-size:1.2rem;font-weight:800;color:var(--gray-900);margin:4px 0 10px;">${product.name}</h2>
              
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="font-size:1.5rem;font-weight:900;color:var(--primary-dark);">${product.price.toLocaleString()} ر.س</div>
                ${product.oldPrice ? `<div style="font-size:0.9rem;color:var(--gray-400);text-decoration:line-through;">${product.oldPrice.toLocaleString()} ر.س</div>` : ''}
              </div>

              ${product.description ? `<div style="font-size:0.8rem;color:var(--gray-600);line-height:1.6;margin-bottom:14px;">${product.description}</div>` : ''}

              <div style="display:flex;gap:10px;">
                <button class="btn btn-primary" onclick="addToCart(${product.id}); closeQuickViewModal();" style="flex:1;"><i class="fas fa-shopping-cart"></i> أضف للسلة</button>
                <a href="product-details.html?id=${product.id}" class="btn btn-outline" style="padding:10px 18px;"><i class="fas fa-info-circle"></i> التفاصيل</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    qvModal.classList.add('active');
  };

  window.closeQuickViewModal = function() {
    document.querySelector('#quickViewModal')?.classList.remove('active');
  };
}

// 5. Smart Booking Page Wizard Improvements & Simulated Riyadh Map
let bookingRegion = 'الوسطى';
function initBookingSystemUpgrades() {
  const uploadInput = document.getElementById('bookImage');
  if (uploadInput) {
    uploadInput.addEventListener('change', previewACImage);
  }


  // Intercept normal booking success to show tracker
  console.log('[Booking] submitBooking function registered');
  window.submitBooking = async function() {
    console.log('[Booking] submitBooking called');
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    if (!date || !time) { showToast('يرجى اختيار التاريخ والوقت'); return; }

    const trackId = 'AJW-' + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('last_booking_track', trackId);

    // Save to Firestore
    try {
      console.log('[Booking] Trying to save to Firestore...');
      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      await createBooking({
        trackId,
        customerName: document.getElementById('bookName')?.value.trim() || '',
        phone:        document.getElementById('bookPhone')?.value.trim() || '',
        address:      document.getElementById('bookAddress')?.value.trim() || '',
        acType:       document.getElementById('bookACType')?.value || '',
        acBrand:      document.getElementById('bookACBrand')?.value || '',
        description:  document.getElementById('bookDesc')?.value.trim() || '',
        date,
        time,
        userId: user ? user.uid : null,
        email:  user ? user.email : '',
        location: window._locationData || null
      });
    } catch (e) {
      console.error('Firestore booking save error:', e);
    }

    document.querySelectorAll('.booking-form-card').forEach(c => c.style.display = 'none');
    
    // Create gorgeous Tracking screen
    const successCard = document.getElementById('stepSuccess');
    successCard.innerHTML = `
      <div class="tracking-overlay-box">
        <div class="success-icon"><i class="fas fa-check"></i></div>
        <h2 style="font-size:1.5rem;font-weight:800;color:var(--success);margin-bottom:8px;text-align:center;">تم إرسال طلب الحجز بنجاح! 🎉</h2>
        <p style="color:var(--gray-500);margin-bottom:24px;text-align:center;">يرجى الاحتفاظ برقم التتبع الخاص بك للمراجعة</p>
        
        <div class="tracking-header">
          <div class="tracking-id-text">رقم تتبع الحجز: <span style="font-weight:900;color:var(--primary-dark);letter-spacing:1px;">${trackId}</span></div>
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${trackId}').then(()=>showToast('تم نسخ رقم التتبع!'))"><i class="far fa-copy"></i> نسخ</button>
        </div>

        <div style="background:var(--gray-50);border-radius:var(--radius-lg);padding:24px;margin-top:20px;text-align:center;border:1px dashed var(--primary-light);">
          <i class="fas fa-headset" style="font-size:2.5rem;color:var(--primary);margin-bottom:12px;"></i>
          <h4 style="font-size:1.1rem;font-weight:800;color:var(--gray-900);margin-bottom:8px;">فريق الدعم الفني في خدمتك</h4>
          <p style="font-size:0.9rem;color:var(--gray-600);line-height:1.6;margin:0;">لقد استلمنا طلب الصيانة الخاص بك بنجاح، وسيقوم أحد ممثلي خدمة العملاء بالتواصل معك قريباً لتأكيد الموعد وترتيب الزيارة.</p>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap;">
          <a href="index.html" class="btn btn-outline"><i class="fas fa-home"></i> الرئيسية</a>
          <a href="https://wa.me/966530656834?text=تحديث%20بخصوص%20طلب%20التتبع%20${trackId}" target="_blank" class="btn btn-primary" style="background:#25d366;"><i class="fab fa-whatsapp"></i> إشعار بالواتساب</a>
        </div>
      </div>
    `;
    successCard.style.display = 'block';
    document.querySelectorAll('.booking-step').forEach(s => s.classList.add('completed'));
    showToast('تم إرسال حجز الصيانة بنجاح! ✅');
  };
}

function previewACImage(event) {
  const input = event.target;
  const label = document.getElementById('fileLabel');
  if (input.files && input.files[0]) {
    const file = input.files[0];
    label.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);font-size:1.5rem;display:block;margin-bottom:6px;"></i>تم رفع: ${file.name}`;
  }
}


// 6. E-commerce Upgrades: Recently Viewed Items
function initRecentlyViewed() {
  const currentIdPage = new URLSearchParams(window.location.search).get('id');
  if (currentIdPage && window.location.pathname.includes('product-details.html')) {
    let recent = JSON.parse(localStorage.getItem('ajwaa_recent')) || [];
    const prodId = parseInt(currentIdPage);
    if (prodId) {
      recent = recent.filter(id => id !== prodId);
      recent.unshift(prodId);
      recent = recent.slice(0, 4); // Keep top 4
      localStorage.setItem('ajwaa_recent', JSON.stringify(recent));
    }
  }

  // If there's a recently viewed section container, render it
  const rVContainer = document.getElementById('recently-viewed-grid');
  if (rVContainer) {
    const recentIds = JSON.parse(localStorage.getItem('ajwaa_recent')) || [];
    const items = recentIds.map(id => productsData.find(p => p.id === id)).filter(Boolean);
    if (items.length === 0) {
      rVContainer.parentElement.style.display = 'none';
      return;
    }
    rVContainer.innerHTML = items.map(p => `
      <div class="product-card" style="box-shadow:none;border-color:var(--gray-200);">
        <div class="product-image" style="height:150px;padding:10px;">
          <a href="product-details.html?id=${p.id}"><img src="${p.image}" alt="" style="max-height:110px;"></a>
        </div>
        <div class="product-info" style="padding:10px;">
          <h3 class="product-name" style="font-size:0.82rem;"><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
          <div style="font-weight:800;color:var(--primary-dark);font-size:0.92rem;margin-top:6px;">${p.price.toLocaleString()} ر.س</div>
        </div>
      </div>
    `).join('');
  }
}

// 7. SaaS Admin Control Dashboard Logic
let localAdminProducts = JSON.parse(localStorage.getItem('admin_products')) || [...productsData];

function initSaaSAdminInterface() {
  if (!window.location.pathname.includes('admin.html')) return;

  // Overwrite local products array in local storage
  localStorage.setItem('admin_products', JSON.stringify(localAdminProducts));
  renderAdminProductsTable();

  // Custom Chart modifications if dashboard is open
  const timelineContainer = document.querySelector('#dashboard');
  if (timelineContainer && !document.getElementById('adminTimelineBlock')) {
    const timeline = document.createElement('div');
    timeline.id = 'adminTimelineBlock';
    timeline.className = 'data-table-card';
    timeline.style.padding = '24px';
    timeline.style.marginTop = '24px';
    timeline.innerHTML = `
      <div class="table-header" style="padding:0 0 16px;border-bottom:1.5px solid var(--gray-100);">
        <h3><i class="fas fa-history"></i> سجل الأنشطة والعمليات الفنية</h3>
        <button class="btn btn-outline btn-sm" onclick="triggerReportExport('PDF')"><i class="fas fa-file-pdf"></i> تصدير تقرير PDF</button>
      </div>
      <div class="activity-timeline" style="margin-top:20px;">
        <div class="activity-item completed">
          <div class="activity-time">منذ 5 دقائق</div>
          <div class="activity-desc">أرسل العميل <strong>سعود العنزي</strong> طلب صيانة طوارئ بوسط الرياض. تم توجيه الفني.</div>
        </div>
        <div class="activity-item warning">
          <div class="activity-time">منذ ساعة</div>
          <div class="activity-desc">تم تحديث حالة الطلب <strong>#1021</strong> إلى "قيد التنفيذ" بواسطة الفني خالد علي.</div>
        </div>
        <div class="activity-item completed">
          <div class="activity-time">منذ 4 ساعات</div>
          <div class="activity-desc">قام المشرف بإضافة المنتج <strong>تكييف شارب انفرتر 1.5 حصان</strong> لتسويق العروض الكبرى.</div>
        </div>
      </div>
    `;
    timelineContainer.appendChild(timeline);
  }

  // Intercept form saves in admin
  const modalSaveBtn = document.querySelector('.modal-footer .btn-primary');
  if (modalSaveBtn) {
    modalSaveBtn.onclick = function() { saveAdminProduct(); };
  }
}

function renderAdminProductsTable() {
  const tbody = document.querySelector('#products-mgmt tbody');
  if (!tbody) return;

  tbody.innerHTML = localAdminProducts.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${p.image}" alt="" style="width:36px;height:36px;object-fit:contain;background:var(--gray-50);border-radius:6px;padding:2px;">
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.brand}</td>
      <td style="font-weight:700;color:var(--primary);">${p.price.toLocaleString()} ر.س</td>
      <td>${p.hp} حصان</td>
      <td><span class="status-badge completed">متوفر</span></td>
      <td>
        <button class="btn btn-sm btn-outline" style="padding:4px 10px;font-size:0.75rem;" onclick="editAdminProduct(${p.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm" style="padding:4px 10px;font-size:0.75rem;background:var(--danger);color:#fff;border-radius:6px;" onclick="deleteAdminProduct(${p.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function deleteAdminProduct(id) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) {
    localAdminProducts = localAdminProducts.filter(p => p.id !== id);
    localStorage.setItem('admin_products', JSON.stringify(localAdminProducts));
    renderAdminProductsTable();
    showToast('تم حذف المنتج بنجاح 🗑️');
  }
}

function saveAdminProduct() {
  const modal = document.getElementById('productModal');
  const name = modal.querySelector('input[placeholder="اسم المنتج"]').value.trim();
  const price = parseFloat(modal.querySelector('input[placeholder="السعر"]').value);
  const brand = modal.querySelector('select').value;
  const hp = modal.querySelectorAll('select')[1].value;

  if (!name || !price) {
    showToast('يرجى تعبئة كافة الحقول المطلوبة ⚠️');
    return;
  }

  const newProd = {
    id: Date.now(),
    name: name,
    brand: brand,
    hp: hp.replace(' حصان', ''),
    price: price,
    oldPrice: price + 400,
    rating: 4.8,
    reviews: 1,
    image: 'assets/images/product-1.png',
    inverter: true,
    badge: 'جديد'
  };

  localAdminProducts.unshift(newProd);
  localStorage.setItem('admin_products', JSON.stringify(localAdminProducts));
  renderAdminProductsTable();
  
  modal.classList.remove('active');
  showToast('تمت إضافة المنتج بنجاح إلى المنصة 🎉');

  // Reset inputs
  modal.querySelector('input[placeholder="اسم المنتج"]').value = '';
  modal.querySelector('input[placeholder="السعر"]').value = '';
}

function triggerReportExport(type) {
  let loader = document.querySelector('.export-loader-overlay');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'export-loader-overlay';
    loader.innerHTML = `
      <div class="export-progress-card">
        <h3><i class="fas fa-cloud-download-alt" style="color:var(--primary);font-size:2rem;margin-bottom:10px;display:block;"></i> جاري تصدير الملف كـ ${type}</h3>
        <p style="font-size:0.8rem;color:var(--gray-500);">تحضير البيانات والتحليلات الفنية لمكثفات التبريد</p>
        <div class="export-progress-bar-outer">
          <div class="export-progress-bar-inner"></div>
        </div>
        <span class="export-percent" style="font-weight:700;font-size:0.9rem;color:var(--primary-dark);">0%</span>
      </div>
    `;
    document.body.appendChild(loader);
  }

  loader.classList.add('active');
  const bar = loader.querySelector('.export-progress-bar-inner');
  const percentText = loader.querySelector('.export-percent');
  
  let percent = 0;
  const interval = setInterval(() => {
    percent += 5;
    bar.style.width = percent + '%';
    percentText.textContent = percent + '%';
    
    if (percent >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.remove('active');
        showToast(`تم تصدير تقرير ${type} بنجاح وحفظه بالتنزيلات 📊`);
      }, 500);
    }
  }, 100);
}

// ═══ Reviews System ═══
async function loadTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--primary);"></i></div>';
  try {
    const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').limit(6).get();
    if (snapshot.empty) {
      grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--gray-500);">لا توجد تقييمات حتى الآن. كن أول من يضيف تقييماً!</p>';
      return;
    }
    grid.innerHTML = snapshot.docs.map((doc, idx) => {
      const data = doc.data();
      const firstLetter = data.name ? data.name.charAt(0) : 'ع';
      const delay = idx * 100;
      return `
        <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${delay}">
          <i class="fas fa-quote-right quote-icon"></i>
          <p class="testimonial-text">${data.text}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${firstLetter}</div>
            <div>
              <h4>${data.name}</h4><span>${data.city}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--danger);">خطأ في تحميل التقييمات.</p>';
  }
}

async function submitReview() {
  const name = document.getElementById('reviewName').value.trim();
  const city = document.getElementById('reviewCity').value.trim();
  const text = document.getElementById('reviewText').value.trim();

  if (!name || !city || !text) {
    showToast('يرجى ملء جميع الحقول المطلوبة ⚠️');
    return;
  }

  const btn = document.querySelector('#reviewModal .btn-primary');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
  btn.disabled = true;

  try {
    await db.collection('reviews').add({
      name,
      city,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast('تم إرسال تقييمك بنجاح ✓');
    document.getElementById('reviewModal').classList.remove('active');
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewCity').value = '';
    document.getElementById('reviewText').value = '';
    
    loadTestimonials();
  } catch (error) {
    showToast('خطأ أثناء إرسال التقييم: ' + error.message);
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}
