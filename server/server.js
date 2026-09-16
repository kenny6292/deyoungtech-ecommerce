import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ success: true, service: 'DEYOUNGTECH E-Commerce API', status: 'ok' })
})

app.get('/api/products', async (_req, res) => {
  try {
    const Product = mongoose.model('Product')
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 })
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

async function startServer() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
  } else {
    console.warn('MONGODB_URI is not configured. API started without a database connection.')
  }

  app.listen(PORT, () => {
    console.log(`DEYOUNGTECH API running on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Server startup failed:', error)
  process.exit(1)
})
