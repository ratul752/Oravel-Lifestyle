/* ========================================
   ORAVEL LIFESTYLE - Product Data & Helpers
   ======================================== */

const products = [
  // === ACCESSORIES ===
  {
    id: 1,
    name: 'SILMAX Black & Gold Quartz Watch',
    price: 999,
    originalPrice: 2200,
    category: 'accessories',
    image: './accessory-1.webp?v=5',
    description: 'Elegant black wristwatch with gold-tone markers, date window, and a modern metal bracelet. A smart everyday style choice.',
    rating: 4.8,
    reviews: 126,
    badge: 'Hot',
    inStock: true
  },
  {
    id: 2,
    name: 'Leix Gold Dial Blue Strap Quartz Watch',
    price: 999,
    originalPrice: null,
    category: 'accessories',
    image: './accessory-2.webp?v=5',
    description: 'Charming gold-tone watch with a soft blue strap and a clean cream dial. Lightweight, stylish, and easy to wear daily.',
    rating: 4.6,
    reviews: 84,
    badge: 'New',
    inStock: true
  },
  {
    id: 3,
    name: 'AOLIX Silver Multifunction Quartz Watch',
    price: 999,
    originalPrice: 2500,
    category: 'accessories',
    image: './accessory-3.webp?v=5',
    description: 'Premium silver-tone steel watch with a black multifunction dial and polished bracelet. A refined look for work or events.',
    rating: 4.9,
    reviews: 98,
    badge: 'Sale',
    inStock: true
  },
  {
    id: 4,
    name: 'Matte Black Mini Stainless Steel Bottle',
    price: 499,
    originalPrice: null,
    category: 'accessories',
    image: './accessory-4.webp?v=5',
    description: 'Minimal matte black insulated steel bottle with a silver cap and carry ring. Practical, stylish, and ideal for daily use.',
    rating: 4.7,
    reviews: 64,
    badge: null,
    inStock: true
  },

  // === LAMPS ===
  {
    id: 5,
    name: 'Camping Lamp',
    price: 1000,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-1.webp?v=20260724-original4',
    description: 'Portable red camping lamp with a warm vintage-style glow. Suitable for camping, emergency lighting, balconies, and decorative use.',
    rating: 4.8,
    reviews: 96,
    badge: 'New',
    inStock: true
  },
  {
    id: 6,
    name: 'Antique Ramadan Lantern',
    price: 250,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-2.webp?v=2',
    description: 'Antique bronze-finish decorative lantern with detailed Islamic patterns. Ideal for Ramadan, Eid, home décor, and gifting.',
    rating: 4.7,
    reviews: 82,
    badge: null,
    inStock: true
  },
  {
    id: 7,
    name: 'Candle Lamp',
    price: 100,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-3.webp?v=2',
    description: 'Minimal amber glass candle lamp that creates a soft and relaxing glow for bedrooms, dining tables, and cozy interiors.',
    rating: 4.6,
    reviews: 118,
    badge: 'Hot',
    inStock: true
  },
  {
    id: 8,
    name: 'Golden Ramadan Lantern',
    price: 300,
    originalPrice: 1900,
    category: 'lamps',
    image: './lamp-4.webp?v=2',
    description: 'Elegant golden Ramadan lantern with decorative cutwork and mosque-inspired artwork. Perfect for festive decoration and gifts.',
    rating: 4.8,
    reviews: 105,
    badge: 'Sale',
    inStock: true
  },
  {
    id: 10,
    name: 'Table Lamp with Pen Holder',
    price: 549,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-5.webp?v=20260724-original4',
    description: 'Cute snail-shaped LED table lamp with an integrated pen holder. A practical and charming choice for study desks and children’s rooms.',
    rating: 4.9,
    reviews: 137,
    badge: 'New',
    inStock: true
  },


  {
    id: 20,
    name: 'Pink Astronaut LED Night Light',
    price: 549,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-6.webp?v=20260821',
    description: 'Cute pastel pink astronaut-shaped LED night light with a large circular diffuser. A playful choice for bedrooms, study desks, and gift setups.',
    rating: 0,
    reviews: 0,
    badge: 'New',
    inStock: true
  },
  {
    id: 21,
    name: 'Crystal Cube Ambient Lamp',
    price: 949,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-7.webp?v=20260821',
    description: 'Modern crystal-style cube ambient lamp with textured clear panels and a warm golden base. Designed for cozy bedside, desk, and décor lighting.',
    rating: 0,
    reviews: 0,
    badge: 'New',
    inStock: true
  },
  {
    id: 22,
    name: 'Purple Flower LED Desk Lamp',
    price: 549,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-8.webp?v=20260821',
    description: 'Purple flower-shaped LED desk lamp with decorative leaves and a compact pot-style base. Ideal for study tables, kids rooms, and cute room décor.',
    rating: 0,
    reviews: 0,
    badge: 'New',
    inStock: true
  },
  {
    id: 23,
    name: 'Blue Robot LED Desk Lamp',
    price: 549,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-9.webp?v=20260821',
    description: 'Playful blue robot-style LED desk lamp with a large round light head and bright yellow feet. A fun lighting option for desks and children’s rooms.',
    rating: 0,
    reviews: 0,
    badge: 'New',
    inStock: true
  },
  {
    id: 24,
    name: 'Astronaut Moon LED Desk Lamp',
    price: 549,
    originalPrice: null,
    category: 'lamps',
    image: './lamp-10.webp?v=20260821',
    description: 'Space-themed LED desk lamp featuring an astronaut resting on a moon-inspired base beneath a curved UFO-style light. Great for bedrooms, desks, and gifts.',
    rating: 0,
    reviews: 0,
    badge: 'New',
    inStock: true
  },

  // === MIRRORS ===
  {
    id: 9,
    name: 'Warm Terracotta LED Vanity Mirror',
    price: 7499,
    originalPrice: 16900,
    category: 'mirrors',
    image: './mirror-1.webp?v=5',
    description: 'Elegant oval LED mirror displayed against a warm terracotta interior, with floral tree lighting, a slim gold edge, and a touch-control switch.',
    rating: 4.8,
    reviews: 91,
    badge: 'New',
    inStock: true
  },
  {
    id: 11,
    name: 'Black Stone Backlit LED Vanity Mirror',
    price: 7499,
    originalPrice: null,
    category: 'mirrors',
    image: './mirror-2.webp?v=5',
    description: 'Premium oval LED bathroom mirror with warm edge lighting and an illuminated floral tree design, styled against a dramatic black stone wall.',
    rating: 4.9,
    reviews: 108,
    badge: 'Hot',
    inStock: true
  },
  {
    id: 12,
    name: 'Noir Touch LED Vanity Mirror',
    price: 7499,
    originalPrice: 15500,
    category: 'mirrors',
    image: './mirror-3.webp?v=5',
    description: 'Minimal dark-wall LED mirror with a soft backlit halo, bright floral border, black frame, and convenient touch power control.',
    rating: 4.7,
    reviews: 73,
    badge: 'Sale',
    inStock: true
  },
  {
    id: 18,
    name: 'Marble Gold-Trim LED Vanity Mirror',
    price: 7499,
    originalPrice: 18500,
    category: 'mirrors',
    image: './mirror-4.webp?v=5',
    description: 'Luxury oval vanity mirror with warm LED illumination, gold trim, floral detailing, and an elegant marble bathroom presentation.',
    rating: 4.9,
    reviews: 132,
    badge: 'Best Seller',
    inStock: true
  },
  {
    id: 19,
    name: 'Dark Wood Backlit LED Vanity Mirror',
    price: 7500,
    originalPrice: null,
    category: 'mirrors',
    image: './mirror-5.webp?v=5',
    description: 'Statement LED vanity mirror with a glowing floral tree pattern, warm backlight, gold edge, and a sophisticated dark walnut-panel setting.',
    rating: 4.8,
    reviews: 86,
    badge: 'Limited',
    inStock: true
  },

  // === BEAUTY (Coming Soon - no products yet) ===

  // === CLOTHES (Coming Soon) ===
  {
    id: 17,
    name: 'Premium Silk Shirt',
    price: 4500,
    originalPrice: null,
    category: 'clothes',
    image: './category-clothes.webp',
    description: 'Luxurious 100% mulberry silk shirt with a modern tailored fit. Coming soon to Oravel Lifestyle.',
    rating: 0,
    reviews: 0,
    badge: 'Coming Soon',
    inStock: false
  }
];

// --- Helper Functions ---

function formatPrice(price) {
  const amount = Number(price);
  return '৳' + (Number.isFinite(amount) ? amount : 0).toLocaleString('en-IN');
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getProductsByCategory(category) {
  if (category === 'all') return products.filter(p => p.category !== 'clothes');
  return products.filter(p => p.category === category);
}

function getProductById(id) {
  const productId = Number(id);
  if (!Number.isInteger(productId)) return null;
  return products.find(p => p.id === productId) || null;
}

function searchProducts(query) {
  const q = String(query ?? '').toLowerCase().trim();
  if (!q) return products.filter(p => p.category !== 'clothes');
  return products.filter(p =>
    p.category !== 'clothes' && (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  );
}

function sortProducts(productList, sortBy) {
  const sorted = [...productList];
  switch (sortBy) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => {
        const badgeOrder = { 'New': 0, 'Hot': 1, 'Limited': 2, 'Sale': 3, 'Coming Soon': 5 };
        const aOrder = a.badge ? (badgeOrder[a.badge] ?? 4) : 4;
        const bOrder = b.badge ? (badgeOrder[b.badge] ?? 4) : 4;
        return aOrder - bOrder;
      });
      break;
  }
  return sorted;
}

function getBestSellingProducts(limit = 8) {
  const safeLimit = Math.max(1, Math.min(16, Number(limit) || 8));
  return products
    .filter(product => product.inStock && product.category !== 'clothes')
    .sort((a, b) => {
      const reviewDifference = (Number(b.reviews) || 0) - (Number(a.reviews) || 0);
      if (reviewDifference !== 0) return reviewDifference;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    })
    .slice(0, safeLimit);
}

function getFeaturedProducts() {
  return getBestSellingProducts(8);
}

// Export to global scope
window.products = products;
window.formatPrice = formatPrice;
window.escapeHTML = escapeHTML;
window.getProductsByCategory = getProductsByCategory;
window.getProductById = getProductById;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
window.getBestSellingProducts = getBestSellingProducts;
window.getFeaturedProducts = getFeaturedProducts;
