
  const state = {
    token: sessionStorage.getItem('oravelAdminToken') || '',
    activeTab: 'orders',
    data: { orders: [], users: [], messages: [], subscribers: [], authEvents: [], verificationCodes: [], siteEvents: [], products: [], allData: {}, counts: {}, database: {} }
  };

  const views = {
    login: document.getElementById('login-view'),
    dashboard: document.getElementById('dashboard-view')
  };

  const columns = {
    orders: [
      ['id', 'Order ID'], ['trackingId', 'Tracking ID'], ['status', 'Status'], ['methodLabel', 'Method'], ['amount', 'Amount'],
      ['customerName', 'Customer'], ['customerPhone', 'Phone'], ['customerEmail', 'Email'],
      ['itemCount', 'Items'], ['createdAt', 'Created'], ['paymentStatusLabel', 'Payment'], ['orderActions', 'Update']
    ],
    users: [
      ['id', 'User ID'], ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['role', 'Role'], ['createdAt', 'Created']
    ],
    messages: [
      ['id', 'Ticket ID'], ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['topic', 'Topic'], ['message', 'Message'], ['createdAt', 'Created']
    ],
    subscribers: [
      ['email', 'Email'], ['createdAt', 'Subscribed']
    ],
    authEvents: [
      ['id', 'Event ID'], ['eventType', 'Type'], ['userId', 'User ID'], ['email', 'Email'], ['createdAt', 'Created'], ['details', 'Details']
    ],
    verificationCodes: [
      ['id', 'OTP ID'], ['purpose', 'Purpose'], ['channel', 'Channel'], ['destinationMasked', 'Destination'], ['email', 'Email'], ['phone', 'Phone'], ['status', 'Status'], ['attempts', 'Attempts'], ['expiresAt', 'Expires'], ['createdAt', 'Created']
    ],
    siteEvents: [
      ['id', 'Event ID'], ['eventType', 'Type'], ['label', 'Label'], ['category', 'Category'], ['productId', 'Product ID'], ['email', 'Email'], ['page', 'Page'], ['createdAt', 'Created'], ['details', 'Details']
    ],
    allData: [
      ['collection', 'Collection'], ['count', 'Rows'], ['description', 'Description']
    ],
    products: [
      ['id', 'Product ID'], ['name', 'Name'], ['category', 'Category'], ['price', 'Price'], ['oldPrice', 'Old Price'], ['rating', 'Rating'], ['reviews', 'Reviews'], ['inStock', 'Stock'], ['badge', 'Badge']
    ]
  };

  const subtitles = {
    orders: 'Saved Cash on Delivery orders',
    users: 'Customer signup data without password hashes',
    messages: 'Messages submitted from the contact form',
    subscribers: 'Newsletter email subscribers',
    authEvents: 'Signup, login, contact, newsletter, order, and reset activity saved in the database',
    verificationCodes: 'Signup and forgot-password OTP records. Codes are hashed, so plain OTP is never shown here.',
    siteEvents: 'Website interaction events such as category taps, cart opens, add-to-cart clicks, and form submissions.',
    products: 'Product catalog loaded by the backend from MongoDB products collection for order validation',
    allData: 'One gathered view of every collection saved or loaded by the backend.'
  };

  document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const alert = document.getElementById('login-alert');
    alert.textContent = '';

    try {
      const response = await window.oravelFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('admin-email').value,
          password: document.getElementById('admin-password').value
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Login failed');
      state.token = data.token;
      sessionStorage.setItem('oravelAdminToken', state.token);
      await loadDashboard();
    } catch (error) {
      alert.textContent = error.message;
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('oravelAdminToken');
    state.token = '';
    views.login.classList.remove('hidden');
    views.dashboard.classList.add('hidden');
    document.getElementById('logout-btn').classList.add('hidden');
  });

  document.getElementById('refresh-btn').addEventListener('click', () => {
    if (state.token) loadDashboard();
  });

  document.getElementById('tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    state.activeTab = button.dataset.tab;
    document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === button));
    renderTable();
  });

  document.getElementById('search-input').addEventListener('input', renderTable);

  document.querySelectorAll('[data-export]').forEach(button => {
    button.addEventListener('click', () => exportTable(button.dataset.export));
  });

  document.querySelectorAll('[data-export-all]').forEach(button => {
    button.addEventListener('click', () => exportAllData(button.dataset.exportAll));
  });

  async function loadDashboard() {
    const response = await window.oravelFetch('/api/admin/data', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      sessionStorage.removeItem('oravelAdminToken');
      throw new Error(data.message || 'Admin session expired');
    }
    state.data = data;
    views.login.classList.add('hidden');
    views.dashboard.classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    renderStatus();
    renderStats();
    renderTable();
  }

  function renderStatus() {
    const db = state.data.database || {};
    document.getElementById('db-engine').textContent = db.connected ? `${db.engine || 'MongoDB'} database connected` : 'Database disconnected';
    document.getElementById('db-file').textContent = db.name || 'Database name unavailable';
  }

  function renderStats() {
    const c = state.data.counts || {};
    const stats = [
      ['Orders', c.orders || 0], ['Confirmed', c.confirmedOrders || 0], ['Pending', c.pendingOrders || 0],
      ['Order Value', `৳${Number(c.orderValue || 0).toLocaleString()}`], ['Users', c.users || 0], ['Customers', c.customers || 0], ['Messages', c.messages || 0], ['Subscribers', c.subscribers || 0], ['Activity', c.authEvents || 0], ['OTP Codes', c.verificationCodes || 0], ['Site Events', c.siteEvents || 0], ['Products', c.products || 0]
    ];
    document.getElementById('stats-grid').innerHTML = stats.map(([label, value]) => `
      <div class="stat"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>
    `).join('');
  }

  function renderTable() {
    const tab = state.activeTab;
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    const sourceRows = tab === 'allData' ? getAllDataRows() : (state.data[tab] || []);
    const rows = sourceRows.filter(row => JSON.stringify(row).toLowerCase().includes(query));
    const tableColumns = columns[tab] || [];

    document.getElementById('table-title').textContent = titleCase(tab);
    document.getElementById('table-subtitle').textContent = subtitles[tab] || '';
    document.getElementById('row-count').textContent = `${rows.length} row${rows.length === 1 ? '' : 's'}`;

    if (!rows.length) {
      document.getElementById('table-wrap').innerHTML = '<div class="empty">No data found.</div>';
      return;
    }

    document.getElementById('table-wrap').innerHTML = `
      <table>
        <thead><tr>${tableColumns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(row => `<tr>${tableColumns.map(([key]) => `<td>${formatCell(key, row[key], row)}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  function formatCell(key, value, row = {}) {
    if (key === 'orderActions') return renderOrderActions(row);
    if (key === 'status') return `<span class="pill ${escapeHtml(value || 'pending')}">${escapeHtml(row.statusLabel || value || 'pending')}</span>`;
    if (key === 'amount' || key === 'price' || key === 'oldPrice') return value ? `৳${Number(value || 0).toLocaleString()}` : '';
    if (key === 'inStock') return value ? '<span class="pill paid">In Stock</span>' : '<span class="pill failed">Out</span>';
    if (key.toLowerCase().includes('created') || key.toLowerCase().includes('updated')) return escapeHtml(formatDate(value));
    if (typeof value === 'object') return `<span class="json-box">${escapeHtml(JSON.stringify(value))}</span>`;
    return escapeHtml(value || '');
  }

  function renderOrderActions(row) {
    const statuses = [
      ['confirmed','Confirmed'], ['processing','Processing'], ['packed','Packed'], ['shipped','Shipped'],
      ['out_for_delivery','Out for Delivery'], ['delivered','Delivered'], ['cancelled','Cancelled'], ['returned','Returned']
    ];
    const currentPayment = row.paymentStatus || (row.collectionStatus === 'collected' ? 'paid' : 'unpaid');
    return `
      <div class="order-admin-actions" data-order-id="${escapeHtml(row.id)}">
        <select class="order-status-select" aria-label="Order status">
          ${statuses.map(([value,label]) => `<option value="${value}" ${row.status === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <select class="order-payment-select" aria-label="Payment status">
          <option value="unpaid" ${currentPayment === 'unpaid' ? 'selected' : ''}>Due</option>
          <option value="paid" ${currentPayment === 'paid' ? 'selected' : ''}>Paid</option>
        </select>
        <button class="btn order-update-btn" type="button">Update</button>
      </div>`;
  }

  document.getElementById('table-wrap').addEventListener('click', async (event) => {
    const button = event.target.closest('.order-update-btn');
    if (!button) return;
    const wrapper = button.closest('.order-admin-actions');
    if (!wrapper) return;
    const orderId = wrapper.dataset.orderId;
    const status = wrapper.querySelector('.order-status-select')?.value;
    const paymentStatus = wrapper.querySelector('.order-payment-select')?.value;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Saving...';
    try {
      const response = await window.oravelFetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`
        },
        body: JSON.stringify({ orderId, status, paymentStatus })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Update failed');
      await loadDashboard();
    } catch (error) {
      alert(error.message || 'Order update failed');
      button.disabled = false;
      button.textContent = original;
    }
  });

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  async function exportTable(format) {
    const exportType = state.activeTab === 'allData' ? 'all' : state.activeTab;
    const response = await window.oravelFetch(`/api/admin/export/${exportType}?format=${format}`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    if (!response.ok) return alert('Export failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oravel-${exportType}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function exportAllData(format) {
    const response = await window.oravelFetch(`/api/admin/export/all?format=${format}`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    if (!response.ok) return alert('All data export failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oravel-all-data.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getAllDataRows() {
    const counts = state.data.counts || {};
    return [
      ['orders', 'Cash on Delivery order records'],
      ['users', 'Admin and customer signup records'],
      ['messages', 'Contact form submissions'],
      ['subscribers', 'Newsletter subscribers'],
      ['authEvents', 'Login, signup, reset, contact, newsletter, and order activity'],
      ['verificationCodes', 'OTP verification metadata with hashed codes only'],
      ['siteEvents', 'Website clicks, category taps, cart actions, and form events'],
      ['products', 'Product catalog loaded from MongoDB products collection']
    ].map(([collection, description]) => ({ collection, count: counts[collection] || 0, description }));
  }

  function titleCase(text) {
    if (text === 'authEvents') return 'Activity';
    if (text === 'verificationCodes') return 'OTP Codes';
    if (text === 'siteEvents') return 'Site Events';
    if (text === 'allData') return 'All Data';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  if (state.token) {
    loadDashboard().catch(() => {
      sessionStorage.removeItem('oravelAdminToken');
      state.token = '';
    });
  }
