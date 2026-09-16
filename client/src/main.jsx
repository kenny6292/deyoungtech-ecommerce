import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import './styles.css';

const products = [
  { id: 1, name: 'Minimal Leather Backpack', category: 'Bags', price: 68000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80' },
  { id: 2, name: 'Classic Everyday Sneaker', category: 'Shoes', price: 85000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { id: 3, name: 'Premium Wrist Watch', category: 'Accessories', price: 120000, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80' },
  { id: 4, name: 'Modern Cotton Shirt', category: 'Clothing', price: 42000, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80' },
];

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

function App() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState(false);
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const add = product => setCart(items => [...items, product]);

  return <div className="app">
    <header className="header">
      <button className="icon mobile" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
      <a className="logo" href="#">DEYOUNGTECH</a>
      <nav className={menu ? 'nav open' : 'nav'}>
        <a href="#shop">Shop</a><a href="#categories">Categories</a><a href="#about">About</a><a href="#contact">Contact</a>
      </nav>
      <div className="header-actions">
        <label className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."/></label>
        <button className="bag" aria-label="Shopping bag"><ShoppingBag size={21}/><span>{cart.length}</span></button>
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
          <div className="product-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>{money.format(product.price)}</strong></div>
        </article>)}</div>
      </section>

      <section className="statement" id="about"><p className="eyebrow">DEYOUNGTECH STORE</p><h2>Simple products.<br/>Better shopping.</h2></section>
    </main>
    <footer id="contact"><div><strong>DEYOUNGTECH</strong><p>A modern e-commerce experience.</p></div><p>© 2026 DEYOUNGTECH. All rights reserved.</p></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
