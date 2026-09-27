/**
 * AJ BIRYANI PALACE - CORE APPLICATION ENGINE
 * Location: Varadaiahpalem, AP (SH-4437)
 */

// 1. CONFIGURATION
const SHOP_WHATSAPP_NUMBER = "919876543210"; // Replace with your shop's WhatsApp number

// 2. STATE MANAGEMENT
let cart = [];
let selectedSpice = 'Authentic Andhra Medium';
let currentLang = 'en';

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  updateHandiCountdown();
  setInterval(updateHandiCountdown, 1000);
  runPartyCalc();
  calculateTravelTime();
});

// 4. EVENT LISTENERS ATTACHMENT
function initEventListeners() {
  // Cart open/close triggers
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartOpenBtnMobile = document.getElementById('cart-open-btn-mobile');
  const cartCloseBtn = document.getElementById('cart-close-btn');

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', () => toggleCartDrawer(true));
  if (cartOpenBtnMobile) cartOpenBtnMobile.addEventListener('click', () => toggleCartDrawer(true));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));

  // WhatsApp checkout trigger
  const checkoutBtn = document.getElementById('checkout-wa-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', sendCartOrderWhatsApp);

  // Add-to-cart buttons on menu cards
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      addToCart(name, price);
    });
  });

  // Spice level cards
  document.querySelectorAll('.spice-card').forEach(card => {
    card.addEventListener('click', () => {
      const spice = card.getAttribute('data-spice');
      selectSpice(spice, card);
    });
  });

  // Add customized spice biryani button
  const addCustomSpiceBtn = document.getElementById('add-custom-spice-btn');
  if (addCustomSpiceBtn) {
    addCustomSpiceBtn.addEventListener('click', () => {
      addToCart(`Special Chicken Dum (${selectedSpice})`, 160);
    });
  }

  // Menu Category Filter tabs
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-cat');
      filterCategory(category, btn);
    });
  });

  // Travel time select
  const locationSelect = document.getElementById('location-select');
  if (locationSelect) {
    locationSelect.addEventListener('change', calculateTravelTime);
  }

  // Party calculator controls
  const partyRange = document.getElementById('partyPeople');
  const partyDish = document.getElementById('partyDish');
  const partyStarter = document.getElementById('partyStarter');
  const partyWABtn = document.getElementById('order-party-wa-btn');

  if (partyRange) partyRange.addEventListener('input', runPartyCalc);
  if (partyDish) partyDish.addEventListener('change', runPartyCalc);
  if (partyStarter) partyStarter.addEventListener('change', runPartyCalc);
  if (partyWABtn) partyWABtn.addEventListener('click', orderPartyWhatsApp);

  // Reviews modal controls
  const openRevBtn = document.getElementById('open-review-modal-btn');
  const closeRevBtn = document.getElementById('close-review-modal-btn');
  const revForm = document.getElementById('review-form');

  if (openRevBtn) openRevBtn.addEventListener('click', openReviewModal);
  if (closeRevBtn) closeRevBtn.addEventListener('click', closeReviewModal);
  if (revForm) revForm.addEventListener('submit', submitReview);

  // Language switcher toggle
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);
}

// 5. LIVE CART LOGIC
function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  if (open) {
    drawer.classList.remove('translate-x-full');
  } else {
    drawer.classList.add('translate-x-full');
  }
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  toggleCartDrawer(true);
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function updateCartUI() {
  const list = document.getElementById('cart-items');
  const counter = document.getElementById('cart-counter');
  const mobileCounter = document.getElementById('cart-counter-mobile');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  let totalCount = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    list.innerHTML = `<p class="text-stone-400 text-xs text-center py-8">Your cart is currently empty. Click '+ Add' on any dish to begin!</p>`;
  } else {
    list.innerHTML = '';
    cart.forEach((item, index) => {
      totalCount += item.qty;
      totalPrice += item.price * item.qty;

      const row = document.createElement('div');
      row.className = "flex items-center justify-between p-3 rounded-xl bg-brand-surfaceLight border border-brand-border text-xs";
      row.innerHTML = `
        <div>
          <h4 class="font-bold text-white">${item.name}</h4>
          <span class="text-amber-400 font-mono">₹${item.price} each</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-qty-minus w-6 h-6 rounded bg-stone-800 text-stone-300 font-bold flex items-center justify-center hover:bg-stone-700">-</button>
          <span class="font-bold text-white w-4 text-center">${item.qty}</span>
          <button type="button" class="btn-qty-plus w-6 h-6 rounded bg-stone-800 text-stone-300 font-bold flex items-center justify-center hover:bg-stone-700">+</button>
        </div>
      `;

      row.querySelector('.btn-qty-minus').addEventListener('click', () => changeQty(index, -1));
      row.querySelector('.btn-qty-plus').addEventListener('click', () => changeQty(index, 1));
      list.appendChild(row);
    });
  }

  if (counter) counter.innerText = totalCount;
  if (mobileCounter) mobileCounter.innerText = totalCount;
  if (subtotalEl) subtotalEl.innerText = '₹' + totalPrice;
  if (totalEl) totalEl.innerText = '₹' + totalPrice;
}

function sendCartOrderWhatsApp() {
  if (cart.length === 0) {
    alert("Please add at least one dish to your cart before proceeding.");
    return;
  }
  const orderLines = cart.map(item => `• ${item.name} x ${item.qty} (₹${item.price * item.qty})`).join('%0A');
  const total = document.getElementById('cart-total').innerText;
  const msg = `Hi AJ Biryani Palace (Varadaiahpalem), I would like to place a pickup order:%0A%0A${orderLines}%0A%0A*Total Amount: ${total}*%0APlease confirm if this can be packed for pickup. Thank you!`;
  window.open(`https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// 6. SPICE CUSTOMIZER
function selectSpice(spiceName, element) {
  selectedSpice = spiceName;
  document.querySelectorAll('.spice-card').forEach(c => {
    c.classList.remove('border-amber-500', 'border-red-500', 'border-2');
    c.classList.add('border-brand-border');
  });
  element.classList.remove('border-brand-border');
  element.classList.add('border-2', spiceName.includes('Guntur') ? 'border-red-500' : 'border-amber-500');

  const label = document.getElementById('current-spice-choice');
  if (label) label.innerText = spiceName;
}

// 7. MENU FILTERING
function filterCategory(cat, btn) {
  document.querySelectorAll('.category-btn').forEach(b => {
    b.classList.remove('bg-amber-500', 'text-black');
    b.classList.add('bg-brand-surfaceLight', 'text-stone-300');
  });
  btn.classList.remove('bg-brand-surfaceLight', 'text-stone-300');
  btn.classList.add('bg-amber-500', 'text-black');

  document.querySelectorAll('.menu-dish-card').forEach(card => {
    if (cat === 'all' || card.classList.contains(cat)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// 8. DUM HANDI COUNTDOWN TIMER
function updateHandiCountdown() {
  const timerDisplay = document.getElementById('countdown-timer');
  const dumTypeDisplay = document.getElementById('next-dum-type');
  if (!timerDisplay || !dumTypeDisplay) return;

  const now = new Date();
  let target = new Date(now);

  const lunchTime = new Date(now);
  lunchTime.setHours(12, 30, 0, 0);

  const dinnerTime = new Date(now);
  dinnerTime.setHours(19, 0, 0, 0);

  let dumType = '';
  if (now < lunchTime) {
    target = lunchTime;
    dumType = '(Lunch Handi at 12:30 PM)';
  } else if (now >= lunchTime && now < dinnerTime) {
    target = dinnerTime;
    dumType = '(Dinner Handi at 7:00 PM)';
  } else {
    target = new Date(now);
    target.setDate(target.getDate() + 1);
    target.setHours(12, 30, 0, 0);
    dumType = '(Tomorrow Lunch Handi)';
  }

  const diff = target - now;
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  timerDisplay.innerText = 
    `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  dumTypeDisplay.innerText = dumType;
}

// 9. TRAVEL TIME ESTIMATION
function calculateTravelTime() {
  const select = document.getElementById('location-select');
  const display = document.getElementById('travel-time-display');
  if (!select || !display) return;

  const times = {
    'sricity': '18 - 22 mins',
    'tada': '20 - 25 mins',
    'kalahasti': '25 - 30 mins',
    'satyavedu': '15 - 18 mins',
    'local': '3 - 5 mins'
  };
  display.innerText = times[select.value] || '15 mins';
}

// 10. PARTY & BULK ORDER CALCULATOR
function runPartyCalc() {
  const peopleInput = document.getElementById('partyPeople');
  const dishInput = document.getElementById('partyDish');
  const starterInput = document.getElementById('partyStarter');
  const valDisplay = document.getElementById('partyPeopleVal');
  const totalDisplay = document.getElementById('partyTotalDisplay');
  const portionText = document.getElementById('partyPortionText');

  if (!peopleInput || !dishInput || !starterInput) return;

  const people = parseInt(peopleInput.value, 10);
  const price = parseInt(dishInput.value, 10);
  const hasStarter = starterInput.checked;

  if (valDisplay) valDisplay.innerText = people;

  const starterCost = hasStarter ? 75 : 0;
  const total = people * (price + starterCost);

  if (totalDisplay) totalDisplay.innerText = '₹' + total.toLocaleString('en-IN');
  if (portionText) portionText.innerText = `${people} Individual Boxes (${hasStarter ? 'Biryani + Starter' : 'Biryani Only'})`;
}

function orderPartyWhatsApp() {
  const people = document.getElementById('partyPeople').value;
  const dishSelect = document.getElementById('partyDish');
  const type = dishSelect.options[dishSelect.selectedIndex].text;
  const starter = document.getElementById('partyStarter').checked ? 'Yes' : 'No';
  const total = document.getElementById('partyTotalDisplay').innerText;

  const msg = `Hi AJ Biryani Varadaiahpalem, I would like to reserve a Bulk / Party parcel:%0A• Group Size: ${people} People%0A• Dish: ${type}%0A• Starters Included: ${starter}%0A• Estimated Total: ${total}%0APlease let me know preparation availability!`;
  window.open(`https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// 11. REVIEWS MODAL LOGIC
function openReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.add('hidden');
}

function submitReview(e) {
  e.preventDefault();
  const nameInput = document.getElementById('rev-name');
  const commentInput = document.getElementById('rev-comment');
  const reviewsList = document.getElementById('reviews-list');

  if (!nameInput || !commentInput || !reviewsList) return;

  const name = nameInput.value;
  const comment = commentInput.value;

  const card = document.createElement('div');
  card.className = "bg-brand-darkBg p-6 rounded-2xl border border-amber-500/40";
  card.innerHTML = `
    <div class="flex text-amber-400 text-xs gap-1 mb-3">
      <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
    </div>
    <p class="text-stone-300 text-xs leading-relaxed italic">"${comment}"</p>
    <div class="mt-6 pt-4 border-t border-brand-border flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">${name.substring(0, 2).toUpperCase()}</div>
      <div>
        <div class="text-white text-xs font-bold">${name}</div>
        <div class="text-[10px] text-emerald-400">Verified Customer</div>
      </div>
    </div>
  `;

  reviewsList.prepend(card);
  nameInput.value = '';
  commentInput.value = '';
  closeReviewModal();
  alert("Thank you! Your review has been added.");
}

// 12. BILINGUAL LANGUAGE SWITCHER (EN / TE)
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'te' : 'en';
  const indicator = document.getElementById('lang-indicator');
  if (indicator) indicator.innerText = currentLang === 'en' ? 'తెలుగు' : 'English';

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${currentLang}`);
    if (text) el.innerText = text;
  });
}
