const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')).replace(/\/$/, '')

const fallbackCatalog = [
  { id: '1', name: 'Minimal Leather Backpack', category: 'Bags', price: 68000, stock: 12, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A clean everyday backpack with a durable leather finish and practical storage.' },
  { id: '2', name: 'Classic Everyday Sneaker', category: 'Shoes', price: 85000, stock: 8, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', description: 'A versatile sneaker designed for everyday comfort and effortless style.' },
  { id: '3', name: 'Premium Wrist Watch', category: 'Accessories', price: 120000, stock: 5, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', description: 'A refined timepiece with a timeless profile for daily wear.' },
  { id: '4', name: 'Modern Cotton Shirt', category: 'Clothing', price: 42000, stock: 20, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80', description: 'Soft, modern cotton shirting with a comfortable everyday fit.' },
  { id: '5', name: 'Canvas Travel Tote', category: 'Bags', price: 55000, stock: 14, image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80', description: 'A roomy canvas tote for work, travel and everyday errands.' },
  { id: '6', name: 'Urban Crossbody Bag', category: 'Bags', price: 48000, stock: 10, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80', description: 'A compact crossbody bag with a clean urban design.' },
  { id: '7', name: 'Classic Running Shoe', category: 'Shoes', price: 92000, stock: 9, image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80', description: 'Lightweight everyday running shoes with cushioned comfort.' },
  { id: '8', name: 'Leather Loafers', category: 'Shoes', price: 105000, stock: 6, image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=80', description: 'Polished leather loafers for smart casual occasions.' },
  { id: '9', name: 'Classic Sunglasses', category: 'Accessories', price: 38000, stock: 18, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80', description: 'Timeless sunglasses with a lightweight everyday frame.' },
  { id: '10', name: 'Minimal Leather Belt', category: 'Accessories', price: 32000, stock: 16, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80', description: 'A versatile leather belt with a refined minimal buckle.' },
  { id: '11', name: 'Everyday Denim Jacket', category: 'Clothing', price: 78000, stock: 11, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80', description: 'A durable denim jacket designed for effortless layering.' },
  { id: '12', name: 'Relaxed Fit T-Shirt', category: 'Clothing', price: 28000, stock: 25, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', description: 'A soft relaxed-fit tee made for everyday comfort.' },
  { id: '13', name: 'Premium Polo Shirt', category: 'Clothing', price: 45000, stock: 15, image: 'https://images.unsplash.com/photo-1586363104868-2a5e2ab1e0f2?auto=format&fit=crop&w=900&q=80', description: 'A refined polo shirt with a comfortable modern fit.' },
  { id: '14', name: 'Slim Chino Trousers', category: 'Clothing', price: 62000, stock: 13, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80', description: 'Clean-cut chino trousers suitable for work and weekends.' },
  { id: '15', name: 'Everyday Hoodie', category: 'Clothing', price: 58000, stock: 17, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', description: 'A comfortable hoodie with a simple everyday silhouette.' },
  { id: '16', name: 'Structured Handbag', category: 'Bags', price: 98000, stock: 7, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', description: 'A structured handbag designed for polished everyday carry.' },
  { id: '17', name: 'Compact Travel Backpack', category: 'Bags', price: 72000, stock: 9, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A practical travel backpack with organized storage.' },
  { id: '18', name: 'Classic Chelsea Boots', category: 'Shoes', price: 135000, stock: 4, image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=900&q=80', description: 'Classic Chelsea boots with a sleek profile and durable finish.' },
  { id: '19', name: 'Daily Canvas Sneakers', category: 'Shoes', price: 52000, stock: 21, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80', description: 'Simple canvas sneakers for relaxed everyday outfits.' },
  { id: '20', name: 'Premium Leather Sandals', category: 'Shoes', price: 64000, stock: 12, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80', description: 'Comfortable leather sandals with a refined finish.' },
  { id: '21', name: 'Stainless Steel Watch', category: 'Accessories', price: 145000, stock: 6, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', description: 'A modern stainless steel watch with a clean dial.' },
  { id: '22', name: 'Classic Card Holder', category: 'Accessories', price: 25000, stock: 30, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80', description: 'A slim card holder for simple everyday carry.' },
  { id: '23', name: 'Everyday Baseball Cap', category: 'Accessories', price: 22000, stock: 24, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80', description: 'A classic cap with an adjustable everyday fit.' },
  { id: '24', name: 'Premium Knit Sweater', category: 'Clothing', price: 69000, stock: 8, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80', description: 'A soft knit sweater for comfortable cool-weather styling.' },
  { id: '25', name: 'Oxford Button Shirt', category: 'Clothing', price: 52000, stock: 14, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80', description: 'A classic Oxford shirt with a polished everyday look.' },
  { id: '26', name: 'Lightweight Windbreaker', category: 'Clothing', price: 88000, stock: 7, image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80', description: 'A lightweight outer layer for changing weather.' },
  { id: '27', name: 'Weekend Duffel Bag', category: 'Bags', price: 86000, stock: 8, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A spacious duffel bag for short trips and weekends away.' },
  { id: '28', name: 'Minimalist Chain Bracelet', category: 'Accessories', price: 36000, stock: 19, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80', description: 'A minimalist bracelet that adds a subtle finishing touch.' },
  { id: '29', name: 'Everyday Slip-On Shoes', category: 'Shoes', price: 59000, stock: 10, image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80', description: 'Easy slip-on shoes built for everyday convenience.' },
  { id: '30', name: 'Premium Cotton Shorts', category: 'Clothing', price: 39000, stock: 18, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80', description: 'Comfortable cotton shorts with a clean versatile fit.' },
]

async function request(path, options = {}) {
  const token = localStorage.getItem('deyoungtech-token')
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
    return data
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Unable to reach the DEYOUNGTECH store API. Check the deployment and database configuration.')
    throw error
  }
}

export const api = {
  products: async (params = '') => {
    try {
      const data = await request(`/products${params ? `?${params}` : ''}`)
      return Array.isArray(data?.products) && data.products.length ? data : { ...data, products: fallbackCatalog }
    } catch {
      return { products: fallbackCatalog }
    }
  },
  search: (params = '') => request(`/search${params ? `?${params}` : ''}`),
  createOrder: payload => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: reference => request(`/orders/${encodeURIComponent(reference)}`),
  register: payload => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: payload => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  profile: () => request('/customer/profile'),
  customerOrders: () => request('/customer/orders'),
  wishlist: () => request('/wishlist'),
  toggleWishlist: productId => request(`/wishlist/${encodeURIComponent(productId)}`, { method: 'POST' }),
  reviews: productId => request(`/reviews/${encodeURIComponent(productId)}`),
  addReview: (productId, payload) => request(`/reviews/${encodeURIComponent(productId)}`, { method: 'POST', body: JSON.stringify(payload) }),
  validateCoupon: (code, subtotal) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  initializePaystack: reference => request('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify({ reference }) }),
  initializeFlutterwave: reference => request('/payments/flutterwave/initialize', { method: 'POST', body: JSON.stringify({ reference }) }),
  verifyPaystack: reference => request(`/payments/paystack/verify/${encodeURIComponent(reference)}`),
  verifyFlutterwave: transactionId => request(`/payments/flutterwave/verify/${encodeURIComponent(transactionId)}`),
  adminStats: () => request('/admin/stats'),
  adminAnalytics: () => request('/analytics/overview'),
}

export default api
