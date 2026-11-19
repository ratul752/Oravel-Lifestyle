// Page template, rendered by build.mjs.
export default `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oravel Lifestyle — Premium Accessories, Lamps, Mirrors, Beauty & Lifestyle</title>
  <meta name="description" content="Oravel Lifestyle — Discover premium accessories, designer lamps, elegant mirrors, upcoming beauty products, and lifestyle essentials. Order with Cash on Delivery across Bangladesh. Free shipping over ৳5,000.">
  <meta name="keywords" content="Oravel Lifestyle, accessories, lamps, mirrors, beauty products, lifestyle, online shop, Bangladesh, cash on delivery, COD">
  <meta name="author" content="Oravel Lifestyle">
  <meta name="theme-color" content="#08080f">
  <link rel="icon" type="image/png" href="/logo.png">
  <link rel="stylesheet" href="/styles.css?v=20260821-orders-nav-2">
  <script src="/api-config.js" defer></script>
  <script src="/api-client.js" defer></script>
</head>
<body>

  <!-- ===== NAVIGATION ===== -->
  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="#home" class="nav-logo">
        <img src="/logo.webp" alt="Oravel Lifestyle Logo" width="192" height="192" decoding="async">
        <span>Oravel Lifestyle</span>
      </a>

      <div class="nav-links" id="nav-links">
        <a href="#home">Home</a>
        <a href="#categories">Categories</a>
        <a href="#best-selling">Best Selling</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#" class="mobile-auth-link" data-auth-open="login">Login</a>
        <a href="#" class="mobile-auth-link" data-auth-open="signup">Sign Up</a>
        <a href="#" class="mobile-orders-link" id="mobile-orders-link" style="display:none;">My Orders</a>
      </div>

      <div class="nav-actions">
        <button type="button" class="nav-auth-btn" id="login-btn">Login</button>
        <button type="button" class="nav-auth-btn nav-auth-primary" id="signup-btn">Sign Up</button>
        <button type="button" class="nav-account-btn" id="account-btn" style="display:none;" aria-label="Account menu">👤 <span id="account-name">Account</span></button>
        <button type="button" class="nav-orders-btn" id="orders-btn" style="display:none;" title="My Orders" aria-label="Open my orders">
          📦 <span class="orders-label">Orders</span>
          <span class="orders-badge" id="orders-badge" style="display:none;">0</span>
        </button>
        <button type="button" class="nav-cart" id="cart-icon" title="Shopping Cart" aria-label="Open shopping cart">
          🛒
          <span class="cart-badge" id="cart-badge">0</span>
        </button>
        <button type="button" class="nav-hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-links">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- ===== HERO SECTION ===== -->
  <section class="hero" id="home">
    <div class="hero-canvas"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-badge">
        <span></span>
        Premium Collection 2026
      </div>
      <h1>
        Discover the <br><span class="text-gradient">Art of Luxury</span>
      </h1>
      <p class="hero-tagline">
        Curated accessories, elegant lamps, statement mirrors, and upcoming beauty essentials — all in one extraordinary destination.
      </p>
      <div class="hero-cta">
        <a href="#categories" class="btn btn-primary btn-lg">Shop by Category</a>
        <a href="#categories" class="btn btn-secondary btn-lg">View Categories</a>
      </div>
    </div>
    <div class="scroll-indicator">
      <span>Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </section>

  <!-- ===== CATEGORIES ===== -->
  <section class="categories-section section" id="categories">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-label">Collections</span>
        <h2>Browse by <span class="text-gradient">Category</span></h2>
        <p>Choose a category to see its products directly below. No category is selected when the page first opens.</p>
      </div>

      <div class="category-link-grid" id="category-buttons" aria-label="Product categories">
        <button class="category-link-card" type="button" data-category="accessories" aria-pressed="false">
          <span class="category-link-image"><img src="/category-accessories.webp?v=original-2" alt="Accessories" width="560" height="560" loading="eager" decoding="async"></span>
          <span class="category-link-title">Accessories</span>
          <span class="category-link-text">Jewelry, watches and daily style</span>
        </button>
        <button class="category-link-card" type="button" data-category="lamps" aria-pressed="false">
          <span class="category-link-image"><img src="/category-lamps.webp?v=original-2" alt="Lamps" width="560" height="560" loading="lazy" decoding="async"></span>
          <span class="category-link-title">Lamps</span>
          <span class="category-link-text">Decorative and ambient lighting</span>
        </button>
        <button class="category-link-card" type="button" data-category="mirrors" aria-pressed="false">
          <span class="category-link-image"><img src="/category-mirrors.webp?v=original-2" alt="Mirrors" width="560" height="560" loading="lazy" decoding="async"></span>
          <span class="category-link-title">Mirrors</span>
          <span class="category-link-text">Elegant LED and decorative mirrors</span>
        </button>
        <button class="category-link-card" type="button" data-category="beauty" aria-pressed="false">
          <span class="category-link-image"><img src="/category-beauty.webp" alt="Beauty" width="560" height="560" loading="lazy" decoding="async"></span>
          <span class="category-link-title">Beauty</span>
          <span class="category-link-text">Beauty products coming soon</span>
        </button>
        <button class="category-link-card" type="button" data-category="clothes" aria-pressed="false">
          <span class="category-link-image"><img src="/category-clothes.webp" alt="Clothing" width="560" height="560" loading="lazy" decoding="async"></span>
          <span class="category-link-title">Clothing</span>
          <span class="category-link-text">Upcoming fashion collection</span>
        </button>
      </div>

      <section class="selected-category-panel" id="selected-category-panel" aria-live="polite" hidden>
        <div class="selected-category-head">
          <div>
            <span class="section-label" id="selected-category-label">Selected Category</span>
            <h3 id="selected-category-title">Category Products</h3>
            <p id="selected-category-description"></p>
          </div>
          <button class="category-close-btn" id="category-close-btn" type="button" aria-label="Close selected category">Close</button>
        </div>
        <div class="products-grid selected-category-grid" id="selected-category-grid"></div>
      </section>
    </div>
  </section>

  <!-- ===== BEST SELLING PRODUCTS ===== -->
  <section class="featured-section section" id="best-selling">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-label">Customer Favorites</span>
        <h2>Best Selling <span class="text-gradient">Products</span></h2>
        <p>Popular products selected from our most reviewed and highest-rated collections.</p>
      </div>

      <div class="featured-grid" id="best-selling-grid">
        <!-- Rendered by JavaScript -->
      </div>
    </div>
  </section>

  <!-- ===== ABOUT ===== -->
  <section class="about-section section" id="about">
    <div class="container">
      <div class="about-grid">
        <div class="about-content animate-on-scroll">
          <span class="section-label">About Us</span>
          <h2>Built for a More <span class="text-gradient">Stylish Lifestyle</span></h2>
          <p>
            Oravel Lifestyle is a modern online lifestyle store for accessories, lamps, mirrors, upcoming beauty products, and future fashion collections. We focus on products that look premium, feel useful, and match daily life in Bangladesh.
          </p>
          <p>
            Our goal is simple: make curated lifestyle products easier to find, easier to order with a simple Cash on Delivery checkout.
          </p>

          <div class="about-stats">
            <div class="stat-item animate-on-scroll">
              <div class="stat-number">500+</div>
              <div class="stat-label">Curated Products</div>
            </div>
            <div class="stat-item animate-on-scroll">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Online Store</div>
            </div>
            <div class="stat-item animate-on-scroll">
              <div class="stat-number">COD</div>
              <div class="stat-label">Cash on Delivery</div>
            </div>
          </div>

          <div class="brand-values">
            <div><strong>Quality first</strong><span>Every product is selected for design, usefulness, and value.</span></div>
            <div><strong>Simple checkout</strong><span>Cash on Delivery is the only available order method.</span></div>
            <div><strong>Customer support</strong><span>Order help, return questions, and product information in one place.</span></div>
          </div>
        </div>

        <div class="about-visual animate-on-scroll">
          <div class="about-decorative"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SERVICE INFO ===== -->
  <section class="info-section section" id="service-info">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <span class="section-label">Help & Support</span>
        <h2>Everything You Need to <span class="text-gradient">Shop Confidently</span></h2>
        <p>Clear shipping, return, order tracking, and privacy information for Oravel Lifestyle customers.</p>
      </div>

      <div class="info-grid">
        <article class="info-card animate-on-scroll" id="shipping-info">
          <div class="info-icon">🚚</div>
          <h3>Shipping Info</h3>
          <p>We deliver across Bangladesh. Standard delivery usually takes 3-5 business days after order confirmation.</p>
          <ul>
            <li>Dhaka city: faster local delivery when available</li>
            <li>Outside Dhaka: courier delivery</li>
            <li>Free shipping on orders over ৳5,000</li>
          </ul>
        </article>

        <article class="info-card animate-on-scroll" id="return-policy">
          <div class="info-icon">↩️</div>
          <h3>Return Policy</h3>
          <p>Products can be returned if they are damaged, wrong, or not matching the confirmed order.</p>
          <ul>
            <li>Contact us within 24 hours of delivery</li>
            <li>Keep the product unused with packaging</li>
            <li>Return approval is required before sending back</li>
          </ul>
        </article>

        <article class="info-card animate-on-scroll" id="faqs">
          <div class="info-icon">❔</div>
          <h3>FAQs</h3>
          <div class="faq-list">
            <details open>
              <summary>How do I pay for my order?</summary>
              <p>Cash on Delivery is the only available method. Pay the courier when your order arrives.</p>
            </details>
            <details>
              <summary>Can I order outside Dhaka?</summary>
              <p>Yes. Oravel Lifestyle can accept delivery addresses from all Bangladesh divisions.</p>
            </details>
            <details>
              <summary>When do I pay?</summary>
              <p>Pay the courier when your order is delivered.</p>
            </details>
          </div>
        </article>

        <article class="info-card animate-on-scroll" id="privacy-policy">
          <div class="info-icon">🔒</div>
          <h3>Privacy Policy</h3>
          <p>We use your name, phone, email, and address only for account access, order confirmation, delivery, support, and fraud prevention.</p>
          <ul>
            <li>No financial account details are collected</li>
            <li>Customer data is not sold</li>
            <li>Orders use Cash on Delivery only</li>
          </ul>
        </article>
      </div>
    </div>
  </section>

  <!-- ===== TRACK ORDER ===== -->
  <section class="track-section section" id="track-order">
    <div class="container">
      <div class="track-card animate-on-scroll">
        <div>
          <span class="section-label">Track Order</span>
          <h2>Check Your <span class="text-gradient">Order Status</span></h2>
          <p>Enter your Order ID or Tracking ID to see the products, payment information, total, and current order status.</p>
        </div>
        <form class="track-form" id="track-form">
          <input type="text" class="form-input" id="track-order-id" placeholder="Order ID or Tracking ID" required>
          <button type="submit" class="btn btn-primary">Track</button>
        </form>
        <div class="track-result" id="track-result" aria-live="polite"></div>
      </div>
    </div>
  </section>

  <!-- ===== CONTACT ===== -->
  <section class="contact-section section" id="contact">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-content animate-on-scroll">
          <span class="section-label">Contact</span>
          <h2>Need Help with <span class="text-gradient">Your Order?</span></h2>
          <p>Send us your question about products, orders, shipping, returns, or order tracking. We will respond as soon as possible.</p>

          <div class="contact-methods">
            <div><strong>Email</strong><span>support@oravellifestyle.com</span></div>
            <div><strong>Phone</strong><span>01XXXXXXXXX</span></div>
            <div><strong>Location</strong><span>Dhaka, Bangladesh</span></div>
          </div>
        </div>

        <form class="contact-form animate-on-scroll" id="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">Name *</label>
              <input type="text" id="contact-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone *</label>
              <input type="tel" id="contact-phone" class="form-input" placeholder="01XXXXXXXXX" required>
            </div>
          </div>
          <div class="form-group">
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" class="form-input" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label for="contact-topic">Topic *</label>
            <select id="contact-topic" class="form-input form-select" required>
              <option value="">Select topic</option>
              <option>Product Question</option>
              <option>Order Tracking</option>
              <option>Order Help</option>
              <option>Return Request</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="contact-message">Message *</label>
            <textarea id="contact-message" class="form-input" placeholder="Write your message" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
        </form>
      </div>
    </div>
  </section>

  <!-- ===== LEGAL ===== -->
  <section class="legal-section section" id="terms">
    <div class="container">
      <div class="legal-grid">
        <article class="info-card animate-on-scroll">
          <h3>Terms of Service</h3>
          <p>By using Oravel Lifestyle, customers agree to provide correct order details, pay the courier at delivery, and follow return approval instructions for eligible issues.</p>
        </article>
        <article class="info-card animate-on-scroll" id="cookies">
          <h3>Cookies</h3>
          <p>This website uses browser storage to remember cart items, account login state, and pending order information so the shopping experience works smoothly.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer class="footer" id="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="#home" class="nav-logo">
            <img src="/logo.webp" alt="Oravel Lifestyle" width="192" height="192" decoding="async" style="height:36px">
            <span>Oravel Lifestyle</span>
          </a>
          <p>Your destination for premium accessories, lamps, mirrors, with beauty products coming soon. Elevate your lifestyle with curated luxury.</p>
          <div class="footer-social">
            <a href="https://www.facebook.com/share/14kusKvwW4A/" title="Facebook">f</a>
            <a href="https://www.instagram.com/oravel.lifestyle?igsi=MWw0Mm5qYXdwYzBtNA==" title="Instagram">📷</a>
            <a href="#" title="Twitter">𝕏</a>
            <a href="#" title="YouTube">▶</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#best-selling">Best Selling</a>
          <a href="#categories">Categories</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </div>

        <div class="footer-col">
          <h4>Help & Support</h4>
          <a href="#shipping-info">Shipping Info</a>
          <a href="#return-policy">Return Policy</a>
          <a href="#faqs">FAQs</a>
          <a href="#track-order">Track Order</a>
          <a href="#privacy-policy">Privacy Policy</a>
        </div>

        <div class="footer-col">
          <h4>Stay Updated</h4>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:8px;">Subscribe for exclusive offers and new arrivals</p>
          <form class="newsletter-form" id="newsletter-form">
            <input type="email" class="newsletter-input" id="newsletter-email" placeholder="Your email address" required>
            <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Oravel Lifestyle. All rights reserved.</p>
        <div class="footer-bottom-links">
          <a href="#terms">Terms of Service</a>
          <a href="#privacy-policy">Privacy Policy</a>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- ===== CART SIDEBAR ===== -->
  <div class="cart-overlay" id="cart-overlay"></div>
  <aside class="cart-sidebar" id="cart-sidebar">
    <div class="cart-header">
      <h3>🛒 Shopping Cart <span class="cart-count">(0 items)</span></h3>
      <button type="button" class="cart-close" id="cart-close" aria-label="Close cart">✕</button>
    </div>
    <div class="cart-items" id="cart-items">
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>
    </div>
    <div class="cart-summary" id="cart-summary" style="display:none;"></div>
  </aside>

  <!-- ===== MY ORDERS MODAL ===== -->
  <div class="orders-modal" id="orders-modal" aria-hidden="true">
    <div class="orders-container" role="dialog" aria-modal="true" aria-labelledby="orders-title">
      <button type="button" class="orders-close" id="orders-close" aria-label="Close my orders">✕</button>
      <div class="orders-header">
        <div>
          <span class="section-label">Your Account</span>
          <h2 id="orders-title">My Orders</h2>
          <p id="orders-status">Loading your orders...</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="orders-refresh-btn">Refresh</button>
      </div>
      <div class="orders-login-note" id="orders-login-note" hidden>Login to view orders linked to your account.</div>
      <div class="orders-list" id="orders-list"></div>
    </div>
  </div>

  <!-- ===== PRODUCT DETAIL MODAL ===== -->
  <div class="product-modal" id="product-modal" aria-hidden="true">
    <div class="product-modal-container" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <button type="button" class="product-modal-close" id="product-modal-close" aria-label="Close product details">✕</button>
      <div class="product-modal-body" id="product-modal-body">
        <!-- Rendered by JS -->
      </div>
    </div>
  </div>

  <!-- ===== CHECKOUT MODAL ===== -->
  <div class="checkout-modal" id="checkout-modal">
    <div class="checkout-container">
      <button type="button" class="checkout-close" id="checkout-close" aria-label="Close checkout">✕</button>

      <div class="checkout-steps">
        <div class="step active">
          <div class="step-number">1</div>
          <span class="step-label">Shipping</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-number">2</div>
          <span class="step-label">Order</span>
        </div>
      </div>

      <div class="checkout-body" id="checkout-body">
        <!-- Rendered by JS -->
      </div>
    </div>
  </div>


  <!-- ===== AUTH MODAL ===== -->
  <div class="auth-modal" id="auth-modal" aria-hidden="true">
    <div class="auth-container" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button type="button" class="auth-close" id="auth-close" aria-label="Close login and signup">✕</button>
      <div class="auth-header">
        <img src="/logo.webp" alt="Oravel Lifestyle" width="192" height="192" decoding="async">
        <div>
          <span class="section-label">My Account</span>
          <h2 id="auth-title">Welcome to Oravel Lifestyle</h2>
          <p class="auth-subtitle">Login, create an account, or reset your password securely.</p>
        </div>
      </div>

      <div class="auth-tabs">
        <button type="button" class="auth-tab active" data-auth-tab="login">Login</button>
        <button type="button" class="auth-tab" data-auth-tab="signup">Sign Up</button>
        <button type="button" class="auth-tab" data-auth-tab="forgot">Forgot</button>
      </div>

      <form class="auth-form active" id="login-form">
        <div class="form-group">
          <label for="login-email">Email *</label>
          <input type="email" id="login-email" class="form-input" placeholder="your@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label for="login-password">Password *</label>
          <input type="password" id="login-password" class="form-input" placeholder="Enter password" required minlength="6" autocomplete="current-password">
        </div>
        <div class="auth-link-row">
          <button type="button" class="auth-text-link" id="forgot-password-link">Forgot password?</button>
        </div>
        <button type="submit" class="btn btn-primary btn-lg auth-submit">Login</button>
      </form>

      <form class="auth-form" id="signup-form">
        <div class="auth-help-card">
          <strong>Account verification required</strong>
          <span>Enter your details, choose Email or Phone, send the 6 digit code, then verify to create the account.</span>
        </div>

        <div class="form-group">
          <label for="signup-name">Full Name *</label>
          <input type="text" id="signup-name" class="form-input" placeholder="Enter your full name" required autocomplete="name">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="signup-phone">Phone *</label>
            <input type="tel" id="signup-phone" class="form-input" placeholder="01XXXXXXXXX" required autocomplete="tel">
          </div>
          <div class="form-group">
            <label for="signup-email">Email *</label>
            <input type="email" id="signup-email" class="form-input" placeholder="your@email.com" required autocomplete="email">
          </div>
        </div>
        <div class="form-group">
          <label for="signup-password">Password *</label>
          <input type="password" id="signup-password" class="form-input" placeholder="Minimum 6 characters" required minlength="6" autocomplete="new-password">
        </div>

        <div class="verification-panel">
          <div class="form-row">
            <div class="form-group">
              <label for="signup-verify-channel">Send verification code by *</label>
              <select id="signup-verify-channel" class="form-input" required>
                <option value="email">Email</option>
                <option value="phone">Phone SMS</option>
              </select>
            </div>
            <div class="form-group verification-action-group">
              <label>&nbsp;</label>
              <button type="button" class="btn btn-secondary" id="signup-send-code-btn">Send Code</button>
            </div>
          </div>
          <p class="auth-help-text" id="signup-code-status">Enter your details, send a code, then verify to create your account.</p>
          <div class="form-group hidden" id="signup-code-group">
            <label for="signup-code">Verification Code *</label>
            <input type="text" id="signup-code" class="form-input otp-input" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code">
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg auth-submit">Verify & Create Account</button>
      </form>

      <form class="auth-form" id="forgot-form">
        <div class="auth-help-card">
          <strong>Password reset verification</strong>
          <span>Enter your registered email or phone, receive a 6 digit code, then set a new password.</span>
        </div>

        <div class="form-group">
          <label for="forgot-identifier">Email or Phone *</label>
          <input type="text" id="forgot-identifier" class="form-input" placeholder="your@email.com or 01XXXXXXXXX" required autocomplete="username">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="forgot-channel">Send reset code by *</label>
            <select id="forgot-channel" class="form-input" required>
              <option value="email">Email</option>
              <option value="phone">Phone SMS</option>
            </select>
          </div>
          <div class="form-group verification-action-group">
            <label>&nbsp;</label>
            <button type="button" class="btn btn-secondary" id="forgot-send-code-btn">Send Reset Code</button>
          </div>
        </div>

        <p class="auth-help-text" id="forgot-code-status">Request a reset code first.</p>

        <div class="form-group">
          <label for="forgot-code">Reset Code *</label>
          <input type="text" id="forgot-code" class="form-input otp-input" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code">
        </div>
        <div class="form-group">
          <label for="forgot-new-password">New Password *</label>
          <input type="password" id="forgot-new-password" class="form-input" placeholder="Minimum 6 characters" minlength="6" required autocomplete="new-password">
        </div>

        <button type="submit" class="btn btn-primary btn-lg auth-submit">Reset Password</button>
        <div class="auth-link-row auth-link-center">
          <button type="button" class="auth-text-link" id="back-to-login-link">Back to login</button>
        </div>
      </form>

      <div class="auth-profile" id="auth-profile" style="display:none;">
        <div class="profile-summary-row">
          <div class="profile-avatar">👤</div>
          <div class="profile-summary-text">
            <h3 id="profile-name">Customer</h3>
            <p id="profile-email"></p>
          </div>
        </div>
        <div class="profile-orders-head">
          <div>
            <span class="section-label">Order History</span>
            <h3>My Orders</h3>
            <p id="profile-orders-status">Loading your orders...</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="refresh-orders-btn">Refresh</button>
        </div>
        <div class="profile-orders" id="profile-orders"></div>
        <button type="button" class="btn btn-secondary profile-logout-btn" id="logout-btn">Logout</button>
      </div>
    </div>
  </div>

  <!-- ===== SCRIPTS ===== -->
  <script src="/products.js?v=20260821-exact-price-update" defer></script>
  <script src="/cart.js?v=20260821-orders-nav-2" defer></script>
  <script src="/checkout.js?v=20260821-orders-nav-2" defer></script>
  <script src="/three-scene.js?v=502" defer></script>
  <script src="/auth.js?v=20260821-orders-nav-2" defer></script>
  <script src="/site-events.js?v=502" defer></script>
  <script src="/app.js?v=20260821-single-price-only" defer></script>
  <script src="/whatsapp-button.js?v=900" defer></script>
  <script src="/ai-assistant.js?v=800" defer></script>

</body>
</html>
`;
