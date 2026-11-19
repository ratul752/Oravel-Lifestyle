/* ========================================
   ORAVEL LIFESTYLE - Account, OTP Verification, Forms & Support
   ======================================== */

class OravelAuth {
  constructor() {
    this.storageKey = 'oravel_lifestyle_user';
    this.tokenKey = 'oravel_lifestyle_auth_token';
    this.user = this.loadUser();
    this.token = localStorage.getItem(this.tokenKey) || '';
    this.signupCodeSent = false;
    this.forgotCodeSent = false;
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateNav();
    this.prefillContact();
  }

  cacheElements() {
    this.modal = document.getElementById('auth-modal');
    this.loginBtn = document.getElementById('login-btn');
    this.signupBtn = document.getElementById('signup-btn');
    this.accountBtn = document.getElementById('account-btn');
    this.accountName = document.getElementById('account-name');
    this.ordersBtn = document.getElementById('orders-btn');
    this.ordersBadge = document.getElementById('orders-badge');
    this.mobileOrdersLink = document.getElementById('mobile-orders-link');
    this.ordersModal = document.getElementById('orders-modal');
    this.ordersClose = document.getElementById('orders-close');
    this.ordersList = document.getElementById('orders-list');
    this.ordersStatus = document.getElementById('orders-status');
    this.ordersRefreshBtn = document.getElementById('orders-refresh-btn');
    this.closeBtn = document.getElementById('auth-close');
    this.loginForm = document.getElementById('login-form');
    this.signupForm = document.getElementById('signup-form');
    this.forgotForm = document.getElementById('forgot-form');
    this.profilePanel = document.getElementById('auth-profile');
    this.logoutBtn = document.getElementById('logout-btn');
    this.profileName = document.getElementById('profile-name');
    this.profileEmail = document.getElementById('profile-email');
    this.profileOrders = document.getElementById('profile-orders');
    this.profileOrdersStatus = document.getElementById('profile-orders-status');
    this.refreshOrdersBtn = document.getElementById('refresh-orders-btn');
    this.forgotLink = document.getElementById('forgot-password-link');
    this.backToLoginLink = document.getElementById('back-to-login-link');
    this.signupSendCodeBtn = document.getElementById('signup-send-code-btn');
    this.forgotSendCodeBtn = document.getElementById('forgot-send-code-btn');
    this.signupCodeStatus = document.getElementById('signup-code-status');
    this.forgotCodeStatus = document.getElementById('forgot-code-status');
    this.signupCodeGroup = document.getElementById('signup-code-group');
  }

  bindEvents() {
    this.loginBtn?.addEventListener('click', () => this.open('login'));
    this.signupBtn?.addEventListener('click', () => this.open('signup'));
    this.accountBtn?.addEventListener('click', () => this.open('profile'));
    this.ordersBtn?.addEventListener('click', () => this.openOrders());
    this.mobileOrdersLink?.addEventListener('click', (event) => {
      event.preventDefault();
      this.openOrders();
    });
    this.ordersClose?.addEventListener('click', () => this.closeOrders());
    this.ordersRefreshBtn?.addEventListener('click', () => this.loadOrdersPanel());
    this.ordersModal?.addEventListener('click', (event) => {
      if (event.target === this.ordersModal) this.closeOrders();
    });
    this.closeBtn?.addEventListener('click', () => this.close());
    this.logoutBtn?.addEventListener('click', () => this.logout());
    this.refreshOrdersBtn?.addEventListener('click', () => this.loadMyOrders());
    this.forgotLink?.addEventListener('click', () => this.setTab('forgot'));
    this.backToLoginLink?.addEventListener('click', () => this.setTab('login'));
    this.signupSendCodeBtn?.addEventListener('click', () => this.requestSignupCode());
    this.forgotSendCodeBtn?.addEventListener('click', () => this.requestPasswordResetCode());

    this.modal?.addEventListener('click', (event) => {
      if (event.target === this.modal) this.close();
    });

    document.querySelectorAll('[data-auth-open]').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const requestedMode = link.dataset.authOpen || 'login';
        this.open(this.user && requestedMode === 'login' ? 'profile' : requestedMode);
      });
    });

    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => this.setTab(tab.dataset.authTab));
    });

    this.loginForm?.addEventListener('submit', (event) => this.handleLogin(event));
    this.signupForm?.addEventListener('submit', (event) => this.handleSignupVerify(event));
    this.forgotForm?.addEventListener('submit', (event) => this.handlePasswordReset(event));

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (this.ordersModal?.classList.contains('active')) this.closeOrders();
      else if (this.modal?.classList.contains('active')) this.close();
    });

    document.addEventListener('click', (event) => {
      const copyButton = event.target.closest('[data-copy-value]');
      if (!copyButton) return;
      this.copyToClipboard(copyButton.dataset.copyValue || '');
    });

    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm?.addEventListener('submit', (event) => this.handleNewsletter(event));

    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', (event) => this.handleContact(event));

    const trackForm = document.getElementById('track-form');
    trackForm?.addEventListener('submit', (event) => this.handleTrackOrder(event));

    ['signup-name', 'signup-phone', 'signup-email', 'signup-password', 'signup-verify-channel'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.resetSignupCodeState());
      document.getElementById(id)?.addEventListener('change', () => this.resetSignupCodeState());
    });
  }

  open(mode = 'login') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (mode === 'profile' && this.user) {
      this.showProfile();
    } else {
      this.setTab(mode === 'signup' ? 'signup' : mode === 'forgot' ? 'forgot' : 'login');
    }
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');

    const cartOpen = document.querySelector('.cart-sidebar.active');
    const checkoutOpen = document.querySelector('.checkout-modal.active');
    const productOpen = document.querySelector('.product-modal.active');
    const ordersOpen = document.querySelector('.orders-modal.active');
    if (!cartOpen && !checkoutOpen && !productOpen && !ordersOpen) document.body.style.overflow = '';
  }

  setTab(tabName) {
    const target = ['login', 'signup', 'forgot'].includes(tabName) ? tabName : 'login';
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authTab === target));
    this.loginForm?.classList.toggle('active', target === 'login');
    this.signupForm?.classList.toggle('active', target === 'signup');
    this.forgotForm?.classList.toggle('active', target === 'forgot');
    if (this.profilePanel) this.profilePanel.style.display = 'none';
  }

  showProfile() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    this.loginForm?.classList.remove('active');
    this.signupForm?.classList.remove('active');
    this.forgotForm?.classList.remove('active');
    if (this.profilePanel) this.profilePanel.style.display = 'block';
    if (this.profileName) this.profileName.textContent = this.user?.name || 'Customer';
    if (this.profileEmail) this.profileEmail.textContent = this.user?.email || '';
    this.loadMyOrders();
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) return this.toast('Email and password are required.', 'error');

    const submit = this.loginForm.querySelector('.auth-submit');
    this.setButtonLoading(submit, true, 'Logging in...');

    try {
      const result = await this.postJson('/api/auth/login', { email, password });
      if (!result.success) throw new Error(result.message || 'Login failed');
      this.setUser(result.user, result.token);
      this.loginForm.reset();
      this.close();
      this.toast('Logged in successfully.', 'success');
    } catch (error) {
      this.toast(error.message || 'Login failed. Run the site with node server.js.', 'error');
    } finally {
      this.setButtonLoading(submit, false);
    }
  }

  collectSignupPayload() {
    return {
      name: document.getElementById('signup-name')?.value.trim(),
      phone: this.normalizeBDPhone(document.getElementById('signup-phone')?.value),
      email: document.getElementById('signup-email')?.value.trim(),
      password: document.getElementById('signup-password')?.value,
      channel: document.getElementById('signup-verify-channel')?.value || 'email'
    };
  }

  validateSignupPayload(payload) {
    if (!payload.name) return 'Full name is required.';
    if (!payload.phone) return 'Enter a valid Bangladesh phone number.';
    if (!this.validateEmail(payload.email)) return 'Enter a valid email address.';
    if (!payload.password || payload.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  async requestSignupCode() {
    const payload = this.collectSignupPayload();
    const error = this.validateSignupPayload(payload);
    if (error) return this.toast(error, 'error');

    this.setButtonLoading(this.signupSendCodeBtn, true, 'Sending...');
    this.setStatus(this.signupCodeStatus, 'Sending verification code...', '');

    try {
      const result = await this.postJson('/api/auth/signup/request-code', payload);
      if (!result.success) throw new Error(result.message || 'Could not send code');
      this.signupCodeSent = true;
      this.signupCodeGroup?.classList.remove('hidden');
      this.setStatus(this.signupCodeStatus, `${result.message} Destination: ${result.destination}.`, 'success');
      document.getElementById('signup-code')?.focus();
    } catch (error) {
      this.setStatus(this.signupCodeStatus, error.message || 'Code could not be sent.', 'error');
      this.toast(error.message || 'Code could not be sent.', 'error');
    } finally {
      this.setButtonLoading(this.signupSendCodeBtn, false);
    }
  }

  async handleSignupVerify(event) {
    event.preventDefault();
    const payload = this.collectSignupPayload();
    const error = this.validateSignupPayload(payload);
    const code = document.getElementById('signup-code')?.value.trim();

    if (error) return this.toast(error, 'error');
    if (!this.signupCodeSent) return this.toast('Send the verification code first.', 'error');
    if (!/^\d{6}$/.test(code || '')) return this.toast('Enter the 6 digit verification code.', 'error');

    const submit = this.signupForm.querySelector('.auth-submit');
    this.setButtonLoading(submit, true, 'Verifying...');

    try {
      const result = await this.postJson('/api/auth/signup/verify', {
        email: payload.email,
        phone: payload.phone,
        code
      });
      if (!result.success) throw new Error(result.message || 'Signup verification failed');
      this.setUser(result.user, result.token);
      this.signupForm.reset();
      this.resetSignupCodeState();
      this.close();
      this.toast('Account verified and created successfully.', 'success');
    } catch (error) {
      this.toast(error.message || 'Signup failed.', 'error');
    } finally {
      this.setButtonLoading(submit, false);
    }
  }

  resetSignupCodeState() {
    this.signupCodeSent = false;
    this.signupCodeGroup?.classList.add('hidden');
    const code = document.getElementById('signup-code');
    if (code) code.value = '';
    this.setStatus(this.signupCodeStatus, 'Enter your details, send a code, then verify to create your account.', '');
  }

  async requestPasswordResetCode() {
    const identifier = document.getElementById('forgot-identifier')?.value.trim();
    const channel = document.getElementById('forgot-channel')?.value || 'email';
    if (!identifier) return this.toast('Enter your email or phone.', 'error');

    this.setButtonLoading(this.forgotSendCodeBtn, true, 'Sending...');
    this.setStatus(this.forgotCodeStatus, 'Sending reset code...', '');

    try {
      const result = await this.postJson('/api/auth/password/request-reset', { identifier, channel });
      if (!result.success) throw new Error(result.message || 'Could not send reset code');
      this.forgotCodeSent = true;
      this.setStatus(this.forgotCodeStatus, `${result.message} Destination: ${result.destination}.`, 'success');
      document.getElementById('forgot-code')?.focus();
    } catch (error) {
      this.setStatus(this.forgotCodeStatus, error.message || 'Reset code could not be sent.', 'error');
      this.toast(error.message || 'Reset code could not be sent.', 'error');
    } finally {
      this.setButtonLoading(this.forgotSendCodeBtn, false);
    }
  }

  async handlePasswordReset(event) {
    event.preventDefault();
    const identifier = document.getElementById('forgot-identifier')?.value.trim();
    const code = document.getElementById('forgot-code')?.value.trim();
    const newPassword = document.getElementById('forgot-new-password')?.value;

    if (!identifier) return this.toast('Enter your email or phone.', 'error');
    if (!this.forgotCodeSent) return this.toast('Send the reset code first.', 'error');
    if (!/^\d{6}$/.test(code || '')) return this.toast('Enter the 6 digit reset code.', 'error');
    if (!newPassword || newPassword.length < 6) return this.toast('New password must be at least 6 characters.', 'error');

    const submit = this.forgotForm.querySelector('.auth-submit');
    this.setButtonLoading(submit, true, 'Resetting...');

    try {
      const result = await this.postJson('/api/auth/password/reset', { identifier, code, newPassword });
      if (!result.success) throw new Error(result.message || 'Password reset failed');
      this.forgotForm.reset();
      this.forgotCodeSent = false;
      this.setStatus(this.forgotCodeStatus, 'Request a reset code first.', '');
      this.setTab('login');
      this.toast('Password changed successfully. Login with your new password.', 'success');
    } catch (error) {
      this.toast(error.message || 'Password reset failed.', 'error');
    } finally {
      this.setButtonLoading(submit, false);
    }
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    this.user = null;
    this.token = '';
    this.updateNav();
    this.close();
    this.toast('Logged out successfully.', 'success');
  }

  setUser(user, token = '') {
    this.user = user;
    this.token = token || this.token || '';
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    if (this.token) localStorage.setItem(this.tokenKey, this.token);
    this.updateNav();
    this.prefillContact();
  }

  loadUser() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || 'null');
    } catch {
      return null;
    }
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token || localStorage.getItem(this.tokenKey) || '';
  }

  updateNav() {
    const isLoggedIn = Boolean(this.user);
    if (this.loginBtn) this.loginBtn.style.display = isLoggedIn ? 'none' : '';
    if (this.signupBtn) this.signupBtn.style.display = isLoggedIn ? 'none' : '';
    if (this.accountBtn) this.accountBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (this.ordersBtn) this.ordersBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (this.mobileOrdersLink) this.mobileOrdersLink.style.display = isLoggedIn ? '' : 'none';
    if (this.accountName) this.accountName.textContent = this.user?.name?.split(' ')[0] || 'Account';

    if (!isLoggedIn && this.ordersBadge) {
      this.ordersBadge.textContent = '0';
      this.ordersBadge.style.display = 'none';
    }

    document.querySelectorAll('[data-auth-open="login"]').forEach(link => {
      link.textContent = isLoggedIn ? 'My Account' : 'Login';
    });
    document.querySelectorAll('[data-auth-open="signup"]').forEach(link => {
      link.style.display = isLoggedIn ? 'none' : '';
    });

    if (isLoggedIn) this.updateOrdersBadge();
  }

  async handleNewsletter(event) {
    event.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput?.value.trim();
    if (!this.validateEmail(email)) return this.toast('Enter a valid email address.', 'error');

    try {
      const result = await this.postJson('/api/newsletter', { email });
      if (!result.success) throw new Error(result.message || 'Subscription failed');
      event.target.reset();
      this.toast('Subscribed successfully.', 'success');
    } catch (error) {
      this.toast(error.message || 'Subscription failed.', 'error');
    }
  }

  async handleContact(event) {
    event.preventDefault();
    const payload = {
      name: document.getElementById('contact-name')?.value.trim(),
      phone: this.normalizeBDPhone(document.getElementById('contact-phone')?.value),
      email: document.getElementById('contact-email')?.value.trim(),
      topic: document.getElementById('contact-topic')?.value,
      message: document.getElementById('contact-message')?.value.trim()
    };

    if (!payload.name || !payload.phone || !payload.topic || !payload.message) {
      return this.toast('Please fill all required contact fields.', 'error');
    }
    if (payload.email && !this.validateEmail(payload.email)) {
      return this.toast('Enter a valid email address.', 'error');
    }

    const submit = event.target.querySelector('button[type="submit"]');
    this.setButtonLoading(submit, true, 'Sending...');

    try {
      const result = await this.postJson('/api/contact', payload);
      if (!result.success) throw new Error(result.message || 'Message failed');
      event.target.reset();
      this.prefillContact();
      this.toast('Message sent successfully.', 'success');
    } catch (error) {
      this.toast(error.message || 'Message could not be sent.', 'error');
    } finally {
      this.setButtonLoading(submit, false);
    }
  }

  async openOrders() {
    if (!this.user) {
      this.open('login');
      this.toast('Login to view your orders.', 'info');
      return;
    }
    if (!this.ordersModal) return;
    this.ordersModal.classList.add('active');
    this.ordersModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    await this.loadOrdersPanel();
  }

  closeOrders() {
    if (!this.ordersModal) return;
    this.ordersModal.classList.remove('active');
    this.ordersModal.setAttribute('aria-hidden', 'true');
    const cartOpen = document.querySelector('.cart-sidebar.active');
    const checkoutOpen = document.querySelector('.checkout-modal.active');
    const productOpen = document.querySelector('.product-modal.active');
    const authOpen = document.querySelector('.auth-modal.active');
    if (!cartOpen && !checkoutOpen && !productOpen && !authOpen) document.body.style.overflow = '';
  }

  async fetchAccountOrders() {
    if (!this.user) throw new Error('Login to view your orders.');
    const token = this.getToken();
    if (!token) throw new Error('Please login again to activate My Orders.');

    const response = await window.oravelFetch('/api/account/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.tokenKey);
      this.user = null;
      this.token = '';
      this.updateNav();
      throw new Error('Your login session expired. Please login again.');
    }
    if (!response.ok || !result.success) throw new Error(result.message || 'Could not load your orders');
    return Array.isArray(result.orders) ? result.orders : [];
  }

  async loadOrdersPanel() {
    if (!this.ordersList) return;
    if (this.ordersStatus) this.ordersStatus.textContent = 'Loading your orders...';
    this.ordersList.innerHTML = '<div class="order-loading">Loading your saved orders...</div>';
    this.setButtonLoading(this.ordersRefreshBtn, true, 'Refreshing...');

    try {
      const orders = await this.fetchAccountOrders();
      if (this.ordersStatus) {
        this.ordersStatus.textContent = orders.length
          ? `${orders.length} saved order${orders.length === 1 ? '' : 's'} in your account`
          : 'No orders found in this account';
      }
      this.setOrdersBadge(orders.length);
      this.ordersList.innerHTML = orders.length
        ? orders.map(order => this.renderOrderDetails(order, { includeAddress: true, compact: false })).join('')
        : '<div class="order-empty-state">No orders yet. Orders placed while logged in, or orders matching your verified email/phone, will appear here automatically. No Order ID is required.</div>';
    } catch (error) {
      if (this.ordersStatus) this.ordersStatus.textContent = '';
      this.ordersList.innerHTML = `<div class="order-empty-state">${this.escape(error.message || 'Could not load your orders')}</div>`;
    } finally {
      this.setButtonLoading(this.ordersRefreshBtn, false);
    }
  }

  async updateOrdersBadge() {
    if (!this.user || !this.getToken()) {
      this.setOrdersBadge(0);
      return;
    }
    try {
      const orders = await this.fetchAccountOrders();
      this.setOrdersBadge(orders.length);
    } catch {
      this.setOrdersBadge(0);
    }
  }

  setOrdersBadge(count) {
    if (!this.ordersBadge) return;
    const value = Math.max(0, Number(count) || 0);
    this.ordersBadge.textContent = String(value);
    this.ordersBadge.style.display = value > 0 ? 'inline-flex' : 'none';
  }

  async handleTrackOrder(event) {
    event.preventDefault();
    const input = document.getElementById('track-order-id');
    const resultBox = document.getElementById('track-result');
    const orderRef = input?.value.trim();
    if (!orderRef || !resultBox) return;

    resultBox.classList.add('active');
    resultBox.innerHTML = '<div class="order-loading">Checking order...</div>';

    try {
      const response = await window.oravelFetch(`/api/orders/${encodeURIComponent(orderRef)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'Order not found');
      resultBox.innerHTML = this.renderOrderDetails(result.order, { includeAddress: false, compact: false });
    } catch (error) {
      resultBox.innerHTML = `<div class="order-empty-state">${this.escape(error.message || 'Order not found')}. Check the Order ID or Tracking ID and try again.</div>`;
    }
  }

  async loadMyOrders() {
    if (!this.profileOrders) return;
    if (!this.user) {
      this.profileOrders.innerHTML = '<div class="order-empty-state">Login to view your order history.</div>';
      return;
    }

    if (this.profileOrdersStatus) this.profileOrdersStatus.textContent = 'Loading your orders...';
    this.profileOrders.innerHTML = '';
    this.setButtonLoading(this.refreshOrdersBtn, true, 'Refreshing...');

    try {
      const orders = await this.fetchAccountOrders();
      this.setOrdersBadge(orders.length);
      if (this.profileOrdersStatus) {
        this.profileOrdersStatus.textContent = orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} found` : 'No orders yet';
      }
      this.profileOrders.innerHTML = orders.length
        ? orders.map(order => this.renderOrderDetails(order, { includeAddress: true, compact: true })).join('')
        : '<div class="order-empty-state">You have not placed any orders yet.</div>';
    } catch (error) {
      if (this.profileOrdersStatus) this.profileOrdersStatus.textContent = '';
      this.profileOrders.innerHTML = `<div class="order-empty-state">${this.escape(error.message || 'Could not load your orders')}</div>`;
    } finally {
      this.setButtonLoading(this.refreshOrdersBtn, false);
    }
  }

  renderOrderDetails(order, options = {}) {
    const includeAddress = Boolean(options.includeAddress);
    const compact = Boolean(options.compact);
    const items = Array.isArray(order.items) ? order.items : [];
    const payment = order.payment || {};
    const created = order.createdAt ? new Date(order.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    const statusClass = String(order.status || 'confirmed').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const trackingProgress = this.renderTrackingProgress(order.status || 'confirmed');

    const itemHtml = items.map(item => `
      <div class="customer-order-item">
        ${item.image ? `<img src="${this.escape(item.image)}" alt="${this.escape(item.name)}" loading="lazy">` : '<div class="customer-order-image-placeholder">🛍️</div>'}
        <div class="customer-order-item-info">
          <strong>${this.escape(item.name || 'Product')}</strong>
          <span>${Number(item.quantity || 0)} × ৳${Number(item.price || 0).toLocaleString('en-BD')}</span>
        </div>
        <strong>৳${Number(item.lineTotal || 0).toLocaleString('en-BD')}</strong>
      </div>
    `).join('');

    const address = order.customer || {};
    const addressHtml = includeAddress && (address.address || address.city || address.division) ? `
      <div class="customer-order-address">
        <strong>Delivery Address</strong>
        <span>${this.escape([address.address, address.city, address.division, address.postal].filter(Boolean).join(', '))}</span>
      </div>
    ` : '';

    return `
      <article class="customer-order-card ${compact ? 'compact' : ''}">
        <div class="customer-order-head">
          <div>
            <span class="customer-order-label">Order ID</span>
            <div class="customer-order-id-row">
              <strong class="customer-order-id">${this.escape(order.id || '—')}</strong>
              <button type="button" class="order-copy-btn" data-copy-value="${this.escape(order.id || '')}" title="Copy Order ID">Copy</button>
            </div>
          </div>
          <span class="customer-order-status status-${statusClass}">${this.escape(order.statusLabel || order.status || 'Confirmed')}</span>
        </div>
        <div class="customer-order-meta">
          <div><span>Tracking ID</span><div class="customer-order-id-row"><strong>${this.escape(order.trackingId || order.id || '—')}</strong><button type="button" class="order-copy-btn" data-copy-value="${this.escape(order.trackingId || order.id || '')}" title="Copy Tracking ID">Copy</button></div></div>
          <div><span>Placed</span><strong>${this.escape(created)}</strong></div>
        </div>
        ${trackingProgress}
        <div class="customer-order-items">${itemHtml || '<div class="order-empty-state">Product details unavailable for this older order.</div>'}</div>
        <div class="customer-order-totals">
          <div><span>Subtotal</span><strong>৳${Number(order.subtotal || 0).toLocaleString('en-BD')}</strong></div>
          <div><span>Shipping</span><strong>${Number(order.shipping || 0) === 0 ? 'Free' : `৳${Number(order.shipping || 0).toLocaleString('en-BD')}`}</strong></div>
          <div class="grand-total"><span>Total</span><strong>৳${Number(order.amount || 0).toLocaleString('en-BD')}</strong></div>
        </div>
        <div class="customer-order-payment">
          <div><span>Payment Method</span><strong>${this.escape(payment.methodLabel || order.methodLabel || 'Cash on Delivery')}</strong></div>
          <div><span>Payment Status</span><strong>${this.escape(payment.statusLabel || 'Due on Delivery')}</strong></div>
          <div><span>Amount Due</span><strong>৳${Number(payment.dueAmount ?? order.amount ?? 0).toLocaleString('en-BD')}</strong></div>
        </div>
        ${addressHtml}
      </article>
    `;
  }

  renderTrackingProgress(status) {
    const current = String(status || 'confirmed').toLowerCase();
    if (['cancelled', 'returned'].includes(current)) {
      return `<div class="order-track-alert">${current === 'cancelled' ? 'This order was cancelled.' : 'This order was returned.'}</div>`;
    }
    const stages = [
      ['confirmed', 'Confirmed'],
      ['processing', 'Processing'],
      ['shipped', 'Shipped'],
      ['out_for_delivery', 'Out for Delivery'],
      ['delivered', 'Delivered']
    ];
    const normalized = current === 'packed' ? 'processing' : current === 'created' || current === 'pending' ? 'confirmed' : current;
    let activeIndex = stages.findIndex(([value]) => value === normalized);
    if (activeIndex < 0) activeIndex = 0;
    return `<div class="order-track-progress">${stages.map(([value, label], index) => `
      <div class="order-track-step ${index <= activeIndex ? 'active' : ''} ${index < activeIndex ? 'completed' : ''}">
        <span class="order-track-dot">${index < activeIndex ? '✓' : index + 1}</span>
        <span>${label}</span>
      </div>`).join('')}</div>`;
  }

  prefillContact() {
    if (!this.user) return;
    const name = document.getElementById('contact-name');
    const phone = document.getElementById('contact-phone');
    const email = document.getElementById('contact-email');
    if (name && !name.value) name.value = this.user.name || '';
    if (phone && !phone.value) phone.value = this.user.phone || '';
    if (email && !email.value) email.value = this.user.email || '';
  }

  async postJson(url, data) {
    const response = await window.oravelFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Server request failed');
    return result;
  }

  setButtonLoading(button, isLoading, text) {
    if (!button) return;
    if (isLoading) {
      if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();
      button.disabled = true;
      button.textContent = text || 'Please wait...';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
      delete button.dataset.originalText;
    }
  }

  setStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('success', 'error');
    if (type) element.classList.add(type);
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  normalizeBDPhone(phone) {
    let cleaned = String(phone || '').replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+88')) cleaned = cleaned.slice(3);
    if (cleaned.startsWith('88')) cleaned = cleaned.slice(2);
    return /^01[3-9]\d{8}$/.test(cleaned) ? cleaned : '';
  }

  async copyToClipboard(value) {
    const text = String(value || '').trim();
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      this.toast('Copied successfully.', 'success');
    } catch {
      this.toast('Could not copy automatically. Select the ID and copy it manually.', 'error');
    }
  }

  escape(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[char]));
  }

  toast(message, type = 'info') {
    if (window.cart && typeof window.cart.showToast === 'function') {
      window.cart.showToast(message, type);
    } else {
      alert(message);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.oravelAuth = new OravelAuth();
  window.oravelAuth.init();
});
