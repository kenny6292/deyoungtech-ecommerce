import { Router } from 'express'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist')
  res.json({ success: true, wishlist: user?.wishlist || [] })
})

router.post('/:productId', requireAuth, async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
  const user = await User.findById(req.user.id)
  user.wishlist = user.wishlist || []
  const exists = user.wishlist.some(id => String(id) === String(product._id))
  user.wishlist = exists ? user.wishlist.filter(id => String(id) !== String(product._id)) : [...user.wishlist, product._id]
  await user.save()
  res.json({ success: true, wishlist: user.wishlist, added: !exists })
})

export default router
