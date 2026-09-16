import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import authRouter from './routes/auth.js'
import paymentsRouter from './routes/payments.js'

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/auth', authRouter)
app.use('/api/payments', paymentsRouter)
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'DEYOUNGTECH E-Commerce API', status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }))
async function startServer() { if (!process.env.MONGODB_URI) console.warn('MONGODB_URI is not configured. Database routes will not work.'); else await mongoose.connect(process.env.MONGODB_URI); app.listen(PORT, () => console.log(`DEYOUNGTECH API running on port ${PORT}`)) }
startServer().catch(error => { console.error('Server startup failed:', error); process.exit(1) })
