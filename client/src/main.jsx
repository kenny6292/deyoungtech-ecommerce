import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, ShoppingBag, Menu, X, ArrowRight, Minus, Plus, Trash2, Heart, SlidersHorizontal, ChevronDown, Star, RotateCcw, LogOut } from 'lucide-react'
import Checkout from './pages/Checkout.jsx'
import Auth from './pages/Auth.jsx'
import Admin from './pages/Admin.jsx'
import PaymentResult from './pages/PaymentResult.jsx'
import api from './services/api.js'
import './styles.css'

const fallbackProducts = [
  { id: '1', name: 'Minimal Leather Backpack', category: 'Bags', price: 68000, stock: 12, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A clean everyday backpack with a durable leather finish and practical storage.' },
  { id: '2', name: 'Classic Everyday Sneaker', category: 'Shoes', price: 85000, stock: 8, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', description: 'A versatile sneaker designed for everyday comfort and effortless style.' },
  { id: '3', name: 'Premium Wrist Watch', category: 'Accessories', price: 120000, stock: 5, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', description: 'A refined timepiece with a timeless profile for daily wear.' },
  { id: '4', name: 'Modern Cotton Shirt', category: 'Clothing', price: 42000, stock: 20, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80', description: 'Soft, modern cotton shirting with a comfortable everyday fit.' },
]
const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
const FREE_SHIPPING = 100000

function App() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') || '')
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('deyoungtech-cart') || '[]'))
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('deyoungtech-wishlist') || '[]'))
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('deyoungtech-recent') || '[]'))
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [menu, setMenu] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [checkout, setCheckout] = useState(false)
  const [toast, setToast] = useState('')
  const [visible, setVisible] = useState(8)
  const path = window.location.pathname
  const user = JSON.parse(localStorage.getItem('deyoungtech-user') || 'null')

  useEffect(() => { localStorage.setItem('deyoungtech-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('deyoungtech-wishlist', JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => { localStorage.setItem('deyoungtech-recent', JSON.stringify(recent)) }, [recent])
  useEffect(() => {
    api.products().then(data => setProducts(data.products || [])).catch(e => setError(e.message || 'Unable to load products.')).finally(() => setLoading(false))
  }, [])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setSelected(null); setCartOpen(false); setWishlistOpen(false) } }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = products.filter(p => (category === 'All' || p.category === category) && (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)))
    return [...result].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0)
  }, [products, query, category, sort])
  const wishProducts = products.filter(p => wishlist.includes(String(p.id || p._id)))
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING) * 100)

  const showProduct = product => {
    setSelected(product)
    const id = String(product.id || product._id)
    setRecent(items => [id, ...items.filter(x => x !== id)].slice(0, 6))
  }
  const add = product => {
    const id = String(product.id || product._id)
    const existing = cart.find(item => String(item.id || item._id) === id)
    if (existing && product.stock != null && existing.quantity >= product.stock) return setToast('Maximum available stock reached.')
    setCart(items => existing ? items.map(item => String(item.id || item._id) === id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, id, quantity: 1 }])
    setCartOpen(true); setToast('Added to cart')
  }
  const changeQuantity = (id, amount) => setCart(items => items.map(item => String(item.id || item._id) === String(id) ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter(item => item.quantity > 0))
  const remove = id => setCart(items => items.filter(item => String(item.id || item._id) !== String(id)))
  const toggleWish = product => { const id = String(product.id || product._id); setWishlist(items => items.includes(id) ? items.filter(x => x !== id) : [...items, id]); setToast(wishlist.includes(id) ? 'Removed from wishlist' : 'Saved to wishlist') }
  const search = value => { setQuery(value); setVisible(8); const url = value ? `/?q=${encodeURIComponent(value)}` : '/'; window.history.replaceState({}, '', url) }

  if (path === '/login' || path === '/register') return <Auth onLogin={() => { window.location.href = '/' }} />
  if (path === '/admin') return <Admin />
  if (path === '/payment/paystack') return <PaymentResult provider="paystack" onDone={() => setCart([])} />
  if (path === '/payment/flutterwave') return <PaymentResult provider="flutterwave" onDone={() => setCart([])} />
  if (checkout) return <Checkout cart={cart} onBack={() => setCheckout(false)} onComplete={() => { setCart([]); setCartOpen(false) }} />

  return <div className="app">
    <header className="header">
      <button className="icon mobile" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
      <a className="logo" href="/">DEYOUNGTECH</a>
      <nav className={menu ? 'nav open' : 'nav'}><a href="#shop" onClick={() => setMenu(false)}>Shop</a><a href="#categories" onClick={() => setMenu(false)}>Categories</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a>{user?.role === 'admin' ? <a href="/admin">Admin</a> : <a href="/login">Account</a>}</nav>
      <div className="header-actions">
        <label className="search"><Search size={18}/><input value={query} onChange={e => search(e.target.value)} placeholder="Search products..."/></label>
        <button className="icon wishlist-button" onClick={() => setWishlistOpen(true)} aria-label="Wishlist"><Heart size={20} fill={wishlist.length ? 'currentColor' : 'none'}/><span>{wishlist.length}</span></button>
        <button className="bag" onClick={() => setCartOpen(true)} aria-label="Shopping bag"><ShoppingBag size={21}/><span>{cartCount}</span></button>
      </div>
    </header>

    <main>
      <section className="hero"><div><p className="eyebrow">NEW COLLECTION</p><h1>Everything you need.<br/><em>Beautifully selected.</em></h1><p className="hero-copy">Discover thoughtfully selected products made for everyday life, with secure checkout and reliable order processing.</p><a className="button" href="#shop">Shop now <ArrowRight size={18}/></a></div></section>

      <section className="section" id="shop">
        <div className="section-head"><div><p className="eyebrow">SHOP</p><h2>Product catalog</h2></div><span>{filtered.length} products</span></div>
        <div className="toolbar"><div className="categories" id="categories">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => { setCategory(c); setVisible(8) }}>{c}</button>)}</div><label className="sort"><SlidersHorizontal size={16}/><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select><ChevronDown size={14}/></label></div>
        {error && <div className="form-error">{error}</div>}
        {loading ? <div className="loading-grid">{Array.from({ length: 8 }).map((_, i) => <div className="skeleton" key={i}/>)}</div> : <div className="grid">{filtered.slice(0, visible).map(product => { const id = String(product.id || product._id); const stock = Number(product.stock ?? 0); return <article className="product" key={id}><div className="product-image"><img src={product.image || product.images?.[0]} alt={product.name} loading="lazy"/><button className="quick-add" onClick={() => add(product)} disabled={stock === 0}>{stock === 0 ? 'Out of stock' : 'Add to cart'}</button><button className={`wish-float ${wishlist.includes(id) ? 'saved' : ''}`} onClick={() => toggleWish(product)} aria-label="Wishlist"><Heart size={17} fill={wishlist.includes(id) ? 'currentColor' : 'none'}/></button>{stock > 0 && stock <= 5 && <span className="stock-badge">Only {stock} left</span>}</div><button className="product-info product-link" onClick={() => showProduct(product)}><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{money.format(product.price)}</strong></button></article> })}</div>}
        {!loading && !filtered.length && <div className="empty"><Search size={30}/><p>No products match your search or filter.</p><button className="button dark" onClick={() => { search(''); setCategory('All') }}>Clear filters</button></div>}
        {!loading && visible < filtered.length && <button className="load-more" onClick={() => setVisible(v => v + 8)}>Load more products</button>}
      </section>

      {recent.length > 0 && <section className="section recently"><div className="section-head"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>Recently viewed</h2></div><button className="clear-recent" onClick={() => setRecent([])}><RotateCcw size={14}/> Clear</button></div><div className="recent-grid">{recent.map(id => products.find(p => String(p.id || p._id) === id)).filter(Boolean).map(p => <button className="recent-card" key={p.id || p._id} onClick={() => showProduct(p)}><img src={p.image || p.images?.[0]} alt={p.name}/><div><strong>{p.name}</strong><span>{money.format(p.price)}</span></div></button>)}</div></section>}
      <section className="statement" id="about"><p className="eyebrow">DEYOUNGTECH STORE</p><h2>Simple products.<br/>Better shopping.</h2><p>Browse, save favorites, manage your cart and complete secure online payments from one responsive storefront.</p></section>
    </main>
    <footer id="contact"><div><strong>DEYOUNGTECH</strong><p>A modern e-commerce experience.</p></div><div><p>Secure checkout · Customer accounts · Order management</p><p>© 2026 DEYOUNGTECH. All rights reserved.</p></div></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="product-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><X/></button><img src={selected.image || selected.images?.[0]} alt={selected.name}/><div className="modal-copy"><p className="eyebrow">{selected.category}</p><div className="modal-title"><h2>{selected.name}</h2><button className="icon" onClick={() => toggleWish(selected)}><Heart fill={wishlist.includes(String(selected.id || selected._id)) ? 'currentColor' : 'none'}/></button></div><strong>{money.format(selected.price)}</strong><div className="rating"><Star size={15} fill="currentColor"/> 4.8 <span>· Product details</span></div><p>{selected.description || 'Quality product carefully selected for the DEYOUNGTECH Store.'}</p><p className="stock-line">{selected.stock > 0 ? `${selected.stock} available` : 'Currently out of stock'}</p><button className="button dark" disabled={selected.stock === 0} onClick={() => { add(selected); setSelected(null) }}>{selected.stock === 0 ? 'Out of stock' : 'Add to cart'}</button></div></div></div>}

    {wishlistOpen && <div className="cart-backdrop" onClick={() => setWishlistOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Wishlist <small>{wishlist.length}</small></h2><button className="icon" onClick={() => setWishlistOpen(false)}><X/></button></div>{!wishProducts.length ? <div className="empty-cart"><Heart size={34}/><p>Save products you want to revisit.</p><button className="button dark" onClick={() => setWishlistOpen(false)}>Continue shopping</button></div> : <div className="wish-list">{wishProducts.map(p => <div className="wish-item" key={p.id || p._id}><img src={p.image || p.images?.[0]} alt={p.name}/><div><h3>{p.name}</h3><strong>{money.format(p.price)}</strong><div><button className="small-action" onClick={() => add(p)}>Add to cart</button><button className="text-button" onClick={() => toggleWish(p)}>Remove</button></div></div></div>)}</div>}</aside></div>}

    {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart <small>{cartCount} items</small></h2><button className="icon" onClick={() => setCartOpen(false)}><X/></button></div>{!cart.length ? <div className="empty-cart"><ShoppingBag size={34}/><p>Your cart is empty.</p><button className="button dark" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id || item._id}><img src={item.image || item.images?.[0]} alt={item.name}/><div><h3>{item.name}</h3><strong>{money.format(item.price)}</strong><div className="quantity"><button onClick={() => changeQuantity(item.id || item._id, -1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id || item._id, 1)}><Plus size={14}/></button><button className="remove" onClick={() => remove(item.id || item._id)}><Trash2 size={14}/></button></div></div></div>)}</div><div className="cart-summary">{subtotal < FREE_SHIPPING && <div className="shipping-progress"><p>{money.format(FREE_SHIPPING - subtotal)} away from <strong>free shipping</strong></p><div><span style={{ width: `${shippingProgress}%` }}/></div></div>}<div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><p>Shipping and payment are calculated at checkout.</p><button className="button dark checkout" onClick={() => { setCartOpen(false); setCheckout(true) }}>Proceed to checkout</button></div></>}</aside></div>}
    {toast && <div className="toast">{toast}</div>}
  </div>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
