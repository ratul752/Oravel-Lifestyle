
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    const money = value => `৳${Number(value || 0).toLocaleString('en-BD')}`;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId') || '';
    const box = document.getElementById('order-success-details');

    function renderOrder(order) {
      const payment = order.payment || {};
      const items = Array.isArray(order.items) ? order.items : [];
      const itemHtml = items.map(item => `
        <div class="customer-order-item">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : '<div class="customer-order-image-placeholder">🛍️</div>'}
          <div class="customer-order-item-info"><strong>${escapeHtml(item.name)}</strong><span>${Number(item.quantity || 0)} × ${money(item.price)}</span></div>
          <strong>${money(item.lineTotal)}</strong>
        </div>`).join('');
      const stages = [['confirmed','Confirmed'],['processing','Processing'],['shipped','Shipped'],['out_for_delivery','Out for Delivery'],['delivered','Delivered']];
      const current = String(order.status || 'confirmed').toLowerCase();
      const normalized = current === 'packed' ? 'processing' : (current === 'created' || current === 'pending' ? 'confirmed' : current);
      let activeIndex = stages.findIndex(([value]) => value === normalized);
      if (activeIndex < 0) activeIndex = 0;
      const progress = ['cancelled','returned'].includes(current)
        ? `<div class="order-track-alert">${current === 'cancelled' ? 'This order was cancelled.' : 'This order was returned.'}</div>`
        : `<div class="order-track-progress">${stages.map(([value,label],index) => `<div class="order-track-step ${index <= activeIndex ? 'active' : ''} ${index < activeIndex ? 'completed' : ''}"><span class="order-track-dot">${index < activeIndex ? '✓' : index + 1}</span><span>${label}</span></div>`).join('')}</div>`;
      return `
        <article class="customer-order-card">
          <div class="customer-order-head">
            <div><span class="customer-order-label">Order ID</span><strong class="customer-order-id">${escapeHtml(order.id)}</strong></div>
            <span class="customer-order-status status-${escapeHtml(String(order.status || 'confirmed').toLowerCase())}">${escapeHtml(order.statusLabel || 'Order Confirmed')}</span>
          </div>
          <div class="customer-order-meta">
            <div><span>Tracking ID</span><strong>${escapeHtml(order.trackingId || order.id)}</strong></div>
            <div><span>Placed</span><strong>${order.createdAt ? escapeHtml(new Date(order.createdAt).toLocaleString('en-BD')) : '—'}</strong></div>
          </div>
          ${progress}
          <div class="customer-order-items">${itemHtml}</div>
          <div class="customer-order-totals">
            <div><span>Subtotal</span><strong>${money(order.subtotal)}</strong></div>
            <div><span>Shipping</span><strong>${Number(order.shipping || 0) === 0 ? 'Free' : money(order.shipping)}</strong></div>
            <div class="grand-total"><span>Total</span><strong>${money(order.amount)}</strong></div>
          </div>
          <div class="customer-order-payment">
            <div><span>Payment Method</span><strong>${escapeHtml(payment.methodLabel || 'Cash on Delivery')}</strong></div>
            <div><span>Payment Status</span><strong>${escapeHtml(payment.statusLabel || 'Due on Delivery')}</strong></div>
            <div><span>Amount Due</span><strong>${money(payment.dueAmount ?? order.amount)}</strong></div>
          </div>
        </article>`;
    }

    async function loadOrder() {
      if (!orderId) {
        box.innerHTML = '<div class="order-empty-state">Order ID is missing.</div>';
        return;
      }
      try {
        const response = await window.oravelFetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.message || 'Order not found');
        box.innerHTML = renderOrder(result.order);
        localStorage.setItem('oravel_lifestyle_last_order', JSON.stringify({
          orderId: result.order.id,
          trackingId: result.order.trackingId || result.order.id,
          amount: result.order.amount,
          createdAt: result.order.createdAt
        }));
      } catch (error) {
        box.innerHTML = `<div class="order-empty-state">${escapeHtml(error.message || 'Could not load order details')}</div>`;
      }
    }

    localStorage.removeItem('oravel_lifestyle_cart');
    localStorage.removeItem('oravel_lifestyle_pending_order');
    loadOrder();
  