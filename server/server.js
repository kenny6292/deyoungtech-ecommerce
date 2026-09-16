import 'dotenv/config'
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

const app = express()
const PORT = process.env.PORT || 5000
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173'

app.disable('x-powered-by')
app.use(cors({ origin: clientOrigin, credentials: true }))
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

async function startServer() {
  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.')
    console.warn('MONGODB_URI is not configured. Database routes will not work.')
  } else await mongoose.connect(process.env.MONGODB_URI)
  app.listen(PORT, () => console.log(`DEYOUNGTECH API running on port ${PORT}`))
}

startServer().catch(error => { console.error('Server startup failed:', error); process.exit(1) })
