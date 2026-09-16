import { Router } from 'express'
import Order from '../models/Order.js'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash')
  if (!user) return res.status(404).json({ success: false, message: 'Account not found.' })
  res.json({ success: true, user })
})

router.get('/orders', requireAuth, async (req, res) => {
  const orders = await Order.find({ 'customer.email': req.user.email }).sort({ createdAt: -1 }).limit(100)
  res.json({ success: true, orders })
})

export default router
