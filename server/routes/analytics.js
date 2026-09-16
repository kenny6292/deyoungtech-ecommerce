import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/overview', async (_req, res) => {
  const [orders, products, revenue, byStatus, lowStock] = await Promise.all([
    Order.countDocuments(), Product.countDocuments({ isActive: true }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Product.find({ isActive: true, stock: { $lte: 5 } }).sort({ stock: 1 }).limit(20).select('name stock price category')
  ])
  res.json({ success: true, overview: { orders, activeProducts: products, revenue: revenue[0]?.revenue || 0, byStatus, lowStock } })
})

export default router
