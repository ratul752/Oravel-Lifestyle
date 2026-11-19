/* ========================================
   ORAVEL LIFESTYLE - Data Gathering Events
   Saves useful website actions to the backend database.
   ======================================== */
(function () {
  const endpoint = '/api/track';

  function getUser() {
    try {
      if (window.oravelAuth && typeof window.oravelAuth.getUser === 'function') return window.oravelAuth.getUser() || {};
    } catch (error) {}
    return {};
  }

  function sendEvent(eventType, details = {}) {
    try {
      const user = getUser();
      const payload = {
        eventType,
        page: location.pathname + location.hash,
        label: details.label || '',
        category: details.category || '',
        productId: details.productId || '',
        userId: user.id || '',
        email: user.email || '',
        details
      };
      const body = JSON.stringify(payload);
      window.oravelFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => {});
    } catch (error) {}
  }

  document.addEventListener('click', function (event) {
    const categoryCard = event.target.closest('[data-category], [data-category-link], .category-card, .category-tab-label');
    if (categoryCard) {
      const category = categoryCard.dataset.category || categoryCard.dataset.categoryLink || categoryCard.getAttribute('href') || categoryCard.textContent.trim();
      sendEvent('category_tap', { category, label: categoryCard.textContent.trim().slice(0, 100) });
    }

    const addToCart = event.target.closest('.add-to-cart, [data-add-to-cart], button[onclick*="addItem"]');
    if (addToCart) {
      const productCard = addToCart.closest('[data-product-id], .product-card');
      const productId = addToCart.dataset.productId || productCard?.dataset.productId || '';
      sendEvent('add_to_cart_click', { productId, label: addToCart.textContent.trim().slice(0, 100) });
    }

    const productCard = event.target.closest('.product-card[data-product-id], [data-product-id].product-card');
    if (productCard && !event.target.closest('button')) {
      sendEvent('product_card_open', { productId: productCard.dataset.productId || '', label: productCard.textContent.trim().slice(0, 100) });
    }

    if (event.target.closest('.cart-btn, .cart-icon, [data-cart-open]')) {
      sendEvent('cart_open_click', { label: 'Cart opened' });
    }

    if (event.target.closest('.cart-checkout-btn')) {
      sendEvent('checkout_start_click', { label: 'Proceed to checkout' });
    }
  }, true);

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form || !form.id) return;
    const allowed = ['contact-form', 'newsletter-form', 'login-form', 'signup-form', 'forgot-form', 'shipping-form'];
    if (allowed.includes(form.id)) sendEvent('form_submit', { formId: form.id });
  }, true);

  window.oravelTrackEvent = sendEvent;
  sendEvent('page_view', { title: document.title });
})();
