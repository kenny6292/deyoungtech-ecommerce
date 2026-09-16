import 'dotenv/config'
import mongoose from 'mongoose'
import Product from './models/Product.js'
import products from './data/catalog.js'

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
await mongoose.connect(process.env.MONGODB_URI)
for (const product of products) await Product.findOneAndUpdate({ slug: product.slug }, { ...product, isActive: true }, { upsert: true, new: true, setDefaultsOnInsert: true })
console.log(`Seeded ${products.length} products.`)
await mongoose.disconnect()
