import { Router } from 'express'
import crypto from 'node:crypto'
import Order from '../models/Order.js'
import Product from '../models/Product.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { customer, items, shippingAddress, paymentMethod = 'paystack' } = req.body
    if (!customer?.name || !customer?.email || !Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Customer details and cart items are required.' })
    const ids = items.map(item => item.product).filter(Boolean)
    const products = await Product.find({ _id: { $in: ids }, isActive: true })
    const normalized = items.map(item => {
      const product = products.find(p => String(p._id) === String(item.product))
      if (!product || product.stock < Number(item.quantity)) throw new Error(`Product unavailable: ${item.name || item.product}`)
      return { product: product._id, name: product.name, price: product.price, quantity: Number(item.quantity) }
    })
    const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = subtotal >= 100000 ? 0 : 5000
    const order = await Order.create({ customer, items: normalized, shippingAddress, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod, reference: `DYT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}` })
    res.status(201).json({ success: true, order })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/:reference', async (req, res) => {
  const order = await Order.findOne({ reference: req.params.reference })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  res.json({ success: true, order })
})

export default router
