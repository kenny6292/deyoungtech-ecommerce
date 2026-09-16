import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Product from './models/Product.js'
import User from './models/User.js'
import Coupon from './models/Coupon.js'
import products from './data/catalog.js'

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
await mongoose.connect(process.env.MONGODB_URI)
await Promise.all(products.map(product => Product.findOneAndUpdate({ slug: product.slug }, product, { upsert: true, new: true, setDefaultsOnInsert: true })))

await Coupon.findOneAndUpdate(
  { code: 'WELCOME10' },
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50000, maxUses: 1000, isActive: true },
  { upsert: true, new: true, setDefaultsOnInsert: true }
)
await Coupon.findOneAndUpdate(
  { code: 'SAVE15000' },
  { code: 'SAVE15000', type: 'fixed', value: 15000, minOrder: 150000, maxUses: 500, isActive: true },
  { upsert: true, new: true, setDefaultsOnInsert: true }
)

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { name: process.env.ADMIN_NAME || 'DEYOUNGTECH Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash, role: 'admin' }, { upsert: true, new: true, setDefaultsOnInsert: true })
}
console.log(`DEYOUNGTECH seed completed: ${products.length} products.`)
await mongoose.disconnect()
