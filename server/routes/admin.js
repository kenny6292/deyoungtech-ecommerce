import { Router } from 'express'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
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
router.get('/orders', async (_req, res) => res.json({ success: true, orders: await Order.find().sort({ createdAt: -1 }) }))
router.patch('/orders/:id', async (req, res) => { const allowed = ['orderStatus', 'paymentStatus']; const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!order) return res.status(404).json({ success: false, message: 'Order not found.' }); res.json({ success: true, order }) })
router.get('/stats', async (_req, res) => { const [products, orders, paidOrders] = await Promise.all([Product.countDocuments({ isActive: true }), Order.countDocuments(), Order.find({ paymentStatus: 'paid' }).select('total')]); res.json({ success: true, stats: { products, orders, paidOrders: paidOrders.length, revenue: paidOrders.reduce((sum, order) => sum + order.total, 0) } }) })
export default router
