import { Router } from 'express'
import crypto from 'node:crypto'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { customer, items, shippingAddress, paymentMethod = 'paystack', couponCode = '' } = req.body
    if (!customer?.name || !customer?.email || !Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Customer details and cart items are required.' })
    if (!['paystack', 'flutterwave', 'cash_on_delivery'].includes(paymentMethod)) return res.status(400).json({ success: false, message: 'Invalid payment method.' })
    const ids = items.map(item => item.product).filter(Boolean)
    const products = await Product.find({ _id: { $in: ids }, isActive: true })
    const normalized = items.map(item => {
      const product = products.find(p => String(p._id) === String(item.product))
      const quantity = Number(item.quantity)
      if (!product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) throw new Error(`Product unavailable: ${item.name || item.product}`)
      return { product: product._id, name: product.name, price: product.price, quantity }
    })
    const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let discount = 0
    let normalizedCoupon = ''
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase(), isActive: true })
      if (!coupon) throw new Error('Invalid coupon code.')
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('This coupon has expired.')
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error('This coupon has reached its usage limit.')
      if (subtotal < coupon.minOrder) throw new Error(`Minimum order is ₦${coupon.minOrder.toLocaleString()}.`)
      discount = coupon.type === 'percentage' ? Math.min(subtotal, subtotal * coupon.value / 100) : Math.min(subtotal, coupon.value)
      normalizedCoupon = coupon.code
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } })
    }
    discount = Math.round(discount)
    const shippingFee = subtotal - discount >= 100000 ? 0 : 5000
    const reserved = []
    try {
      for (const item of normalized) {
        const updated = await Product.findOneAndUpdate({ _id: item.product, isActive: true, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true })
        if (!updated) throw new Error(`Stock changed for ${item.name}. Please review your cart.`)
        reserved.push(item)
      }
      const order = await Order.create({ customer, items: normalized, shippingAddress, subtotal, discount, couponCode: normalizedCoupon, shippingFee, total: subtotal - discount + shippingFee, paymentMethod, reference: `DYT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}` })
      res.status(201).json({ success: true, order })
    } catch (error) {
      await Promise.all(reserved.map(item => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })))
      if (normalizedCoupon) await Coupon.updateOne({ code: normalizedCoupon }, { $inc: { usedCount: -1 } })
      throw error
    }
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/:reference', async (req, res) => {
  const order = await Order.findOne({ reference: req.params.reference }).populate('items.product', 'name slug image')
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  res.json({ success: true, order })
})

export default router
