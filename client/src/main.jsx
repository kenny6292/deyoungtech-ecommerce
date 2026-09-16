import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, Menu, X, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import './styles.css';

const products = [
  { id: 1, name: 'Minimal Leather Backpack', category: 'Bags', price: 68000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A clean everyday backpack with a durable leather finish and practical storage.' },
  { id: 2, name: 'Classic Everyday Sneaker', category: 'Shoes', price: 85000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', description: 'A versatile sneaker designed for everyday comfort and effortless style.' },
  { id: 3, name: 'Premium Wrist Watch', category: 'Accessories', price: 120000, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', description: 'A refined timepiece with a timeless profile for daily wear.' },
  { id: 4, name: 'Modern Cotton Shirt', category: 'Clothing', price: 42000, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80', description: 'Soft, modern cotton shirting with a comfortable everyday fit.' },
];

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

function App() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const add = product => {
    setCart(items => {
      const existing = items.find(item => item.id === product.id);
      if (existing) return items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id, amount) => setCart(items => items.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item).filter(item => item.quantity > 0));
  const remove = id => setCart(items => items.filter(item => item.id !== id));

  return <div className="app">
    <header className="header">
      <button className="icon mobile" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
      <a className="logo" href="#">DEYOUNGTECH</a>
      <nav className={menu ? 'nav open' : 'nav'}>
        <a href="#shop" onClick={() => setMenu(false)}>Shop</a><a href="#categories" onClick={() => setMenu(false)}>Categories</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a>
      </nav>
      <div className="header-actions">
        <label className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."/></label>
        <button className="bag" onClick={() => setCartOpen(true)} aria-label="Shopping bag"><ShoppingBag size={21}/><span>{cartCount}</span></button>
      </div>
    </header>

    <main>
      <section className="hero">
        <div><p className="eyebrow">NEW COLLECTION</p><h1>Everything you need.<br/><em>Beautifully selected.</em></h1><p className="hero-copy">Discover thoughtfully selected products made for everyday life.</p><a className="button" href="#shop">Shop now <ArrowRight size={18}/></a></div>
      </section>

      <section className="section" id="shop">
        <div className="section-head"><div><p className="eyebrow">SHOP</p><h2>Featured products</h2></div><span>{filtered.length} products</span></div>
        <div className="grid">{filtered.map(product => <article className="product" key={product.id}>
          <div className="product-image"><img src={product.image} alt={product.name}/><button onClick={() => add(product)}>Add to cart</button></div>
          <button className="product-info product-link" onClick={() => setSelected(product)}><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{money.format(product.price)}</strong></button>
        </article>)}</div>
        {filtered.length === 0 && <p className="empty">No products found. Try another search.</p>}
      </section>

      <section className="statement" id="about"><p className="eyebrow">DEYOUNGTECH STORE</p><h2>Simple products.<br/>Better shopping.</h2></section>
    </main>
    <footer id="contact"><div><strong>DEYOUNGTECH</strong><p>A modern e-commerce experience.</p></div><p>© 2026 DEYOUNGTECH. All rights reserved.</p></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="product-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><X/></button><img src={selected.image} alt={selected.name}/><div className="modal-copy"><p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><strong>{money.format(selected.price)}</strong><p>{selected.description}</p><button className="button dark" onClick={() => { add(selected); setSelected(null); }}>Add to cart</button></div></div></div>}

    {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart</h2><button className="icon" onClick={() => setCartOpen(false)}><X/></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={34}/><p>Your cart is empty.</p><button className="button dark" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div><h3>{item.name}</h3><strong>{money.format(item.price)}</strong><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}><Plus size={14}/></button><button className="remove" onClick={() => remove(item.id)}><Trash2 size={14}/></button></div></div></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><p>Shipping and payment are calculated at checkout.</p><button className="button dark checkout" onClick={() => alert('Checkout flow is the next build stage.')}>Proceed to checkout</button></div></>}</aside></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
