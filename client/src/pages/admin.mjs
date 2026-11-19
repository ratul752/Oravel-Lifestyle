// Page template, rendered by build.mjs.
export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Oravel Lifestyle</title>
  <link rel="icon" type="image/webp" href="/logo.webp">
  <style>
    :root {
      --bg: #080812;
      --panel: #11111c;
      --panel-2: #171724;
      --border: rgba(255,255,255,.1);
      --text: #f7f4ef;
      --muted: #a8a2b8;
      --accent: #d6a184;
      --accent-2: #c78086;
      --success: #57d68d;
      --danger: #ff7676;
      --warning: #ffd166;
      --shadow: 0 25px 80px rgba(0,0,0,.35);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      font-family: Inter, Segoe UI, system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at top left, rgba(214,161,132,.15), transparent 35%), var(--bg);
    }
    a { color: inherit; text-decoration: none; }
    .wrap { width: min(1240px, calc(100% - 32px)); margin: 0 auto; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 1px solid var(--border);
      background: rgba(8,8,18,.88);
      backdrop-filter: blur(18px);
    }
    .topbar-inner {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.1rem; }
    .brand img { width: 40px; height: 40px; object-fit: contain; border-radius: 10px; }
    .top-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .btn {
      border: 1px solid var(--border);
      background: var(--panel-2);
      color: var(--text);
      border-radius: 12px;
      padding: 11px 15px;
      cursor: pointer;
      font-weight: 700;
      transition: transform .22s ease, border-color .22s ease, background .22s ease;
    }
    .btn:hover { transform: translateY(-2px); border-color: rgba(214,161,132,.55); }
    .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #120d0b; border: none; }
    .btn-danger { background: rgba(255,118,118,.12); border-color: rgba(255,118,118,.35); color: #ffdada; }
    .page { padding: 32px 0 56px; }
    .login-card, .panel {
      background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.02));
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
    }
    .login-card {
      width: min(460px, 100%);
      margin: 70px auto;
      padding: 28px;
    }
    h1, h2, h3 { margin: 0; }
    .login-card h1 { margin-bottom: 8px; }
    .muted { color: var(--muted); }
    .form-row { display: grid; gap: 8px; margin-top: 18px; }
    label { color: var(--muted); font-weight: 700; font-size: .9rem; }
    input, select {
      width: 100%;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.045);
      color: var(--text);
      border-radius: 14px;
      padding: 13px 14px;
      outline: none;
    }
    input:focus, select:focus { border-color: rgba(214,161,132,.65); box-shadow: 0 0 0 4px rgba(214,161,132,.1); }
    .alert { margin-top: 14px; color: var(--danger); min-height: 22px; }
    .hidden { display: none !important; }
    .hero {
      display: grid;
      grid-template-columns: 1.4fr .8fr;
      gap: 18px;
      align-items: stretch;
      margin-bottom: 18px;
    }
    .hero-card { padding: 24px; }
    .hero h1 { font-size: clamp(1.8rem, 4vw, 3rem); margin-bottom: 8px; }
    .status-line { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 11px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.04);
      color: var(--muted);
      font-size: .88rem;
      font-weight: 700;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 16px var(--success); }
    .stats {
      display: grid;
      grid-template-columns: repeat(6, minmax(130px, 1fr));
      gap: 14px;
      margin: 18px 0;
    }
    .stat {
      padding: 18px;
      border-radius: 20px;
      background: var(--panel);
      border: 1px solid var(--border);
    }
    .stat span { color: var(--muted); font-size: .85rem; }
    .stat strong { display: block; font-size: 1.55rem; margin-top: 8px; }
    .toolbar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
      margin: 18px 0;
    }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .tab.active { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #120d0b; border: none; }
    .table-panel { overflow: hidden; }
    .table-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      padding: 18px;
      border-bottom: 1px solid var(--border);
      align-items: center;
      flex-wrap: wrap;
    }
    .table-wrap { overflow: auto; max-height: 560px; }
    table { width: 100%; border-collapse: collapse; min-width: 860px; }
    th, td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.07); text-align: left; vertical-align: top; }
    th { position: sticky; top: 0; background: #151521; z-index: 1; color: var(--muted); font-size: .84rem; text-transform: uppercase; letter-spacing: .04em; }
    td { color: #eeeaf5; font-size: .92rem; }
    tr:hover td { background: rgba(255,255,255,.025); }
    .pill { padding: 6px 9px; border-radius: 999px; font-weight: 800; font-size: .78rem; display: inline-block; }
    .paid { color: #b9ffd4; background: rgba(87,214,141,.12); }
    .pending { color: #ffe6a3; background: rgba(255,209,102,.12); }
    .failed, .cancelled { color: #ffd0d0; background: rgba(255,118,118,.12); }
    .json-box { color: var(--muted); font-family: ui-monospace, Consolas, monospace; font-size: .82rem; white-space: nowrap; }
    .order-admin-actions { display:grid; grid-template-columns:minmax(130px,1fr) minmax(85px,.7fr) auto; gap:7px; min-width:360px; }
    .order-admin-actions select { padding:9px 10px; min-width:0; }
    .order-admin-actions .btn { padding:9px 12px; }
    .empty { padding: 42px 18px; color: var(--muted); text-align: center; }
    @media (max-width: 920px) {
      .hero { grid-template-columns: 1fr; }
      .stats { grid-template-columns: repeat(2, 1fr); }
      .toolbar { grid-template-columns: 1fr; }
      .topbar-inner { align-items: flex-start; padding: 14px 0; flex-direction: column; }
    }
    @media (max-width: 520px) {
      .stats { grid-template-columns: 1fr; }
      .wrap { width: min(100% - 20px, 1240px); }
      .login-card { padding: 20px; margin-top: 32px; }
    }
  </style>
  <script src="/api-config.js" defer></script>
  <script src="/api-client.js" defer></script>
</head>
<body>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="/">
        <img src="/logo.webp" alt="Oravel Lifestyle">
        <span>Oravel Lifestyle Admin</span>
      </a>
      <div class="top-actions">
        <a class="btn" href="/">Open Website</a>
        <button class="btn" id="refresh-btn" type="button">Refresh</button>
        <button class="btn btn-danger hidden" id="logout-btn" type="button">Logout</button>
      </div>
    </div>
  </header>

  <main class="page">
    <section class="wrap" id="login-view">
      <form class="login-card" id="admin-login-form">
        <h1>Admin Login</h1>
        <p class="muted">Login to view orders, users, contact messages, newsletter subscribers, OTP verification records, activity logs, and products saved or loaded by the backend.</p>
        <div class="form-row">
          <label for="admin-email">Admin email</label>
          <input id="admin-email" type="email" placeholder="admin@example.com" autocomplete="username" required>
        </div>
        <div class="form-row">
          <label for="admin-password">Admin password</label>
          <input id="admin-password" type="password" placeholder="Enter admin password" autocomplete="current-password" required>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:18px;" type="submit">Login</button>
        <div class="alert" id="login-alert"></div>
      </form>
    </section>

    <section class="wrap hidden" id="dashboard-view">
      <div class="hero">
        <div class="panel hero-card">
          <h1>Store Data Dashboard</h1>
          <p class="muted">View all saved website data from your backend database in one place.</p>
          <div class="status-line">
            <span class="badge"><span class="dot"></span><span id="db-engine">Database loading</span></span>
            <span class="badge" id="db-file">Database loading</span>
          </div>
        </div>
        <div class="panel hero-card">
          <h3>Quick Export</h3>
          <p class="muted">Download any table as CSV or JSON.</p>
          <div class="top-actions" style="margin-top:16px;">
            <button class="btn" data-export="csv" type="button">Current CSV</button>
            <button class="btn" data-export="json" type="button">Current JSON</button>
            <button class="btn btn-primary" data-export-all="json" type="button">All Data JSON</button>
            <button class="btn" data-export-all="csv" type="button">All Data CSV</button>
          </div>
        </div>
      </div>

      <div class="stats" id="stats-grid"></div>

      <div class="toolbar">
        <div class="tabs" id="tabs">
          <button class="btn tab active" data-tab="orders" type="button">Orders</button>
          <button class="btn tab" data-tab="users" type="button">Users</button>
          <button class="btn tab" data-tab="messages" type="button">Messages</button>
          <button class="btn tab" data-tab="subscribers" type="button">Subscribers</button>
          <button class="btn tab" data-tab="authEvents" type="button">Activity</button>
          <button class="btn tab" data-tab="verificationCodes" type="button">OTP Codes</button>
          <button class="btn tab" data-tab="siteEvents" type="button">Site Events</button>
          <button class="btn tab" data-tab="products" type="button">Products</button>
          <button class="btn tab" data-tab="allData" type="button">All Data</button>
        </div>
        <input id="search-input" type="search" placeholder="Search current table...">
      </div>

      <section class="panel table-panel">
        <div class="table-head">
          <div>
            <h2 id="table-title">Orders</h2>
            <p class="muted" id="table-subtitle">Saved Cash on Delivery orders</p>
          </div>
          <span class="badge" id="row-count">0 rows</span>
        </div>
        <div class="table-wrap" id="table-wrap"></div>
      </section>
    </section>
  </main>

<script src="/admin-page.js" defer></script>
</body>
</html>
`;
