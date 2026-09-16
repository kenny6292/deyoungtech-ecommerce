import { Router } from 'express'
import Coupon from '../models/Coupon.js'

const router = Router()

router.post('/validate', async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase()
    const subtotal = Number(req.body.subtotal || 0)
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' })
    const coupon = await Coupon.findOne({ code, isActive: true })
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'This coupon has expired.' })
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' })
    if (subtotal < coupon.minOrder) return res.status(400).json({ success: false, message: `Minimum order is ₦${coupon.minOrder.toLocaleString()}.` })
    const discount = coupon.type === 'percentage' ? Math.min(subtotal, subtotal * coupon.value / 100) : Math.min(subtotal, coupon.value)
    res.json({ success: true, code: coupon.code, discount: Math.round(discount), type: coupon.type, value: coupon.value })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

export default router
