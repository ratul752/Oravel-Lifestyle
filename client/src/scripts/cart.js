/* ========================================
   ORAVEL LIFESTYLE - Shopping Cart
   ======================================== */

class Cart {
  constructor() {
    this.items = [];
    this.maxQuantity = 99;
    this.storageKey = 'oravel_lifestyle_cart';
    this.legacyStorageKeys = [
      'oravellifestyle_cart',
      ['c', 'u', 'r', 'i', 'o', 'c', 'a', 'r', 't', '_', 'c', 'a', 'r', 't'].join('')
    ];
    this.handleCartItemsClick = this.handleCartItemsClick.bind(this);
    this.load();
    this.updateCartBadge();
    this.bindCartItemEvents();
  }

  addItem(productId) {
    const product = window.getProductById(productId);
    if (!product || !product.inStock) return;

    const existing = this.items.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= this.maxQuantity) {
        this.showToast(`Maximum ${this.maxQuantity} items allowed for this product`, 'error');
        return;
      }
      existing.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }

    this.save();
    this.updateCartBadge();
    this.renderCart();
    this.showToast(`${product.name} added to cart`, 'success');
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.save();
    this.updateCartBadge();
    this.renderCart();
  }

  updateQuantity(productId, change) {
    const id = Number(productId);
    const item = this.items.find(item => item.product.id === id);
    if (!item) return;

    item.quantity += Number(change) || 0;
    if (item.quantity <= 0) {
      this.removeItem(id);
      return;
    }
    if (item.quantity > this.maxQuantity) {
      item.quantity = this.maxQuantity;
      this.showToast(`Maximum ${this.maxQuantity} items allowed for this product`, 'error');
    }

    this.save();
    this.updateCartBadge();
    this.renderCart();
  }

  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getShipping() {
    if (this.items.length === 0) return 0;
    return this.getSubtotal() >= 5000 ? 0 : 120;
  }

  getTotal() {
    return this.getSubtotal() + this.getShipping();
  }

  clear() {
    this.items = [];
    try { this.legacyStorageKeys.forEach(key => localStorage.removeItem(key)); } catch (e) {}
    this.save();
    this.updateCartBadge();
    this.renderCart();
  }

  save() {
    try {
      const data = this.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.legacyStorageKeys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Unable to save cart:', e);
    }
  }

  load() {
    try {
      const currentData = localStorage.getItem(this.storageKey);
      const legacyData = !currentData
        ? this.legacyStorageKeys.map(key => localStorage.getItem(key)).find(Boolean)
        : null;
      const data = JSON.parse(currentData || legacyData || '[]');
      if (data && Array.isArray(data)) {
        this.items = data
          .map(item => {
            const product = window.getProductById(item.productId);
            const quantity = Math.max(1, Math.min(this.maxQuantity, parseInt(item.quantity, 10) || 1));
            return product && product.inStock ? { product, quantity } : null;
          })
          .filter(Boolean);
        if (legacyData) this.save();
      }
    } catch (e) {
      this.items = [];
    }
  }

  updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;

    const count = this.getItemCount();
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('active');
    } else {
      badge.classList.remove('active');
    }

    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.textContent = `(${count} ${count === 1 ? 'item' : 'items'})`;
  }

  bindCartItemEvents() {
    const cartItemsEl = document.querySelector('.cart-items');
    if (!cartItemsEl || cartItemsEl.dataset.cartEventsBound === 'true') return;
    cartItemsEl.addEventListener('click', this.handleCartItemsClick);
    cartItemsEl.dataset.cartEventsBound = 'true';
  }

  handleCartItemsClick(e) {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!Number.isInteger(id)) return;

    if (btn.classList.contains('qty-minus')) {
      this.updateQuantity(id, -1);
    } else if (btn.classList.contains('qty-plus')) {
      this.updateQuantity(id, 1);
    } else if (btn.classList.contains('cart-item-remove')) {
      this.removeItem(id);
    }
  }

  renderCart() {
    const cartItemsEl = document.querySelector('.cart-items');
    const cartSummaryEl = document.querySelector('.cart-summary');
    if (!cartItemsEl) return;

    if (this.items.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <button class="btn btn-secondary btn-sm" type="button" onclick="window.cart && window.cart.closeCart()">Continue Shopping</button>
        </div>
      `;
      if (cartSummaryEl) cartSummaryEl.style.display = 'none';
      this.updateCartBadge();
      this.bindCartItemEvents();
      return;
    }

    if (cartSummaryEl) cartSummaryEl.style.display = 'block';

    cartItemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.product.id}">
        <div class="cart-item-image">
          ${item.product.image
            ? `<img src="${window.escapeHTML(item.product.image)}" alt="${window.escapeHTML(item.product.name)}">`
            : `<div class="coming-soon-placeholder" style="height:100%"><span>🔜</span></div>`
          }
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${window.escapeHTML(item.product.name)}</div>
          <div class="cart-item-category">${window.escapeHTML(item.product.category)}</div>
          <div class="cart-item-bottom">
            <div class="quantity-controls">
              <button class="qty-btn qty-minus" type="button" data-id="${item.product.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-count">${item.quantity}</span>
              <button class="qty-btn qty-plus" type="button" data-id="${item.product.id}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">${window.formatPrice(item.product.price * item.quantity)}</span>
          </div>
        </div>
        <button class="cart-item-remove" type="button" data-id="${item.product.id}" title="Remove" aria-label="Remove ${window.escapeHTML(item.product.name)}">✕</button>
      </div>
    `).join('');

    // Update summary
    if (cartSummaryEl) {
      const subtotal = this.getSubtotal();
      const shipping = this.getShipping();
      const total = this.getTotal();

      cartSummaryEl.innerHTML = `
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span>${window.formatPrice(subtotal)}</span>
        </div>
        <div class="cart-summary-row">
          <span>Shipping</span>
          <span class="${shipping === 0 ? 'free-shipping' : ''}">${shipping === 0 ? 'Free' : window.formatPrice(shipping)}</span>
        </div>
        <div class="cart-summary-row total">
          <span>Total</span>
          <span>${window.formatPrice(total)}</span>
        </div>
        <button class="cart-checkout-btn" type="button" onclick="window.cart.closeCart(); window.checkout && window.checkout.open();">
          Proceed to Checkout →
        </button>
      `;
    }

    this.updateCartBadge();
    this.bindCartItemEvents();
  }

  toggleCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('active');
    if (isOpen) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  openCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderCart();
  }

  closeCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    const productOpen = document.querySelector('.product-modal.active');
    const checkoutOpen = document.querySelector('.checkout-modal.active');
    const ordersOpen = document.querySelector('.orders-modal.active');
    if (!productOpen && !checkoutOpen && !ordersOpen) {
      document.body.style.overflow = '';
    }
  }

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = icons[type] || icons.info;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(icon, text);

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize and bind events after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();

  // Bind cart icon
  const cartIcon = document.querySelector('.nav-cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => window.cart.toggleCart());
  }

  // Bind overlay close
  const overlay = document.querySelector('.cart-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => window.cart.closeCart());
  }

  // Bind close button
  const closeBtn = document.querySelector('.cart-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.cart.closeCart());
  }
});
