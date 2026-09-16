import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import productsRouter from './routes/products.js'
import searchRouter from './routes/search.js'
import ordersRouter from './routes/orders.js'
import authRouter from './routes/auth.js'
import customerRouter from './routes/customer.js'
import wishlistRouter from './routes/wishlist.js'
import reviewsRouter from './routes/reviews.js'
import couponsRouter from './routes/coupons.js'
import paymentsRouter from './routes/payments.js'
import adminRouter from './routes/admin.js'
import analyticsRouter from './routes/analytics.js'
import healthRouter from './routes/health.js'
import Product from './models/Product.js'
import catalog from './data/catalog.js'

const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use('/api/products', productsRouter)
app.use('/api/search', searchRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/auth', authRouter)
app.use('/api/customer', customerRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/health', healthRouter)
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

let databasePromise
let catalogPromise

async function ensureCatalog() {
  const count = await Product.countDocuments()
  if (count > 0) return
  catalogPromise ||= Promise.all(
    catalog.map(product =>
      Product.findOneAndUpdate(
        { slug: product.slug },
        product,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    ),
  )
  await catalogPromise
}

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
  if (mongoose.connection.readyState !== 1) {
    databasePromise ||= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    await databasePromise
  }
  await ensureCatalog()
  return mongoose.connection
}

export default app
