// script.js — Robust cart with localStorage, delegation and safe DOM handling
document.addEventListener('DOMContentLoaded', () => {
  // Elements (may be null on pages without sidebar)
  const cartIcon = document.querySelector('.cart');
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('close-cart');
  const cartItemsList = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // ---------- Helpers ----------
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function formatKsh(n) {
    // Format number with commas and 2 decimals removed if integer: "1,199" or "1,199.50"
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function parsePriceText(priceText) {
    if (!priceText) return 0;
    // Remove commas and non-numeric except decimal point
    const cleaned = priceText.replace(/,/g, '').replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  // ---------- Render / Update ----------
  function renderCart() {
    if (!cartItemsList || !cartCountEl || !cartTotalEl) return;

    cartItemsList.innerHTML = '';
    let total = 0;

    cart.forEach((item, idx) => {
      total += item.price * (item.quantity || 1);

      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.index = idx;
      li.innerHTML = `
        <div class="ci-left">
          <div class="ci-name">${escapeHtml(item.name)} x${item.quantity || 1}</div>
        </div>
        <div class="ci-right">
          <div class="ci-price">Ksh ${formatKsh(item.price)}</div>
          <button class="remove-item" data-index="${idx}" aria-label="Remove item">✖</button>
        </div>
      `;
      cartItemsList.appendChild(li);
    });

    cartCountEl.textContent = cart.reduce((acc, it) => acc + (it.quantity || 1), 0);
    cartTotalEl.textContent = formatKsh(total);
    saveCart();
  }

  // Simple HTML escape for product names
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  // ---------- Cart Operations ----------
  function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ name, price: Number(price), quantity: 1 });
    }
    renderCart();
    showToast(`${name} added to cart`);
  }

  function removeFromCart(index) {
    index = Number(index);
    if (Number.isInteger(index) && index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      renderCart();
      showToast('Item removed');
    }
  }

  // ---------- Toast ----------
  function showToast(message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    document.body.appendChild(t);
    // trigger CSS transition
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 1400);
  }

  // ---------- Sidebar open/close ----------
  if (cartIcon && sidebar && overlay) {
    cartIcon.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('show');
    });

    if (closeBtn) closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // ---------- Event Delegation for Add buttons & Remove buttons ----------
  // Add-to-cart: use delegated listener so it works even if buttons are added later
  document.body.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      const card = addBtn.closest('.product-card');
      if (!card) return;
      const nameEl = card.querySelector('h3');
      const priceEl = card.querySelector('.price');
      const name = nameEl ? nameEl.textContent.trim() : 'Product';
      const priceRaw = priceEl ? priceEl.textContent.trim() : '0';
      const price = parsePriceText(priceRaw);

      // temporary button feedback (green for 1s)
      const prevText = addBtn.textContent;
      const prevBg = addBtn.style.background;
      addBtn.textContent = 'Added!';
      addBtn.style.background = '#28a745';
      setTimeout(() => {
        addBtn.textContent = prevText;
        addBtn.style.background = prevBg || '';
      }, 1000);

      addToCart(name, price);
      return; // stop further handling for this click
    }

    // Remove from cart (delegated)
    const rem = e.target.closest('.remove-item');
    if (rem) {
      const idx = rem.dataset.index;
      removeFromCart(idx);
    }
  });

  // ---------- Initialize render ----------
  renderCart();
});
