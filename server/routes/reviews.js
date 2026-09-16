import { Router } from 'express'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true }).sort({ createdAt: -1 }).limit(100)
    const summary = await Review.aggregate([
      { $match: { product: new (Product.base.Types.ObjectId)(req.params.productId), isApproved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).catch(() => [])
    res.json({ success: true, reviews, summary: summary[0] || { average: 0, count: 0 } })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    const { rating, title = '', comment = '' } = req.body
    const review = await Review.create({ product: product._id, user: req.user.id, name: req.user.name || 'Customer', rating, title, comment })
    res.status(201).json({ success: true, review })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

export default router
