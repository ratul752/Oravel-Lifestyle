// Page template, rendered by build.mjs.
export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — Oravel Lifestyle</title>
  <link rel="stylesheet" href="/styles.css?v=20260821-full-orders-1">
  <style>
    .order-result-page { min-height:100vh; display:grid; place-items:center; padding:24px; background:var(--bg-deep,#08080f); color:var(--text-primary,#fff); }
    .order-result-card { width:min(760px,100%); padding:32px; border-radius:24px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); box-shadow:0 24px 80px rgba(0,0,0,.35); }
    .order-result-top { text-align:center; }
    .order-result-icon { width:76px; height:76px; display:grid; place-items:center; margin:0 auto 18px; border-radius:50%; background:rgba(16,185,129,.16); color:#10b981; font-size:36px; font-weight:800; }
    .order-result-card h1 { margin:0 0 10px; font-size:clamp(28px,5vw,42px); }
    .order-result-card p { color:rgba(255,255,255,.74); line-height:1.7; }
    .order-result-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:22px; }
    .order-save-note { text-align:center; margin-top:16px; }
  </style>
  <script src="/api-config.js" defer></script>
  <script src="/api-client.js" defer></script>
</head>
<body>
  <main class="order-result-page">
    <section class="order-result-card">
      <div class="order-result-top">
        <div class="order-result-icon">✓</div>
        <h1>Order Confirmed</h1>
        <p>Your order is saved. You can return anytime and view it from My Account, or track it using the Order ID or Tracking ID.</p>
      </div>
      <div id="order-success-details"><div class="order-loading">Loading order details...</div></div>
      <p class="order-save-note">Cash on Delivery: no advance payment is required. Pay the courier when your order arrives.</p>
      <div class="order-result-actions">
        <a href="/#track-order" class="btn btn-secondary">Track Order</a>
        <a href="/" class="btn btn-primary">Continue Shopping</a>
      </div>
    </section>
  </main>
  <script src="/order-success-page.js" defer></script>
  <script src="/whatsapp-button.js?v=800" defer></script>
</body>
</html>
`;
