/* ========================================
   ORAVEL LIFESTYLE - Main Application Controller
   ======================================== */

class App {
  constructor() {
    this.selectedCategory = null;
    this.threeScene = null;
    this.productDetailsBound = false;
  }

  init() {
    this.renderBestSellingProducts();
    this.setupNavigation();
    this.setupCategorySelection();
    this.setupProductDetails();
    this.setupScrollAnimations();
    this.setup3DCardTilt();
    this.preloadProductImages();
    this.deferThreeScene();
  }

  createProductCard(product, options = {}) {
    const escape = window.escapeHTML || ((value) => String(value ?? ''));
    const productName = escape(product.name);
    const productCategory = escape(product.category);
    const productId = Number(product.id);
    const badgeClass = product.badge ? {
      New: 'badge-new',
      Sale: 'badge-sale',
      Hot: 'badge-hot',
      Limited: 'badge-limited',
      'Coming Soon': 'badge-coming-soon'
    }[product.badge] || '' : '';

    const priceHtml = `<span class="product-price">${window.formatPrice(product.price)}</span>`;

    const imageLoading = options.eager ? 'eager' : 'lazy';
    const imagePriority = options.eager ? 'high' : 'auto';
    const imageHtml = product.image
      ? `<img src="${escape(product.image)}" alt="${productName}" loading="${imageLoading}" fetchpriority="${imagePriority}" decoding="async" width="560" height="560">`
      : '<div class="coming-soon-placeholder"><span class="icon">🖼️</span><span>Image unavailable</span></div>';

    return `
      <article class="product-card animate-on-scroll" data-product-id="${productId}" role="button" tabindex="0" aria-label="View details for ${productName}">
        <div class="product-image">
          ${imageHtml}
          ${product.badge ? `<span class="product-badge ${badgeClass}">${escape(product.badge)}</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-category">${productCategory}</div>
          <div class="product-name">${productName}</div>
          <div class="product-rating">
            <div class="stars">${this.renderStars(product.rating)}</div>
            <span class="rating-count">(${Number(product.reviews) || 0})</span>
          </div>
          <div class="product-price-row"><div>${priceHtml}</div></div>
          <div class="product-actions">
            <button class="add-to-cart-btn" type="button"
                    onclick="event.stopPropagation(); window.cart && window.cart.addItem(${productId});"
                    ${!product.inStock ? 'disabled' : ''}>
              ${product.inStock ? '🛒 Add to Cart' : '🔒 Coming Soon'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  renderStars(rating) {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    let html = '';
    for (let index = 1; index <= 5; index += 1) {
      html += index <= Math.round(safeRating) ? '★' : '☆';
    }
    return html;
  }

  renderBestSellingProducts() {
    const grid = document.getElementById('best-selling-grid');
    if (!grid) return;

    const bestSelling = typeof window.getBestSellingProducts === 'function'
      ? window.getBestSellingProducts(8)
      : (window.products || []).filter(product => product.inStock).slice(0, 8);

    grid.innerHTML = bestSelling
      .map((product, index) => this.createProductCard(product, { eager: index < 4 }))
      .join('');
  }

  setupCategorySelection() {
    const buttonsContainer = document.getElementById('category-buttons');
    const closeButton = document.getElementById('category-close-btn');
    if (!buttonsContainer) return;

    buttonsContainer.addEventListener('click', (event) => {
      const button = event.target.closest('.category-link-card[data-category]');
      if (!button) return;
      this.openCategory(button.dataset.category, button);
    });

    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeCategory());
    }
  }

  openCategory(category, selectedButton = null) {
    const categoryMeta = {
      accessories: {
        title: 'Accessories Collection',
        description: 'Jewelry, watches, sunglasses, bracelets and premium everyday accessories.'
      },
      lamps: {
        title: 'Lamps Collection',
        description: 'Decorative table lamps, floor lamps, mood lights and warm home lighting.'
      },
      mirrors: {
        title: 'Mirrors Collection',
        description: 'Elegant LED mirrors and decorative statement mirrors for a premium interior look.'
      },
      beauty: {
        title: 'Beauty Products Coming Soon',
        description: 'Beauty products are not available yet. This category is coming soon.'
      },
      clothes: {
        title: 'Clothing Preview',
        description: 'Our fashion collection is coming soon. Preview products cannot be ordered yet.'
      }
    };

    if (!Object.prototype.hasOwnProperty.call(categoryMeta, category)) return;

    const panel = document.getElementById('selected-category-panel');
    const grid = document.getElementById('selected-category-grid');
    const title = document.getElementById('selected-category-title');
    const description = document.getElementById('selected-category-description');
    const label = document.getElementById('selected-category-label');
    if (!panel || !grid || !title || !description || !label) return;

    document.querySelectorAll('.category-link-card[data-category]').forEach((button) => {
      const active = button === selectedButton || button.dataset.category === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const categoryProducts = typeof window.getProductsByCategory === 'function'
      ? window.getProductsByCategory(category)
      : (window.products || []).filter(product => product.category === category);

    this.selectedCategory = category;
    label.textContent = (category === 'clothes' || category === 'beauty') ? 'Upcoming Category' : 'Selected Category';
    title.textContent = categoryMeta[category].title;
    description.textContent = categoryMeta[category].description;
    if (categoryProducts.length) {
      grid.innerHTML = categoryProducts.map(product => this.createProductCard(product)).join('');
    } else if (category === 'beauty') {
      grid.innerHTML = `
        <div class="category-empty-state category-coming-soon">
          <span class="coming-soon-icon" aria-hidden="true">✨</span>
          <strong>Beauty Products Coming Soon</strong>
          <p>We are preparing skincare, cosmetics, and self-care products for Oravel Lifestyle.</p>
        </div>`;
    } else {
      grid.innerHTML = '<div class="category-empty-state">No products are available in this category yet.</div>';
    }

    panel.hidden = false;
    panel.classList.add('is-open');
    this.observeNewElements();
    this.setup3DCardTilt();

    window.requestAnimationFrame(() => {
      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const top = panel.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }

  closeCategory() {
    const panel = document.getElementById('selected-category-panel');
    if (panel) {
      panel.classList.remove('is-open');
      panel.hidden = true;
    }

    document.querySelectorAll('.category-link-card[data-category]').forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });

    this.selectedCategory = null;
  }

  setupProductDetails() {
    if (this.productDetailsBound) return;
    this.productDetailsBound = true;

    document.addEventListener('click', (event) => {
      const card = event.target.closest('.product-card[data-product-id]');
      if (!card || event.target.closest('button, a, input, select, textarea')) return;
      this.openProductModal(card.dataset.productId);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeProductModal();
        return;
      }

      const card = event.target.closest('.product-card[data-product-id]');
      if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      this.openProductModal(card.dataset.productId);
    });

    const modal = document.getElementById('product-modal');
    const closeButton = document.getElementById('product-modal-close');
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) this.closeProductModal();
    });
    closeButton?.addEventListener('click', () => this.closeProductModal());
  }

  openProductModal(productId) {
    const product = window.getProductById?.(productId);
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('product-modal-body');
    if (!product || !modal || !body) return;

    const escape = window.escapeHTML || ((value) => String(value ?? ''));
    const productName = escape(product.name);
    const productCategory = escape(product.category);
    const productDescription = escape(product.description);
    const productImage = product.image
      ? `<img src="${escape(product.image)}" alt="${productName}" loading="eager" decoding="async">`
      : '<div class="coming-soon-placeholder"><span class="icon">🖼️</span><span>Image unavailable</span></div>';
    const stockText = product.inStock ? 'In Stock' : 'Coming Soon';
    const stockClass = product.inStock ? 'in-stock' : 'out-of-stock';
    const badgeClass = product.badge ? {
      New: 'badge-new',
      Sale: 'badge-sale',
      Hot: 'badge-hot',
      Limited: 'badge-limited',
      'Coming Soon': 'badge-coming-soon'
    }[product.badge] || '' : '';
    const priceHtml = `<span class="product-price">${window.formatPrice(product.price)}</span>`;

    body.innerHTML = `
      <div class="product-modal-grid">
        <div class="product-modal-image">
          ${productImage}
          ${product.badge ? `<span class="product-badge ${badgeClass}">${escape(product.badge)}</span>` : ''}
        </div>
        <div class="product-modal-info">
          <div class="product-category">${productCategory}</div>
          <h2 id="product-modal-title">${productName}</h2>
          <div class="product-rating product-modal-rating">
            <div class="stars">${this.renderStars(product.rating)}</div>
            <span class="rating-count">${Number(product.rating) || 0} (${Number(product.reviews) || 0} reviews)</span>
          </div>
          <div class="product-modal-price">${priceHtml}</div>
          <p class="product-modal-description">${productDescription}</p>
          <div class="product-modal-meta">
            <div><span>Category</span><strong>${productCategory}</strong></div>
            <div><span>Status</span><strong class="${stockClass}">${stockText}</strong></div>
            <div><span>Payment</span><strong>Cash on Delivery</strong></div>
          </div>
          <div class="product-modal-actions">
            <button class="add-to-cart-btn" type="button" ${product.inStock ? `onclick="window.cart && window.cart.addItem(${Number(product.id)})"` : 'disabled'}>
              ${product.inStock ? '🛒 Add to Cart' : '🔒 Coming Soon'}
            </button>
            <button class="btn btn-secondary" type="button" onclick="window.app && window.app.closeProductModal()">Continue Shopping</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('product-modal-close')?.focus();
  }

  closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal || !modal.classList.contains('active')) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.cart-sidebar.active, .checkout-modal.active, .auth-modal.active, .orders-modal.active')) {
      document.body.style.overflow = '';
    }
  }

  setupNavigation() {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        const active = !hamburger.classList.contains('active');
        hamburger.classList.toggle('active', active);
        navLinks.classList.toggle('active', active);
        hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
      });

      navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navLinks.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.hasAttribute('data-auth-open')) return;
      anchor.addEventListener('click', (event) => {
        const targetSelector = anchor.getAttribute('href');
        if (!targetSelector) return;
        if (targetSelector === '#') {
          event.preventDefault();
          return;
        }
        const target = document.querySelector(targetSelector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.animate-on-scroll').forEach(element => element.classList.add('visible'));
      return;
    }

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        this.scrollObserver.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '120px 0px 80px 0px' });

    this.observeNewElements();
  }

  observeNewElements() {
    if (!this.scrollObserver) return;
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach((element) => {
      this.scrollObserver.observe(element);
    });
  }

  preloadProductImages() {
    const imageUrls = Array.from(new Set((window.products || [])
      .filter(product => product?.inStock && product.image)
      .map(product => product.image)));

    const preload = () => imageUrls.forEach((src, index) => {
      window.setTimeout(() => {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
      }, index * 20);
    });

    if ('requestIdleCallback' in window) window.requestIdleCallback(preload, { timeout: 1200 });
    else window.setTimeout(preload, 500);
  }

  deferThreeScene() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768) return;

    const startScene = () => {
      if (this.threeScene || typeof window.ThreeScene !== 'function' || typeof window.THREE === 'undefined') return;
      try {
        this.threeScene = new window.ThreeScene('.hero-canvas');
        this.threeScene.init();
      } catch (error) {
        console.warn('3D scene initialization failed:', error);
      }
    };

    const scheduleScene = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(startScene, { timeout: 2000 });
      else window.setTimeout(startScene, 800);
    };

    if (typeof window.THREE !== 'undefined') {
      scheduleScene();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', scheduleScene, { once: true });
    script.addEventListener('error', () => console.warn('3D library unavailable; the store remains usable.'), { once: true });
    document.body.appendChild(script);
  }

  setup3DCardTilt() {
    if (window.matchMedia?.('(pointer: coarse)').matches || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('.product-card, .category-link-card').forEach((card) => {
      if (card.dataset.tiltBound === 'true') return;
      card.dataset.tiltBound = 'true';

      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
        const rotateY = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
