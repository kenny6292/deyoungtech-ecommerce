import { Router } from 'express'
import mongoose from 'mongoose'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:productId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ success: false, message: 'Invalid product ID.' })
    const reviews = await Review.find({ product: req.params.productId, isApproved: true }).sort({ createdAt: -1 }).limit(100)
    const summary = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.productId), isApproved: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    res.json({ success: true, reviews, summary: summary[0] || { average: 0, count: 0 } })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    const rating = Number(req.body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be an integer from 1 to 5.' })
    const review = await Review.create({ product: product._id, user: req.user.id, name: req.user.name || 'Customer', rating, title: String(req.body.title || '').trim(), comment: String(req.body.comment || '').trim() })
    res.status(201).json({ success: true, review })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

export default router
