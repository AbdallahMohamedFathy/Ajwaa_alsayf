/* ═══════════════════════════════════════
   أجواء الصيف - Main JavaScript
   ═══════════════════════════════════════ */

// ═══ Products Data ═══
const productsData = [
  { id: 1, name: 'تكييف كاريير انفرتر 1.5 حصان بارد', brand: 'Carrier', hp: '1.5', price: 22999, oldPrice: 27500, discount: 16, rating: 4.8, reviews: 124, image: 'assets/images/product-1.png', inverter: true, badge: 'الأكثر مبيعاً' },
  { id: 2, name: 'تكييف شارب انفرتر 1.5 حصان بارد ساخن', brand: 'Sharp', hp: '1.5', price: 21500, oldPrice: 25000, discount: 14, rating: 4.7, reviews: 98, image: 'assets/images/product-2.png', inverter: true, badge: 'خصم' },
  { id: 3, name: 'تكييف ال جي دوال كول 2.25 حصان', brand: 'LG', hp: '2.25', price: 32999, oldPrice: 38000, discount: 13, rating: 4.9, reviews: 67, image: 'assets/images/product-3.png', inverter: true, badge: 'جديد' },
  { id: 4, name: 'تكييف تورنيدو 1.5 حصان بارد', brand: 'Tornado', hp: '1.5', price: 15999, oldPrice: 18500, discount: 14, rating: 4.5, reviews: 203, image: 'assets/images/product-4.png', inverter: false, badge: 'خصم' },
  { id: 5, name: 'تكييف فريش 1.5 حصان بروفيشنال', brand: 'Fresh', hp: '1.5', price: 14500, oldPrice: 17000, discount: 15, rating: 4.4, reviews: 156, image: 'assets/images/product-1.png', inverter: false, badge: '' },
  { id: 6, name: 'تكييف ميديا انفرتر 3 حصان', brand: 'Midea', hp: '3', price: 42000, oldPrice: 48000, discount: 12, rating: 4.6, reviews: 45, image: 'assets/images/product-2.png', inverter: true, badge: 'جديد' },
  { id: 7, name: 'تكييف كاريير 2.25 حصان بارد ساخن', brand: 'Carrier', hp: '2.25', price: 29999, oldPrice: 34000, discount: 12, rating: 4.8, reviews: 89, image: 'assets/images/product-3.png', inverter: false, badge: '' },
  { id: 8, name: 'تكييف شارب 3 حصان انفرتر بلازما', brand: 'Sharp', hp: '3', price: 45000, oldPrice: 52000, discount: 13, rating: 4.9, reviews: 34, image: 'assets/images/product-4.png', inverter: true, badge: 'premium' },
];

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
  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('active');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    menu?.classList.remove('active');
    overlay?.classList.remove('active');
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
  return `
    <div class="product-card" data-aos="fade-up">
      <div class="product-image">
        ${product.badge ? `<span class="product-badge ${product.badge === 'جديد' ? 'new' : ''}">${product.badge}</span>` : ''}
        <button class="product-wishlist ${isWished ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist(${product.id})">
          <i class="${isWished ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <a href="product-details.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a>
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
          <button class="btn-add-cart" onclick="addToCart(${product.id})" title="أضف للسلة">
            <i class="fas fa-plus"></i>
          </button>
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
