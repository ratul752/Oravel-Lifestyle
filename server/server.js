/* ========================================
   ORAVEL LIFESTYLE - COD Ecommerce Backend
   Run: node server.js
   ======================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { connectDatabase, collection, databaseName } = require('./database');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contact-messages.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');
const AUTH_EVENTS_FILE = path.join(DATA_DIR, 'auth-events.json');
const VERIFICATION_FILE = path.join(DATA_DIR, 'verification-codes.json');
const SITE_EVENTS_FILE = path.join(DATA_DIR, 'site-events.json');


loadEnvFile(path.join(ROOT, '.env'));

const configuredAuthSecret = String(process.env.AUTH_SECRET || '').trim();
if (configuredAuthSecret.length < 32 || configuredAuthSecret === 'REPLACE_WITH_RANDOM_64_CHARACTER_SECRET') {
  console.error('Set AUTH_SECRET to at least 32 characters in .env');
  throw new Error('Set a valid AUTH_SECRET of at least 32 characters');
}
const AUTH_SECRET = configuredAuthSecret;

const PORT = Number(process.env.PORT || 5000);
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

// In-memory brute-force protection for the admin login endpoint.
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;
const ADMIN_LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const adminLoginAttempts = new Map(); // ip -> { count, firstAttemptAt, lockedUntil }

// In-memory abuse/cost protection for the AI assistant endpoint.
const ASSISTANT_RATE_LIMIT_MAX = 8;
const ASSISTANT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const assistantRateLimit = new Map(); // ip -> { count, windowStart }

// Basic protection against automated fake COD order submissions.
const ORDER_RATE_LIMIT_MAX = 5;
const ORDER_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const orderRateLimit = new Map();



async function handler(req, res) {
  try {
    setSecurityHeaders(res);
    res.setHeader('Cache-Control', 'no-store');
    const origin = req.headers.origin;
    if (origin) {
      const allowed = String(process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(v => v.trim()).filter(Boolean);
      res.setHeader('Vary', 'Origin');
      if (!allowed.includes(origin)) return sendJson(res, 403, { success: false, message: 'Origin not allowed' });
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const requestUrl = new URL(req.url, PUBLIC_BASE_URL);
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (!pathname.startsWith('/api/')) return sendJson(res, 404, { success: false, message: 'API route not found' });
    if (pathname !== '/api/config') await initialize();

    if (pathname === '/api/health' && req.method === 'GET') {
      await (await connectDatabase()).command({ ping: 1 });
      return sendJson(res, 200, {
        ok: true,
        store: 'Oravel Lifestyle',
        publicBaseUrl: PUBLIC_BASE_URL,
        orderMethod: 'cash_on_delivery',
        cashOnDeliveryOnly: true,
        database: 'MongoDB connected',
        adminConfigured: hasAdminCredentials(),
        emailOtpConfigured: hasEmailDelivery(),
        smsOtpConfigured: hasSmsDelivery(),
        realOtpRequired: true,
        aiAssistantVisible: isAssistantVisible(),
        aiAssistantConfigured: hasAssistantDelivery(),
        aiAssistantProvider: getAssistantProvider() || 'not configured'
      });
    }


    if (pathname === '/api/config' && req.method === 'GET') {
      return sendJson(res, 200, {
        store: 'Oravel Lifestyle',
        whatsappNumber: getWhatsappNumber(),
        assistantEnabled: isAssistantVisible(),
        assistantConfigured: hasAssistantDelivery(),
        assistantProvider: getAssistantProvider() || 'not configured'
      });
    }

    if (pathname === '/api/assistant/chat' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleAssistantChat(res, body, req);
    }

    if (pathname === '/api/assistant/test' && req.method === 'GET') {
      if (!requireAdmin(req, res)) return;
      return await handleAssistantTest(res);
    }

    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleAdminLogin(res, body, req);
    }

    if (pathname === '/api/admin/data' && req.method === 'GET') {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      return await handleAdminData(res);
    }

    if (pathname === '/api/admin/orders/update-status' && req.method === 'POST') {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const body = await readBody(req);
      return await handleAdminOrderStatusUpdate(res, body);
    }

    if (pathname.startsWith('/api/admin/export/') && req.method === 'GET') {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      const type = pathname.split('/').pop();
      const format = String(requestUrl.searchParams.get('format') || 'json').toLowerCase();
      return await handleAdminExport(res, type, format);
    }


    if (pathname === '/api/auth/signup/request-code' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleSignupRequestCode(res, body);
    }

    if (pathname === '/api/auth/signup/verify' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleSignupVerify(res, body);
    }

    if (pathname === '/api/auth/password/request-reset' && req.method === 'POST') {
      const body = await readBody(req);
      return await handlePasswordResetRequest(res, body);
    }

    if (pathname === '/api/auth/password/reset' && req.method === 'POST') {
      const body = await readBody(req);
      return await handlePasswordResetVerify(res, body);
    }

    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleSignup(res, body);
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleLogin(res, body);
    }

    if (pathname === '/api/contact' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleContactMessage(res, body);
    }

    if (pathname === '/api/newsletter' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleNewsletter(res, body);
    }

    if (pathname === '/api/track' && req.method === 'POST') {
      const body = await readBody(req);
      return await handleSiteEvent(res, body, req);
    }

    if (pathname === '/api/account/orders' && req.method === 'GET') {
      const user = await requireCustomer(req, res);
      if (!user) return;
      return await handleCustomerOrders(res, user);
    }

    if (pathname.startsWith('/api/account/orders/') && req.method === 'GET') {
      const user = await requireCustomer(req, res);
      if (!user) return;
      const orderRef = pathname.split('/').pop();
      return await handleCustomerOrderDetail(res, user, orderRef);
    }

    if (pathname === '/api/orders/create' && req.method === 'POST') {
      const body = await readBody(req);
      return await createOrder(req, res, body);
    }

    if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
      const orderRef = pathname.split('/').pop();
      const order = await getOrder(orderRef);
      if (!order) return sendJson(res, 404, { success: false, message: 'Order not found' });
      return sendJson(res, 200, { success: true, order: sanitizePublicOrder(order) });
    }

    return sendJson(res, 404, { success: false, message: 'API route not found' });
  } catch (error) {
    const statusCode = Number(error.statusCode || 500);
    if (statusCode >= 500) console.error(safeError(error));
    else console.warn(`Request rejected (${statusCode}): ${safeError(error)}`);
    return sendJson(res, statusCode, { success: false, message: statusCode === 500 ? 'Server error' : error.message });
  }
}

let initialization;
function initialize() {
  if (!initialization) initialization = (async () => {
    await connectDatabase();
    await seedProducts();
    await ensureAdminUser();
  })().catch(error => { initialization = undefined; throw error; });
  return initialization;
}

async function start() {
  await initialize();
  const server = http.createServer(handler);
  server.listen(PORT, () => {
  console.log(`Oravel Lifestyle server running at ${PUBLIC_BASE_URL}`);
  console.log('Order method: Cash on Delivery only');
  console.log(`Database: MongoDB (${databaseName()})`);
  console.log(`Client origins: ${process.env.CLIENT_ORIGINS || "http://localhost:5173"}`);
  if (isDevReturnCodeEnabled()) {
    console.warn('WARNING: OTP_DEV_RETURN_CODE is enabled. Verification codes are being returned in API responses instead of being emailed/texted. This is for local development only — set OTP_DEV_RETURN_CODE=false before deploying to production.');
  }
  if (configuredAuthSecret.length < 32) {
    console.warn('WARNING: AUTH_SECRET is missing or shorter than 32 characters. A temporary runtime secret is being used, so login sessions will reset when the server restarts.');
  }
  if (!hasAdminCredentials()) {
    console.warn('WARNING: Admin login is disabled until ADMIN_EMAIL and a strong ADMIN_PASSWORD are configured.');
  }
  });
}

if (require.main === module) {
  start().catch(error => {
    console.error(`Startup failed: ${safeError(error)}`);
    process.exit(1);
  });
}
module.exports = handler;


function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

function checkAdminLoginRateLimit(ip) {
  const record = adminLoginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }
  return { allowed: true };
}

function registerAdminLoginFailure(ip) {
  const now = Date.now();
  const record = adminLoginAttempts.get(ip) || { count: 0, firstAttemptAt: now, lockedUntil: 0 };
  // Reset the window if the lockout has expired and it's been a while since the last attempt.
  if (record.lockedUntil && record.lockedUntil <= now) {
    record.count = 0;
    record.firstAttemptAt = now;
    record.lockedUntil = 0;
  }
  record.count += 1;
  if (record.count >= ADMIN_LOGIN_MAX_ATTEMPTS) {
    record.lockedUntil = now + ADMIN_LOGIN_LOCKOUT_MS;
  }
  adminLoginAttempts.set(ip, record);
}

function registerAdminLoginSuccess(ip) {
  adminLoginAttempts.delete(ip);
}

async function handleAdminLogin(res, body, req) {
  if (!hasAdminCredentials()) {
    return sendJson(res, 503, { success: false, message: 'Admin login is not configured on the server' });
  }

  const ip = getClientIp(req);
  const rateLimit = checkAdminLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return sendJson(res, 429, {
      success: false,
      message: `Too many failed login attempts. Try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`
    });
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  const hash = (value) => crypto.createHash('sha256').update(String(value)).digest();
  const emailMatches = crypto.timingSafeEqual(hash(email), hash(adminEmail));
  const passwordMatches = crypto.timingSafeEqual(hash(password), hash(adminPassword));

  if (!emailMatches || !passwordMatches) {
    registerAdminLoginFailure(ip);
    await recordAuthEvent('admin_login_failed', { email, ip });
    return sendJson(res, 401, { success: false, message: 'Invalid admin email or password' });
  }

  registerAdminLoginSuccess(ip);
  await recordAuthEvent('admin_login_success', { email, ip });

  return sendJson(res, 200, {
    success: true,
    token: createAdminToken(adminEmail),
    admin: { email: adminEmail, role: 'admin' }
  });
}

function checkAssistantRateLimit(ip) {
  const now = Date.now();
  const record = assistantRateLimit.get(ip);
  if (!record || (now - record.windowStart) > ASSISTANT_RATE_LIMIT_WINDOW_MS) {
    assistantRateLimit.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (record.count >= ASSISTANT_RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((record.windowStart + ASSISTANT_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  record.count += 1;
  return { allowed: true };
}

function checkOrderRateLimit(ip) {
  const now = Date.now();
  const record = orderRateLimit.get(ip);
  if (!record || (now - record.windowStart) > ORDER_RATE_LIMIT_WINDOW_MS) {
    orderRateLimit.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (record.count >= ORDER_RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((record.windowStart + ORDER_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  record.count += 1;
  return { allowed: true };
}

const ASSISTANT_SYSTEM_PROMPT_HEADER = `You are the AI assistant for Oravel Lifestyle, an online store in Bangladesh selling accessories, lamps, and mirrors, with beauty products and clothes coming soon. Prices are in Bangladeshi Taka (BDT).

Store policies:
- Free shipping on orders of BDT 5000 or more, otherwise a flat BDT 120 shipping fee.
- The only order method is Cash on Delivery. Customers pay the courier when the order is delivered.

Guidelines:
- Help customers with product discovery, gift ideas, category questions, price questions, shipping questions, return policy questions, beauty-coming-soon, lifestyle, and product-care questions, and general shopping guidance.
- For products, prices, categories, and stock, use ONLY the catalog list below. Never invent products, prices, discounts, stock levels, or order data that are not in the list.
- You do NOT have access to any specific customer's order status, password, OTP, or account details. For anything order-specific ("where is my order", delivery issues, account issues), tell the customer to use Track Order, WhatsApp, or the Contact page.
- Keep replies short, friendly, and practical.
- Do not request OTP codes, passwords, card numbers, or financial account details.

Current product catalog:
`;

async function handleAssistantTest(res) {
  if (!hasAssistantDelivery()) {
    return sendJson(res, 200, {
      success: false,
      configured: false,
      provider: 'openai',
      message: 'OPENAI_API_KEY is missing or too short in the server environment.'
    });
  }

  try {
    const reply = await getOpenAIAssistantReply(
      'You are a connection test assistant. Reply with one short sentence only.',
      [],
      'Reply exactly: OpenAI assistant connected.'
    );
    return sendJson(res, 200, {
      success: true,
      configured: true,
      provider: 'openai',
      model: getAssistantModel(),
      reply
    });
  } catch (error) {
    console.error('Assistant test error:', safeError(error));
    return sendJson(res, 502, {
      success: false,
      configured: true,
      provider: 'openai',
      model: getAssistantModel(),
      message: 'The OpenAI key is configured, but the API test failed.',
      error: safeError(error),
      note: isNetworkFetchError(error)
        ? 'The server could not reach api.openai.com. Check the hosting network and try again.'
        : 'Check the API key, model access, billing, and usage limits.'
    });
  }
}

async function handleAssistantChat(res, body, req) {
  if (!hasAssistantDelivery()) {
    return sendJson(res, 503, {
      success: false,
      unavailable: true,
      message: 'The AI assistant is not connected yet. Add OPENAI_API_KEY to the server environment and restart the app.'
    });
  }

  const ip = getClientIp(req);
  const rateLimit = checkAssistantRateLimit(ip);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return sendJson(res, 429, {
      success: false,
      message: `Too many messages. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`
    });
  }

  const message = String(body.message || '').trim();
  if (!message) {
    return sendJson(res, 400, { success: false, message: 'Message is required' });
  }
  if (message.length > 800) {
    return sendJson(res, 400, { success: false, message: 'Message is too long (max 800 characters)' });
  }

  let history = [];
  if (Array.isArray(body.history)) {
    history = body.history
      .slice(-10)
      .filter(turn => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
      .map(turn => ({ role: turn.role, content: turn.content.slice(0, 800) }));
  }

  const systemPrompt = ASSISTANT_SYSTEM_PROMPT_HEADER + await getCatalogSummaryForAssistant();

  try {
    const reply = await getOpenAIAssistantReply(systemPrompt, history, message);
    if (!reply) {
      return sendJson(res, 502, { success: false, message: 'The assistant returned an empty response. Please try again.' });
    }
    return sendJson(res, 200, { success: true, reply, provider: 'openai' });
  } catch (error) {
    console.error('Assistant chat error:', safeError(error));
    return sendJson(res, 502, { success: false, message: 'The AI assistant is temporarily unavailable. Please try again shortly.' });
  }
}

async function getOpenAIAssistantReply(systemPrompt, history, message) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  const input = [
    ...history.map(turn => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: getAssistantModel(),
        instructions: systemPrompt,
        input,
        max_output_tokens: clampNumber(process.env.AI_ASSISTANT_MAX_TOKENS, 80, 800, 450),
        store: false
      })
    });

    if (!response.ok) {
      const errorBody = maskSecrets((await response.text()).slice(0, 1500));
      throw new Error(`OpenAI API failed with HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return extractOpenAIText(data);
  } catch (error) {
    if (error && error.name === 'AbortError') throw new Error('OpenAI API request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractOpenAIText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = [];
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (!Array.isArray(item.content)) continue;
      for (const part of item.content) {
        if (typeof part.text === 'string') chunks.push(part.text);
        if (typeof part.output_text === 'string') chunks.push(part.output_text);
      }
    }
  }
  return chunks.join('\n').trim();
}

async function handleAdminData(res) {
  const users = (await readJsonFile(USERS_FILE, [])).map(publicUser);
  const orders = (await readOrders()).map(sanitizeAdminOrder);
  const messages = await readJsonFile(CONTACT_FILE, []);
  const subscribers = await readJsonFile(NEWSLETTER_FILE, []);
  const authEvents = await readJsonFile(AUTH_EVENTS_FILE, []);
  const verificationCodes = (await readJsonFile(VERIFICATION_FILE, [])).map(publicVerificationCode);
  const siteEvents = await readJsonFile(SITE_EVENTS_FILE, []);
  const products = (await loadProductCatalog()).map(publicProduct);
  const allData = buildAllDataBundle({ orders, users, messages, subscribers, authEvents, verificationCodes, siteEvents, products });

  return sendJson(res, 200, {
    success: true,
    database: {
      connected: true,
      engine: 'MongoDB',
      name: databaseName(),
      file: null,
      tables: ['orders', 'users', 'contact_messages', 'newsletter', 'auth_events', 'verification_codes', 'site_events', 'products'],
      sourceOfTruth: 'MongoDB Atlas'
    },
    counts: {
      orders: orders.length,
      confirmedOrders: orders.filter(order => order.status === 'confirmed').length,
      pendingOrders: orders.filter(order => ['pending', 'created'].includes(order.status)).length,
      users: users.length,
      customers: users.filter(user => user.role === 'customer').length,
      admins: users.filter(user => user.role === 'admin').length,
      messages: messages.length,
      subscribers: subscribers.length,
      authEvents: authEvents.length,
      verificationCodes: verificationCodes.length,
      pendingOtps: verificationCodes.filter(item => item.status === 'pending').length,
      siteEvents: siteEvents.length,
      products: products.length,
      orderValue: Number(orders.reduce((sum, order) => sum + Number(order.amount || 0), 0).toFixed(2))
    },
    orders,
    users,
    messages,
    subscribers,
    authEvents,
    verificationCodes,
    siteEvents,
    allData,
    products
  });
}

async function handleAdminExport(res, type, format) {
  const datasets = {
    orders: (await readOrders()).map(sanitizeAdminOrder),
    users: (await readJsonFile(USERS_FILE, [])).map(publicUser),
    messages: await readJsonFile(CONTACT_FILE, []),
    subscribers: await readJsonFile(NEWSLETTER_FILE, []),
    authEvents: await readJsonFile(AUTH_EVENTS_FILE, []),
    verificationCodes: (await readJsonFile(VERIFICATION_FILE, [])).map(publicVerificationCode),
    siteEvents: await readJsonFile(SITE_EVENTS_FILE, []),
    products: (await loadProductCatalog()).map(publicProduct)
  };

  datasets.all = buildAllDataBundle({
    orders: datasets.orders,
    users: datasets.users,
    messages: datasets.messages,
    subscribers: datasets.subscribers,
    authEvents: datasets.authEvents,
    verificationCodes: datasets.verificationCodes,
    siteEvents: datasets.siteEvents,
    products: datasets.products
  });

  const data = datasets[type];
  if (!data) return sendJson(res, 404, { success: false, message: 'Unknown export type' });

  if (format === 'csv') {
    const csv = toCsv(type === 'all' ? flattenAllDataForCsv(data) : data);
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="oravel-${type}.csv"`
    });
    return res.end(csv);
  }

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="oravel-${type}.json"`
  });
  return res.end(JSON.stringify(data, null, 2));
}

function createAdminToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, role: 'admin', iat: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function requireAdmin(req, res) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!verifyAdminToken(token)) {
    sendJson(res, 401, { success: false, message: 'Admin login required' });
    return null;
  }
  return true;
}

function verifyAdminToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return false;

  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const tokenAgeMs = Date.now() - Number(data.iat || 0);
    return data.role === 'admin' && tokenAgeMs >= 0 && tokenAgeMs < 1000 * 60 * 60 * 12;
  } catch {
    return false;
  }
}

function sanitizeAdminOrder(order) {
  const display = normalizeOrderForDisplay(order);
  return {
    ...order,
    trackingId: order.trackingId || order.id,
    statusLabel: display.statusLabel,
    paymentStatus: display.payment.status,
    paymentStatusLabel: display.payment.statusLabel,
    customerName: order.customer?.name || '',
    customerPhone: order.customer?.phone || '',
    customerEmail: order.customer?.email || '',
    itemCount: Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0
  };
}

async function handleAdminOrderStatusUpdate(res, body) {
  const orderId = cleanOrderId(body.orderId);
  const status = String(body.status || '').toLowerCase().trim();
  const paymentStatus = String(body.paymentStatus || '').toLowerCase().trim();
  const allowedStatuses = ['created', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
  const allowedPaymentStatuses = ['unpaid', 'paid'];

  if (!orderId) return sendJson(res, 400, { success: false, message: 'Order ID is required' });
  if (!allowedStatuses.includes(status)) return sendJson(res, 400, { success: false, message: 'Invalid order status' });
  if (!allowedPaymentStatuses.includes(paymentStatus)) return sendJson(res, 400, { success: false, message: 'Invalid payment status' });

  const existing = await getOrder(orderId);
  if (!existing) return sendJson(res, 404, { success: false, message: 'Order not found' });

  const amount = Number(existing.amount || 0);
  const paid = paymentStatus === 'paid';
  const payment = {
    method: 'cod',
    methodLabel: 'Cash on Delivery',
    status: paymentStatus,
    statusLabel: paid ? 'Paid on Delivery' : 'Due on Delivery',
    paidAmount: paid ? amount : 0,
    dueAmount: paid ? 0 : amount
  };

  const updated = await updateOrder(existing.id, {
    status,
    statusLabel: formatOrderStatus(status),
    collectionStatus: paid ? 'collected' : 'due_on_delivery',
    payment,
    updatedAt: new Date().toISOString()
  });

  await recordAuthEvent('order_status_updated', {
    orderId: existing.id,
    trackingId: existing.trackingId || existing.id,
    status,
    paymentStatus
  });

  return sendJson(res, 200, { success: true, order: sanitizeAdminOrder(updated) });
}

function toCsv(rows) {
  if (!rows.length) return '';
  const flatRows = rows.map(row => flattenObject(row));
  const headers = Array.from(new Set(flatRows.flatMap(row => Object.keys(row))));
  const escape = value => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(','), ...flatRows.map(row => headers.map(key => escape(row[key])).join(','))].join('\n');
}

function flattenObject(value, prefix = '', result = {}) {
  if (Array.isArray(value)) {
    result[prefix || 'items'] = JSON.stringify(value);
    return result;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flattenObject(child, prefix ? `${prefix}.${key}` : key, result);
    }
    return result;
  }
  result[prefix] = value;
  return result;
}

function handleSignup(res, body) {
  return sendJson(res, 400, {
    success: false,
    message: 'Signup now requires OTP verification. Use /api/auth/signup/request-code then /api/auth/signup/verify.'
  });
}

async function handleSignupRequestCode(res, body) {
  const name = String(body.name || '').trim();
  const phone = normalizeBDPhone(body.phone);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const channel = normalizeOtpChannel(body.channel);

  if (!name) return sendJson(res, 400, { success: false, message: 'Full name is required' });
  if (!phone) return sendJson(res, 400, { success: false, message: 'Valid Bangladesh phone number is required' });
  if (!isValidEmail(email)) return sendJson(res, 400, { success: false, message: 'Valid email is required' });
  if (password.length < 6) return sendJson(res, 400, { success: false, message: 'Password must be at least 6 characters' });
  if (!channel) return sendJson(res, 400, { success: false, message: 'Choose email or phone verification' });

  const users = await readJsonFile(USERS_FILE, []);
  if (users.some(user => user.email === email)) {
    return sendJson(res, 409, { success: false, message: 'An account with this email already exists' });
  }
  if (users.some(user => user.phone === phone)) {
    return sendJson(res, 409, { success: false, message: 'An account with this phone already exists' });
  }

  const destination = channel === 'email' ? email : phone;
  const code = generateOtpCode();
  const verification = createVerificationRecord({
    purpose: 'signup',
    channel,
    destination,
    email,
    phone,
    data: { name, phone, email, passwordHash: hashPassword(password), role: 'customer' },
    code
  });

  const delivery = await deliverOtpCode(verification, code);
  if (!delivery.sent) {
    verification.status = 'delivery_failed';
    verification.lastError = delivery.message;
    await saveVerificationRecord(verification);
    await recordAuthEvent('signup_code_delivery_failed', { email, phone, channel, destination, verificationId: verification.id, message: delivery.message });
    return sendJson(res, 503, {
      success: false,
      message: delivery.message,
      channel,
      destination: maskDestination(destination, channel)
    });
  }

  await saveVerificationRecord(verification);
  await recordAuthEvent('signup_code_requested', { email, phone, channel, destination, verificationId: verification.id, simulated: !!delivery.simulated });

  return sendJson(res, 200, {
    success: true,
    message: delivery.message,
    channel,
    destination: maskDestination(destination, channel),
    expiresAt: verification.expiresAt,
    verificationId: verification.id,
    devCode: delivery.devCode
  });
}

async function handleSignupVerify(res, body) {
  const email = normalizeEmail(body.email);
  const phone = normalizeBDPhone(body.phone);
  const code = String(body.code || '').trim();

  if (!isValidEmail(email) && !phone) {
    return sendJson(res, 400, { success: false, message: 'Email or phone is required' });
  }
  if (!/^\d{6}$/.test(code)) return sendJson(res, 400, { success: false, message: 'Enter the 6 digit verification code' });

  const verify = await verifyOtpCode({ purpose: 'signup', email, phone, code });
  if (!verify.valid) return sendJson(res, 400, { success: false, message: verify.message });

  const payload = verify.record.data || {};
  const users = await readJsonFile(USERS_FILE, []);
  if (users.some(user => user.email === payload.email)) {
    await markVerificationUsed(verify.record.id, 'rejected_existing_email');
    return sendJson(res, 409, { success: false, message: 'An account with this email already exists' });
  }
  if (users.some(user => user.phone === payload.phone)) {
    await markVerificationUsed(verify.record.id, 'rejected_existing_phone');
    return sendJson(res, 409, { success: false, message: 'An account with this phone already exists' });
  }

  const user = {
    id: `USR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    passwordHash: payload.passwordHash,
    role: payload.role || 'customer',
    emailVerified: verify.record.channel === 'email' || Boolean(payload.emailVerified),
    phoneVerified: verify.record.channel === 'phone' || Boolean(payload.phoneVerified),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await collection('users').insertOne({ ...user });
  } catch (error) {
    if (error.code !== 11000) throw error;
    await markVerificationUsed(verify.record.id, 'rejected_existing_account');
    return sendJson(res, 409, { success: false, message: 'An account with this email or phone already exists' });
  }
  await markVerificationUsed(verify.record.id, 'used');
  await recordAuthEvent('signup_verified', { userId: user.id, name: user.name, phone: user.phone, email: user.email, channel: verify.record.channel, role: user.role });

  return sendJson(res, 201, { success: true, user: publicUser(user), token: createAuthToken(user) });
}

async function handlePasswordResetRequest(res, body) {
  const channel = normalizeOtpChannel(body.channel);
  const identifier = String(body.identifier || '').trim();
  const email = normalizeEmail(identifier);
  const phone = normalizeBDPhone(identifier);
  const users = await readJsonFile(USERS_FILE, []);

  if (!channel) return sendJson(res, 400, { success: false, message: 'Choose email or phone reset method' });

  const user = channel === 'email'
    ? users.find(item => item.email === email && item.role !== 'admin')
    : users.find(item => item.phone === phone && item.role !== 'admin');

  if (!user) {
    await recordAuthEvent('password_reset_request_failed', { identifier, channel });
    return sendJson(res, 404, { success: false, message: channel === 'email' ? 'No account found with this email' : 'No account found with this phone number' });
  }

  const destination = channel === 'email' ? user.email : user.phone;
  const code = generateOtpCode();
  const verification = createVerificationRecord({
    purpose: 'password_reset',
    channel,
    destination,
    email: user.email,
    phone: user.phone,
    userId: user.id,
    data: { userId: user.id, email: user.email, phone: user.phone },
    code
  });

  const delivery = await deliverOtpCode(verification, code);
  if (!delivery.sent) {
    verification.status = 'delivery_failed';
    verification.lastError = delivery.message;
    await saveVerificationRecord(verification);
    await recordAuthEvent('password_reset_code_delivery_failed', { userId: user.id, email: user.email, phone: user.phone, channel, destination, verificationId: verification.id, message: delivery.message });
    return sendJson(res, 503, {
      success: false,
      message: delivery.message,
      channel,
      destination: maskDestination(destination, channel)
    });
  }

  await saveVerificationRecord(verification);
  await recordAuthEvent('password_reset_code_requested', { userId: user.id, email: user.email, phone: user.phone, channel, destination, verificationId: verification.id, simulated: !!delivery.simulated });

  return sendJson(res, 200, {
    success: true,
    message: delivery.message,
    channel,
    destination: maskDestination(destination, channel),
    expiresAt: verification.expiresAt,
    verificationId: verification.id,
    devCode: delivery.devCode
  });
}

async function handlePasswordResetVerify(res, body) {
  const identifier = String(body.identifier || '').trim();
  const email = normalizeEmail(identifier);
  const phone = normalizeBDPhone(identifier);
  const code = String(body.code || '').trim();
  const newPassword = String(body.newPassword || '');

  if (!isValidEmail(email) && !phone) return sendJson(res, 400, { success: false, message: 'Enter the email or phone linked to your account' });
  if (!/^\d{6}$/.test(code)) return sendJson(res, 400, { success: false, message: 'Enter the 6 digit reset code' });
  if (newPassword.length < 6) return sendJson(res, 400, { success: false, message: 'New password must be at least 6 characters' });

  const verify = await verifyOtpCode({ purpose: 'password_reset', email, phone, code });
  if (!verify.valid) return sendJson(res, 400, { success: false, message: verify.message });

  const users = await readJsonFile(USERS_FILE, []);
  const index = users.findIndex(user => user.id === verify.record.userId && user.role !== 'admin');
  if (index === -1) return sendJson(res, 404, { success: false, message: 'Account not found' });

  users[index] = {
    ...users[index],
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString()
  };
  await collection('users').updateOne({ id: users[index].id }, { $set: { passwordHash: users[index].passwordHash, updatedAt: users[index].updatedAt } });
  await markVerificationUsed(verify.record.id, 'used');
  await recordAuthEvent('password_reset_success', { userId: users[index].id, email: users[index].email, phone: users[index].phone, channel: verify.record.channel });

  return sendJson(res, 200, { success: true, message: 'Password updated successfully. You can login now.' });
}


async function handleLogin(res, body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const user = await collection('users').findOne({ email }, { projection: { _id: 0 } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    await recordAuthEvent('login_failed', { email });
    return sendJson(res, 401, { success: false, message: 'Invalid email or password' });
  }

  await recordAuthEvent('login_success', { userId: user.id, name: user.name, email: user.email, role: user.role || 'customer' });
  return sendJson(res, 200, { success: true, user: publicUser(user), token: createAuthToken(user) });
}

async function handleContactMessage(res, body) {
  const message = {
    id: `MSG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    name: String(body.name || '').trim(),
    phone: normalizeBDPhone(body.phone),
    email: normalizeEmail(body.email),
    topic: String(body.topic || '').trim(),
    message: String(body.message || '').trim(),
    createdAt: new Date().toISOString()
  };

  if (!message.name) return sendJson(res, 400, { success: false, message: 'Name is required' });
  if (!message.phone) return sendJson(res, 400, { success: false, message: 'Valid Bangladesh phone number is required' });
  if (message.email && !isValidEmail(message.email)) return sendJson(res, 400, { success: false, message: 'Valid email is required' });
  if (!message.topic) return sendJson(res, 400, { success: false, message: 'Topic is required' });
  if (!message.message) return sendJson(res, 400, { success: false, message: 'Message is required' });

  await collection('contact_messages').insertOne({ ...message });
  await recordAuthEvent('contact_message', { ticketId: message.id, name: message.name, phone: message.phone, email: message.email, topic: message.topic });

  return sendJson(res, 201, { success: true, message: 'Message saved successfully', ticketId: message.id });
}

async function handleNewsletter(res, body) {
  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) return sendJson(res, 400, { success: false, message: 'Valid email is required' });

  const result = await collection('newsletter').updateOne({ email }, { $setOnInsert: { email, createdAt: new Date().toISOString() } }, { upsert: true });
  if (result.upsertedCount) await recordAuthEvent('newsletter_subscribe', { email });

  return sendJson(res, 200, { success: true, message: 'Subscribed successfully' });
}

async function handleSiteEvent(res, body, req) {
  const eventType = String(body.eventType || body.type || '').trim().slice(0, 80);
  if (!eventType) return sendJson(res, 400, { success: false, message: 'eventType is required' });

  const event = {
    id: `SEV-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    eventType,
    page: String(body.page || '').slice(0, 220),
    label: String(body.label || '').slice(0, 220),
    category: String(body.category || '').slice(0, 80),
    productId: String(body.productId || '').slice(0, 40),
    userId: String(body.userId || '').slice(0, 80),
    email: normalizeEmail(body.email || ''),
    details: typeof body.details === 'object' && body.details ? body.details : {},
    userAgent: String(req.headers['user-agent'] || '').slice(0, 320),
    createdAt: new Date().toISOString()
  };

  await collection('site_events').insertOne({ ...event });

  return sendJson(res, 201, { success: true, eventId: event.id });
}

function buildAllDataBundle(data) {
  return {
    generatedAt: new Date().toISOString(),
    store: 'Oravel Lifestyle',
    database: { engine: 'MongoDB', name: databaseName(), file: null },
    counts: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    ...data
  };
}

function flattenAllDataForCsv(bundle) {
  const rows = [];
  const collections = ['orders', 'users', 'messages', 'subscribers', 'authEvents', 'verificationCodes', 'siteEvents', 'products'];
  for (const collection of collections) {
    const items = Array.isArray(bundle[collection]) ? bundle[collection] : [];
    for (const item of items) rows.push({ collection, ...flattenObject(item) });
  }
  return rows;
}


function publicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || product.originalPrice || 0),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    inStock: Boolean(product.inStock),
    badge: product.badge || '',
    image: product.image || ''
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role || 'customer',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt || user.createdAt,
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified)
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = String(storedHash || '').split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(originalHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createAuthToken(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, iat: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAuthToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return null;

  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const tokenAgeMs = Date.now() - Number(data.iat || 0);
    const maxAgeMs = 1000 * 60 * 60 * 24 * 30;
    if (!data.id || tokenAgeMs < 0 || tokenAgeMs > maxAgeMs) return null;
    return data;
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await collection('users').findOne({ id: payload.id, email: payload.email }, { projection: { _id: 0 } });
  return user || null;
}

async function requireCustomer(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    sendJson(res, 401, { success: false, message: 'Please login again to view your orders' });
    return null;
  }
  return user;
}

function normalizeOtpChannel(channel) {
  const value = String(channel || '').toLowerCase().trim();
  return ['email', 'phone'].includes(value) ? value : '';
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtpCode(code) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(String(code)).digest('hex');
}

function createVerificationRecord({ purpose, channel, destination, email, phone, userId = '', data = {}, code }) {
  const now = new Date();
  const expiryMinutes = Math.max(2, Math.min(60, Number(process.env.OTP_EXPIRY_MINUTES || 10)));
  const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();
  return {
    id: `OTP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    purpose,
    channel,
    destination,
    email: normalizeEmail(email),
    phone: normalizeBDPhone(phone),
    userId,
    codeHash: hashOtpCode(code),
    attempts: 0,
    maxAttempts: 5,
    status: 'pending',
    data,
    expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

async function saveVerificationRecord(record) {
  const codes = collection('verification_codes');
  const now = new Date().toISOString();
  if (record.status === 'pending') {
    // One active code per purpose/channel/destination. A unique partial index enforces this across instances.
    await codes.updateMany({ status: 'pending', purpose: record.purpose, destination: record.destination }, { $set: { status: 'replaced', updatedAt: now } });
  }
  await codes.updateMany({ status: 'pending', expiresAt: { $lt: now } }, { $set: { status: 'expired', updatedAt: now } });
  await codes.insertOne({ ...record });
}

async function verifyOtpCode({ purpose, email, phone, code }) {
  const codes = collection('verification_codes');
  const candidates = [normalizeEmail(email), normalizeBDPhone(phone)].filter(Boolean);
  const record = await codes.findOne({ purpose, status: 'pending', destination: { $in: candidates } }, { sort: { createdAt: -1 }, projection: { _id: 0 } });
  if (!record) return { valid: false, message: 'Verification code was not found. Request a new code.' };
  const now = new Date().toISOString();
  const filter = { id: record.id, status: 'pending', attempts: record.attempts };
  if (record.expiresAt < now) {
    await codes.updateOne(filter, { $set: { status: 'expired', updatedAt: now } });
    return { valid: false, message: 'Verification code expired. Request a new code.' };
  }
  const attempts = Number(record.attempts || 0) + 1;
  const correct = record.codeHash === hashOtpCode(code);
  const status = correct ? 'verified' : attempts >= Number(record.maxAttempts || 5) ? 'locked' : 'pending';
  const updated = await codes.findOneAndUpdate(filter, { $set: { attempts, status, updatedAt: now } }, { returnDocument: 'after', projection: { _id: 0 } });
  if (!updated) return { valid: false, message: 'Code state changed. Please try again.' };
  if (!correct) return { valid: false, message: status === 'locked' ? 'Too many wrong attempts. Request a new code.' : 'Wrong verification code.' };
  return { valid: true, record: updated };
}

async function markVerificationUsed(id, status = 'used') {
  await collection('verification_codes').updateOne({ id }, { $set: { status, updatedAt: new Date().toISOString() } });
}

function isDevReturnCodeEnabled() {
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production' && String(process.env.OTP_DEV_RETURN_CODE || 'false').toLowerCase() === 'true';
}

function isIncludeCodeWhenSentEnabled() {
  return !process.env.VERCEL && process.env.NODE_ENV !== 'production' && String(process.env.OTP_INCLUDE_CODE_WHEN_SENT || 'false').toLowerCase() === 'true';
}

async function deliverOtpCode(record, code) {
  const deliveryTarget = record.channel === 'email' ? 'email' : 'phone';
  const devFallback = isDevReturnCodeEnabled();

  if (record.channel === 'email' && !hasEmailDelivery()) {
    if (devFallback) {
      return {
        sent: true,
        simulated: true,
        devCode: code,
        message: 'DEV MODE: SMTP is not configured, so this code was not actually emailed. Returned here for local testing only.'
      };
    }
    return {
      sent: false,
      message: 'Real email OTP is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env, then restart the server.'
    };
  }

  if (record.channel === 'phone' && !hasSmsDelivery()) {
    if (devFallback) {
      return {
        sent: true,
        simulated: true,
        devCode: code,
        message: 'DEV MODE: SMS gateway is not configured, so this code was not actually texted. Returned here for local testing only.'
      };
    }
    return {
      sent: false,
      message: 'Real phone OTP is not configured. Add SMS_API_URL and SMS_API_TOKEN in .env, then restart the server.'
    };
  }

  try {
    const sent = record.channel === 'email'
      ? await sendEmailOtp(record.destination, code, record.purpose)
      : await sendSmsOtp(record.destination, code, record.purpose);

    if (!sent) {
      return {
        sent: false,
        message: `OTP could not be sent to your ${deliveryTarget}. Check your ${deliveryTarget === 'email' ? 'SMTP' : 'SMS gateway'} settings.`
      };
    }

    return {
      sent: true,
      message: `Verification code sent to your ${deliveryTarget}.`,
      devCode: isIncludeCodeWhenSentEnabled() ? code : undefined
    };
  } catch (error) {
    return {
      sent: false,
      message: `OTP delivery failed: ${error.message}`
    };
  }
}

async function sendEmailOtp(to, code, purpose) {
  if (!hasEmailDelivery()) return false;
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const subject = purpose === 'password_reset' ? 'Oravel Lifestyle password reset code' : 'Oravel Lifestyle signup verification code';
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
      <h2>Oravel Lifestyle Verification</h2>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
      <p>This code expires in ${Number(process.env.OTP_EXPIRY_MINUTES || 10)} minutes.</p>
      <p>If you did not request this code, ignore this email.</p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: `Your Oravel Lifestyle verification code is ${code}. It expires in ${Number(process.env.OTP_EXPIRY_MINUTES || 10)} minutes.`,
    html
  });
  return true;
}

async function sendSmsOtp(phone, code, purpose) {
  if (!hasSmsDelivery()) return false;
  const body = JSON.stringify({
    to: phone,
    message: `Your Oravel Lifestyle ${purpose === 'password_reset' ? 'password reset' : 'signup'} code is ${code}. It expires in ${Number(process.env.OTP_EXPIRY_MINUTES || 10)} minutes.`
  });
  const response = await fetch(process.env.SMS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.SMS_API_TOKEN ? `Bearer ${process.env.SMS_API_TOKEN}` : ''
    },
    body
  });
  if (!response.ok) throw new Error(`SMS API failed with ${response.status}`);
  return true;
}

function hasEmailDelivery() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function hasSmsDelivery() {
  return Boolean(process.env.SMS_API_URL);
}

function isAssistantVisible() {
  return String(process.env.AI_ASSISTANT_VISIBLE || 'true').toLowerCase() !== 'false';
}

function getOpenAIApiKey() {
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  return key.length > 20 ? key : '';
}

function getAssistantProvider() {
  return getOpenAIApiKey() ? 'openai' : null;
}

function hasAssistantDelivery() {
  return Boolean(getOpenAIApiKey());
}

function getAssistantModel() {
  return String(process.env.OPENAI_MODEL || 'gpt-5.4-mini').trim();
}

function getWhatsappNumber() {
  const raw = String(process.env.WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
  return raw || null;
}

function maskDestination(destination, channel) {
  const value = String(destination || '');
  if (channel === 'email') {
    const [name, domain] = value.split('@');
    if (!domain) return value;
    return `${name.slice(0, 2)}***@${domain}`;
  }
  if (value.length >= 6) return `${value.slice(0, 3)}****${value.slice(-3)}`;
  return value;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

async function createOrder(req, res, body) {
  const ip = getClientIp(req);
  const rateLimit = checkOrderRateLimit(ip);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return sendJson(res, 429, {
      success: false,
      message: `Too many order attempts. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`
    });
  }

  const method = String(body.method || 'cod').toLowerCase().trim();
  if (method !== 'cod') {
    return sendJson(res, 400, { success: false, message: 'Only Cash on Delivery is available' });
  }

  const customer = validateCustomer(body.customer || {});
  if (!customer.valid) {
    return sendJson(res, 400, { success: false, message: customer.message });
  }

  const orderDetails = await buildOrderDetails(body.items || []);
  if (!orderDetails.valid) {
    return sendJson(res, 400, { success: false, message: orderDetails.message });
  }

  const orderId = generateOrderId();
  const trackingId = generateTrackingId();
  const authenticatedUser = await getAuthenticatedUser(req);
  const now = new Date().toISOString();
  const amount = Number(orderDetails.total.toFixed(2));
  const order = {
    id: orderId,
    trackingId,
    userId: authenticatedUser?.id || null,
    method: 'cod',
    methodLabel: 'Cash on Delivery',
    status: 'confirmed',
    statusLabel: 'Order Confirmed',
    collectionStatus: 'due_on_delivery',
    amount,
    currency: 'BDT',
    subtotal: orderDetails.subtotal,
    shipping: orderDetails.shipping,
    payment: {
      method: 'cod',
      methodLabel: 'Cash on Delivery',
      status: 'unpaid',
      statusLabel: 'Due on Delivery',
      paidAmount: 0,
      dueAmount: amount
    },
    items: orderDetails.items,
    customer: customer.data,
    createdAt: now,
    updatedAt: now
  };

  await saveOrder(order);
  await recordAuthEvent('order_created', {
    orderId: order.id,
    method: order.method,
    amount: order.amount,
    email: order.customer.email,
    phone: order.customer.phone,
    ip
  });

  return sendJson(res, 201, {
    success: true,
    orderId: order.id,
    trackingId: order.trackingId,
    amount: order.amount,
    method: order.method,
    status: order.status,
    redirectUrl: `/order-success?orderId=${encodeURIComponent(order.id)}`
  });
}

async function buildOrderDetails(items) {
  const catalog = await loadProductCatalog();
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Cart is empty' };
  }

  const resultItems = [];
  let subtotal = 0;

  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Math.max(1, Math.min(99, Number.parseInt(item.quantity, 10) || 1));
    const product = catalog.find(p => Number(p.id) === productId);

    if (!product || !product.inStock) {
      return { valid: false, message: 'One or more products are unavailable' };
    }

    const lineTotal = Number(product.price) * quantity;
    subtotal += lineTotal;
    resultItems.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.image || '',
      price: Number(product.price),
      quantity,
      lineTotal
    });
  }

  const shipping = subtotal >= 5000 ? 0 : 120;
  const total = subtotal + shipping;

  return { valid: true, subtotal, shipping, total, items: resultItems };
}

function readSeedCatalog() {
  const code = fs.readFileSync(path.join(ROOT, 'catalog.js'), 'utf8');
  const sandbox = { window: {}, console };
  vm.runInNewContext(code, sandbox, { timeout: 1000 });
  return sandbox.window.products || [];
}

async function seedProducts() {
  const products = readSeedCatalog();
  if (!products.length) throw new Error('Product catalog is empty');
  await collection('products').bulkWrite(products.map(product => ({ updateOne: { filter: { id: product.id }, update: { $set: { ...product } }, upsert: true } })));
}

async function loadProductCatalog() {
  return collection('products').find({ id: { $in: readSeedCatalog().map(product => product.id) } }, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
}

let catalogSummaryCache = null;
let catalogSummaryCacheAt = 0;
const CATALOG_SUMMARY_CACHE_MS = 5 * 60 * 1000; // 5 minutes

async function getCatalogSummaryForAssistant() {
  const now = Date.now();
  if (catalogSummaryCache && (now - catalogSummaryCacheAt) < CATALOG_SUMMARY_CACHE_MS) {
    return catalogSummaryCache;
  }
  const catalog = await loadProductCatalog();
  catalogSummaryCache = catalog
    .map(p => `- ${p.name} | category: ${p.category} | price: BDT ${Number(p.price)} | ${p.inStock ? 'in stock' : 'out of stock'}`)
    .join('\n');
  catalogSummaryCacheAt = now;
  return catalogSummaryCache;
}

function validateCustomer(customer) {
  const data = {
    name: String(customer.name || '').trim(),
    phone: normalizeBDPhone(customer.phone),
    email: String(customer.email || '').trim(),
    division: String(customer.division || '').trim(),
    city: String(customer.city || '').trim(),
    address: String(customer.address || '').trim(),
    postal: String(customer.postal || '').trim()
  };

  if (!data.name) return { valid: false, message: 'Customer name is required' };
  if (!data.phone) return { valid: false, message: 'Valid Bangladesh phone number is required' };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { valid: false, message: 'Valid email is required' };
  if (!data.division) return { valid: false, message: 'Division is required' };
  if (!data.city) return { valid: false, message: 'City is required' };
  if (!data.address) return { valid: false, message: 'Address is required' };

  return { valid: true, data };
}

function normalizeBDPhone(phone) {
  let cleaned = String(phone || '').replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+88')) cleaned = cleaned.slice(3);
  if (cleaned.startsWith('88')) cleaned = cleaned.slice(2);
  return /^01[3-9]\d{8}$/.test(cleaned) ? cleaned : '';
}

function cleanOrderId(value) {
  const cleaned = String(value || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  return cleaned || '';
}

function generateOrderId() {
  return `OL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

function generateTrackingId() {
  return `TRK-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function getOrder(orderRef) {
  const ref = cleanOrderId(orderRef);
  if (!ref) return null;
  return collection('orders').findOne({ $or: [{ id: ref }, { trackingId: ref }] }, { projection: { _id: 0 } });
}

async function saveOrder(order) {
  await collection('orders').insertOne({ ...order });
}

async function updateOrder(orderId, patch) {
  return collection('orders').findOneAndUpdate({ id: orderId }, { $set: patch }, { returnDocument: 'after', projection: { _id: 0 } });
}

const collectionNames = new Map([
  [USERS_FILE, 'users'], [CONTACT_FILE, 'contact_messages'],
  [NEWSLETTER_FILE, 'newsletter'], [AUTH_EVENTS_FILE, 'auth_events'],
  [VERIFICATION_FILE, 'verification_codes'], [SITE_EVENTS_FILE, 'site_events']
]);

async function readJsonFile(filePath) {
  const name = collectionNames.get(filePath);
  if (!name) throw new Error('Unknown collection');
  return collection(name).find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
}

async function readOrders() {
  return collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
}

function normalizeOrderForDisplay(order) {
  const amount = Number(order.amount || 0);
  const payment = order.payment || {
    method: order.method || 'cod',
    methodLabel: order.methodLabel || 'Cash on Delivery',
    status: order.collectionStatus === 'collected' ? 'paid' : 'unpaid',
    statusLabel: order.collectionStatus === 'collected' ? 'Paid' : 'Due on Delivery',
    paidAmount: order.collectionStatus === 'collected' ? amount : 0,
    dueAmount: order.collectionStatus === 'collected' ? 0 : amount
  };

  return {
    id: order.id,
    trackingId: order.trackingId || order.id,
    method: order.method || 'cod',
    methodLabel: order.methodLabel || 'Cash on Delivery',
    status: order.status || 'confirmed',
    statusLabel: order.statusLabel || formatOrderStatus(order.status || 'confirmed'),
    collectionStatus: order.collectionStatus || 'due_on_delivery',
    amount,
    currency: order.currency || 'BDT',
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    payment: {
      method: payment.method || 'cod',
      methodLabel: payment.methodLabel || 'Cash on Delivery',
      status: payment.status || 'unpaid',
      statusLabel: payment.statusLabel || 'Due on Delivery',
      paidAmount: Number(payment.paidAmount || 0),
      dueAmount: Number(payment.dueAmount ?? amount)
    },
    items: Array.isArray(order.items) ? order.items.map(item => ({
      productId: item.productId,
      name: item.name || 'Product',
      category: item.category || '',
      image: item.image || '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: Number(item.lineTotal || 0)
    })) : [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function formatOrderStatus(status) {
  const labels = {
    created: 'Order Created',
    pending: 'Pending Confirmation',
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned'
  };
  return labels[String(status || '').toLowerCase()] || String(status || 'Confirmed');
}

function sanitizePublicOrder(order) {
  return normalizeOrderForDisplay(order);
}

function sanitizeCustomerOrder(order) {
  return {
    ...normalizeOrderForDisplay(order),
    customer: {
      name: order.customer?.name || '',
      phone: order.customer?.phone || '',
      email: order.customer?.email || '',
      division: order.customer?.division || '',
      city: order.customer?.city || '',
      address: order.customer?.address || '',
      postal: order.customer?.postal || ''
    }
  };
}

function orderBelongsToUser(order, user) {
  if (order.userId && order.userId === user.id) return true;
  const orderEmail = normalizeEmail(order.customer?.email || '');
  const userEmail = normalizeEmail(user.email || '');
  const orderPhone = normalizeBDPhone(order.customer?.phone || '');
  const userPhone = normalizeBDPhone(user.phone || '');
  const emailMatch = Boolean(user.emailVerified && orderEmail && userEmail && orderEmail === userEmail);
  const phoneMatch = Boolean(user.phoneVerified && orderPhone && userPhone && orderPhone === userPhone);
  return emailMatch || phoneMatch;
}

async function handleCustomerOrders(res, user) {
  const orders = (await readOrders())
    .filter(order => orderBelongsToUser(order, user))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map(sanitizeCustomerOrder);
  return sendJson(res, 200, { success: true, orders });
}

async function handleCustomerOrderDetail(res, user, orderRef) {
  const order = await getOrder(orderRef);
  if (!order || !orderBelongsToUser(order, user)) {
    return sendJson(res, 404, { success: false, message: 'Order not found in your account' });
  }
  return sendJson(res, 200, { success: true, order: sanitizeCustomerOrder(order) });
}

function hasAdminCredentials() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || '');
  const blockedPasswords = new Set(['admin12345', 'replace-with-a-strong-password', 'password', 'changeme']);
  return isValidEmail(email) && password.length >= 12 && !blockedPasswords.has(password.toLowerCase());
}

async function ensureAdminUser() {
  if (!hasAdminCredentials()) return;
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD);
  const users = collection('users');
  const existing = await users.findOne({ email });
  if (existing && existing.role !== 'admin') throw new Error('ADMIN_EMAIL belongs to an existing customer. Choose a separate admin email.');
  if (existing && verifyPassword(password, existing.passwordHash)) return;
  const now = new Date().toISOString();
  await users.updateOne({ email, role: 'admin' }, {
    $set: { email, name: 'Oravel Admin', passwordHash: hashPassword(password), role: 'admin', emailVerified: true, updatedAt: now },
    $setOnInsert: { id: `ADMIN-${crypto.randomUUID()}`, phone: '', phoneVerified: false, createdAt: now }
  }, { upsert: true });
}

async function recordAuthEvent(eventType, details = {}) {
  try {
    await collection('auth_events').insertOne({
      id: `EVT-${crypto.randomUUID()}`, eventType, userId: details.userId || '',
      email: normalizeEmail(details.email || ''), details, createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn(`Could not save activity event: ${safeError(error)}`);
  }
}

function publicVerificationCode(record) {
  const { codeHash, data, ...safe } = record || {};
  return {
    ...safe,
    destinationMasked: maskDestination(record?.destination || '', record?.channel || ''),
    hasSignupPayload: Boolean(data && data.email)
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const raw = trimmed.slice(index + 1).trim();
    const value = raw.replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && !Buffer.isBuffer(req.body) && typeof req.body === 'object') {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 1024 * 1024) {
      const error = new Error('Request body is too large');
      error.statusCode = 413;
      throw error;
    }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  const maxBytes = 1024 * 1024;

  const body = req.body;
  const source = typeof body === 'string' || Buffer.isBuffer(body) ? [Buffer.from(body)] : req;
  for await (const chunk of source) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      const error = new Error('Request body is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      const error = new Error('Invalid JSON request body');
      error.statusCode = 400;
      throw error;
    }
  }
  if (contentType.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw));
  return { raw };
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; connect-src 'self'");
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function safeError(error) {
  return maskSecrets(error && error.message ? error.message : String(error));
}


function isNetworkFetchError(error) {
  const msg = String((error && error.message) || '').toLowerCase();
  return msg.includes('fetch failed') || msg.includes('getaddrinfo') || msg.includes('enotfound') || msg.includes('econnrefused') || msg.includes('etimedout');
}

function maskSecrets(value) {
  return String(value || '')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[REDACTED_MONGODB_URI]')
    .replace(/sk-[A-Za-z0-9_\-]{12,}/g, '[REDACTED_OPENAI_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [REDACTED]');
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}
