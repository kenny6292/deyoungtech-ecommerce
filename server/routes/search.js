import { Router } from 'express'
import Product from '../models/Product.js'

const router = Router()
router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim()
  const category = String(req.query.category || '').trim()
  const sort = String(req.query.sort || 'newest')
  const filter = { isActive: true }
  if (category) filter.category = category
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }]
  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, name: { name: 1 }, newest: { createdAt: -1 } }
  const products = await Product.find(filter).sort(sortMap[sort] || sortMap.newest).limit(100)
  const categories = await Product.distinct('category', { isActive: true })
  res.json({ success: true, products, categories })
})
export default router
