/* ========================================
   ORAVEL LIFESTYLE - Checkout & Cash on Delivery System
   ======================================== */

class Checkout {
  constructor() {
    this.currentStep = 1;
    this.shippingData = this.getInitialShippingData();
    this.orderMethod = 'cod';
    this.orderSnapshot = null;
  }

  getInitialShippingData() {
    const authUser = window.oravelAuth && typeof window.oravelAuth.getUser === 'function' ? window.oravelAuth.getUser() : null;
    return authUser ? {
      name: authUser.name || '',
      phone: authUser.phone || '',
      email: authUser.email || '',
      division: authUser.division || '',
      city: authUser.city || '',
      address: authUser.address || '',
      postal: authUser.postal || ''
    } : {};
  }

  open() {
    const modal = document.querySelector('.checkout-modal');
    if (!modal) return;
    
    if (window.cart && window.cart.getItemCount() === 0) {
      window.cart.showToast('Your cart is empty', 'error');
      return;
    }

    this.currentStep = 1;
    // Re-sync with the logged-in user each time checkout opens (handles login/profile
    // changes since the page loaded) instead of wiping previously pre-filled data.
    this.shippingData = this.getInitialShippingData();
    this.orderMethod = 'cod';
    this.orderSnapshot = null;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderStep();
  }

  close() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) modal.classList.remove('active');
    const cartOpen = document.querySelector('.cart-sidebar.active');
    const productOpen = document.querySelector('.product-modal.active');
    const ordersOpen = document.querySelector('.orders-modal.active');
    if (!cartOpen && !productOpen && !ordersOpen) {
      document.body.style.overflow = '';
    }
  }

  goToStep(step) {
    this.currentStep = step;
    this.renderStep();
  }

  nextStep() {
    if (this.currentStep === 1 && !this.validateShipping()) return;
    if (this.currentStep === 2 && !this.validateOrderMethod()) return;
    
    if (this.currentStep === 2) {
      this.processOrder();
      return;
    }
    
    this.currentStep++;
    this.renderStep();
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
    }
  }

  renderStep() {
    this.renderStepIndicators();

    const body = document.querySelector('.checkout-body');
    if (!body) return;

    switch (this.currentStep) {
      case 1:
        this.renderShippingForm(body);
        break;
      case 2:
        this.renderOrderMethod(body);
        break;
    }
  }

  renderStepIndicators() {
    const steps = document.querySelectorAll('.checkout-steps .step');
    const lines = document.querySelectorAll('.checkout-steps .step-line');

    steps.forEach((step, i) => {
      const num = i + 1;
      step.classList.remove('active', 'completed');
      if (num === this.currentStep) step.classList.add('active');
      if (num < this.currentStep) step.classList.add('completed');
    });

    lines.forEach((line, i) => {
      line.classList.remove('completed');
      if (i + 1 < this.currentStep) line.classList.add('completed');
    });
  }

  renderShippingForm(container) {
    const data = this.shippingData;
    container.innerHTML = `
      <h3 class="checkout-title">Shipping Information</h3>
      <form id="shipping-form" onsubmit="event.preventDefault(); window.checkout.nextStep();">
        <div class="form-group">
          <label for="ship-name">Full Name *</label>
          <input type="text" id="ship-name" class="form-input" placeholder="Enter your full name" value="${this.escape(data.name)}" required>
          <div class="form-error" id="err-name">Please enter your name</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ship-phone">Phone Number *</label>
            <input type="tel" id="ship-phone" class="form-input" placeholder="01XXXXXXXXX" value="${this.escape(data.phone)}" required>
            <div class="form-error" id="err-phone">Enter valid BD phone (01XXXXXXXXX)</div>
          </div>
          <div class="form-group">
            <label for="ship-email">Email (Optional)</label>
            <input type="email" id="ship-email" class="form-input" placeholder="your@email.com" value="${this.escape(data.email)}">
            <div class="form-error" id="err-email">Enter a valid email address</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ship-division">Division *</label>
            <select id="ship-division" class="form-input form-select" required>
              <option value="">Select Division</option>
              <option ${data.division === 'Dhaka' ? 'selected' : ''}>Dhaka</option>
              <option ${data.division === 'Chattogram' ? 'selected' : ''}>Chattogram</option>
              <option ${data.division === 'Rajshahi' ? 'selected' : ''}>Rajshahi</option>
              <option ${data.division === 'Khulna' ? 'selected' : ''}>Khulna</option>
              <option ${data.division === 'Barishal' ? 'selected' : ''}>Barishal</option>
              <option ${data.division === 'Sylhet' ? 'selected' : ''}>Sylhet</option>
              <option ${data.division === 'Rangpur' ? 'selected' : ''}>Rangpur</option>
              <option ${data.division === 'Mymensingh' ? 'selected' : ''}>Mymensingh</option>
            </select>
            <div class="form-error" id="err-division">Select your division</div>
          </div>
          <div class="form-group">
            <label for="ship-city">City *</label>
            <input type="text" id="ship-city" class="form-input" placeholder="Your city" value="${this.escape(data.city)}" required>
            <div class="form-error" id="err-city">Enter your city</div>
          </div>
        </div>

        <div class="form-group">
          <label for="ship-address">Full Address *</label>
          <textarea id="ship-address" class="form-input" placeholder="House/Road/Area details" required>${this.escape(data.address)}</textarea>
          <div class="form-error" id="err-address">Enter your full address</div>
        </div>

        <div class="form-group">
          <label for="ship-postal">Postal Code</label>
          <input type="text" id="ship-postal" class="form-input" placeholder="Postal code (optional)" value="${this.escape(data.postal)}">
        </div>

        <div class="checkout-nav">
          <button type="button" class="btn btn-secondary" onclick="window.checkout.close()">Cancel</button>
          <button type="submit" class="btn btn-primary">Continue to Order →</button>
        </div>
      </form>
    `;
  }

  validateShipping() {
    let valid = true;
    const name = document.getElementById('ship-name');
    const phone = document.getElementById('ship-phone');
    const division = document.getElementById('ship-division');
    const city = document.getElementById('ship-city');
    const address = document.getElementById('ship-address');
    const email = document.getElementById('ship-email');
    const normalizedPhone = this.normalizeBDPhone(phone.value);

    // Clear errors
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error.visible').forEach(el => el.classList.remove('visible'));

    if (!name.value.trim()) {
      this.showFieldError(name, 'err-name');
      valid = false;
    }
    if (!normalizedPhone) {
      this.showFieldError(phone, 'err-phone');
      valid = false;
    }
    if (email.value.trim() && !this.validateEmail(email.value.trim())) {
      this.showFieldError(email, 'err-email');
      valid = false;
    }
    if (!division.value) {
      this.showFieldError(division, 'err-division');
      valid = false;
    }
    if (!city.value.trim()) {
      this.showFieldError(city, 'err-city');
      valid = false;
    }
    if (!address.value.trim()) {
      this.showFieldError(address, 'err-address');
      valid = false;
    }

    if (valid) {
      this.shippingData = {
        name: name.value.trim(),
        phone: normalizedPhone,
        email: email.value.trim(),
        division: division.value,
        city: city.value.trim(),
        address: address.value.trim(),
        postal: document.getElementById('ship-postal').value.trim()
      };
    }

    return valid;
  }

  renderOrderMethod(container) {
    const cart = window.cart;
    const totalStr = window.formatPrice(cart.getTotal());

    container.innerHTML = `
      <h3 class="checkout-title">Order Method</h3>

      <div class="order-summary-mini">
        <h4>Order Summary</h4>
        ${cart.getItems().map(item => `
          <div class="order-summary-item">
            <span>${this.escape(item.product.name)} × ${item.quantity}</span>
            <span>${window.formatPrice(item.product.price * item.quantity)}</span>
          </div>
        `).join('')}
        <div class="order-summary-item">
          <span>Shipping</span>
          <span>${cart.getShipping() === 0 ? 'Free' : window.formatPrice(cart.getShipping())}</span>
        </div>
        <div class="order-summary-total">
          <span>Total</span>
          <span>${totalStr}</span>
        </div>
      </div>

      <div class="order-methods">
        <div class="order-option selected" data-method="cod">
          <div class="order-option-header">
            <div class="order-method-icon">৳</div>
            <div class="order-option-info">
              <h4>Cash on Delivery</h4>
              <p>Pay the courier when your order arrives</p>
            </div>
          </div>
          <div class="order-method-details">
            Pay the courier when your order arrives. No advance payment is required.
          </div>
        </div>
      </div>

      <div class="checkout-nav">
        <button type="button" class="btn btn-secondary" onclick="window.checkout.prevStep()">← Back</button>
        <button type="button" class="order-submit-btn" onclick="window.checkout.nextStep()">Place Order — ${totalStr}</button>
      </div>
    `;
  }

  validateOrderMethod() {
    this.orderMethod = 'cod';
    return true;
  }

  async processOrder() {
    if (!window.cart || window.cart.getItemCount() === 0) {
      window.cart && window.cart.showToast('Your cart is empty', 'error');
      return;
    }

    if (window.location.protocol === 'file:') {
      window.cart.showToast('Run the website with node server.js before placing an order.', 'error');
      return;
    }

    this.orderSnapshot = {
      total: window.cart.getTotal(),
      itemCount: window.cart.getItemCount(),
      items: window.cart.getItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.setOrderLoading(true);

    try {
      const authToken = window.oravelAuth && typeof window.oravelAuth.getToken === 'function' ? window.oravelAuth.getToken() : '';
      const response = await window.oravelFetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          method: 'cod',
          customer: this.shippingData,
          items: this.orderSnapshot.items
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.redirectUrl) {
        throw new Error(result.message || 'Order could not be placed.');
      }

      localStorage.setItem('oravel_lifestyle_last_order', JSON.stringify({
        orderId: result.orderId,
        trackingId: result.trackingId || result.orderId,
        method: 'cod',
        amount: result.amount,
        createdAt: Date.now()
      }));

      window.location.href = result.redirectUrl;
    } catch (error) {
      console.error('Order creation failed:', error);
      this.setOrderLoading(false);
      window.cart.showToast(error.message || 'Order could not be placed. Try again.', 'error');
    }
  }

  setOrderLoading(isLoading) {
    const buttons = document.querySelectorAll('.order-submit-btn');
    buttons.forEach(button => {
      if (isLoading) {
        if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();
        button.disabled = true;
        button.textContent = 'Placing order...';
      } else {
        button.disabled = false;
        if (button.dataset.originalText) button.textContent = button.dataset.originalText;
      }
    });
  }

  // --- Validation Helpers ---
  validatePhone(phone) {
    return Boolean(this.normalizeBDPhone(phone));
  }

  normalizeBDPhone(phone) {
    let cleaned = String(phone ?? '').replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+88')) cleaned = cleaned.slice(3);
    if (cleaned.startsWith('88')) cleaned = cleaned.slice(2);
    return /^01[3-9]\d{8}$/.test(cleaned) ? cleaned : '';
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());
  }


  showFieldError(inputEl, errorId) {
    if (!inputEl) return;
    inputEl.classList.add('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.classList.add('visible');
  }

  clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('error');
  }


  escape(value) {
    return window.escapeHTML ? window.escapeHTML(value) : String(value ?? '');
  }
}

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
  window.checkout = new Checkout();

  // Bind close button
  const closeBtn = document.querySelector('.checkout-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.checkout.close());
  }

  // Close on overlay click
  const modal = document.querySelector('.checkout-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.checkout.close();
    });
  }
});
