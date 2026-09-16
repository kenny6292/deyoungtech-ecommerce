import { Router } from 'express'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Coupon from '../models/Coupon.js'
import Review from '../models/Review.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/products', async (_req, res) => res.json({ success: true, products: await Product.find().sort({ createdAt: -1 }) }))
router.post('/products', async (req, res) => {
  try { const product = await Product.create(req.body); res.status(201).json({ success: true, product }) }
  catch (error) { res.status(400).json({ success: false, message: error.message }) }
})
router.put('/products/:id', async (req, res) => {
  try { const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ success: false, message: 'Product not found.' }); res.json({ success: true, product }) }
  catch (error) { res.status(400).json({ success: false, message: error.message }) }
})
router.delete('/products/:id', async (req, res) => { const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }); if (!product) return res.status(404).json({ success: false, message: 'Product not found.' }); res.json({ success: true, product }) })

router.get('/orders', async (_req, res) => res.json({ success: true, orders: await Order.find().sort({ createdAt: -1 }).limit(500) }))
router.patch('/orders/:id', async (req, res) => {
  const allowed = ['orderStatus']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
  res.json({ success: true, order })
})

router.get('/coupons', async (_req, res) => res.json({ success: true, coupons: await Coupon.find().sort({ createdAt: -1 }) }))
router.post('/coupons', async (req, res) => {
  try { const coupon = await Coupon.create({ ...req.body, code: String(req.body.code || '').trim().toUpperCase() }); res.status(201).json({ success: true, coupon }) }
  catch (error) { res.status(400).json({ success: false, message: error.message }) }
})
router.patch('/coupons/:id', async (req, res) => {
  try { const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' }); res.json({ success: true, coupon }) }
  catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/reviews', async (_req, res) => res.json({ success: true, reviews: await Review.find().populate('product', 'name').sort({ createdAt: -1 }).limit(500) }))
router.patch('/reviews/:id', async (req, res) => {
  try { const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: Boolean(req.body.isApproved) }, { new: true, runValidators: true }); if (!review) return res.status(404).json({ success: false, message: 'Review not found.' }); res.json({ success: true, review }) }
  catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/stats', async (_req, res) => {
  const [products, orders, paidOrders, customers, lowStock, statusBreakdown] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.find({ paymentStatus: 'paid' }).select('total'),
    (await import('../models/User.js')).default.countDocuments({ role: 'customer' }),
    Product.find({ isActive: true, stock: { $lte: 5 } }).select('name stock category').sort({ stock: 1 }).limit(20),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }])
  ])
  res.json({ success: true, stats: { products, orders, customers, paidOrders: paidOrders.length, revenue: paidOrders.reduce((sum, order) => sum + order.total, 0), lowStock, statusBreakdown } })
})

export default router
