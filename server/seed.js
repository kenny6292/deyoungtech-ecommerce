import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Product from './models/Product.js'
import User from './models/User.js'

const products = [
  { name: 'Minimal Leather Backpack', slug: 'minimal-leather-backpack', category: 'Bags', price: 68000, stock: 25, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A clean everyday backpack with a durable leather finish and practical storage.' },
  { name: 'Classic Everyday Sneaker', slug: 'classic-everyday-sneaker', category: 'Shoes', price: 85000, stock: 30, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', description: 'A versatile sneaker designed for everyday comfort and effortless style.' },
  { name: 'Premium Wrist Watch', slug: 'premium-wrist-watch', category: 'Accessories', price: 120000, stock: 15, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', description: 'A refined timepiece with a timeless profile for daily wear.' },
  { name: 'Modern Cotton Shirt', slug: 'modern-cotton-shirt', category: 'Clothing', price: 42000, stock: 40, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80', description: 'Soft, modern cotton shirting with a comfortable everyday fit.' }
]

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
await mongoose.connect(process.env.MONGODB_URI)
await Promise.all(products.map(product => Product.findOneAndUpdate({ slug: product.slug }, product, { upsert: true, new: true, setDefaultsOnInsert: true })))
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { name: process.env.ADMIN_NAME || 'DEYOUNGTECH Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash, role: 'admin' }, { upsert: true, new: true, setDefaultsOnInsert: true })
}
console.log('DEYOUNGTECH seed completed.')
await mongoose.disconnect()
